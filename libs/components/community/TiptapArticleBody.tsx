import React, { useEffect, useMemo, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor } from '@tiptap/core';
import { REACT_APP_API_URL } from '../../config';
import {
	estimateReadTimeMinutes,
	isArticleHtmlContent,
	resolveInlineImagesInHtml,
	sanitizeArticleContent,
	stripHtmlToPlainText,
} from '../../utils/articleContentHelpers';

export type TiptapArticleBodyProps = {
	initialContent?: string;
	placeholder?: string;
	onChange?: (payload: { html: string; plainLength: number; readMinutes: number }) => void;
	onEditorReady?: (editor: Editor) => void;
	uploadImage: (file: File) => Promise<string>;
};

type ToolbarButtonProps = {
	label: string;
	tooltip: string;
	active?: boolean;
	onClick: () => void;
	classSuffix?: string;
};

function ToolbarButton({ label, tooltip, active, onClick, classSuffix = '' }: ToolbarButtonProps) {
	return (
		<button
			type="button"
			className={`article-tiptap-toolbar__btn article-tiptap-toolbar__btn--${classSuffix || 'default'}${active ? ' is-active' : ''}`}
			onClick={onClick}
			title={tooltip}
			aria-label={tooltip}
		>
			<span className="article-tiptap-toolbar__label">{label}</span>
		</button>
	);
}

