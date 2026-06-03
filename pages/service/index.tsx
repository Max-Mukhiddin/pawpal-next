import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { ServicesInquiry } from '../../libs/types/services/service.input';
import type { Service } from '../../libs/types/services/service';
import { ListingType } from '../../libs/enums/listing.enum';
import { withServicesListingTypeFilter } from '../../libs/utils/catalogListingInquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ServicesFilterBar from '../../libs/components/services/ServicesFilterBar';
import ServicesList from '../../libs/components/services/ServicesList';
import ServiceCategories, { SERVICE_CATEGORIES } from '../../libs/components/services/ServiceCategories';
import ServicePackages from '../../libs/components/services/ServicePackages';
import ServiceBenefits from '../../libs/components/services/ServiceBenefits';
import ServiceFaq from '../../libs/components/services/ServiceFaq';
import ServicesCta from '../../libs/components/services/ServicesCta';
import type {
	ServicesBlockHeading,
	ServicePackageItem,
	ServiceBenefitItem,
	ServicesFaqSection,
	ServicesCtaContent,
} from '../../libs/types/services/services.page';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ─── Static page data ────────────────────────────────────────────────────────

const packagesBlock: ServicesBlockHeading = {
	heading: 'Our Best Packages',
	subheading: 'Curated bundles for every pet — from quick grooming sessions to full-day pampering.',
};

const packagesItems: ServicePackageItem[] = [
	{
		image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
		title: 'Relax Bath & Full Grooming',
		desc: 'Grooming service for a small pet including bathing, ear cleaning and grooming.',
		price: 'From ₩35,000',
		cta: 'Enquire Now',
	},
	{
		image: 'https://images.unsplash.com/photo-1512237798647-84b57b22b517?w=800&q=80',
		title: 'Body Massage & Hair Style',
		desc: 'Grooming service for a small pet including bathing, ear cleaning and grooming.',
		price: 'From ₩45,000',
		cta: 'Enquire Now',
	},
	{
		image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
		title: 'Spa & Nail Cutting',
		desc: 'Spa & Manicure service for a small pet including bathing, ear cleaning and grooming.',
		price: 'From ₩50,000',
		cta: 'Enquire Now',
	},
];

const benefitsBlock: ServicesBlockHeading = {
	heading: 'Why Choose PawPal?',
	subheading: 'We combine expert care with a calm, stress-free experience for your pet and peace of mind for you.',
};

const benefitsItems: ServiceBenefitItem[] = [
	{
		title: 'Certified Specialists',
		text: 'Every specialist on PawPal is vetted, certified, and passionate about animal wellbeing.',
	},
	{
		title: 'Stress-Free Experience',
		text: 'We use gentle, pet-first techniques that keep your companion calm and comfortable throughout.',
	},
	{
		title: 'Easy Online Booking',
		text: 'Browse, compare, and book your preferred service in minutes — no phone calls needed.',
	},
	{
		title: 'Satisfaction Guaranteed',
		text: "If you're not happy, we'll make it right. Your pet's happiness is our number one priority.",
	},
];

const faqData: ServicesFaqSection = {
	block: {
		heading: 'Frequently Asked Questions',
		subheading: 'Everything you need to know before booking a service for your pet.',
	},
	items: [
		{
			question: 'How often should I take my pet to the vet?',
			answer: 'Most healthy adult pets should visit a vet at least once a year for a wellness check. Senior pets or those with health conditions may need more frequent visits.',
		},
		{
			question: 'How can I book an appointment for emergency treatment?',
			answer: 'You can reach our support team 24/7 via the Help / Chat option in the footer. For urgent cases, please call our emergency line directly.',
		},
		{
			question: 'How often should I bathe my pet?',
			answer: 'Most dogs benefit from a bath every 4–6 weeks. Cats are generally self-cleaning, but some breeds or medical conditions may require occasional baths.',
		},
		{
			question: 'What should I do if my pet eats something toxic?',
			answer: 'Contact your vet or an emergency animal poison hotline immediately. Do not induce vomiting unless specifically instructed by a professional.',
		},
		{
			question: 'Is it normal for pets to be anxious or fearful?',
			answer: 'Yes — anxiety is common in pets, especially around strangers or new environments. Our specialists are trained to work with anxious animals in a calm, reassuring way.',
		},
	],
	mediaImageSrc: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80',
	mediaImageAlt: 'Specialist caring for a pet',
};

const ctaData: ServicesCtaContent = {
	title: 'Explore Our Comprehensive Petcare Solutions',
	lead: 'From grooming to health checks — find the right specialist for every need your pet has.',
	primaryCta: 'Make Appointment',
	secondaryCta: 'Our Specialists',
};

// ─── Page component ──────────────────────────────────────────────────────────

