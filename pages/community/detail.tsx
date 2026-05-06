/**
 * Redirect wrapper — /community/detail → /blog/detail
 * Passes all query params (id, articleCategory, etc.) through unchanged.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CommunityDetailRedirect() {
	const router = useRouter();
	useEffect(() => {
		if (!router.isReady) return;
		router.replace(
			{ pathname: '/blog/detail', query: router.query },
			undefined,
			{ shallow: false },
		);
	}, [router.isReady]);

	return null;
}
