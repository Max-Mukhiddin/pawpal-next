/** Domain models for the public /specialists page — ready to map from GraphQL later. */

export interface SpecialistsBlockHeading {
	heading: string;
	subheading: string;
}

export interface SpecialistsHeroContent {
	eyebrow: string;
	title: string;
	lead: string;
}

export interface SpecialistListItem {
	name: string;
	role: string;
}

export interface SpecialistsListSection {
	block: SpecialistsBlockHeading;
	items: SpecialistListItem[];
	/** Label shown on each row (e.g. availability). */
	availabilityLabel: string;
}

export interface FeaturedSpecialistSection {
	block: SpecialistsBlockHeading;
	name: string;
	bio: string;
}

export interface SpecialistsCtaContent {
	title: string;
	lead: string;
	primaryCta: string;
}

/** Single payload shape the page container owns; Apollo can populate this in one assignment. */
export interface SpecialistsPageData {
	hero: SpecialistsHeroContent;
	listing: SpecialistsListSection;
	featured: FeaturedSpecialistSection;
	cta: SpecialistsCtaContent;
}
