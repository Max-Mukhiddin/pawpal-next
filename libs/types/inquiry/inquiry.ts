/** Minimal `Inquiry` shape returned by `createInquiry`. */
export interface Inquiry {
	_id: string;
	listingId: string;
	agentId?: string | null;
	customerId?: string | null;
	name: string;
	phone: string;
	email: string;
	message: string;
	inquiryStatus?: string | null;
	createdAt: string;
	updatedAt: string;
}
