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
import { ARTICLE_CATEGORIES, getArticleCategoryLabel } from '../../libs/utils/articleCategoryMap';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const POPULAR_TAGS = ['Pet Care', 'Dogs', 'Cats', 'Grooming', 'Nutrition', 'Training', 'Health', 'Vets'];

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
		if (router.query.articleCategory) {
			setSearchArticles((prev) => ({
				...prev,
				search: {
					...prev.search,
					articleCategory: router.query.articleCategory as BoardArticleCategory,
				},
			}));
		}
	}, [router.isReady, router.query.articleCategory]);

	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{ pathname: router.pathname, query: { articleCategory: 'FREE' } },
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (value: string) => {
		setSearchArticles({
			...searchArticles,
			page: 1,
			search: { ...searchArticles.search, articleCategory: value as BoardArticleCategory },
		});
		await router.push(
			{ pathname: '/blog', query: { articleCategory: value } },
			router.pathname,
			{ shallow: true },
		);
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
		setSearchArticles((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, text: searchText.trim() },
		}));
	};

	const activeCategory = searchArticles.search?.articleCategory;

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
												<div className="cb-card__meta">
													<span className="cb-card__avatar">{authorInitial}</span>
													<span className="cb-card__author">
														{boardArticle?.memberData?.memberNick || 'PawPal'}
													</span>
													<span className="cb-card__sep">·</span>
													<span className="cb-card__count">
														{boardArticle?.articleComments ?? 0} Comment{boardArticle?.articleComments !== 1 ? 's' : ''}
													</span>
												</div>
												<span className="cb-card__cat">{displayCategory}</span>
												<h3 className="cb-card__title">{boardArticle?.articleTitle}</h3>
												<p className="cb-card__stats">
													👁 {boardArticle?.articleViews ?? 0}&nbsp;·&nbsp;♥ {boardArticle?.articleLikes ?? 0}
												</p>
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
								{ARTICLE_CATEGORIES.map((cat) => (
									<li
										key={cat.value}
										className={`cb-cats__item${activeCategory === cat.value ? ' cb-cats__item--active' : ''}`}
										onClick={() => tabChangeHandler(cat.value)}
									>
										<span className="cb-cats__arrow">→</span>
										<span className="cb-cats__name">{cat.label}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="cb-widget">
							<h3 className="cb-widget__title">Popular Tags</h3>
							<div className="cb-tags">
								{POPULAR_TAGS.map((tag) => (
									<span key={tag} className="cb-tags__tag">{tag}</span>
								))}
							</div>
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
		search: { articleCategory: 'FREE' },
	},
};

export default withLayoutBasic(BlogList);
