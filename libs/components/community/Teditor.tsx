import React, { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, FormControl, IconButton, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Editor } from '@tiptap/core';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { ARTICLE_CATEGORY_FORM_OPTIONS, getArticleCategoryLabel } from '../../utils/articleCategoryMap';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import { useMutation, useReactiveVar } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { userVar } from '../../../apollo/store';
import { sanitizeArticleContent, stripHtmlToPlainText } from '../../utils/articleContentHelpers';
import { resolveArticleImage } from '../../utils/articleCardHelpers';
import ArticleEditorPreview from '../articles/ArticleEditorPreview';

const TiptapArticleBody = dynamic(() => import('./TiptapArticleBody'), { ssr: false });

const MAX_ARTICLE_CONTENT_LENGTH = 5000;

type EditorViewMode = 'edit' | 'preview';

interface TuiEditorProps {
	initialArticle?: BoardArticle;
	mode?: 'create' | 'edit';
}

function hasArticleBody(content: string): boolean {
	return stripHtmlToPlainText(content).length > 0;
}

const TuiEditor = ({ initialArticle, mode = 'create' }: TuiEditorProps) => {
	const editorInstanceRef = useRef<Editor | null>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(
		mode === 'edit' ? (initialArticle?.articleCategory ?? BoardArticleCategory.FREE) : BoardArticleCategory.FREE,
	);

	const [articleTitle, setArticleTitle] = useState<string>(
		mode === 'edit' ? (initialArticle?.articleTitle ?? '') : '',
	);

	const [coverImagePath, setCoverImagePath] = useState<string>(
		mode === 'edit' ? String(initialArticle?.articleImage ?? '').replace(/^\/+/, '') : '',
	);

	const [bodyCharCount, setBodyCharCount] = useState(0);
	const [readMinutes, setReadMinutes] = useState(1);
	const [previewHtml, setPreviewHtml] = useState('');
	const [viewMode, setViewMode] = useState<EditorViewMode>('edit');

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const uploadBoardImage = async (file: File) => {
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
				variables: {
					file: null,
					target: 'board',
				},
			}),
		);
		formData.append(
			'map',
			JSON.stringify({
				'0': ['variables.file'],
			}),
		);
		formData.append('0', file);

		const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});

		const responseImage = response.data.data.imageUploader as string;
		return String(responseImage ?? '').replace(/^\/+/, '');
	};

	const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const mime = (file.type || '').toLowerCase();
		if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
			await sweetErrorHandling(new Error('Cover image must be JPEG or PNG.'));
			e.target.value = '';
			return;
		}

		try {
			const path = await uploadBoardImage(file);
			setCoverImagePath(path);
		} catch (err) {
			console.log('Error, uploadCoverImage:', err);
			sweetErrorHandling(err).then();
		} finally {
			e.target.value = '';
		}
	};

	const removeCoverImage = () => {
		setCoverImagePath('');
		if (coverInputRef.current) coverInputRef.current.value = '';
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleBodyChange = useCallback(
		({ html, plainLength, readMinutes: minutes }: { html: string; plainLength: number; readMinutes: number }) => {
			setPreviewHtml(html);
			setBodyCharCount(plainLength);
			setReadMinutes(minutes);
		},
		[],
	);

	const readEditorHtml = (): string => {
		const raw = editorInstanceRef.current?.getHTML() ?? previewHtml;
		return sanitizeArticleContent(raw);
	};

	const openPreview = () => {
		const html = readEditorHtml();
		const plain = stripHtmlToPlainText(html);
		setPreviewHtml(html);
		setBodyCharCount(plain.length);
		setViewMode('preview');
	};

	const handleSubmitButton = async () => {
		try {
			const articleContent = readEditorHtml();

			if (!hasArticleBody(articleContent) || !articleTitle.trim()) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			const plainLength = stripHtmlToPlainText(articleContent).length;
			if (plainLength > MAX_ARTICLE_CONTENT_LENGTH) {
				throw new Error(
					`Article body must be ${MAX_ARTICLE_CONTENT_LENGTH} characters or less (currently ${plainLength}).`,
				);
			}

			const articleImageInput = coverImagePath ? { articleImage: coverImagePath } : {};

			if (mode === 'edit') {
				await updateBoardArticle({
					variables: {
						input: {
							_id: initialArticle!._id,
							articleTitle: articleTitle.trim(),
							articleContent,
							...articleImageInput,
						},
					},
				});
				await sweetTopSuccessAlert('Article updated successfully!', 700);
				await router.push({
					pathname: '/blog/detail',
					query: { id: initialArticle!._id },
				});
			} else {
				await createBoardArticle({
					variables: {
						input: {
							articleTitle: articleTitle.trim(),
							articleContent,
							articleCategory,
							...articleImageInput,
						},
					},
				});
				await sweetTopSuccessAlert('Article created successfully!', 700);
				await router.push({
					pathname: '/mypage',
					query: { category: 'myArticles' },
				});
			}
		} catch (err: any) {
			console.log(err);
			sweetErrorHandling(err).then();
		}
	};

	const coverPreviewUrl = coverImagePath ? resolveArticleImage(coverImagePath) : '';
	const isNearCharLimit =
		bodyCharCount > MAX_ARTICLE_CONTENT_LENGTH * 0.9 && bodyCharCount <= MAX_ARTICLE_CONTENT_LENGTH;

	const editorKey =
		mode === 'edit' ? `edit-${initialArticle?._id ?? 'article'}` : 'create-article';

	return (
		<Stack className="article-form">
			<div className="article-form__mode-toggle" role="tablist" aria-label="Article editor mode">
				<button
					type="button"
					role="tab"
					aria-selected={viewMode === 'edit'}
					className={`article-form__mode-btn${viewMode === 'edit' ? ' is-active' : ''}`}
					onClick={() => setViewMode('edit')}
				>
					Write
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={viewMode === 'preview'}
					className={`article-form__mode-btn${viewMode === 'preview' ? ' is-active' : ''}`}
					onClick={openPreview}
				>
					Preview
				</button>
			</div>

			{viewMode === 'edit' ? (
				<div className="article-form__edit-panel">
					<Stack className="article-form__fields-row" direction="row">
						<Box component="div" className="article-form__field form_row">
							<Typography className="article-form__label" variant="h3">
								Category
							</Typography>
							<FormControl className="article-form__select" fullWidth>
								<Select
									value={articleCategory}
									onChange={changeCategoryHandler}
									displayEmpty
									inputProps={{ 'aria-label': 'Article category' }}
									disabled={mode === 'edit'}
								>
									{ARTICLE_CATEGORY_FORM_OPTIONS.map((category) => (
										<MenuItem key={category} value={category}>
											{getArticleCategoryLabel(category)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							{mode === 'edit' && (
								<Typography className="article-form__hint">
									Category cannot be changed after publishing
								</Typography>
							)}
						</Box>
						<Box component="div" className="article-form__field">
							<Typography className="article-form__label" variant="h3">
								Title
							</Typography>
							<TextField
								className="article-form__text-input"
								value={articleTitle}
								onChange={articleTitleHandler}
								id="article-title"
								placeholder="Enter article title"
								variant="outlined"
								fullWidth
							/>
						</Box>
					</Stack>

					<div className="article-cover-upload">
						<Typography className="article-form__label">Cover image (optional)</Typography>
						<Typography className="article-cover-upload__hint">
							Upload a cover for listings and the article hero. You can also insert images within the
							body using the image tool in the editor toolbar.
						</Typography>
						<div className="article-cover-upload__row">
							{coverImagePath ? (
								<div className="article-cover-upload__preview">
									<img src={coverPreviewUrl} alt="Article cover preview" />
									<IconButton
										className="article-cover-upload__remove"
										size="small"
										onClick={removeCoverImage}
										aria-label="Remove cover image"
									>
										<CloseIcon fontSize="small" />
									</IconButton>
								</div>
							) : null}
							<Button className="article-form__upload-btn" component="label">
								{coverImagePath ? 'Change cover' : 'Upload cover image'}
								<input
									ref={coverInputRef}
									type="file"
									hidden
									accept="image/jpeg,image/jpg,image/png"
									onChange={handleCoverFileChange}
								/>
							</Button>
						</div>
					</div>

					<div className="article-form__body-block">
						<div className="article-body-meta">
							<Typography className="article-form__label">Article body</Typography>
							<div className="article-body-meta__stats">
								<Typography
									className={
										bodyCharCount > MAX_ARTICLE_CONTENT_LENGTH
											? 'article-body-meta__count article-body-meta__count--over'
											: isNearCharLimit
												? 'article-body-meta__count article-body-meta__count--near'
												: 'article-body-meta__count'
									}
								>
									{bodyCharCount} / {MAX_ARTICLE_CONTENT_LENGTH} characters (text only)
								</Typography>
								<Typography className="article-body-meta__read-time">~{readMinutes} min read</Typography>
							</div>
						</div>

						<TiptapArticleBody
							key={editorKey}
							initialContent={mode === 'edit' ? (initialArticle?.articleContent ?? '') : ''}
							onChange={handleBodyChange}
							onEditorReady={(ed) => {
								editorInstanceRef.current = ed;
							}}
							uploadImage={uploadBoardImage}
						/>
					</div>
				</div>
			) : (
				<ArticleEditorPreview
					title={articleTitle}
					category={articleCategory}
					contentHtml={previewHtml}
					coverImagePath={coverImagePath}
					author={user}
				/>
			)}

			<Stack className="article-form__submit-row" direction="row" justifyContent="center">
				{viewMode === 'preview' ? (
					<Button
						className="article-form__submit article-form__submit--secondary"
						variant="outlined"
						onClick={() => setViewMode('edit')}
					>
						Back to editor
					</Button>
				) : null}
				<Button className="article-form__submit update-button" variant="contained" onClick={handleSubmitButton}>
					{mode === 'edit' ? 'Save Changes' : 'Register'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
