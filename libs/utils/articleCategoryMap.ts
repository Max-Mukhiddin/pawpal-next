/**
 * Display-only mapping for BoardArticleCategory enum values.
 *
 * Backend enum values (FREE / RECOMMEND / NEWS / HUMOR) are NEVER changed here —
 * only the visible label shown in the UI is remapped to a pet-care blog theme.
 *
 * Usage:
 *   import { getArticleCategoryLabel, ARTICLE_CATEGORIES } from '../utils/articleCategoryMap';
 *   getArticleCategoryLabel('FREE')  // → 'Pet Care'
 */

import { BoardArticleCategory } from '../enums/board-article.enum';

export const ARTICLE_CATEGORY_LABEL_MAP: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]: 'Pet Care',
	[BoardArticleCategory.RECOMMEND]: 'Training',
	[BoardArticleCategory.NEWS]: 'Health',
	[BoardArticleCategory.HUMOR]: 'Lifestyle',
};

/** Returns the UI display label for a given backend category value. */
export function getArticleCategoryLabel(category: string | undefined): string {
	if (!category) return '';
	return ARTICLE_CATEGORY_LABEL_MAP[category as BoardArticleCategory] ?? category;
}

/**
 * Ordered list of categories for sidebar / filter rendering.
 * `value` is the backend enum — never change it.
 * `label` is the display-only string.
 */
export const ARTICLE_CATEGORIES: Array<{ value: BoardArticleCategory; label: string }> = [
	{ value: BoardArticleCategory.FREE, label: 'Pet Care' },
	{ value: BoardArticleCategory.RECOMMEND, label: 'Training' },
	{ value: BoardArticleCategory.NEWS, label: 'Health' },
	{ value: BoardArticleCategory.HUMOR, label: 'Lifestyle' },
];
