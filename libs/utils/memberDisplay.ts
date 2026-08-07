import { MemberType } from '../enums/member.enum';

/**
 * User-facing member type labels.
 * API / GraphQL continue to use MemberType.AGENT — never send "SPECIALIST" to the backend.
 */
export function getMemberTypeLabel(type?: MemberType | string | null): string {
	switch (String(type ?? '').toUpperCase()) {
		case MemberType.AGENT:
			return 'Specialist';
		case MemberType.ADMIN:
			return 'Admin';
		case MemberType.USER:
			return 'User';
		default:
			return type ? String(type) : '—';
	}
}

/** @deprecated Prefer `getMemberTypeLabel` — alias kept for existing imports. */
export function formatMemberBadgeLabel(memberType?: string | null): string {
	return getMemberTypeLabel(memberType);
}

/** Initials for avatar fallbacks — prefers first letters of first + last name. */
export function getMemberInitials(name?: string | null): string {
	const trimmed = name?.trim();
	if (!trimmed) return 'A';
	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
	}
	return trimmed.slice(0, 2).toUpperCase();
}
