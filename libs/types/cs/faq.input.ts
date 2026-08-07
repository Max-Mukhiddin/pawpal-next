export interface FaqsInquiry {
	page: number;
	limit: number;
	search: {
		faqCategory?: string;
		faqStatus?: string;
		text?: string;
	};
}
