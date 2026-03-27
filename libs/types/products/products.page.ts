/** Domain models for the public /products page — ready to map from GraphQL later. */

export interface ProductsBlockHeading {
	heading: string;
	subheading: string;
}

export interface ProductsHeroContent {
	eyebrow: string;
	title: string;
	lead: string;
	primaryCta: string;
	secondaryCta: string;
	mediaImageSrc: string;
	mediaImageAlt: string;
}

export interface ProductCategoryChipItem {
	label: string;
	icon: string;
}

export type ProductPromoTone = 'green' | 'warm';

export interface ProductPromoItem {
	tone: ProductPromoTone;
	title: string;
	description: string;
	cta: string;
	image: string;
}

export interface ProductCardItem {
	title: string;
	tag: string;
	price: string;
	description: string;
	image: string;
	cta: string;
}

export interface ProductFeatureBannerContent {
	title: string;
	description: string;
	chips: string[];
	ctaPrimary: string;
	ctaSecondary: string;
	image: string;
}

export interface CollectionPromoContent {
	title: string;
	description: string;
	cta: string;
	image: string;
}

export interface ProductCollectionBlock {
	ariaLabel: string;
	heading: string;
	promo: CollectionPromoContent;
	products: ProductCardItem[];
}

export interface ProductTestimonialItem {
	name: string;
	role: string;
	text: string;
	rating: string;
}

export interface ProductTrustItem {
	title: string;
	text: string;
}

export interface ProductsCtaContent {
	title: string;
	lead: string;
	primaryCta: string;
	secondaryCta: string;
}

/** Single payload shape the page container owns; Apollo can populate this in one assignment. */
export interface ProductsPageData {
	hero: ProductsHeroContent;
	petCategories: {
		block: ProductsBlockHeading;
		items: ProductCategoryChipItem[];
	};
	promoRow: ProductPromoItem[];
	bestSelling: {
		block: ProductsBlockHeading;
		items: ProductCardItem[];
	};
	featureBanner: ProductFeatureBannerContent;
	trending: {
		block: ProductsBlockHeading;
		items: ProductCardItem[];
	};
	foodCategories: {
		block: ProductsBlockHeading;
		items: ProductCategoryChipItem[];
	};
	dogCollection: ProductCollectionBlock;
	catCollection: ProductCollectionBlock;
	testimonials: {
		block: ProductsBlockHeading;
		items: ProductTestimonialItem[];
	};
	brands: {
		block: ProductsBlockHeading;
		names: string[];
	};
	trustRow: ProductTrustItem[];
	cta: ProductsCtaContent;
}
