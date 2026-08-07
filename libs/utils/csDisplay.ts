/** Shared CS (FAQ / Notice) display helpers for admin + consumer pages. */

export const FAQ_CATEGORIES = ['PAYMENT', 'ACCOUNT', 'TECHNICAL', 'GENERAL', 'EVENT'] as const;
export const NOTICE_CATEGORIES = ['PAYMENT', 'ACCOUNT', 'TECHNICAL', 'EVENT', 'GENERAL'] as const;
export const CS_STATUS_TABS = ['ALL', 'ACTIVE', 'HOLD', 'DELETE'] as const;

export type CsStatusTab = (typeof CS_STATUS_TABS)[number];

export function formatCsCategory(category?: string | null): string {
	if (!category) return '—';
	return category.charAt(0) + category.slice(1).toLowerCase();
}

export function formatCsStatusLabel(status?: string | null): string {
	switch (status) {
		case 'ACTIVE':
			return 'Active';
		case 'HOLD':
			return 'On Hold';
		case 'DELETE':
			return 'Deleted';
		default:
			return status ?? '—';
	}
}

export function getCsStatusBadgeClass(status?: string | null): string {
	switch (status) {
		case 'ACTIVE':
			return 'admin-badge admin-badge--active';
		case 'HOLD':
			return 'admin-badge admin-badge--pending';
		case 'DELETE':
			return 'admin-badge admin-badge--deleted';
		default:
			return 'admin-badge';
	}
}
