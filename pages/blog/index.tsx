import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
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
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import Link from 'next/link';
import { userVar } from '../../apollo/store';
import { BLOG_CATEGORY_FILTERS, getArticleCategoryLabel } from '../../libs/utils/articleCategoryMap';

const VALID_ARTICLE_CATEGORIES = new Set<string>(Object.values(BoardArticleCategory));

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const BlogList: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const [searchArticles, setSearchArticles] = useState<BoardArticlesInquiry>(initialInput);
	const [searchText, setSearchText] = useState('');
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
		setSearchArticles({ ...searchArticles, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { articleId: id } });
			await boardArticlesRefetch({ input: searchArticles });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.error('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const applySearchHandler = () => {
		setSearchArticles((prev) => {
			const nextSearch: BoardArticlesInquiry['search'] = {};
			const trimmed = searchText.trim();
			if (trimmed) nextSearch.text = trimmed;
			if (prev.search.articleCategory) nextSearch.articleCategory = prev.search.articleCategory;
			return { ...prev, page: 1, search: nextSearch };
		});
	};

	const activeCategory: BoardArticleCategory | null = searchArticles.search?.articleCategory ?? null;

	if (device === 'mobile') {
		return <h1>BLOG PAGE MOBILE</h1>;
	} else {
		return (
			<div id="community-list-page">
			<div className="cb-container">
					{/* ── LEFT: article grid ─────────────────────── */}
					<div className="cb-grid">
						<div className="cb-articles">
							{boardArticlesLoading ? (
								Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="cb-card" style={{ minHeight: 320, opacity: 0.45, pointerEvents: 'none' }}>
										<div className="cb-card__thumb" style={{ background: '#eee', height: 196 }} />
										<div className="cb-card__body">
											<div style={{ height: 12, width: '60%', borderRadius: 6, background: '#eee', marginBottom: 12 }} />
											<div style={{ height: 16, width: '90%', borderRadius: 6, background: '#e8e8e8', marginBottom: 8 }} />
											<div style={{ height: 16, width: '70%', borderRadius: 6, background: '#e8e8e8' }} />
										</div>
									</div>
								))
							) : boardArticles?.length ? (
								boardArticles.map((boardArticle: BoardArticle) => {
									const imageSrc = boardArticle?.articleImage
										? `${REACT_APP_API_URL}/${boardArticle.articleImage}`
										: '/img/banner/header2.svg';
									const authorInitial = (boardArticle?.memberData?.memberNick || 'P')[0].toUpperCase();
									const displayCategory = getArticleCategoryLabel(boardArticle?.articleCategory);

									return (
										<div key={boardArticle?._id} className="cb-card">
											<img
												src={imageSrc}
												alt={boardArticle?.articleTitle || 'Article cover'}
												className="cb-card__thumb"
											/>
											<div className="cb-card__body">
												<span className="cb-card__cat">{displayCategory}</span>
												<h3 className="cb-card__title">{boardArticle?.articleTitle}</h3>
												<div className="cb-card__footer">
													<div className="cb-card__author-row">
														<span className="cb-card__avatar">{authorInitial}</span>
														<span className="cb-card__author">
															{boardArticle?.memberData?.memberNick || 'PawPal'}
														</span>
													</div>
													<span className="cb-card__stats">
														👁 {boardArticle?.articleViews ?? 0}
														&nbsp;·&nbsp;
														♥ {boardArticle?.articleLikes ?? 0}
													</span>
												</div>
												<Link href={`/blog/detail?id=${boardArticle?._id}`} className="cb-card__readmore">
													Read More <span className="cb-card__readmore-arrow">→</span>
												</Link>
											</div>
										</div>
									);
								})
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
					<aside className="cb-sidebar">
						<div className="cb-widget">
							<h3 className="cb-widget__title">Search Articles</h3>
							<div className="cb-search">
								<input
									className="cb-search__input"
									type="text"
									placeholder="Search articles…"
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={(e) => { if (e.key === 'Enter') applySearchHandler(); }}
								/>
								<button className="cb-search__btn" onClick={applySearchHandler} aria-label="Search">
									<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
									</svg>
								</button>
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
	}
};

BlogList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {},
	},
};

export default withLayoutBasic(BlogList);
