import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
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
import ProductsHero from '../../libs/components/products/ProductsHero';
import ProductsFilterBar from '../../libs/components/products/ProductsFilterBar';
import ProductsList from '../../libs/components/products/ProductsList';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

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

	const productCatalogInquiry = useMemo(
		() => withProductsListingTypeFilter(productInquiry),
		[productInquiry],
	);
	const productCatalogInquiryRef = useRef(productCatalogInquiry);
	productCatalogInquiryRef.current = productCatalogInquiry;

	/** APOLLO REQUESTS **/
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

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const page = Number(router.query.page) || 1;
		setProductInquiry((prev) =>
			prev.page === page ? prev : withProductsListingTypeFilter({ ...prev, page }),
		);
		setCurrentPage(page);
	}, [router.isReady, router.query.page]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withProductsListingTypeFilter({ ...productInquiry, page: value });
		setProductInquiry(next);
		setCurrentPage(value);
		await router.push(`/product?page=${next.page}`, undefined, { shallow: true });
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({
				variables: { input: id },
			});
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
				setProductInquiry(
					withProductsListingTypeFilter({ ...productInquiry, sort: 'createdAt', direction: Direction.ASC }),
				);
				setFilterSortName('New');
				break;
			case 'lowest':
				setProductInquiry(
					withProductsListingTypeFilter({
						...productInquiry,
						sort: 'listingPrice',
						direction: Direction.ASC,
					}),
				);
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setProductInquiry(
					withProductsListingTypeFilter({
						...productInquiry,
						sort: 'listingPrice',
						direction: Direction.DESC,
					}),
				);
				setFilterSortName('Highest Price');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setProductInquiry(
			withProductsListingTypeFilter({
				...productInquiry,
				search: { ...productInquiry.search, text: searchText },
			}),
		);
	};

	const catalogBody = (
		<Stack className={'products-catalog-page'}>
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

			<Stack className="products-catalog-page__main" mb={device === 'mobile' ? '32px' : '76px'}>
				<ProductsList products={products} onLike={likeProductHandler} />

				<Stack className="pagination-config">
					{products.length !== 0 && (
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

					{products.length !== 0 && (
						<Stack className="total-result">
							<Typography>Total {total} product{total > 1 ? 's' : ''} available</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Stack>
	);

	return (
		<Stack className="pawpal-static-page pawpal-static-page--products">
			<Stack className="container" sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}>
				<ProductsHero />
				{catalogBody}
			</Stack>
		</Stack>
	);
};

ProductsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			typeList: [ListingType.PRODUCT],
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutFull(ProductsListPage);
