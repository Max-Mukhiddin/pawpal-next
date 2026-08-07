import type { Member } from '../types/member/member';

export type SidebarFilterState = {
	specialty: string[];
	location: string[];
	experience: string[];
	availability: string[];
};

export const DEFAULT_SIDEBAR_FILTERS: SidebarFilterState = {
	specialty: [],
	location: [],
	experience: [],
	availability: [],
};

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
	Veterinarian: ['vet', 'veterinar', 'clinic', 'medical'],
	Groomer: ['groom', 'salon', 'bath', 'blowdry'],
	Trainer: ['train', 'behavior', 'obedience'],
	Sitter: ['sit', 'boarding', 'daycare', 'stay'],
	Walker: ['walk', 'exercise', 'outdoor'],
};

const EXPERIENCE_RANGES: Record<string, (years: number) => boolean> = {
	'1-3 years': (y) => y >= 1 && y <= 3,
	'3-5': (y) => y >= 3 && y <= 5,
	'5-10': (y) => y >= 5 && y <= 10,
	'10+': (y) => y >= 10,
};

const getExperienceYears = (member: Member): number => {
	const desc = member?.memberDesc ?? '';
	const match = desc.match(/(\d+)\s*years?/i);
	const listings = member?.memberListings ?? 0;
	return match ? parseInt(match[1], 10) : Math.max(1, Math.min(20, Math.round(listings / 8) + 1));
};

const haystack = (member: Member) =>
	`${member?.memberDesc ?? ''} ${member?.memberFullName ?? ''} ${member?.memberNick ?? ''} ${member?.memberAddress ?? ''}`.toLowerCase();

export const applySidebarFilters = (agents: Member[], filters: SidebarFilterState): Member[] => {
	let result = agents;

	if (filters.specialty.length > 0) {
		result = result.filter((m) =>
			filters.specialty.some((label) => {
				const keys = SPECIALTY_KEYWORDS[label] ?? [label.toLowerCase()];
				const text = haystack(m);
				return keys.some((k) => text.includes(k));
			}),
		);
	}

	if (filters.location.length > 0) {
		result = result.filter((m) => {
			const addr = (m?.memberAddress ?? '').toLowerCase();
			return filters.location.some((loc) => addr.includes(loc.toLowerCase()));
		});
	}

	if (filters.experience.length > 0) {
		result = result.filter((m) => {
			const years = getExperienceYears(m);
			return filters.experience.some((range) => EXPERIENCE_RANGES[range]?.(years));
		});
	}

	if (filters.availability.length > 0) {
		result = result.filter((m) => {
			const text = haystack(m);
			return filters.availability.some((slot) => text.includes(slot.toLowerCase()));
		});
	}

	return result;
};
