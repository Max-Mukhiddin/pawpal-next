/**
 * Display-only mapping for BoardArticleCategory enum values.
 *
 * Backend enum values (FREE / RECOMMEND / NEWS / HUMOR) are NEVER changed here —
 * only the visible label shown in the UI is remapped.
 */

import { BoardArticleCategory } from '../enums/board-article.enum';

export const ARTICLE_CATEGORY_ALL = 'ALL' as const;

export type ArticleCategoryFilter = typeof ARTICLE_CATEGORY_ALL | BoardArticleCategory;

export const ARTICLE_CATEGORY_LABEL_MAP: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]: 'General',
	[BoardArticleCategory.RECOMMEND]: 'Recommendations',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.HUMOR]: 'Fun & Humor',
};

/** Returns the UI display label for a given backend category value. */
export function getArticleCategoryLabel(category: string | undefined): string {
	if (!category) return '';
	return ARTICLE_CATEGORY_LABEL_MAP[category as BoardArticleCategory] ?? category;
}

/**
 * Sidebar / filter options. `value` is sent to the API (ALL = no category filter).
 */
export const ARTICLE_CATEGORY_FILTER_OPTIONS: Array<{ value: ArticleCategoryFilter; label: string }> = [
	{ value: ARTICLE_CATEGORY_ALL, label: 'All' },
	{ value: BoardArticleCategory.FREE, label: 'General' },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Recommendations' },
	{ value: BoardArticleCategory.NEWS, label: 'News' },
	{ value: BoardArticleCategory.HUMOR, label: 'Fun & Humor' },
];

/** Blog list sidebar — `null` = All (no `articleCategory` in search). */
export const BLOG_CATEGORY_FILTERS: Array<{ label: string; value: BoardArticleCategory | null }> = [
	{ label: 'All', value: null },
	{ label: 'General', value: BoardArticleCategory.FREE },
	{ label: 'Recommendations', value: BoardArticleCategory.RECOMMEND },
	{ label: 'News', value: BoardArticleCategory.NEWS },
	{ label: 'Fun & Humor', value: BoardArticleCategory.HUMOR },
];

/** Write / edit article dropdown order (enum values only). */
export const ARTICLE_CATEGORY_FORM_OPTIONS: BoardArticleCategory[] = [
	BoardArticleCategory.FREE,
	BoardArticleCategory.RECOMMEND,
	BoardArticleCategory.NEWS,
	BoardArticleCategory.HUMOR,
];

/** @deprecated Use ARTICLE_CATEGORY_FILTER_OPTIONS */
export const ARTICLE_CATEGORIES = ARTICLE_CATEGORY_FILTER_OPTIONS.filter(
	(c) => c.value !== ARTICLE_CATEGORY_ALL,
) as Array<{ value: BoardArticleCategory; label: string }>;
