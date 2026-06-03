import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/products/product.input';
import type { Product } from '../../libs/types/products/product';
import { ListingType } from '../../libs/enums/listing.enum';
import { withProductsListingTypeFilter } from '../../libs/utils/catalogListingInquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ProductsFilterBar from '../../libs/components/products/ProductsFilterBar';
import ProductsList from '../../libs/components/products/ProductsList';
import ProductFeatureBanner from '../../libs/components/products/ProductFeatureBanner';
import ProductsCta from '../../libs/components/products/ProductsCta';
import ProductsTrustRow from '../../libs/components/products/ProductsTrustRow';
import type {
	ProductFeatureBannerContent,
	ProductTrustItem,
	ProductsCtaContent,
} from '../../libs/types/products/products.page';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ─── Static page data ────────────────────────────────────────────────────────

const featureBannerData: ProductFeatureBannerContent = {
	title: 'Premium Nutrition for Every Life Stage',
	description: 'Vet-formulated recipes with real meat, fresh vegetables, and zero artificial fillers — made for pets that deserve the best.',
	chips: ['Grain Free', 'High Protein', 'Vet Approved', 'Natural Ingredients'],
	ctaPrimary: 'Shop Nutrition',
	ctaSecondary: 'Learn More',
	image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
};

const trustItems: ProductTrustItem[] = [
	{ title: '100% Safe Ingredients', text: 'All products are tested and approved by certified pet nutritionists.' },
	{ title: 'Fast Delivery', text: 'Orders delivered within 2–3 business days across the country.' },
	{ title: 'Easy Returns', text: 'Not satisfied? Return within 7 days for a full refund, no questions asked.' },
	{ title: '24/7 Pet Support', text: 'Our specialist team is available around the clock for any questions.' },
];

const ctaData: ProductsCtaContent = {
	title: 'Everything Your Pet Needs, In One Place',
	lead: 'From daily nutrition to grooming essentials — shop trusted products recommended by our specialists.',
	primaryCta: 'Browse All Products',
	secondaryCta: 'Meet Our Specialists',
};

// ─── Category filter config ──────────────────────────────────────────────────

interface CategoryFilter {
	label: string;
	icon: string;
	keywords: string[];
}

const PRODUCT_CATEGORIES: CategoryFilter[] = [
	{ label: 'All', icon: '🐾', keywords: [] },
	{ label: 'Food', icon: '🍖', keywords: ['food', 'nutrition', 'supplement', 'treat', 'chew', 'diet', 'meal'] },
	{ label: 'Grooming', icon: '✂️', keywords: ['groom', 'brush', 'shampoo', 'comb', 'nail', 'hair'] },
	{ label: 'Toys', icon: '🎾', keywords: ['toy', 'ball', 'play', 'chew', 'interactive'] },
	{ label: 'Health', icon: '💊', keywords: ['health', 'vitamin', 'dental', 'care', 'flea', 'tick', 'joint'] },
	{ label: 'Accessories', icon: '🎀', keywords: ['collar', 'leash', 'harness', 'bed', 'bowl', 'carrier', 'kit'] },
];

// ─── Page component ──────────────────────────────────────────────────────────

