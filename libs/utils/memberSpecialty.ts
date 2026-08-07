import type { Member } from '../types/member/member';

const SPECIALTY_RULES: { label: string; keywords: string[] }[] = [
	{ label: 'GROOMING', keywords: ['groom', 'salon', 'bath', 'blowdry'] },
	{ label: 'VETERINARY', keywords: ['vet', 'veterinar', 'clinic', 'medical', 'vaccine', 'dental'] },
	{ label: 'TRAINING', keywords: ['train', 'behavior', 'obedience', 'puppy'] },
	{ label: 'PET SITTING', keywords: ['sit', 'boarding', 'daycare', 'stay'] },
	{ label: 'DOG WALKING', keywords: ['walk', 'exercise', 'outdoor'] },
	{ label: 'CAT CARE', keywords: ['cat', 'feline'] },
];

const memberHaystack = (member: Member): string =>
	`${member?.memberDesc ?? ''} ${member?.memberFullName ?? ''} ${member?.memberNick ?? ''}`.toLowerCase();

/** Uppercase specialty label inferred from profile copy — used on listing cards. */
export const getMemberSpecialtyCategory = (member: Member): string => {
	const text = memberHaystack(member);
	const match = SPECIALTY_RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
	return match?.label ?? 'PET CARE';
};

const PLACEHOLDER_IMAGE_MARKERS = ['defaultuser', 'default-user', 'placeholder', 'avatar-default'];

/** True when the member has a real uploaded portrait (not empty or stock placeholder). */
export const hasRealMemberPhoto = (imagePath?: string | null): boolean => {
	if (!imagePath?.trim()) return false;
	const lower = imagePath.trim().toLowerCase();
	return !PLACEHOLDER_IMAGE_MARKERS.some((marker) => lower.includes(marker));
};
