import { formatMemberBadgeLabel, getMemberTypeLabel } from './memberDisplay';

export { formatMemberBadgeLabel, getMemberTypeLabel };

/** UI label for member type — AGENT → Specialist (uppercase for admin badge chrome) */
export function formatAdminMemberType(memberType?: string | null): string {
	return getMemberTypeLabel(memberType).toUpperCase();
}

/** CSS modifier class for status pill badges in admin tables */
export function getAdminStatusBadgeClass(status?: string | null): string {
	switch (status) {
		case 'ACTIVE':
			return 'admin-badge admin-badge--active';
		case 'BLOCK':
			return 'admin-badge admin-badge--blocked';
		case 'DELETE':
			return 'admin-badge admin-badge--deleted';
		case 'PENDING':
			return 'admin-badge admin-badge--pending';
		default:
			return 'admin-badge';
	}
}

export function getAdminMemberTypeBadgeClass(memberType?: string | null): string {
	switch (memberType) {
		case 'AGENT':
			return 'admin-badge admin-badge--specialist';
		case 'ADMIN':
			return 'admin-badge admin-badge--admin';
		default:
			return 'admin-badge admin-badge--user';
	}
}

export function getAdminListingStatusBadgeClass(status?: string | null): string {
	switch (status) {
		case 'ACTIVE':
			return 'admin-badge admin-badge--active';
		case 'SOLD':
			return 'admin-badge admin-badge--pending';
		case 'DELETE':
			return 'admin-badge admin-badge--deleted';
		default:
			return 'admin-badge';
	}
}

export function getAdminListingTypeBadgeClass(listingType?: string | null): string {
	switch (listingType) {
		case 'SERVICE':
			return 'admin-badge admin-badge--specialist';
		case 'PRODUCT':
			return 'admin-badge admin-badge--user';
		default:
			return 'admin-badge';
	}
}
