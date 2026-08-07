import { REACT_APP_API_URL } from '../config';

export function formatArticleCategory(category: string | undefined | null): string {
	if (!category) return 'Tips';
	const raw = String(category).toLowerCase();
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatArticleDate(value: string | Date | undefined | null): string | null {
	if (!value) return null;
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function makeArticleExcerpt(content: string | undefined | null, max = 140): string {
	if (!content) return '';
	const plain = String(content)
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!plain) return '';
	if (plain.length <= max) return plain;
	return `${plain.slice(0, max).trimEnd()}…`;
}

export function resolveArticleImage(
	imagePath: string | undefined | null,
	fallback = '/images/services/service-grooming.jpg',
): string {
	if (!imagePath?.trim()) return fallback;
	const clean = String(imagePath).replace(/^\/+/, '');
	if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
	// Prefer known upload folders; avoid inventing `/uploads/article/` for board paths.
	if (clean.startsWith('uploads/')) return `${REACT_APP_API_URL}/${clean}`;
	if (clean.startsWith('board/')) return `${REACT_APP_API_URL}/uploads/${clean}`;
	if (clean.startsWith('article/')) return `${REACT_APP_API_URL}/uploads/${clean}`;
	return `${REACT_APP_API_URL}/uploads/article/${clean}`;
}
