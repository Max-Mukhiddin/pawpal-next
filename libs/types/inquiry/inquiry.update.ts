import type { InquiryStatus } from './inquiry-status.enum';

/** Input for `updateInquiryStatus`. */
export interface InquiryUpdateStatus {
	_id: string;
	inquiryStatus: InquiryStatus;
}
