import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useDebouncedValue } from '../../libs/hooks/useDebouncedValue';
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
import { likeToastMessage, readWasLiked } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import CatalogSidebarFilter from '../../libs/components/listings/CatalogSidebarFilter';
import CatalogSortToolbar from '../../libs/components/listings/CatalogSortToolbar';
import ServicesList from '../../libs/components/services/ServicesList';
import { SERVICE_CATEGORIES } from '../../libs/components/services/ServiceCategories';
import ServiceFeatureBanner from '../../libs/components/services/ServiceFeatureBanner';
import ServicePackages from '../../libs/components/services/ServicePackages';
import ServiceFaq from '../../libs/components/services/ServiceFaq';
import ServicesCta from '../../libs/components/services/ServicesCta';
import type {
	ServicesBlockHeading,
	ServicePackageItem,
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

const featureBannerData = {
	title: 'Premium Grooming for Every Breed',
	description:
		'Gentle, breed-aware grooming from vetted specialists — bath, style, and spa care that keeps coats healthy and pets calm.',
	chips: ['Breed-aware', 'Low-stress', 'Vetted specialists', 'Easy booking'],
	ctaPrimary: 'Book Now',
	ctaSecondary: 'Learn More',
	image:
		'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?fm=jpg&q=80&w=2000&auto=format&fit=crop',
};

const packagesBlock: ServicesBlockHeading = {
	heading: 'Our Best Packages',
	subheading: 'Curated bundles for every pet — from quick grooming sessions to full-day pampering.',
};

const packagesItems: ServicePackageItem[] = [
	{
		image: '/img/listing/junho_groom_bath.jpg',
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
		image:
			'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?fm=jpg&q=80&w=2000&auto=format&fit=crop',
		title: 'Spa & Nail Cutting',
		desc: 'Spa & Manicure service for a small pet including bathing, ear cleaning and grooming.',
		price: 'From ₩50,000',
		cta: 'Enquire Now',
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
	mediaImageSrc: '/img/listing/haerin_vet_checkup.jpg',
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
	const debouncedSearchText = useDebouncedValue(searchText, 300);
	const [activeCategory, setActiveCategory] = useState<string>('All');
	const [isCatalogReady, setIsCatalogReady] = useState(false);

	const serviceCatalogInquiry = useMemo(
		() => withServicesListingTypeFilter(serviceInquiry),
		[serviceInquiry],
	);
	const serviceCatalogInquiryRef = useRef(serviceCatalogInquiry);
	serviceCatalogInquiryRef.current = serviceCatalogInquiry;

	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const { loading: servicesLoading, refetch: getServicesCatalogRefetch } = useQuery(GET_LISTINGS, {
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

	useEffect(() => {
		if (router.isReady) {
			setIsCatalogReady(true);
		}
	}, [router.isReady]);

	const showCatalogSkeleton = !isCatalogReady || (servicesLoading && services.length === 0);
	const searchBusy =
		searchText !== debouncedSearchText || (servicesLoading && services.length > 0);

	useEffect(() => {
		const nextText = debouncedSearchText.trim();
		setServiceInquiry((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (nextText === prevText) return prev;
			setCurrentPage(1);
			return withServicesListingTypeFilter({
				...prev,
				page: 1,
				search: { ...prev.search, text: nextText },
			});
		});
	}, [debouncedSearchText]);

	const filteredServices = useMemo(() => {
		if (activeCategory === 'All') return services;
		const cat = SERVICE_CATEGORIES.find((c) => c.label === activeCategory);
		if (!cat || cat.keywords.length === 0) return services;
		return services.filter((s) => {
			const haystack = `${s.listingTitle} ${s.listingDesc ?? ''}`.toLowerCase();
			return cat.keywords.some((kw) => haystack.includes(kw));
		});
	}, [services, activeCategory]);

	const resetCatalogPage = (patch: Partial<ServicesInquiry> = {}) => {
		const next = withServicesListingTypeFilter({ ...serviceInquiry, page: 1, ...patch });
		setServiceInquiry(next);
		setCurrentPage(1);
		void router.push(`/service?page=1`, undefined, { shallow: true });
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withServicesListingTypeFilter({ ...serviceInquiry, page: value });
		setServiceInquiry(next);
		setCurrentPage(value);
		await router.push(`/service?page=${next.page}`, undefined, { shallow: true });
	};

	const handleCategorySelect = (label: string) => {
		setActiveCategory(label);
		resetCatalogPage();
	};

	const likeServiceHandler = async (user: T, id: string) => {
		await withActionGate(`like:listing:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'like')) return;
				const wasLiked = readWasLiked(services.find((s) => s._id === id));
				await likeTargetListing({ variables: { input: id } });
				await getServicesCatalogRefetch({ input: serviceCatalogInquiryRef.current });
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'like')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.log('ERROR likeServiceHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
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
				setFilterSortName('New');
				resetCatalogPage({ sort: 'createdAt', direction: Direction.ASC });
				break;
			case 'lowest':
				setFilterSortName('Lowest Price');
				resetCatalogPage({ sort: 'listingPrice', direction: Direction.ASC });
				break;
			case 'highest':
				setFilterSortName('Highest Price');
				resetCatalogPage({ sort: 'listingPrice', direction: Direction.DESC });
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		const nextText = searchText.trim();
		setServiceInquiry((prev) =>
			withServicesListingTypeFilter({
				...prev,
				page: 1,
				search: { ...prev.search, text: nextText },
			}),
		);
		setCurrentPage(1);
	};

	const handleFilterReset = () => {
		setSearchText('');
		setActiveCategory('All');
		resetCatalogPage({ search: { ...serviceInquiry.search, text: '' } });
	};

	return (
		<Stack className="pawpal-static-page pawpal-static-page--services">
			<Stack className="container" sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}>

				<div className="catalog-directory">
					<CatalogSidebarFilter
						searchPlaceholder="Search for a service"
						searchText={searchText}
						onSearchTextChange={setSearchText}
						onSearchEnter={handleSearchEnter}
						searchLoading={searchBusy}
						categoryGroupLabel="Service type"
						categories={SERVICE_CATEGORIES.map(({ label, icon }) => ({ label, icon }))}
						activeCategory={activeCategory}
						onCategorySelect={handleCategorySelect}
						onReset={handleFilterReset}
					/>

					<div className={`catalog-directory__main${searchBusy ? ' is-filter-loading' : ''}`}>
						<CatalogSortToolbar
							filterSortName={filterSortName}
							anchorEl={anchorEl}
							sortingOpen={sortingOpen}
							onSortingClick={sortingClickHandler}
							onSortingClose={sortingCloseHandler}
							onSortingSelect={sortingHandler}
						/>

						<Stack className="services-catalog-page__main" mb={device === 'mobile' ? '32px' : '48px'}>
							{showCatalogSkeleton ? (
								<div className="services-catalog-page__grid">
									{Array.from({ length: 6 }).map((_, i) => (
										<div key={i} className="skeleton-card" style={{ height: 320, borderRadius: 16, background: '#f0ede8', animation: 'shimmer 1.5s infinite' }} />
									))}
								</div>
							) : (
								<ServicesList services={filteredServices} onLike={likeServiceHandler} />
							)}

							<Stack className="pagination-config">
								{filteredServices.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											className="pp-pagination"
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
					</div>
				</div>

				{/* ── Featured service hero (matches Products feature banner) ── */}
				<ServiceFeatureBanner
					data={featureBannerData}
					onPrimaryClick={() => {
						const first = filteredServices[0] ?? services[0];
						if (first?._id) void router.push(`/service/detail?id=${first._id}`);
					}}
					onSecondaryClick={() => {
						const el = document.querySelector('.pawpal-static-page__packages');
						el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}}
				/>

				{/* ── Packages (secondary vertical list) ── */}
				<ServicePackages
					block={packagesBlock}
					items={packagesItems}
					onPackageCtaClick={(pkg) => {
						const pkgIndex = packagesItems.findIndex((item) => item.title === pkg.title);
						const target = services[pkgIndex] ?? filteredServices[0] ?? services[0];
						if (target?._id) {
							void router.push(`/service/detail?id=${target._id}`);
						}
					}}
				/>

				{/* ── FAQ ── */}
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