function ArticleTiptapToolbar({ editor }: { editor: Editor | null }) {
	if (!editor) return null;

	const setLink = () => {
		const previousUrl = editor.getAttributes('link').href as string | undefined;
		const url = window.prompt('Enter link URL', previousUrl || 'https://');
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	};

	return (
		<div className="article-tiptap-toolbar" role="toolbar" aria-label="Article formatting">
			<div className="article-tiptap-toolbar__group">
				<ToolbarButton
					label="H2"
					tooltip="Heading 2"
					classSuffix="heading"
					active={editor.isActive('heading', { level: 2 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				/>
				<ToolbarButton
					label="H3"
					tooltip="Heading 3"
					classSuffix="heading"
					active={editor.isActive('heading', { level: 3 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				/>
				<ToolbarButton
					label="B"
					tooltip="Bold"
					classSuffix="bold"
					active={editor.isActive('bold')}
					onClick={() => editor.chain().focus().toggleBold().run()}
				/>
				<ToolbarButton
					label="I"
					tooltip="Italic"
					classSuffix="italic"
					active={editor.isActive('italic')}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				/>
			</div>
			<div className="article-tiptap-toolbar__group">
				<ToolbarButton
					label="❝"
					tooltip="Block quote"
					classSuffix="quote"
					active={editor.isActive('blockquote')}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				/>
				<ToolbarButton
					label="•"
					tooltip="Bullet list"
					classSuffix="list"
					active={editor.isActive('bulletList')}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				/>
				<ToolbarButton
					label="1."
					tooltip="Numbered list"
					classSuffix="list"
					active={editor.isActive('orderedList')}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				/>
			</div>
			<div className="article-tiptap-toolbar__group">
				<ToolbarButton
					label="Img"
					tooltip="Insert image"
					classSuffix="image"
					onClick={() => {
						const input = document.getElementById('article-tiptap-image-input') as HTMLInputElement | null;
						input?.click();
					}}
				/>
				<ToolbarButton
					label="Link"
					tooltip="Insert link"
					classSuffix="link"
					active={editor.isActive('link')}
					onClick={setLink}
				/>
			</div>
		</div>
	);
}

/** Stable extension list — must not be recreated on every render (ProseMirror plugin keys). */
function buildArticleEditorExtensions(placeholder: string) {
	return [
		StarterKit.configure({
			heading: { levels: [2, 3] },
			code: false,
			codeBlock: false,
			horizontalRule: false,
			strike: false,
		}),
		Image.configure({
			inline: false,
			allowBase64: false,
		}),
		Link.configure({
			openOnClick: false,
			HTMLAttributes: {
				target: '_blank',
				rel: 'noopener noreferrer',
			},
		}),
		Placeholder.configure({
			placeholder,
			emptyEditorClass: 'is-editor-empty',
		}),
	];
}

export default function TiptapArticleBody({
	initialContent = '',
	placeholder = 'Write your article here…',
	onChange,
	onEditorReady,
	uploadImage,
}: TiptapArticleBodyProps) {
	const imageInputRef = useRef<HTMLInputElement>(null);
	const initialAppliedRef = useRef(false);
	const onChangeRef = useRef(onChange);
	const onEditorReadyRef = useRef(onEditorReady);
	const uploadImageRef = useRef(uploadImage);

	onChangeRef.current = onChange;
	onEditorReadyRef.current = onEditorReady;
	uploadImageRef.current = uploadImage;

	const extensions = useMemo(() => buildArticleEditorExtensions(placeholder), [placeholder]);

	const editorProps = useMemo(
		() => ({
			attributes: {
				class: 'article-tiptap-editor__content',
				'data-placeholder': placeholder,
			},
		}),
		[placeholder],
	);

	const editor = useEditor(
		{
			extensions,
			content: '',
			editorProps,
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
			onCreate: ({ editor: ed }) => {
				onEditorReadyRef.current?.(ed);
			},
			onUpdate: ({ editor: ed }) => {
				const rawHtml = ed.getHTML();
				const sanitized = sanitizeArticleContent(rawHtml);
				const plain = stripHtmlToPlainText(sanitized);
				onChangeRef.current?.({
					html: sanitized,
					plainLength: plain.length,
					readMinutes: estimateReadTimeMinutes(sanitized),
				});
			},
		},
		[extensions, editorProps],
	);

	useEffect(() => {
		if (!editor || initialAppliedRef.current) return;

		if (!initialContent.trim()) {
			initialAppliedRef.current = true;
			const rawHtml = editor.getHTML();
			const sanitized = sanitizeArticleContent(rawHtml);
			const plain = stripHtmlToPlainText(sanitized);
			onChangeRef.current?.({
				html: sanitized,
				plainLength: plain.length,
				readMinutes: estimateReadTimeMinutes(sanitized),
			});
			return;
		}

		if (isArticleHtmlContent(initialContent)) {
			const prepared = resolveInlineImagesInHtml(sanitizeArticleContent(initialContent));
			editor.commands.setContent(prepared, { emitUpdate: false });
		} else {
			editor.commands.setContent(initialContent, { emitUpdate: false });
		}

		initialAppliedRef.current = true;
		const rawHtml = editor.getHTML();
		const sanitized = sanitizeArticleContent(rawHtml);
		const plain = stripHtmlToPlainText(sanitized);
		onChangeRef.current?.({
			html: sanitized,
			plainLength: plain.length,
			readMinutes: estimateReadTimeMinutes(sanitized),
		});
	}, [editor, initialContent]);

	const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file || !editor || editor.isDestroyed) return;

		const mime = (file.type || '').toLowerCase();
		if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) return;

		try {
			const path = await uploadImageRef.current(file);
			const src = `${REACT_APP_API_URL}/${path}`.replace(/([^:]\/)\/+/g, '$1');
			editor.chain().focus().setImage({ src, alt: 'Article image' }).run();
		} catch {
			// Parent handles errors
		}
	};

	if (!editor) {
		return <div className="article-editor-wrap article-tiptap-shell article-tiptap-shell--loading" />;
	}

	return (
		<div className="article-editor-wrap article-tiptap-shell">
			<ArticleTiptapToolbar editor={editor} />
			<EditorContent editor={editor} />
			<input
				id="article-tiptap-image-input"
				ref={imageInputRef}
				type="file"
				hidden
				accept="image/jpeg,image/jpg,image/png"
				onChange={handleImageFile}
			/>
		</div>
	);
}
