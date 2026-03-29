import type { Direction } from '../../enums/common.enum';

/** Input for `getMyBookings` / `getAgentBookings`. */
export interface BookingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: Record<string, unknown>;
}
