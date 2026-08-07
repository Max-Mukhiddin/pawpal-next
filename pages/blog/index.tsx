import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { likeToastMessage, readWasLiked } from '../../libs/utils/likeToastMessage';
import { PpCardSkeletonGrid } from '../../libs/components/common/PpSkeleton';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import { userVar } from '../../apollo/store';
import { BLOG_CATEGORY_FILTERS, getArticleCategoryLabel } from '../../libs/utils/articleCategoryMap';
import { useDebouncedValue } from '../../libs/hooks/useDebouncedValue';
import { useFadeUpOnScroll } from '../../libs/hooks/useFadeUpOnScroll';
import { useAnimeSectionReveal } from '../../libs/hooks/useAnimeSectionReveal';
import ArticleHoverCard from '../../libs/components/articles/ArticleHoverCard';
import {
	formatArticleDate,
	makeArticleExcerpt,
	resolveArticleImage,
} from '../../libs/utils/articleCardHelpers';

const VALID_ARTICLE_CATEGORIES = new Set<string>(Object.values(BoardArticleCategory));

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const BlogList: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const [searchArticles, setSearchArticles] = useState<BoardArticlesInquiry>(initialInput);
	const [searchText, setSearchText] = useState('');
	const debouncedSearchText = useDebouncedValue(searchText, 300);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchArticles },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;

		const categoryParam = router.query.articleCategory as string | undefined;
		const isValidCategory = !!categoryParam && VALID_ARTICLE_CATEGORIES.has(categoryParam);

		setSearchArticles((prev) => {
			const nextSearch: BoardArticlesInquiry['search'] = {};
			if (prev.search.text) nextSearch.text = prev.search.text;
			if (isValidCategory) {
				nextSearch.articleCategory = categoryParam as BoardArticleCategory;
			}
			return { ...prev, page: 1, search: nextSearch };
		});
	}, [router.isReady, router.query.articleCategory]);

	useEffect(() => {
		const trimmed = debouncedSearchText.trim();
		setSearchArticles((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (trimmed === prevText) return prev;

			const nextSearch: BoardArticlesInquiry['search'] = {};
			if (trimmed) nextSearch.text = trimmed;
			if (prev.search.articleCategory) nextSearch.articleCategory = prev.search.articleCategory;
			return { ...prev, page: 1, search: nextSearch };
		});
	}, [debouncedSearchText]);

	/** HANDLERS **/
	const tabChangeHandler = async (category: BoardArticleCategory | null) => {
		const nextSearch: BoardArticlesInquiry['search'] = {};
		if (searchArticles.search.text) nextSearch.text = searchArticles.search.text;
		if (category !== null) {
			nextSearch.articleCategory = category;
		}

		setSearchArticles({
			...searchArticles,
			page: 1,
			search: nextSearch,
		});

		const nextQuery =
			category === null ? {} : { articleCategory: category as BoardArticleCategory };
		await router.push({ pathname: '/blog', query: nextQuery }, router.pathname, { shallow: true });
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchArticles((prev) => ({ ...prev, page: value }));
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		e.stopPropagation();
		await withActionGate(`like:article:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'article')) return;
				const wasLiked = readWasLiked(boardArticles.find((a) => a._id === id));
				await likeTargetBoardArticle({ variables: { articleId: id } });
				await boardArticlesRefetch({ input: searchArticles });
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'article')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.error('ERROR, likeArticleHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	const applySearchHandler = () => {
		const trimmed = searchText.trim();
		setSearchArticles((prev) => {
			const nextSearch: BoardArticlesInquiry['search'] = {};
			if (trimmed) nextSearch.text = trimmed;
			if (prev.search.articleCategory) nextSearch.articleCategory = prev.search.articleCategory;
			return { ...prev, page: 1, search: nextSearch };
		});
	};

	const searchBusy =
		searchText !== debouncedSearchText || (boardArticlesLoading && boardArticles.length > 0);

	const activeCategory: BoardArticleCategory | null = searchArticles.search?.articleCategory ?? null;

	const sidebarRef = useFadeUpOnScroll<HTMLElement>();

	useAnimeSectionReveal({
		sectionSelector: '#community-list-page',
		deps: [boardArticles, boardArticlesLoading],
	});

	return (
		<div id="community-list-page">
			<div className="cb-container">
					{/* ── LEFT: article grid ─────────────────────── */}
					<div className="cb-grid">
						<div
							className={`cb-articles pp-article-card-grid${
								searchBusy ? ' is-filter-loading' : ''
							}`}
						>
							{boardArticlesLoading && boardArticles.length === 0 ? (
								<PpCardSkeletonGrid variant="article" count={4} bare />
							) : boardArticles?.length ? (
								boardArticles.map((boardArticle: BoardArticle) => (
									<ArticleHoverCard
										key={boardArticle._id}
										href={`/blog/detail?id=${boardArticle._id}`}
										category={getArticleCategoryLabel(boardArticle.articleCategory)}
										dateLabel={
											formatArticleDate(boardArticle.createdAt) ??
											formatArticleDate(boardArticle.updatedAt) ??
											'Recent'
										}
										title={boardArticle.articleTitle ?? 'Untitled article'}
										excerpt={makeArticleExcerpt(boardArticle.articleContent)}
										image={resolveArticleImage(boardArticle.articleImage)}
										scrollReveal
									/>
								))
							) : (
								<div className="cb-empty">
									<div className="cb-empty__icon">🐾</div>
									<h3 className="cb-empty__title">No Articles Yet</h3>
									<p className="cb-empty__sub">
										Be the first to share tips, stories, and pet-care advice with the community!
									</p>
								</div>
							)}
						</div>

						{totalCount > 0 && (
							<div className="cb-pagination">
								<Pagination
									className="pp-pagination"
									count={Math.ceil(totalCount / searchArticles.limit)}
									page={searchArticles.page}
									shape="rounded"
									color="primary"
									onChange={paginationHandler}
								/>
							</div>
						)}
					</div>

					{/* ── RIGHT: sidebar ──────────────────────────── */}
					<aside ref={sidebarRef} className="cb-sidebar">
						<div className="cb-widget">
							<h3 className="cb-widget__title">Search Articles</h3>
							<div className="cb-search">
								<input
									className="cb-search__input"
									type="search"
									placeholder="Search articles…"
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') applySearchHandler();
									}}
									aria-busy={searchBusy}
								/>
								{searchBusy ? (
									<span className="cb-search__spinner" aria-hidden />
								) : (
									<button
										className="cb-search__btn"
										onClick={applySearchHandler}
										aria-label="Search"
									>
										<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
												stroke="currentColor"
												strokeWidth="2.2"
												strokeLinecap="round"
												fill="none"
											/>
										</svg>
									</button>
								)}
							</div>
						</div>

						<div className="cb-widget">
							<h3 className="cb-widget__title">Categories</h3>
							<ul className="cb-cats">
								{BLOG_CATEGORY_FILTERS.map((cat) => (
									<li
										key={cat.value ?? 'all'}
										className={`cb-cats__item${activeCategory === cat.value ? ' cb-cats__item--active' : ''}`}
										onClick={() => tabChangeHandler(cat.value)}
									>
										<span className="cb-cats__arrow">→</span>
										<span className="cb-cats__name">{cat.label}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="cb-support">
							<div className="cb-support__icon">🐶</div>
							<h3 className="cb-support__title">{user?._id ? 'Share Your Story' : 'Join the Blog'}</h3>
							<p className="cb-support__sub">
								{user?._id
									? 'Got a pet-care tip or funny story? Write an article and inspire fellow pet lovers.'
									: 'Sign in to write articles, like posts, and connect with other pet owners.'}
							</p>
							{user?._id ? (
								<button
									className="cb-support__write"
									onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
								>
									✏️&nbsp; Write an Article
								</button>
							) : (
								<button className="cb-support__write" onClick={() => router.push('/account/join')}>
									Sign In / Join Free
								</button>
							)}
						</div>
					</aside>
				</div>
			</div>
	);
};

BlogList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: 'ASC',
		search: {},
	},
};

export default withLayoutBasic(BlogList);
