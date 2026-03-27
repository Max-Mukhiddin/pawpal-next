import type { ServicesPageData } from '../../types/services/services.page';

/** Replace with GET_SERVICES_PAGE (or fragments) when backend is ready. */
export const SERVICES_PAGE_MOCK: ServicesPageData = {
	hero: {
		eyebrow: 'PawPal services',
		title: 'Services',
		lead: 'Professional pet-care services designed to keep routines easier and pets happier every day.',
		primaryCta: 'Book a service',
		secondaryCta: 'Talk to care team',
		mediaImageSrc: '/images/services/service-vet.jpg',
		mediaImageAlt: '',
	},
	categories: {
		block: {
			heading: 'Service categories',
			subheading: 'Choose the care type that best fits your pet and schedule.',
		},
		items: [
			{ label: 'Grooming', icon: 'GR' },
			{ label: 'Walking', icon: 'WK' },
			{ label: 'Training', icon: 'TR' },
			{ label: 'Veterinary', icon: 'VT' },
			{ label: 'Boarding', icon: 'BD' },
			{ label: 'Pet Shop', icon: 'SH' },
		],
	},
	featured: {
		block: {
			heading: 'Featured services',
			subheading: 'Popular picks families book the most.',
		},
		items: [
			{
				image: '/images/services/service-grooming.jpg',
				title: 'Full Grooming Session',
				desc: 'Bath, coat care, nail trim, and a gentle finish tailored to your pet.',
				meta: '60-90 min . Hygiene',
				cta: 'Book now',
			},
			{
				image: '/images/services/service-walking.jpg',
				title: 'Daily Dog Walking',
				desc: 'Trusted walkers with flexible morning and evening schedules.',
				meta: '30-60 min . Activity',
				cta: 'View details',
			},
			{
				image: '/images/services/service-training.jpg',
				title: 'Puppy Starter Training',
				desc: 'Foundational behavior lessons for calmer routines at home.',
				meta: '45 min . Behavior',
				cta: 'Book now',
			},
		],
	},
	packages: {
		block: {
			heading: 'Our packages',
			subheading: 'Balanced plans designed for ongoing care and better pet routines.',
		},
		items: [
			{
				image: '/images/services/service-shop.jpg',
				title: 'Relax & Refresh Package',
				desc: 'Complete grooming and wellness check for a calmer, cleaner pet day.',
				price: 'From $79',
				cta: 'Book package',
			},
			{
				image: '/images/services/service-boarding.jpg',
				title: 'Active Daycare Pack',
				desc: 'Playtime, walks, and supervised social care in a safe routine.',
				price: 'From $49',
				cta: 'Enquire',
			},
			{
				image: '/images/services/service-vet.jpg',
				title: 'Health First Plan',
				desc: 'Preventive care support with trusted specialist coordination.',
				price: 'From $65',
				cta: 'Book package',
			},
		],
	},
	faq: {
		block: {
			heading: 'Frequently asked questions',
			subheading: 'Answers to the most common questions before booking a service.',
		},
		items: [
			{
				question: 'How do I choose the right service for my pet?',
				answer:
					'Start with your pet age, routine, and behavior needs. Our team can suggest the best starting plan before booking.',
			},
			{
				question: 'Can I reschedule a booked service?',
				answer:
					'Yes. You can reschedule in advance through support or your upcoming bookings flow once account tools are connected.',
			},
			{
				question: 'Are PawPal specialists verified?',
				answer:
					'All listed professionals follow profile checks and service quality standards before joining active service categories.',
			},
			{
				question: 'Do you offer packages for regular care?',
				answer:
					'Yes. We provide package options for grooming, activity, and care routines so families can plan recurring services.',
			},
			{
				question: 'What if my pet has special handling needs?',
				answer:
					'Share medical or behavior notes during booking. We match your request with specialists experienced in gentle handling.',
			},
		],
		mediaImageSrc: '/images/services/service-grooming.jpg',
		mediaImageAlt: '',
	},
	benefits: {
		block: {
			heading: 'Why choose PawPal services',
			subheading: 'Care built around trust, convenience, and safer routines for every pet.',
		},
		items: [
			{
				title: 'Trusted professionals',
				text: 'Experienced specialists with pet-first handling and verified service standards.',
			},
			{
				title: 'Flexible scheduling',
				text: 'Book sessions around your daily routine with convenient time windows.',
			},
			{
				title: 'Personalized care',
				text: 'Each service is adapted to your pet profile, age, and comfort level.',
			},
			{
				title: 'Safety-first approach',
				text: 'Clear checklists and calm protocols to keep pets safe in every visit.',
			},
		],
	},
	cta: {
		title: 'Need help picking the right service?',
		lead: 'Tell us about your pet and we will suggest the best care plan for your goals and routine.',
		primaryCta: 'Get personalized recommendations',
		secondaryCta: 'View all plans',
	},
};
