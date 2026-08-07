import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import { getArticleCategoryLabel } from '../../utils/articleCategoryMap';
import { resolveArticleImage } from '../../utils/articleCardHelpers';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

function articleStatusBadgeClass(status: string): string {
	if (status === BoardArticleStatus.ACTIVE) return 'mypage-catalog__status-badge--active';
	return 'mypage-catalog__status-badge--delete';
}

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

	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
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

	const deleteArticleHandler = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		try {
			if (!(await sweetConfirmAlert('Are you sure you want to delete this article?'))) return;
			await updateBoardArticle({
				variables: {
					input: {
						_id: articleId,
						articleStatus: BoardArticleStatus.DELETE,
					},
				},
			});
			await boardArticlesRefetch({ input: searchCommunity });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	}

	return (
		<div id="my-articles-page" className="mypage-catalog">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Articles</Typography>
					<Typography className="sub-title">Manage and edit your published articles.</Typography>
				</Stack>
			</Stack>

			<div className="mypage-catalog__panel">
				<div className="mypage-catalog__header">
					<span aria-hidden />
					<span>Title</span>
					<span>Date Published</span>
					<span>Status</span>
					<span>View</span>
					<span>Action</span>
				</div>

				{boardArticlesLoading ? (
					<div className="no-data">
						<p>Loading articles…</p>
					</div>
				) : boardArticles?.length > 0 ? (
					boardArticles.map((article: BoardArticle) => {
						const imageSrc = resolveArticleImage(
							article.articleImage,
							'/img/community/communityImg.png',
						);
						const categoryLabel = getArticleCategoryLabel(article.articleCategory);

						return (
							<div key={article._id} className="mypage-catalog__row">
								<div className="mypage-catalog__thumb" onClick={() => goToDetailHandler(article._id)}>
									<img src={imageSrc} alt={article.articleTitle || 'Article'} />
								</div>

								<div className="mypage-catalog__info" onClick={() => goToDetailHandler(article._id)}>
									<p className="mypage-catalog__info__title">{article.articleTitle}</p>
									<p className="mypage-catalog__info__meta">{categoryLabel || '—'}</p>
								</div>

								<div className="mypage-catalog__date">
									<Moment format="DD MMMM, YYYY">{article.createdAt}</Moment>
								</div>

								<div>
									<span className={`mypage-catalog__status-badge ${articleStatusBadgeClass(article.articleStatus)}`}>
										{article.articleStatus}
									</span>
								</div>

								<div className="mypage-catalog__views">{article.articleViews?.toLocaleString() ?? '0'}</div>

								<div className="mypage-catalog__actions">
									<IconButton
										className="icon-button"
										aria-label="Edit article"
										onClick={(e) => goToEditHandler(e, article._id)}
									>
										<ModeIcon fontSize="small" />
									</IconButton>
									<IconButton
										className="icon-button"
										aria-label="Delete article"
										onClick={(e) => deleteArticleHandler(e, article._id)}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</div>
							</div>
						);
					})
				) : (
					<div className="no-data">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No articles yet. Write your first one!</p>
					</div>
				)}

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								className="pp-pagination"
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
