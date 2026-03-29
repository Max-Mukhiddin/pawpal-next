import { BookingStatus } from '../types/booking/booking-status.enum';

/** Human-readable status for chips and headings. */
export function formatBookingStatusLabel(st: string): string {
	switch (st) {
		case BookingStatus.REQUESTED:
			return 'Requested';
		case BookingStatus.CONFIRMED:
			return 'Confirmed';
		case BookingStatus.CANCELLED:
			return 'Cancelled';
		case BookingStatus.DONE:
			return 'Completed';
		default:
			return st || 'Unknown';
	}
}

/** MUI-friendly chip colors per status (subtle, readable on white cards). */
export function bookingStatusChipSx(st: string): Record<string, string | number> {
	switch (st) {
		case BookingStatus.REQUESTED:
			return { bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 };
		case BookingStatus.CONFIRMED:
			return { bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 };
		case BookingStatus.CANCELLED:
			return { bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 600 };
		case BookingStatus.DONE:
			return { bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 };
		default:
			return { bgcolor: '#f5f5f5', color: '#616161', fontWeight: 600 };
	}
}