const ServicesListPage: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');

	const [serviceInquiry, setServiceInquiry] = useState<ServicesInquiry>(() =>
		withServicesListingTypeFilter(initialInput),
	);
	const [services, setServices] = useState<Service[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>('');
	const [activeCategory, setActiveCategory] = useState<string>('All');

	const serviceCatalogInquiry = useMemo(
		() => withServicesListingTypeFilter(serviceInquiry),
		[serviceInquiry],
	);
	const serviceCatalogInquiryRef = useRef(serviceCatalogInquiry);
	serviceCatalogInquiryRef.current = serviceCatalogInquiry;

	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const { refetch: getServicesCatalogRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: serviceCatalogInquiry },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setServices(data?.getListings?.list);
			setTotal(data?.getListings?.metaCounter[0]?.total);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		const page = Number(router.query.page) || 1;
		setServiceInquiry((prev) =>
			prev.page === page ? prev : withServicesListingTypeFilter({ ...prev, page }),
		);
		setCurrentPage(page);
	}, [router.isReady, router.query.page]);

	const filteredServices = useMemo(() => {
		if (activeCategory === 'All') return services;
		const cat = SERVICE_CATEGORIES.find((c) => c.label === activeCategory);
		if (!cat || cat.keywords.length === 0) return services;
		return services.filter((s) => {
			const haystack = `${s.listingTitle} ${s.listingDesc ?? ''}`.toLowerCase();
			return cat.keywords.some((kw) => haystack.includes(kw));
		});
	}, [services, activeCategory]);

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withServicesListingTypeFilter({ ...serviceInquiry, page: value });
		setServiceInquiry(next);
		setCurrentPage(value);
		await router.push(`/service?page=${next.page}`, undefined, { shallow: true });
	};

	const handleCategorySelect = (label: string) => {
		setActiveCategory(label);
		setCurrentPage(1);
	};

	const likeServiceHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetListing({ variables: { input: id } });
			await getServicesCatalogRefetch({ input: serviceCatalogInquiryRef.current });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeServiceHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setServiceInquiry(withServicesListingTypeFilter({ ...serviceInquiry, sort: 'createdAt', direction: Direction.ASC }));
				setFilterSortName('New');
				break;
			case 'lowest':
				setServiceInquiry(withServicesListingTypeFilter({ ...serviceInquiry, sort: 'listingPrice', direction: Direction.ASC }));
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setServiceInquiry(withServicesListingTypeFilter({ ...serviceInquiry, sort: 'listingPrice', direction: Direction.DESC }));
				setFilterSortName('Highest Price');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setServiceInquiry(withServicesListingTypeFilter({
			...serviceInquiry,
			search: { ...serviceInquiry.search, text: searchText },
		}));
	};

	return (
		<Stack className="pawpal-static-page pawpal-static-page--services">
			<Stack className="container" sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}>

				{/* ── 1. Category pills ── */}
				<ServiceCategories
					activeCategory={activeCategory}
					onSelect={handleCategorySelect}
				/>

				{/* ── 2. Filter bar ── */}
				<ServicesFilterBar
					searchText={searchText}
					onSearchTextChange={setSearchText}
					onSearchEnter={handleSearchEnter}
					filterSortName={filterSortName}
					anchorEl={anchorEl}
					sortingOpen={sortingOpen}
					onSortingClick={sortingClickHandler}
					onSortingClose={sortingCloseHandler}
					onSortingSelect={sortingHandler}
				/>

				{/* ── 3. Services grid + pagination ── */}
				<Stack className="services-catalog-page__main" mb={device === 'mobile' ? '32px' : '76px'}>
					<ServicesList services={filteredServices} onLike={likeServiceHandler} />

					<Stack className="pagination-config">
						{filteredServices.length !== 0 && (
							<Stack className="pagination-box">
								<Pagination
									page={currentPage}
									count={Math.ceil(total / serviceInquiry.limit)}
									onChange={handlePaginationChange}
									shape="circular"
									color="primary"
									size={device === 'mobile' ? 'small' : 'medium'}
								/>
							</Stack>
						)}
						{filteredServices.length !== 0 && (
							<Stack className="total-result">
								<Typography>
									Total {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''}
									{activeCategory !== 'All' ? ` in ${activeCategory}` : ' available'}
								</Typography>
							</Stack>
						)}
						{filteredServices.length === 0 && services.length > 0 && (
							<Stack className="total-result">
								<Typography>No services found in {activeCategory}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>

				{/* ── 4. Packages ── */}
				<ServicePackages
					block={packagesBlock}
					items={packagesItems}
					onPackageCtaClick={(pkg) => router.push('/cs')}
				/>

				{/* ── 5. Benefits ── */}
				<ServiceBenefits
					block={benefitsBlock}
					items={benefitsItems}
				/>

				{/* ── 6. FAQ ── */}
				<ServiceFaq data={faqData} />

				{/* ── 7. CTA banner ── */}
				<ServicesCta
					data={ctaData}
					onPrimaryClick={() => router.push('/service')}
					onSecondaryClick={() => router.push('/specialist')}
				/>

			</Stack>
		</Stack>
	);
};

ServicesListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			typeList: [ListingType.SERVICE],
			pricesRange: { start: 0, end: 2000000 },
		},
	},
};

export default withLayoutBasic(ServicesListPage);