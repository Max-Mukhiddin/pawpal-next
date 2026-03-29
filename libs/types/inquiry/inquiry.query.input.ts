import type { Direction } from '../../enums/common.enum';

/** Input for `getMyInquiries` / `getAgentInquiries`. */
export interface InquiriesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	/** Backend may accept an empty object when no filters are needed. */
	search?: Record<string, unknown>;
}
