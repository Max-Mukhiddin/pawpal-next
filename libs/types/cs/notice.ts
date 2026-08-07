export interface Notice {
	_id: string;
	noticeCategory: 'PAYMENT' | 'ACCOUNT' | 'TECHNICAL' | 'EVENT' | 'GENERAL';
	noticeStatus: 'ACTIVE' | 'HOLD' | 'DELETE';
	noticeTitle: string;
	noticeContent: string;
	noticeViews: number;
	createdAt: string;
}
