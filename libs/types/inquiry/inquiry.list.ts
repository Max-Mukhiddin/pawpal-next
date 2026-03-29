import type { InquiryStatus } from './inquiry-status.enum';

export interface InquiryListingPreview {
	_id?: string | null;
	listingTitle?: string | null;
	listingType?: string | null;
	listingLocation?: string | null;
}

export interface InquiryMemberPreview {
	_id?: string | null;
	memberNick?: string | null;
	memberPhone?: string | null;
	memberImage?: string | null;
}

/** Inquiry row from `getMyInquiries` / `getAgentInquiries`. */
export interface InquiryListItem {
	_id: string;
	listingId: string;
	agentId?: string | null;
	customerId?: string | null;
	name: string;
	phone: string;
	email: string;
	message: string;
	inquiryStatus?: InquiryStatus | string | null;
	createdAt: string;
	updatedAt: string;
	listingData?: InquiryListingPreview | null;
	agentData?: InquiryMemberPreview | null;
	customerData?: InquiryMemberPreview | null;
}

export interface InquiriesPayload {
	list: InquiryListItem[];
	metaCounter: { total: number }[];
}
