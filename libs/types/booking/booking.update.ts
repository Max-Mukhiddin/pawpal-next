import type { BookingStatus } from './booking-status.enum';

/** Input for `updateBookingStatusByAgent`. */
export interface BookingUpdateStatus {
	_id: string;
	bookingStatus: BookingStatus;
}
