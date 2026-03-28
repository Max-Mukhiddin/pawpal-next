import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutFull from '../libs/components/layout/LayoutFull';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PRODUCTS_PAGE_MOCK } from '../libs/data/products/productsPage.mock';
import type { ProductCardItem, ProductCategoryChipItem, ProductsPageData } from '../libs/types/products/products.page';
import ProductsMarketingHero from '../libs/components/products/ProductsMarketingHero';
import ProductCategoryChips from '../libs/components/products/ProductCategoryChips';
import ProductGridSection from '../libs/components/products/ProductGridSection';
import ProductPromoRow from '../libs/components/products/ProductPromoRow';
import ProductFeatureBanner from '../libs/components/products/ProductFeatureBanner';
import CollectionSection from '../libs/components/products/CollectionSection';
import TestimonialsSection from '../libs/components/products/TestimonialsSection';
import BrandsSection from '../libs/components/products/BrandsSection';
import ProductsTrustRow from '../libs/components/products/ProductsTrustRow';
import ProductsCta from '../libs/components/products/ProductsCta';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductsPage: NextPage = () => {
	/** STATE **/
	/** Swap mock for `setPageData(mapProductsPageQuery(data))` when Apollo is wired. */
	const [pageData] = useState<ProductsPageData>(() => PRODUCTS_PAGE_MOCK);

	/** APOLLO REQUESTS **/
	// const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_PAGE, { fetchPolicy: 'network-only' });

	/** LIFECYCLES **/
	useEffect(() => {
		// Future: map query result into pageData when `data` changes.
	}, []);

	/** HANDLERS **/
	const handleAddToCart = useCallback((_product: ProductCardItem) => {
		// Cart / mutation
	}, []);

	const handleCategoryFilter = useCallback((_item: ProductCategoryChipItem) => {
		// Filter / router query
	}, []);

	const handleProductClick = useCallback((_product: ProductCardItem) => {
		// Navigate to product detail
	}, []);

	return (
		<Stack className="pawpal-static-page pawpal-static-page--products">
			<Stack className="container">
				<ProductsMarketingHero data={pageData.hero} />
				<ProductCategoryChips
					block={pageData.petCategories.block}
					items={pageData.petCategories.items}
					sectionClassName="pawpal-products__categories"
				/>
				<ProductPromoRow items={pageData.promoRow} />
				<ProductGridSection block={pageData.bestSelling.block} items={pageData.bestSelling.items} />
				<ProductFeatureBanner data={pageData.featureBanner} />
				<ProductGridSection block={pageData.trending.block} items={pageData.trending.items} />
				<ProductCategoryChips
					block={pageData.foodCategories.block}
					items={pageData.foodCategories.items}
					sectionClassName="pawpal-products__explore-row"
					chipVariant="circle"
				/>
				<CollectionSection collection={pageData.dogCollection} />
				<CollectionSection collection={pageData.catCollection} />
				<TestimonialsSection block={pageData.testimonials.block} items={pageData.testimonials.items} />
				<BrandsSection block={pageData.brands.block} names={pageData.brands.names} />
				<ProductsTrustRow items={pageData.trustRow} />
				<ProductsCta data={pageData.cta} />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(ProductsPage);
