import { BookingStatus } from '../types/booking/booking-status.enum';
import { InquiryStatus } from '../types/inquiry/inquiry-status.enum';

export type ActivityKind = 'BOOKING' | 'INQUIRY';
export type ActivityFilterStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type UnifiedActivity = {
	_id: string;
	_kind: ActivityKind;
	_timestamp: string;
	bookingStatus?: string | null;
	inquiryStatus?: string | null;
	listingId: string;
	listingData?: {
		listingTitle?: string | null;
		listingType?: string | null;
		listingLocation?: string | null;
	} | null;
	agentData?: { memberNick?: string | null } | null;
	customerData?: { memberNick?: string | null } | null;
	name?: string;
	message?: string | null;
	note?: string | null;
	dateTime?: string;
};

export const activityFilterStatus = (item: UnifiedActivity): ActivityFilterStatus => {
	if (item._kind === 'BOOKING') {
		const st = String(item.bookingStatus ?? BookingStatus.REQUESTED).toUpperCase();
		if (st === BookingStatus.REQUESTED) return 'PENDING';
		if (st === BookingStatus.CONFIRMED) return 'CONFIRMED';
		if (st === BookingStatus.DONE) return 'COMPLETED';
		if (st === BookingStatus.CANCELLED) return 'CANCELLED';
		return 'PENDING';
	}
	const st = String(item.inquiryStatus ?? InquiryStatus.NEW).toUpperCase();
	if (st === InquiryStatus.NEW) return 'PENDING';
	if (st === InquiryStatus.RESPONDED) return 'CONFIRMED';
	if (st === InquiryStatus.CLOSED) return 'COMPLETED';
	return 'PENDING';
};

export const activityStatusLabel = (item: UnifiedActivity): string => {
	const key = activityFilterStatus(item);
	switch (key) {
		case 'PENDING':
			return 'Pending';
		case 'CONFIRMED':
			return 'Confirmed';
		case 'COMPLETED':
			return 'Completed';
		case 'CANCELLED':
			return 'Cancelled';
		default:
			return 'Unknown';
	}
};

export const activityDateGroup = (iso: string): string => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return 'Earlier';
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfYesterday = new Date(startOfToday);
	startOfYesterday.setDate(startOfYesterday.getDate() - 1);
	const startOfWeek = new Date(startOfToday);
	startOfWeek.setDate(startOfWeek.getDate() - 7);
	if (d >= startOfToday) return 'Today';
	if (d >= startOfYesterday) return 'Yesterday';
	if (d >= startOfWeek) return 'This week';
	return 'Earlier';
};

export const countPendingForBadge = (items: UnifiedActivity[], isAgent: boolean): number => {
	if (isAgent) {
		return items.filter((item) => activityFilterStatus(item) === 'PENDING').length;
	}
	return items.filter((item) => activityFilterStatus(item) === 'CONFIRMED').length;
};

export const activityStatsForAgent = (items: UnifiedActivity[]) => {
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	let pending = 0;
	let active = 0;
	let completedMonth = 0;

	for (const item of items) {
		const st = activityFilterStatus(item);
		if (st === 'PENDING') pending += 1;
		if (st === 'CONFIRMED') active += 1;
		if (st === 'COMPLETED' && new Date(item._timestamp) >= monthStart) completedMonth += 1;
	}

	return { pending, active, completedMonth, revenue: null as number | null };
};
