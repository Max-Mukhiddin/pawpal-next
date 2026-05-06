/**
 * Redirect wrapper — /community → /blog
 * Keeps old URLs working for any bookmarks or external links.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CommunityRedirect() {
	const router = useRouter();
	useEffect(() => {
		if (!router.isReady) return;
		const { articleCategory, ...rest } = router.query;
		router.replace(
			{
				pathname: '/blog',
				query: articleCategory ? { articleCategory, ...rest } : rest,
			},
			undefined,
			{ shallow: false },
		);
	}, [router.isReady]);

	return null;
}
