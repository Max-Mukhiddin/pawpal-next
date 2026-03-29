import type { BookingStatus } from './booking-status.enum';

/** Row from `getMyBookings` / `getAgentBookings` — scalar `Booking` fields only (no nested listing/member relations in schema). */
export interface BookingListItem {
	_id: string;
	listingId: string;
	agentId?: string | null;
	customerId?: string | null;
	dateTime: string;
	note?: string | null;
	bookingStatus?: BookingStatus | string | null;
	createdAt: string;
	updatedAt: string;
}
