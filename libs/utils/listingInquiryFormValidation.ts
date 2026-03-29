import type { ListingInquiryFormValues } from '../types/inquiry/listing-inquiry.form';

export type ListingInquiryFieldErrors = Partial<Record<keyof ListingInquiryFormValues, string>>;

/** Minimal sanity check — aligns with backend expectations, not a full RFC parser. */
const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX = 100;
const PHONE_MIN = 3;
const PHONE_MAX = 30;
const MESSAGE_MAX = 500;

export function isPlausibleListingInquiryEmail(email: string): boolean {
	const t = email.trim();
	if (!t) return false;
	return EMAIL_LIKE.test(t);
}

export function trimListingInquiryValues(values: ListingInquiryFormValues): ListingInquiryFormValues {
	return {
		name: values.name.trim(),
		phone: values.phone.trim(),
		email: values.email.trim(),
		message: values.message.trim(),
	};
}

export function validateListingInquiryForm(values: ListingInquiryFormValues): ListingInquiryFieldErrors {
	const t = trimListingInquiryValues(values);
	const errors: ListingInquiryFieldErrors = {};

	if (!t.name) errors.name = 'Name is required.';
	else if (t.name.length > NAME_MAX) errors.name = `Name must be at most ${NAME_MAX} characters.`;

	if (!t.phone) errors.phone = 'Phone is required.';
	else if (t.phone.length < PHONE_MIN || t.phone.length > PHONE_MAX) {
		errors.phone = `Phone must be between ${PHONE_MIN} and ${PHONE_MAX} characters.`;
	}

	if (!t.email) errors.email = 'Email is required.';
	else if (!isPlausibleListingInquiryEmail(t.email)) errors.email = 'Enter a valid email address.';

	if (!t.message) errors.message = 'Message is required.';
	else if (t.message.length > MESSAGE_MAX) errors.message = `Message must be at most ${MESSAGE_MAX} characters.`;

	return errors;
}
