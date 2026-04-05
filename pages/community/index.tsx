import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography, Button, Pagination, Chip, TextField } from '@mui/material';
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

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
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
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		if (router.query.articleCategory) {
			setSearchCommunity((prev) => ({
				...prev,
				search: {
					...prev.search,
					articleCategory: router.query.articleCategory as BoardArticleCategory,
				},
			}));
		}
	}, [router.isReady, router.query.articleCategory]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		setSearchCommunity({
			...searchCommunity,
			page: 1,
			search: { ...searchCommunity.search, articleCategory: value as BoardArticleCategory },
		});
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});

			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.error('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const applySearchHandler = () => {
		setSearchCommunity((prev) => ({
			...prev,
			page: 1,
			search: {
				...prev.search,
				text: searchText.trim(),
			},
		}));
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<Stack id="community-list-page" sx={{ bgcolor: '#f8f7f4', pb: 8 }}>
				<Stack sx={{ mx: 'auto', maxWidth: 1200, width: 'calc(100% - 32px)', mt: 3 }}>
					<Stack direction="row" gap={3} alignItems="flex-start">
						<Stack sx={{ width: '65%', minWidth: 0 }}>
							<Stack
								direction="row"
								flexWrap="wrap"
								gap={2.5}
								sx={{ '& > *': { width: 'calc(50% - 10px)' } }}
							>
								{boardArticles?.length ? (
									boardArticles.map((boardArticle: BoardArticle) => {
										const imageSrc = boardArticle?.articleImage
											? `${REACT_APP_API_URL}/${boardArticle.articleImage}`
											: '/img/banner/header2.svg';
										return (
											<Stack
												key={boardArticle?._id}
												sx={{
													bgcolor: '#fff',
													borderRadius: 2.5,
													overflow: 'hidden',
													border: '1px solid #ece8e1',
												}}
											>
												<img
													src={imageSrc}
													alt={boardArticle?.articleTitle || 'Article cover'}
													style={{ width: '100%', height: 180, objectFit: 'cover' }}
												/>
												<Stack sx={{ p: 1.75 }}>
													<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
														<Typography sx={{ fontSize: 12, color: '#676767' }}>
															{boardArticle?.memberData?.memberNick || 'PawPal'}
														</Typography>
														<Chip
															size="small"
															label={boardArticle?.articleCategory || 'FREE'}
															sx={{
																height: 22,
																fontSize: 11,
																bgcolor: '#fff3eb',
																color: '#eb6753',
																fontWeight: 600,
															}}
														/>
													</Stack>
													<Typography
														sx={{
															mt: 1,
															fontSize: 17,
															fontWeight: 700,
															lineHeight: 1.3,
															display: '-webkit-box',
															WebkitLineClamp: 2,
															WebkitBoxOrient: 'vertical',
															overflow: 'hidden',
															minHeight: 44,
														}}
													>
														{boardArticle?.articleTitle}
													</Typography>
													<Typography sx={{ mt: 0.9, fontSize: 12, color: '#7a7a7a' }}>
														Views {boardArticle?.articleViews ?? 0} · Likes {boardArticle?.articleLikes ?? 0}
													</Typography>
													<Link href={`/community/detail?id=${boardArticle?._id}`} style={{ marginTop: 10 }}>
														<Typography sx={{ color: '#eb6753', fontSize: 13, fontWeight: 700 }}>
															Read More →
														</Typography>
													</Link>
												</Stack>
											</Stack>
										);
									})
								) : (
									<Stack sx={{ width: '100%', bgcolor: '#fff', borderRadius: 2, p: 3 }}>
										<Typography>No Article found!</Typography>
									</Stack>
								)}
							</Stack>

							{totalCount > 0 && (
								<Stack className="pagination-config" sx={{ mt: 3 }}>
									<Stack className="pagination-box">
										<Pagination
											count={Math.ceil(totalCount / searchCommunity.limit)}
											page={searchCommunity.page}
											shape="circular"
											color="primary"
											onChange={paginationHandler}
										/>
									</Stack>
								</Stack>
							)}
						</Stack>

						<Stack sx={{ width: '35%', minWidth: 300, bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #ece8e1', p: 2.25 }}>
							<Typography sx={{ fontSize: 24, fontWeight: 700 }}>PawPal Community</Typography>
							<Typography sx={{ mt: 0.5, color: '#7a7a7a', fontSize: 13 }}>
								Find the latest tips, stories, and updates.
							</Typography>

							<TextField
								size="small"
								placeholder="Search articles"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') applySearchHandler();
								}}
								sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
							/>

							<Stack sx={{ mt: 2 }}>
								{(['FREE', 'RECOMMEND', 'NEWS', 'HUMOR'] as BoardArticleCategory[]).map((cat) => (
									<Button
										key={cat}
										onClick={(e) => void tabChangeHandler(e, cat)}
										sx={{
											justifyContent: 'space-between',
											mb: 1,
											px: 1.4,
											py: 1,
											textTransform: 'none',
											fontWeight: 700,
											borderRadius: 2,
											color: searchCommunity.search.articleCategory === cat ? '#fff' : '#181818',
											bgcolor: searchCommunity.search.articleCategory === cat ? '#eb6753' : '#f7f7f7',
											'&:hover': {
												bgcolor: searchCommunity.search.articleCategory === cat ? '#d85845' : '#f0f0f0',
											},
										}}
									>
										{cat === 'RECOMMEND' ? 'RECOMMENDATION' : cat === 'FREE' ? 'FREE BOARD' : cat}
									</Button>
								))}
							</Stack>

							{user?._id && (
								<Button
									onClick={() =>
										router.push({
											pathname: '/mypage',
											query: { category: 'writeArticle' },
										})
									}
									variant="contained"
									sx={{
										mt: 1.5,
										bgcolor: '#eb6753',
										textTransform: 'none',
										fontWeight: 700,
										borderRadius: 999,
										'&:hover': { bgcolor: '#d85845' },
									}}
								>
									Write
								</Button>
							)}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
