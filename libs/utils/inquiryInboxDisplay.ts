import { InquiryStatus } from '../types/inquiry/inquiry-status.enum';

export function formatInquiryStatusLabel(st: string): string {
	switch (st) {
		case InquiryStatus.NEW:
			return 'New';
		case InquiryStatus.RESPONDED:
			return 'Responded';
		case InquiryStatus.CLOSED:
			return 'Closed';
		default:
			return st ? String(st).replace(/_/g, ' ') : 'Unknown';
	}
}

/** MUI chip styles aligned with booking inbox palette. */
export function inquiryStatusChipSx(st: string): Record<string, string | number> {
	switch (st) {
		case InquiryStatus.NEW:
			return { bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 };
		case InquiryStatus.RESPONDED:
			return { bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 };
		case InquiryStatus.CLOSED:
			return { bgcolor: '#eceff1', color: '#546e7a', fontWeight: 600 };
		default:
			return { bgcolor: '#f5f5f5', color: '#616161', fontWeight: 600 };
	}
}
