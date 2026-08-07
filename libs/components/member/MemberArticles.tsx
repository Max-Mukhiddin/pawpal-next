import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import ArticleHoverCard from '../articles/ArticleHoverCard';
import { getArticleCategoryLabel } from '../../utils/articleCategoryMap';
import {
	formatArticleDate,
	makeArticleExcerpt,
	resolveArticleImage,
} from '../../utils/articleCardHelpers';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);

	const { data: boardArticles } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setMemberBoArticles(data?.getBoardArticles?.list);
			setTotal(data?.getBoardArticles?.metaCounter[0]?.total || 0);
		},
	});

	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	}

	return (
		<div className="member-content">
			<h1 className="member-content__title">Articles</h1>
			{memberBoArticles?.length === 0 ? (
				<div className="member-content__empty">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No articles found!</p>
				</div>
			) : (
				<div className="member-content__grid pp-article-card-grid">
					{memberBoArticles.map((boardArticle: BoardArticle) => (
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
						/>
					))}
				</div>
			)}
			{memberBoArticles?.length !== 0 ? (
				<div className="member-content__pagination">
					<Pagination
						className="pp-pagination"
						count={Math.ceil(total / searchFilter.limit) || 1}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
				</div>
			) : null}
		</div>
	);
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
