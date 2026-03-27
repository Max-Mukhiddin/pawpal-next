/** Domain models for the public /services page — ready to map from GraphQL later. */

export interface ServicesBlockHeading {
	heading: string;
	subheading: string;
}

export interface ServicesHeroContent {
	eyebrow: string;
	title: string;
	lead: string;
	primaryCta: string;
	secondaryCta: string;
	mediaImageSrc: string;
	mediaImageAlt: string;
}

export interface ServiceCategoryItem {
	label: string;
	icon: string;
}

export interface FeaturedServiceItem {
	image: string;
	title: string;
	desc: string;
	meta: string;
	cta: string;
}

export interface ServicePackageItem {
	image: string;
	title: string;
	desc: string;
	price: string;
	cta: string;
}

export interface ServiceFaqItem {
	question: string;
	answer: string;
}

export interface ServiceBenefitItem {
	title: string;
	text: string;
}

export interface ServicesFaqSection {
	block: ServicesBlockHeading;
	items: ServiceFaqItem[];
	mediaImageSrc: string;
	mediaImageAlt: string;
}

export interface ServicesCtaContent {
	title: string;
	lead: string;
	primaryCta: string;
	secondaryCta: string;
}

/** Single payload shape the page container owns; Apollo can populate this in one assignment. */
export interface ServicesPageData {
	hero: ServicesHeroContent;
	categories: {
		block: ServicesBlockHeading;
		items: ServiceCategoryItem[];
	};
	featured: {
		block: ServicesBlockHeading;
		items: FeaturedServiceItem[];
	};
	packages: {
		block: ServicesBlockHeading;
		items: ServicePackageItem[];
	};
	faq: ServicesFaqSection;
	benefits: {
		block: ServicesBlockHeading;
		items: ServiceBenefitItem[];
	};
	cta: ServicesCtaContent;
}
