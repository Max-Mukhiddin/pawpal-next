import type { BookingStatus } from './booking-status.enum';

export interface BookingListingPreview {
	_id: string;
	listingTitle?: string | null;
	listingType?: string | null;
	listingLocation?: string | null;
}

export interface BookingAgentPreview {
	_id: string;
	memberNick?: string | null;
	memberPhone?: string | null;
	memberImage?: string | null;
}

export interface BookingCustomerPreview {
	_id: string;
	memberNick?: string | null;
	memberPhone?: string | null;
}

/** Row from `getMyBookings` / `getAgentBookings` (scalar booking fields + optional relation previews). */
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
	listingData?: BookingListingPreview | null;
	agentData?: BookingAgentPreview | null;
	customerData?: BookingCustomerPreview | null;
}