const ProductsListPage: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();

	const [productInquiry, setProductInquiry] = useState<ProductsInquiry>(() =>
		withProductsListingTypeFilter(initialInput),
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>('');
	const [activeCategory, setActiveCategory] = useState<string>('All');

	const productCatalogInquiry = useMemo(
		() => withProductsListingTypeFilter(productInquiry),
		[productInquiry],
	);
	const productCatalogInquiryRef = useRef(productCatalogInquiry);
	productCatalogInquiryRef.current = productCatalogInquiry;

	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const { refetch: getProductsCatalogRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: productCatalogInquiry },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getListings?.list);
			setTotal(data?.getListings?.metaCounter[0]?.total);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		const page = Number(router.query.page) || 1;
		setProductInquiry((prev) =>
			prev.page === page ? prev : withProductsListingTypeFilter({ ...prev, page }),
		);
		setCurrentPage(page);
	}, [router.isReady, router.query.page]);

	// Client-side category filter
	const filteredProducts = useMemo(() => {
		if (activeCategory === 'All') return products;
		const cat = PRODUCT_CATEGORIES.find((c) => c.label === activeCategory);
		if (!cat || cat.keywords.length === 0) return products;
		return products.filter((p) => {
			const haystack = `${p.listingTitle} ${p.listingDesc ?? ''}`.toLowerCase();
			return cat.keywords.some((kw) => haystack.includes(kw));
		});
	}, [products, activeCategory]);

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withProductsListingTypeFilter({ ...productInquiry, page: value });
		setProductInquiry(next);
		setCurrentPage(value);
		await router.push(`/product?page=${next.page}`, undefined, { shallow: true });
	};

	const handleCategorySelect = (label: string) => {
		setActiveCategory(label);
		setCurrentPage(1);
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetListing({ variables: { input: id } });
			await getProductsCatalogRefetch({ input: productCatalogInquiryRef.current });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeProductHandler:', err.message);
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
				setProductInquiry(withProductsListingTypeFilter({ ...productInquiry, sort: 'createdAt', direction: Direction.ASC }));
				setFilterSortName('New');
				break;
			case 'lowest':
				setProductInquiry(withProductsListingTypeFilter({ ...productInquiry, sort: 'listingPrice', direction: Direction.ASC }));
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setProductInquiry(withProductsListingTypeFilter({ ...productInquiry, sort: 'listingPrice', direction: Direction.DESC }));
				setFilterSortName('Highest Price');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setProductInquiry(withProductsListingTypeFilter({
			...productInquiry,
			search: { ...productInquiry.search, text: searchText },
		}));
	};

	return (
		<Stack className="pawpal-static-page pawpal-static-page--products">
			<Stack className="container" sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}>

				{/* ── 1. Category pills ── */}
				<div className="services-categories" style={{ paddingTop: 32 }}>
					{PRODUCT_CATEGORIES.map(({ label, icon }) => (
						<button
							key={label}
							type="button"
							className={`services-categories__pill${activeCategory === label ? ' is-active' : ''}`}
							onClick={() => handleCategorySelect(label)}
						>
							<span className="services-categories__icon" aria-hidden>{icon}</span>
							<span className="services-categories__label">{label}</span>
						</button>
					))}
				</div>

				{/* ── 2. Filter bar ── */}
				<Stack className="products-catalog-page">
					<ProductsFilterBar
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

					{/* ── 3. Products grid + pagination ── */}
					<Stack className="products-catalog-page__main" mb={device === 'mobile' ? '32px' : '76px'}>
						<ProductsList products={filteredProducts} onLike={likeProductHandler} />

						<Stack className="pagination-config">
							{filteredProducts.length !== 0 && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / productInquiry.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
										size={device === 'mobile' ? 'small' : 'medium'}
									/>
								</Stack>
							)}
							{filteredProducts.length !== 0 && (
								<Stack className="total-result">
									<Typography>
										Total {filteredProducts.length} product{filteredProducts.length > 1 ? 's' : ''}
										{activeCategory !== 'All' ? ` in ${activeCategory}` : ' available'}
									</Typography>
								</Stack>
							)}
							{filteredProducts.length === 0 && products.length > 0 && (
								<Stack className="total-result">
									<Typography>No products found in {activeCategory}</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>

				{/* ── 5. Feature banner ── */}
				<ProductFeatureBanner data={featureBannerData} />

				{/* ── 6. Trust row ── */}
				<ProductsTrustRow items={trustItems} />

				{/* ── 7. CTA banner ── */}
				<ProductsCta
					data={ctaData}
					onPrimaryClick={() => router.push('/product')}
					onSecondaryClick={() => router.push('/specialist')}
				/>

			</Stack>
		</Stack>
	);
};

ProductsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			typeList: [ListingType.PRODUCT],
			pricesRange: { start: 0, end: 2000000 },
		},
	},
};

export default withLayoutBasic(ProductsListPage);