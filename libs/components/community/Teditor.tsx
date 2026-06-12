import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, FormControl, IconButton, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { ARTICLE_CATEGORY_FORM_OPTIONS, getArticleCategoryLabel } from '../../utils/articleCategoryMap';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL, REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';

const MAX_ARTICLE_CONTENT_LENGTH = 5000;
const ARTICLE_BODY_PLACEHOLDER = 'Write your article here…';

const ALLOWED_CONTENT_TAGS = new Set(['p', 'strong', 'em', 'b', 'i', 'br', 'ul', 'ol', 'li']);

interface TuiEditorProps {
	initialArticle?: BoardArticle;
	mode?: 'create' | 'edit';
}

/** Strip tags/entities so WYSIWYG placeholders like `<p><br></p>` count as empty. */
function stripHtmlToPlainText(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\u200B/g, '')
		.trim();
}

const EDITOR_CHROME_LABELS = new Set(['write', 'preview', 'markdown', 'wysiwyg']);

function isPlaceholderOnlyContent(content: string): boolean {
	const plain = stripHtmlToPlainText(content);
	if (!plain) return true;
	const normalized = plain.replace(/\u2026/g, '...').toLowerCase();
	const placeholderNorm = ARTICLE_BODY_PLACEHOLDER.replace(/\u2026/g, '...').toLowerCase();
	return normalized === placeholderNorm;
}

/** True when body is empty or only Toast UI tab labels / placeholder leaked into the field. */
function isSpuriousEditorContent(content: string): boolean {
	const plain = stripHtmlToPlainText(content);
	if (!plain) return true;
	if (isPlaceholderOnlyContent(content)) return true;

	const normalized = plain.replace(/\u2026/g, '...').toLowerCase();
	const withoutPlaceholder = normalized
		.replace(/write your article here\.\.\./g, '')
		.replace(/write your article here…/g, '')
		.trim();

	const lines = withoutPlaceholder
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) return true;
	return lines.every((line) => EDITOR_CHROME_LABELS.has(line));
}

function hasArticleBody(content: string): boolean {
	if (isSpuriousEditorContent(content)) return false;
	if (stripHtmlToPlainText(content).length > 0) return true;
	return content.trim().length > 0;
}

/** Keep only text formatting tags; drop images, links, tables, headings, etc. */
function sanitizeArticleContent(html: string): string {
	if (!html) return '';

	let result = html
		.replace(/!\[[^\]]*\]\([^)]+\)/g, '')
		.replace(/<img\b[^>]*\/?>/gi, '')
		.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

	result = result.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tagName) => {
		const tag = tagName.toLowerCase();
		if (!ALLOWED_CONTENT_TAGS.has(tag)) return '';
		if (match.startsWith('</')) return `</${tag}>`;
		if (tag === 'br') return '<br>';
		return `<${tag}>`;
	});

	return result.trim();
}

/** Read live editor output (HTML in WYSIWYG; fall back to markdown if HTML is empty). */
function readEditorContent(editor: Editor | null): string {
	const instance = editor?.getInstance();
	if (!instance) return '';

	const html = typeof instance.getHTML === 'function' ? String(instance.getHTML() ?? '') : '';
	if (hasArticleBody(html)) return html;

	const markdown = typeof instance.getMarkdown === 'function' ? String(instance.getMarkdown() ?? '') : '';
	return markdown.trim() ? markdown : html;
}

const TuiEditor = ({ initialArticle, mode = 'create' }: TuiEditorProps) => {
	const editorRef = useRef<Editor>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();
	const router = useRouter();

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
	const [editorMounted, setEditorMounted] = useState(false);

	useEffect(() => {
		setEditorMounted(true);
	}, []);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);


	const uploadCoverImage = async (file: File) => {
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
			const path = await uploadCoverImage(file);
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

	const updateBodyCharCount = () => {
		const raw = readEditorContent(editorRef.current);
		const sanitized = sanitizeArticleContent(raw);
		const plain = isSpuriousEditorContent(sanitized) ? '' : stripHtmlToPlainText(sanitized);
		setBodyCharCount(plain.length);
	};

	const initializeEditorOnLoad = () => {
		const instance = editorRef.current?.getInstance();
		if (!instance) return;

		if (typeof instance.isMarkdownMode === 'function' && instance.isMarkdownMode()) {
			instance.changeMode('wysiwyg');
		}

		if (mode === 'create') {
			setTimeout(() => {
				const inst = editorRef.current?.getInstance();
				if (!inst) return;
				inst.setMarkdown('');
				if (typeof inst.setHTML === 'function') inst.setHTML('');
				inst.focus();
				inst.blur();
				setBodyCharCount(0);
			}, 100);
			return;
		}

		if (mode === 'edit' && initialArticle?.articleContent) {
			const sanitized = sanitizeArticleContent(initialArticle.articleContent);
			instance.setHTML(sanitized);
			setBodyCharCount(stripHtmlToPlainText(sanitized).length);
		}
	};

	const handleSubmitButton = async () => {
		try {
			const rawContent = readEditorContent(editorRef.current);
			const articleContent = sanitizeArticleContent(rawContent);

			if (!hasArticleBody(articleContent) || !articleTitle.trim()) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			const plainLength = stripHtmlToPlainText(articleContent).length;
			if (plainLength > MAX_ARTICLE_CONTENT_LENGTH) {
				throw new Error(`Article body must be ${MAX_ARTICLE_CONTENT_LENGTH} characters or less (currently ${plainLength}).`);
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

	const coverPreviewUrl = coverImagePath ? `${REACT_APP_API_URL}/${coverImagePath}` : '';
	const isNearCharLimit =
		bodyCharCount > MAX_ARTICLE_CONTENT_LENGTH * 0.9 && bodyCharCount <= MAX_ARTICLE_CONTENT_LENGTH;

	return (
		<Stack className="article-form">
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
					Upload a cover for the article listing. Images cannot be embedded in the body — use formatting only in the
					editor below.
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

			<div className="article-body-meta">
				<Typography className="article-form__label">Article body</Typography>
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
			</div>

			<div className="article-editor-wrap toastui-editor-shell">
				{editorMounted ? (
					<Editor
						key={mode === 'edit' ? `edit-${initialArticle?._id ?? 'article'}` : 'create-article'}
						initialValue=" "
						placeholder={ARTICLE_BODY_PLACEHOLDER}
						height="640px"
						initialEditType="wysiwyg"
						hideModeSwitch={true}
						usageStatistics={false}
						toolbarItems={[['bold', 'italic'], ['ul', 'ol']]}
						ref={editorRef}
						onLoad={initializeEditorOnLoad}
						onChange={updateBodyCharCount}
					/>
				) : null}
			</div>

			<Stack className="article-form__submit-row" direction="row" justifyContent="center">
				<Button className="article-form__submit update-button" variant="contained" onClick={handleSubmitButton}>
					{mode === 'edit' ? 'Save Changes' : 'Register'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
