import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { IconButton, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES, GET_COMMENTS, GET_LISTINGS } from '../../apollo/user/query';
import PpLoader from '../../libs/components/common/PpLoader';
import { Messages } from '../../libs/config';
import {
	sweetConfirmAlert,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { likeToastMessage, readWasLiked } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import Link from 'next/link';
import { getArticleCategoryLabel } from '../../libs/utils/articleCategoryMap';
import {
	formatArticleDate,
	makeArticleExcerpt,
	resolveArticleImage,
} from '../../libs/utils/articleCardHelpers';
import { enrichArticleHtml, estimateReadTimeMinutes, isArticleHtmlContent } from '../../libs/utils/articleContentHelpers';
import { resolveMemberImageUrl } from '../../libs/utils/mediaUrl';
import { useReadingProgress } from '../../libs/hooks/useReadingProgress';
import { useArticleTocSpy } from '../../libs/hooks/useArticleTocSpy';
import ArticleReadingProgress from '../../libs/components/articles/ArticleReadingProgress';
import ArticleRichContent from '../../libs/components/articles/ArticleRichContent';
import ArticleDetailSidebar, {
	type ArticleSpecialistBookingMeta,
} from '../../libs/components/articles/ArticleDetailSidebar';
import ArticleAuthorBio from '../../libs/components/articles/ArticleAuthorBio';
import ArticleHoverCard from '../../libs/components/articles/ArticleHoverCard';
import { MemberType } from '../../libs/enums/member.enum';
import { ListingType } from '../../libs/enums/listing.enum';
import { Direction } from '../../libs/enums/common.enum';
import { getMemberSpecialtyCategory } from '../../libs/utils/memberSpecialty';
import type { Listing } from '../../libs/types/listing/listing';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;
	const articleId = query?.id as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [openEditBackdrop, setOpenEditBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle | undefined>();

	const articleStartRef = useRef<HTMLDivElement>(null);
	const articleEndRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const commentsSectionRef = useRef<HTMLElement>(null);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const {
		loading: boardArticleLoading,
		refetch: boardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		skip: !articleId,
		variables: { articleId },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setBoardArticle(data?.getBoardArticle);
		},
	});

	const relatedSearch = useMemo(() => {
		if (boardArticle?.articleCategory) {
			return { articleCategory: boardArticle.articleCategory };
		}
		return {};
	}, [boardArticle?.articleCategory]);

	const { data: relatedData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-first',
		skip: !articleId || !boardArticle,
		variables: {
			input: { page: 1, limit: 6, sort: 'createdAt', direction: 'DESC', search: relatedSearch },
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setComments(data.getComments.list);
			setTotal(data.getComments.metaCounter?.[0]?.total || 0);
		},
	});

	const relatedArticles = useMemo(() => {
		const list = (relatedData?.getBoardArticles?.list as BoardArticle[] | undefined) ?? [];
		return list.filter((a) => a._id !== articleId).slice(0, 3);
	}, [relatedData, articleId]);

	const authorMember = boardArticle?.memberData;
	const isAuthorSpecialist = authorMember?.memberType === MemberType.AGENT;

	const { data: authorListingsData } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-first',
		skip: !isAuthorSpecialist || !authorMember?._id,
		variables: {
			input: {
				page: 1,
				limit: 20,
				sort: 'listingPrice',
				direction: Direction.ASC,
				search: {
					memberId: authorMember?._id,
					typeList: [ListingType.SERVICE],
				},
			},
		},
	});

	const specialistBooking = useMemo((): ArticleSpecialistBookingMeta | undefined => {
		if (!isAuthorSpecialist || !authorMember) return undefined;

		const listings = (authorListingsData?.getListings?.list as Listing[] | undefined) ?? [];
		const pricedServices = listings
			.filter((listing) => listing.listingType === ListingType.SERVICE && listing.listingPrice > 0)
			.sort((a, b) => a.listingPrice - b.listingPrice);
		const startingPrice = pricedServices[0]?.listingPrice ?? null;

		return {
			categoryLabel: getMemberSpecialtyCategory(authorMember),
			startingPrice,
		};
	}, [authorListingsData, authorMember, isAuthorSpecialist]);

	const { headings } = useMemo(() => {
		if (!isArticleHtmlContent(boardArticle?.articleContent)) {
			return { headings: [] as ReturnType<typeof enrichArticleHtml>['headings'] };
		}
		return enrichArticleHtml(boardArticle?.articleContent);
	}, [boardArticle?.articleContent]);

	const readingProgress = useReadingProgress(articleStartRef, articleEndRef, Boolean(boardArticle));
	const activeTocId = useArticleTocSpy(contentRef, headings, Boolean(boardArticle));

	useEffect(() => {
		if (articleId) setSearchFilter((prev) => ({ ...prev, search: { commentRefId: articleId } }));
	}, [articleId]);

	const likeBoArticleHandler = async (userData: any, id: any) => {
		await withActionGate(`like:article:${id}`, async () => {
			try {
				if (likeLoading) return;
				if (!id) return;
				if (requireSignIn(router, userData._id, 'article')) return;
				const wasLiked = readWasLiked(boardArticle);
				setLikeLoading(true);
				await likeTargetBoardArticle({ variables: { articleId: id } });
				await boardArticleRefetch({ articleId });
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'article')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				sweetMixinErrorAlert(err.message).then();
			} finally {
				setLikeLoading(false);
			}
		});
	};

	const creteCommentHandler = async () => {
		if (!comment) return;
		try {
			if (requireSignIn(router, user?._id, 'comment')) return;
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({ variables: { input: commentInput } });
			setComment('');
			setWordsCnt(0);
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ articleId });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message, 3000, { router, action: 'comment' });
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (requireSignIn(router, user?._id, 'comment')) return;
			if (!commentId) throw new Error('Select a comment to update!');

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData.commentContent && !updateData.commentStatus) {
				throw new Error('Provide data to update your comment!');
			}

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({ variables: { input: updateData } });
					await sweetMixinSuccessAlert('Updated');
				} else return;
			} else {
				await updateComment({ variables: { input: updateData } });
				await sweetMixinSuccessAlert('Updated');
			}

			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message, 3000, { router, action: 'comment' });
		} finally {
			setOpenEditBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) =>
		resolveMemberImageUrl(imageUrl, '/img/community/articleImg.png');

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const paginationHandler = (_e: T, value: number) => {
		setSearchFilter((prev) => ({ ...prev, page: value }));
	};

	const handleTocClick = (id: string) => {
		const el = contentRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const displayCategory = getArticleCategoryLabel(boardArticle?.articleCategory);
	const isLiked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);
	const articleImageSrc = boardArticle?.articleImage?.trim()
		? resolveArticleImage(boardArticle.articleImage)
		: '';
	const memberImage = resolveMemberImageUrl(
		boardArticle?.memberData?.memberImage,
		'/img/community/articleImg.png',
	);
	const readMinutes = estimateReadTimeMinutes(boardArticle?.articleContent);

	if (boardArticleLoading && !boardArticle) {
		return (
			<div id="community-detail-page" className="pp-adetail">
				<div className="pp-adetail-loading">
					<PpLoader size={72} />
				</div>
			</div>
		);
	}

	return (
		<div id="community-detail-page" className="pp-adetail">
			<ArticleReadingProgress progress={readingProgress} />

			<section className="pp-adetail-hero">
				{articleImageSrc ? (
					<img src={articleImageSrc} alt="" className="pp-adetail-hero__img" />
				) : (
					<div className="pp-adetail-hero__img pp-adetail-hero__img--fallback" aria-hidden />
				)}
				<div className="pp-adetail-hero__scrim" aria-hidden />
				<div className="pp-adetail-hero__content">
					<nav className="pp-adetail-hero__crumb" aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<span>/</span>
						<Link href="/blog">Blog</Link>
						<span>/</span>
						<span>{displayCategory || 'Article'}</span>
					</nav>
					{displayCategory ? (
						<span className="pp-adetail-hero__cat">{displayCategory}</span>
					) : null}
					<h1 className="pp-adetail-hero__title">
						{boardArticle?.articleTitle || 'Untitled Article'}
					</h1>
					<div className="pp-adetail-hero__byline">
						<button
							type="button"
							className="pp-adetail-hero__author"
							onClick={() => goMemberPage(boardArticle?.memberData?._id)}
						>
							<img
								src={memberImage}
								alt={boardArticle?.memberData?.memberNick || 'Author'}
								className="pp-adetail-hero__avatar"
							/>
							<span>{boardArticle?.memberData?.memberNick || 'PawPal'}</span>
						</button>
						<span className="pp-adetail-hero__dot" aria-hidden />
						<time className="pp-adetail-hero__date">
							<Moment format="MMM DD, YYYY">{boardArticle?.createdAt}</Moment>
						</time>
						<span className="pp-adetail-hero__dot" aria-hidden />
						<span className="pp-adetail-hero__read">{readMinutes} min read</span>
					</div>
				</div>
			</section>

			<div className="pp-adetail-layout" ref={articleStartRef}>
				<div className="pp-adetail-layout__grid">
					<article className="pp-adetail-main">
						<div ref={contentRef}>
							<ArticleRichContent content={boardArticle?.articleContent} />
						</div>
						<div className="pp-adetail-engage" ref={articleEndRef}>
							<div className="pp-adetail-engage__left">
								<button
									type="button"
									className={`pp-adetail-engage__btn pp-adetail-engage__btn--like${isLiked ? ' is-active' : ''}`}
									onClick={() => likeBoArticleHandler(user, boardArticle?._id)}
									disabled={likeLoading}
									aria-pressed={isLiked}
								>
									♥ {boardArticle?.articleLikes ?? 0}
								</button>
								<button
									type="button"
									className="pp-adetail-engage__btn"
									onClick={() =>
										commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
									}
								>
									💬 {boardArticle?.articleComments ?? total}
								</button>
							</div>
							{user?._id &&
								(user._id === boardArticle?.memberId ? (
									<button
										type="button"
										className="pp-btn pp-btn--primary"
										onClick={() =>
											router.push({
												pathname: '/mypage',
												query: { category: 'editArticle', articleId: boardArticle?._id },
											})
										}
									>
										Edit Article
									</button>
								) : (
									<button
										type="button"
										className="pp-btn pp-btn--primary"
										onClick={() =>
											router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })
										}
									>
										Write an Article
									</button>
								))}
						</div>
					</article>

					<ArticleDetailSidebar
						headings={headings}
						activeId={activeTocId}
						onTocClick={handleTocClick}
						author={boardArticle?.memberData}
						articleTitle={boardArticle?.articleTitle}
						specialistBooking={specialistBooking}
					/>
				</div>
			</div>

			<ArticleAuthorBio author={boardArticle?.memberData} />

			<section className="pp-adetail-comments" ref={commentsSectionRef}>
				<div className="pp-adetail-comments__inner">
					<div className="pp-adetail-comments__head">
						<h2>Comments</h2>
						{total > 0 ? <span>({total})</span> : null}
					</div>

					<div className="pp-adetail-comment-form">
						<input
							className="pp-adetail-comment-form__input"
							type="text"
							placeholder={user?._id ? 'Leave a comment…' : 'Sign in to leave a comment'}
							value={comment}
							disabled={!user?._id}
							onChange={(e) => {
								if (e.target.value.length > 100) return;
								setWordsCnt(e.target.value.length);
								setComment(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') creteCommentHandler();
							}}
						/>
						<div className="pp-adetail-comment-form__row">
							<span>{wordsCnt}/100</span>
							<button
								type="button"
								onClick={creteCommentHandler}
								disabled={!comment || !user?._id}
							>
								Post Comment
							</button>
						</div>
					</div>

					{comments.map((commentData) => (
						<div key={commentData?._id} className="pp-adetail-comment">
							<img
								src={getCommentMemberImage(commentData?.memberData?.memberImage)}
								alt={commentData?.memberData?.memberNick || 'User'}
								className="pp-adetail-comment__avatar"
								onClick={() => goMemberPage(commentData?.memberData?._id)}
							/>
							<div className="pp-adetail-comment__body">
								<div className="pp-adetail-comment__top">
									<div className="pp-adetail-comment__meta">
										<span
											className="pp-adetail-comment__author"
											onClick={() => goMemberPage(commentData?.memberData?._id)}
										>
											{commentData?.memberData?.memberNick}
										</span>
										<span className="pp-adetail-comment__date">
											<Moment format="MMM DD, YYYY · HH:mm">{commentData?.createdAt}</Moment>
										</span>
									</div>
									{commentData?.memberId === user?._id && (
										<div className="pp-adetail-comment__actions">
											<IconButton
												size="small"
												onClick={() =>
													updateButtonHandler(commentData?._id, CommentStatus.DELETE)
												}
											>
												<DeleteForeverIcon sx={{ fontSize: 18, color: '#bbb' }} />
											</IconButton>
											<IconButton
												size="small"
												onClick={() => {
													setUpdatedComment(commentData?.commentContent);
													setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
													setUpdatedCommentId(commentData?._id);
													setOpenEditBackdrop(true);
												}}
											>
												<EditIcon sx={{ fontSize: 17, color: '#bbb' }} />
											</IconButton>
										</div>
									)}
								</div>
								<p className="pp-adetail-comment__text">{commentData?.commentContent}</p>
							</div>
						</div>
					))}

					{total > 0 && (
						<div className="pp-adetail-comments__pagination">
							<Pagination
								className="pp-pagination"
								count={Math.ceil(total / searchFilter.limit) || 1}
								page={searchFilter.page}
								shape="rounded"
								color="primary"
								onChange={paginationHandler}
							/>
						</div>
					)}
				</div>
			</section>

			{relatedArticles.length > 0 && (
				<section className="pp-adetail-related">
					<div className="pp-adetail-related__inner">
						<h2 className="pp-adetail-related__head">Related Articles</h2>
						<div className="pp-article-card-grid pp-adetail-related__grid">
							{relatedArticles.map((item) => (
								<ArticleHoverCard
									key={item._id}
									href={`/blog/detail?id=${item._id}`}
									category={getArticleCategoryLabel(item.articleCategory)}
									dateLabel={
										formatArticleDate(item.createdAt) ??
										formatArticleDate(item.updatedAt) ??
										'Recent'
									}
									title={item.articleTitle ?? 'Untitled article'}
									excerpt={makeArticleExcerpt(item.articleContent)}
									image={resolveArticleImage(item.articleImage)}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{openEditBackdrop && (
				<div className="pp-adetail-edit-overlay" onClick={() => setOpenEditBackdrop(false)}>
					<div className="pp-adetail-edit-box" onClick={(e) => e.stopPropagation()}>
						<h4>Edit Comment</h4>
						<input
							autoFocus
							className="pp-adetail-edit-box__input"
							type="text"
							value={updatedComment}
							onChange={(e) => {
								if (e.target.value.length > 100) return;
								setUpdatedCommentWordsCnt(e.target.value.length);
								setUpdatedComment(e.target.value);
							}}
						/>
						<div className="pp-adetail-edit-box__row">
							<span>{updatedCommentWordsCnt}/100</span>
							<div className="pp-adetail-edit-box__btns">
								<button
									type="button"
									className="pp-adetail-edit-box__cancel"
									onClick={() => {
										setOpenEditBackdrop(false);
										setUpdatedComment('');
										setUpdatedCommentWordsCnt(0);
									}}
								>
									Cancel
								</button>
								<button
									type="button"
									className="pp-adetail-edit-box__save"
									onClick={() => updateButtonHandler(updatedCommentId, undefined)}
								>
									Save
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail, { noHero: true });
