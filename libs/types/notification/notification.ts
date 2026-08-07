export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'INQUIRY' | 'BOOKING' | 'SYSTEM';

export type NotificationStatus = 'WAIT' | 'READ' | 'ARCHIVED';

export type NotificationGroup = 'MEMBER' | 'ARTICLE' | 'LISTING' | 'COMMENT';

export interface NotificationAuthorData {
	_id: string;
	memberNick: string;
	memberImage?: string;
}

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	receiverId: string;
	authorId: string;
	notificationRefId?: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	authorData?: NotificationAuthorData;
}

export interface Notifications {
	list: Notification[];
	unreadCount: number;
}
