/** Variables for `createInquiry` — only required fields are sent from the listing inquiry form. */
export interface InquiryInput {
	listingId: string;
	name: string;
	phone: string;
	email: string;
	message: string;
	agentId?: string;
	customerId?: string;
	inquiryStatus?: string;
}
