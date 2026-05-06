import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { IconButton, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import {
	sweetConfirmAlert,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import Link from 'next/link';
import { getArticleCategoryLabel } from '../../libs/utils/articleCategoryMap';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
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
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [openEditBackdrop, setOpenEditBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle | undefined>();

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const {
		loading: boardArticleLoading,
		data: boardArticleData,
		error: getBoardArticleError,
		refetch: boardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		skip: !articleId,
		variables: {
			articleId,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setComments(data.getComments.list);
			setTotal(data.getComments.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const likeBoArticleHandler = async (user: any, id: any) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			setLikeLoading(true);
		await likeTargetBoardArticle({ variables: { articleId: id } });
		await boardArticleRefetch({ articleId });
			await sweetTopSmallSuccessAlert('Success!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const creteCommentHandler = async () => {
		if (!comment) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({ variables: { input: commentInput } });
			setComment('');
			setWordsCnt(0);
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
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
					await sweetMixinSuccessAlert('Comment deleted.');
				} else return;
			} else {
				await updateComment({ variables: { input: updateData } });
				await sweetMixinSuccessAlert('Comment updated.');
			}

			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenEditBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${REACT_APP_API_URL}/${imageUrl}`;
		return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const displayCategory = getArticleCategoryLabel(boardArticle?.articleCategory);
	const isLiked = !!(boardArticle?.meLiked && boardArticle.meLiked.length > 0 && boardArticle.meLiked[0]?.myFavorite);

	if (device === 'mobile') {
		return <div>BLOG ARTICLE MOBILE</div>;
	} else {
		return (
			<div id="community-detail-page">
			<div className="ablog-wrap">
					{/* ── Breadcrumb ──────────────────────────────── */}
					<nav className="ablog-breadcrumb">
						<Link href="/">Home</Link>
						<span className="ablog-breadcrumb__sep">/</span>
						<Link href="/blog">Blog</Link>
						<span className="ablog-breadcrumb__sep">/</span>
						<span className="ablog-breadcrumb__current">{displayCategory || 'Article'}</span>
					</nav>

					{/* ── Article header ──────────────────────────── */}
					<header className="ablog-header">
						{displayCategory && <span className="ablog-cat">{displayCategory}</span>}
						<h1 className="ablog-title">
							{boardArticle?.articleTitle || (boardArticleLoading ? 'Loading…' : 'Untitled Article')}
						</h1>

						{/* Meta row */}
						<div className="ablog-meta">
							<img
								src={memberImage}
								alt={boardArticle?.memberData?.memberNick || 'Author'}
								className="ablog-meta__avatar"
								onClick={() => goMemberPage(boardArticle?.memberData?._id)}
							/>
							<div className="ablog-meta__info">
								<span
									className="ablog-meta__name"
									onClick={() => goMemberPage(boardArticle?.memberData?._id)}
								>
									{boardArticle?.memberData?.memberNick || 'PawPal'}
								</span>
								<span className="ablog-meta__date">
									<Moment format="MMM DD, YYYY">{boardArticle?.createdAt}</Moment>
								</span>
							</div>

							<div className="ablog-meta__sep" />

							<div className="ablog-stats">
								<span className="ablog-stat">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
									{boardArticle?.articleViews ?? 0}
								</span>
								<span className="ablog-stat">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
									{boardArticle?.articleLikes ?? 0}
								</span>
								<span className="ablog-stat">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
										<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
									</svg>
									{boardArticle?.articleComments ?? 0}
								</span>
							</div>
						</div>
					</header>

				{/* ── Write / Edit CTA ────────────────────────── */}
				{user?._id && (
					<div className="ablog-write-cta">
						{user._id === boardArticle?.memberId ? (
							<button
								className="ablog-write-cta__btn"
								onClick={() =>
									router.push({
										pathname: '/mypage',
										query: { category: 'editArticle', articleId: boardArticle?._id },
									})
								}
							>
								✏️ Edit this Article
							</button>
						) : (
							<button
								className="ablog-write-cta__btn"
								onClick={() =>
									router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })
								}
							>
								✏️ Write an Article
							</button>
						)}
					</div>
				)}

				{/* ── Article body ─────────────────────────────── */}
					<div className="ablog-body">
						<ToastViewerComponent markdown={boardArticle?.articleContent} />
					</div>

					{/* ── Like button ──────────────────────────────── */}
					<div className="ablog-like">
						<button
							className={`ablog-like__btn${isLiked ? ' ablog-like__btn--active' : ''}`}
							onClick={() => likeBoArticleHandler(user, boardArticle?._id)}
							disabled={likeLoading}
						>
							<svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							{isLiked ? 'Liked' : 'Like this article'} &nbsp;·&nbsp; {boardArticle?.articleLikes ?? 0}
						</button>
					</div>

					{/* ── Comments ─────────────────────────────────── */}
					<section className="ablog-comments">
						<div className="ablog-comments__head">
							<h3>Comments</h3>
							{total > 0 && <span className="ablog-comments__count">{total}</span>}
						</div>

						{/* Comment input */}
						<div className="ablog-comment-form">
							<input
								className="ablog-comment-form__input"
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
							<div className="ablog-comment-form__row">
								<span className="ablog-comment-form__count">{wordsCnt}/100</span>
								<button
									className="ablog-comment-form__submit"
									onClick={creteCommentHandler}
									disabled={!comment || !user?._id}
								>
									Post Comment
								</button>
							</div>
						</div>

						{/* Comment list */}
						{comments.map((commentData) => (
							<div key={commentData?._id} className="ablog-comment">
								<img
									src={getCommentMemberImage(commentData?.memberData?.memberImage)}
									alt={commentData?.memberData?.memberNick || 'User'}
									className="ablog-comment__avatar"
									onClick={() => goMemberPage(commentData?.memberData?._id)}
								/>
								<div className="ablog-comment__body">
									<div className="ablog-comment__top">
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<span
												className="ablog-comment__author"
												onClick={() => goMemberPage(commentData?.memberData?._id)}
											>
												{commentData?.memberData?.memberNick}
											</span>
											<span className="ablog-comment__date">
												<Moment format="MMM DD, YYYY · HH:mm">{commentData?.createdAt}</Moment>
											</span>
										</div>
										{commentData?.memberId === user?._id && (
											<div className="ablog-comment__actions">
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
									<p className="ablog-comment__text">{commentData?.commentContent}</p>
								</div>
							</div>
						))}

						{/* Comment pagination */}
						{total > 0 && (
							<div className="ablog-comments__pagination">
								<Pagination
									count={Math.ceil(total / searchFilter.limit) || 1}
									page={searchFilter.page}
									shape="rounded"
									color="primary"
									onChange={paginationHandler}
								/>
							</div>
						)}
				</section>
				</div>

			{/* ── Edit comment overlay ───────────────────────── */}
				{openEditBackdrop && (
					<div className="ablog-edit-overlay" onClick={() => setOpenEditBackdrop(false)}>
						<div className="ablog-edit-box" onClick={(e) => e.stopPropagation()}>
							<h4>Edit Comment</h4>
							<input
								autoFocus
								className="ablog-edit-box__input"
								type="text"
								value={updatedComment}
								onChange={(e) => {
									if (e.target.value.length > 100) return;
									setUpdatedCommentWordsCnt(e.target.value.length);
									setUpdatedComment(e.target.value);
								}}
							/>
							<div className="ablog-edit-box__row">
								<span className="ablog-edit-box__count">{updatedCommentWordsCnt}/100</span>
								<div className="ablog-edit-box__btns">
									<button
										className="ablog-edit-box__cancel"
										onClick={() => {
											setOpenEditBackdrop(false);
											setUpdatedComment('');
											setUpdatedCommentWordsCnt(0);
										}}
									>
										Cancel
									</button>
									<button
										className="ablog-edit-box__save"
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
	}
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

export default withLayoutBasic(CommunityDetail);
