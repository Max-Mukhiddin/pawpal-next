import { REACT_APP_API_URL } from '../config';

const API_BASE = REACT_APP_API_URL || 'http://localhost:5007';

const isLocalAssetPath = (path: string) =>
	path.startsWith('/images/') || path.startsWith('/img/') || path.startsWith('/public/') || path.startsWith('/icons/');

export const resolveListingImageUrl = (
	imagePath?: string | null,
	fallback = '/img/listing/default-listing.webp',
): string => {
	if (!imagePath) return fallback;
	if (imagePath.startsWith('http')) return imagePath;
	if (isLocalAssetPath(imagePath)) return imagePath;
	const clean = imagePath.replace(/^\/+/, '');
	if (clean.startsWith('uploads/')) return `${API_BASE}/${clean}`;
	return `${API_BASE}/uploads/listing/${clean}`;
};

export const resolveMemberImageUrl = (
	imagePath?: string | null,
	fallback = '/img/profile/defaultUser.svg',
): string => {
	if (!imagePath) return fallback;
	if (imagePath.startsWith('http')) return imagePath;
	if (isLocalAssetPath(imagePath)) return imagePath;
	const clean = imagePath.replace(/^\/+/, '');
	if (clean.startsWith('uploads/')) return `${API_BASE}/${clean}`;
	return `${API_BASE}/uploads/member/${clean}`;
};
