import { useRouter } from 'next/router';

const SEGMENT_LABELS: Record<string, string> = {
	users: 'Users',
	listings: 'Listings',
	community: 'Community',
	properties: 'Listings',
	cs: 'Support',
	faq: 'FAQ',
	notice: 'Notice',
	inquiry: 'Inquiry',
};

export function useAdminBreadcrumb() {
	const { pathname } = useRouter();
	const segments = pathname.split('/').filter(Boolean);
	const adminIndex = segments.indexOf('_admin');
	const trail = adminIndex >= 0 ? segments.slice(adminIndex + 1) : [];

	if (trail.length === 0) {
		return [{ label: 'PawPal Admin', href: '/_admin/users' }, { label: 'Dashboard', href: '/_admin/users' }];
	}

	const crumbs = [{ label: 'PawPal Admin', href: '/_admin/users' }];

	trail.forEach((seg, i) => {
		const href = `/_admin/${trail.slice(0, i + 1).join('/')}`;
		crumbs.push({ label: SEGMENT_LABELS[seg] ?? seg, href });
	});

	return crumbs;
}
