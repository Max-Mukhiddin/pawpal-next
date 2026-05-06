import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { getArticleCategoryLabel } from '../../utils/articleCategoryMap';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
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
		skip: !user?._id || user._id.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const goToEditHandler = (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		router.push({
			pathname: '/mypage',
			query: { category: 'editArticle', articleId },
		});
	};

	const goToDetailHandler = (articleId: string) => {
		router.push({
			pathname: '/blog/detail',
			query: { id: articleId },
		});
	};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Articles</Typography>
						<Typography className="sub-title">Manage and edit your published articles.</Typography>
					</Stack>
				</Stack>

				{/* Article management list */}
				<div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
					{boardArticlesLoading ? (
						<div className={'no-data'}>
							<p>Loading articles…</p>
						</div>
					) : boardArticles?.length > 0 ? (
						boardArticles.map((article: BoardArticle) => {
							const imageSrc = article.articleImage
								? `${REACT_APP_API_URL}/${article.articleImage}`
								: '/img/community/communityImg.png';
							const categoryLabel = getArticleCategoryLabel(article.articleCategory);

							return (
								<div
									key={article._id}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 20,
										background: '#fff',
										borderRadius: 16,
										padding: '18px 24px',
										boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
										border: '1px solid rgba(0,0,0,0.06)',
										cursor: 'pointer',
										transition: 'box-shadow 0.18s',
									}}
									onClick={() => goToDetailHandler(article._id)}
									onMouseEnter={(e) =>
										((e.currentTarget as HTMLDivElement).style.boxShadow =
											'0 4px 20px rgba(0,0,0,0.12)')
									}
									onMouseLeave={(e) =>
										((e.currentTarget as HTMLDivElement).style.boxShadow =
											'0 2px 8px rgba(0,0,0,0.06)')
									}
								>
									{/* Thumbnail */}
									<img
										src={imageSrc}
										alt={article.articleTitle}
										style={{
											width: 80,
											height: 80,
											borderRadius: 12,
											objectFit: 'cover',
											flexShrink: 0,
											background: '#f5f5f5',
										}}
									/>

									{/* Info */}
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
											{categoryLabel && (
												<span
													style={{
														fontSize: 11,
														fontWeight: 700,
														color: '#e07b3a',
														background: '#fff3eb',
														borderRadius: 999,
														padding: '2px 10px',
														textTransform: 'uppercase',
														letterSpacing: '0.06em',
													}}
												>
													{categoryLabel}
												</span>
											)}
										</div>
										<p
											style={{
												margin: 0,
												fontSize: 16,
												fontWeight: 700,
												color: '#181a20',
												lineHeight: 1.3,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{article.articleTitle}
										</p>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 16,
												marginTop: 6,
												color: '#aaa',
												fontSize: 12,
											}}
										>
											<Moment format="MMM DD, YYYY">{article.createdAt}</Moment>
											<span>👁 {article.articleViews}</span>
											<span>❤️ {article.articleLikes}</span>
											<span>💬 {article.articleComments}</span>
										</div>
									</div>

									{/* Actions */}
									<div
										style={{ display: 'flex', gap: 10, flexShrink: 0 }}
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={(e) => {
												e.stopPropagation();
												goToDetailHandler(article._id);
											}}
											style={{
												padding: '8px 18px',
												borderRadius: 999,
												border: '1.5px solid #e0ddd8',
												background: 'transparent',
												fontSize: 13,
												fontWeight: 600,
												color: '#555',
												cursor: 'pointer',
												transition: 'border-color 0.18s',
											}}
											onMouseEnter={(e) =>
												((e.currentTarget as HTMLButtonElement).style.borderColor = '#999')
											}
											onMouseLeave={(e) =>
												((e.currentTarget as HTMLButtonElement).style.borderColor = '#e0ddd8')
											}
										>
											View
										</button>
										<button
											onClick={(e) => goToEditHandler(e, article._id)}
											style={{
												padding: '8px 18px',
												borderRadius: 999,
												border: 'none',
												background: '#e07b3a',
												color: '#fff',
												fontSize: 13,
												fontWeight: 700,
												cursor: 'pointer',
												transition: 'background 0.18s',
											}}
											onMouseEnter={(e) =>
												((e.currentTarget as HTMLButtonElement).style.background = '#c96a32')
											}
											onMouseLeave={(e) =>
												((e.currentTarget as HTMLButtonElement).style.background = '#e07b3a')
											}
										>
											Edit
										</button>
									</div>
								</div>
							);
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No articles yet. Write your first one!</p>
						</div>
					)}
				</div>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s) available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
