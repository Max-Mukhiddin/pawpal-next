import type { SpecialistsPageData } from '../../types/specialists/specialists.page';

/** Replace with GET_SPECIALISTS_PAGE (or fragments) when backend is ready. */
export const SPECIALISTS_PAGE_MOCK: SpecialistsPageData = {
	hero: {
		eyebrow: 'PawPal specialists',
		title: 'Find the right specialist for your pet',
		lead: 'Meet experienced pet professionals focused on safe, thoughtful care for every companion.',
	},
	listing: {
		block: {
			heading: 'Specialist listing',
			subheading: 'Preview of the care team directory.',
		},
		items: [
			{ name: 'Emma Carter', role: 'Senior Groomer' },
			{ name: 'Noah Kim', role: 'Behavior Trainer' },
			{ name: 'Ava Johnson', role: 'Pet Nutrition Advisor' },
			{ name: 'Liam Patel', role: 'Care Coordinator' },
		],
		availabilityLabel: 'Available',
	},
	featured: {
		block: {
			heading: 'Featured expert',
			subheading: 'This highlight block is ready for rotating specialist stories.',
		},
		name: 'Emma Carter',
		bio: '12+ years in grooming and calm-handling care. Known for stress-reducing routines and pet-first safety.',
	},
	cta: {
		title: 'Want to speak with a specialist?',
		lead: 'Share your pet profile and we will connect you with the right expert.',
		primaryCta: 'Request specialist consultation',
	},
};
