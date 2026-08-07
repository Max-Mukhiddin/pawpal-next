export interface Faq {
	_id: string;
	faqCategory: 'PAYMENT' | 'ACCOUNT' | 'TECHNICAL' | 'GENERAL' | 'EVENT';
	faqStatus: 'ACTIVE' | 'HOLD' | 'DELETE';
	faqQuestion: string;
	faqAnswer: string;
	faqOrder: number;
	createdAt: string;
}
