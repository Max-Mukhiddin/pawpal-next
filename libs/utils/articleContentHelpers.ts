import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { REACT_APP_API_URL } from '../config';
import { resolveArticleImage } from './articleCardHelpers';

export type ArticleTocItem = {
	id: string;
	text: string;
	level: 2 | 3;
};

export const ARTICLE_ALLOWED_TAGS = [
	'h2',
	'h3',
	'p',
	'strong',
	'em',
	'b',
	'i',
	'blockquote',
	'ul',
	'ol',
	'li',
	'img',
	'a',
	'br',
];

function isAllowedImageSrc(src: string): boolean {
	const trimmed = src.trim();
	if (!trimmed) return false;
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
	if (trimmed.startsWith('uploads/') || trimmed.startsWith('/uploads/')) return true;
	return false;
}

function normalizeStoredImageSrc(src: string): string {
	const apiBase = (REACT_APP_API_URL || '').replace(/\/$/, '');
	if (apiBase && src.startsWith(`${apiBase}/`)) {
		return src.slice(apiBase.length + 1);
	}
	return src.replace(/^\/+/, '');
}

/** True when content contains HTML markup (new articles). Plain-text legacy articles return false. */
export function isArticleHtmlContent(content: string | undefined | null): boolean {
	if (!content?.trim()) return false;
	return /<[a-z][a-z0-9]*\b[^>]*>/i.test(content);
}

export function slugifyHeading(text: string): string {
	return (
		text
			.toLowerCase()
			.replace(/&[a-z]+;/gi, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'section'
	);
}

/** Visible text only — strips tags and normalizes whitespace (for character limits). */
export function stripHtmlToPlainText(html: string): string {
	return String(html)
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\u200B/g, '')
		.trim();
}

export function stripHtml(html: string): string {
	return stripHtmlToPlainText(html).replace(/\s+/g, ' ').trim();
}

export function estimateReadTimeMinutes(content: string | undefined | null, wpm = 200): number {
	const words = stripHtml(content || '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / wpm));
}

/** Sanitize article HTML before save or render (matches backend allowlist). */
export function sanitizeArticleContent(html: string): string {
	if (!html?.trim()) return '';

	const options: IOptions = {
		allowedTags: ARTICLE_ALLOWED_TAGS,
		allowedAttributes: {
			a: ['href', 'target', 'rel'],
			img: ['src', 'alt'],
			h2: ['id'],
			h3: ['id'],
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowedSchemesByTag: {
			img: ['http', 'https'],
		},
		exclusiveFilter: (frame) => {
			if (frame.tag === 'img') {
				return !isAllowedImageSrc(frame.attribs.src || '');
			}
			return false;
		},
		transformTags: {
			a: (_tagName, attribs) => ({
				tagName: 'a',
				attribs: {
					href: attribs.href || '',
					target: '_blank',
					rel: 'noopener noreferrer',
				},
			}),
		},
	};

	let result = sanitizeHtml(html, options).trim();

	result = result.replace(
		/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
		(_match, prefix: string, src: string, suffix: string) =>
			`${prefix}${normalizeStoredImageSrc(src)}${suffix}`,
	);

	return result;
}

/**
 * Inject stable anchor ids into H2/H3 tags for TOC + scroll-spy.
 * Only meaningful for HTML content.
 */
export function enrichArticleHtml(html: string | undefined | null): {
	html: string;
	headings: ArticleTocItem[];
} {
	if (!html?.trim() || !isArticleHtmlContent(html)) {
		return { html: html?.trim() ?? '', headings: [] };
	}

	const sanitized = sanitizeArticleContent(html);
	const headings: ArticleTocItem[] = [];
	const usedIds = new Set<string>();
	let index = 0;

	const enriched = sanitized.replace(
		/<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
		(_match, tag: string, attrs: string | undefined, inner: string) => {
			const text = stripHtml(inner);
			if (!text) return _match;

			const level = tag.toLowerCase() === 'h2' ? 2 : 3;
			const baseId = slugifyHeading(text);
			let id = `${baseId}-${index}`;
			while (usedIds.has(id)) {
				index += 1;
				id = `${baseId}-${index}`;
			}
			usedIds.add(id);
			headings.push({ id, text, level });
			index += 1;

			const attrStr = attrs ?? '';
			if (/\bid\s*=/.test(attrStr)) {
				return `<${tag}${attrStr}>${inner}</${tag}>`;
			}
			return `<${tag}${attrStr} id="${id}">${inner}</${tag}>`;
		},
	);

	return { html: enriched, headings };
}

/** Resolve relative upload paths in inline `<img src>` for display. */
export function resolveInlineImagesInHtml(html: string | undefined | null): string {
	if (!html?.trim()) return '';
	return html.replace(
		/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
		(_match, prefix: string, src: string, suffix: string) =>
			`${prefix}${resolveArticleImage(src, src)}${suffix}`,
	);
}
