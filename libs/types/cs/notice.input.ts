export interface NoticesInquiry {
	page: number;
	limit: number;
	search: {
		noticeCategory?: string;
		noticeStatus?: string;
		text?: string;
	};
}
