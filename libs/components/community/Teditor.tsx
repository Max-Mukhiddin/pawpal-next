import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { Messages, REACT_APP_API_GRAPHQL_URL, REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';

interface TuiEditorProps {
	initialArticle?: BoardArticle;
	mode?: 'create' | 'edit';
}

const TuiEditor = ({ initialArticle, mode = 'create' }: TuiEditorProps) => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(
		mode === 'edit' ? (initialArticle?.articleCategory ?? BoardArticleCategory.FREE) : BoardArticleCategory.FREE,
	);

	// Controlled title state — supports prefilling in edit mode
	const [articleTitle, setArticleTitle] = useState<string>(
		mode === 'edit' ? (initialArticle?.articleTitle ?? '') : '',
	);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	// Mutable value bag for content + image (same pattern as before)
	const memoizedValues = useMemo(
		() => ({
			articleContent: initialArticle?.articleContent ?? '',
			articleImage: initialArticle?.articleImage ?? '',
		}),
		[],
	);

	// Prefill the editor with existing HTML content in edit mode
	useEffect(() => {
		if (mode === 'edit' && initialArticle?.articleContent) {
			setTimeout(() => {
				editorRef.current?.getInstance().setHTML(initialArticle.articleContent);
			}, 0);
		}
	}, []);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader as string;
			const path = String(responseImage ?? '').replace(/^\/+/, '');
			memoizedValues.articleImage = path;

			return `${REACT_APP_API_URL}/${path}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleSubmitButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (!memoizedValues.articleContent || !articleTitle) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			if (mode === 'edit') {
				await updateBoardArticle({
					variables: {
						input: {
							_id: initialArticle!._id,
							articleTitle,
							articleContent: memoizedValues.articleContent,
							...(memoizedValues.articleImage && { articleImage: memoizedValues.articleImage }),
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
							articleTitle,
							articleContent: memoizedValues.articleContent,
							articleImage: memoizedValues.articleImage,
							articleCategory,
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
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		}
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
							disabled={mode === 'edit'}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
					{mode === 'edit' && (
						<Typography style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
							Category cannot be changed after publishing
						</Typography>
					)}
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						value={articleTitle}
						onChange={articleTitleHandler}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={''}
				placeholder={'Type here'}
				previewStyle={'vertical'}
				height={'640px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleSubmitButton}
				>
					{mode === 'edit' ? 'Save Changes' : 'Register'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
