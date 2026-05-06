import React from 'react';
import { Stack, Typography, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLE } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';

const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

interface WriteArticleProps {
	articleId?: string;
}

const WriteArticle = ({ articleId }: WriteArticleProps) => {
	const isEditMode = !!articleId;

	const { data, loading } = useQuery(GET_BOARD_ARTICLE, {
		variables: { articleId },
		skip: !articleId,
		fetchPolicy: 'network-only',
	});

	const article: BoardArticle | undefined = data?.getBoardArticle;

	// In edit mode, wait for article data before mounting the editor
	if (isEditMode && loading) {
		return (
			<div id="write-article-page">
				<Stack alignItems="center" justifyContent="center" style={{ minHeight: 320 }}>
					<CircularProgress size={36} sx={{ color: '#e07b3a' }} />
					<Typography style={{ marginTop: 16, color: '#888', fontSize: 14 }}>Loading article…</Typography>
				</Stack>
			</div>
		);
	}

	return (
		<div id="write-article-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">
						{isEditMode ? 'Edit Article' : 'Write an Article'}
					</Typography>
					<Typography className="sub-title">
						{isEditMode ? 'Update your article below.' : 'Feel free to write your ideas!'}
					</Typography>
				</Stack>
			</Stack>
			<div className="mypage-editor-shell">
				<TuiEditor initialArticle={article} mode={isEditMode ? 'edit' : 'create'} />
			</div>
		</div>
	);
};

export default WriteArticle;
