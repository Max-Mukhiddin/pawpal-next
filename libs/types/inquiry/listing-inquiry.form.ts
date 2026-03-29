/** Shared shape for listing/specialist contact forms (frontend-only until inquiry API exists). */
export interface ListingInquiryFormValues {
	name: string;
	phone: string;
	email: string;
	message: string;
}

export const emptyListingInquiryForm = (): ListingInquiryFormValues => ({
	name: '',
	phone: '',
	email: '',
	message: '',
});

export type ListingInquiryFormField = keyof ListingInquiryFormValues;
