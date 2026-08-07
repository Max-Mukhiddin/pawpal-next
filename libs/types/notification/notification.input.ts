import type { NotificationStatus } from './notification';

export interface NotificationsInquiry {
	page: number;
	limit: number;
	status?: NotificationStatus;
}
