import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/products/product.input';
import type { Product } from '../../libs/types/products/product';
import { PropertyType } from '../../libs/enums/property.enum';
import { withProductsListingTypeFilter } from '../../libs/utils/catalogListingInquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/products/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/products/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ProductsHero from '../../libs/components/products/ProductsHero';
import ProductsFilterBar from '../../libs/components/products/ProductsFilterBar';
import ProductsList from '../../libs/components/products/ProductsList';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductsListPage: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(() =>
		withProductsListingTypeFilter(
			router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
		),
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>('');

	const listingInquiryInput = useMemo(
		() => withProductsListingTypeFilter(searchFilter),
		[searchFilter],
	);
	const listingInquiryInputRef = useRef(listingInquiryInput);
	listingInquiryInputRef.current = listingInquiryInput;

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: listingInquiryInput },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (!router.query.input) return;
		try {
			const inputObj = JSON.parse(router.query.input as string);
			const normalized = withProductsListingTypeFilter(inputObj);
			setSearchFilter(normalized);
			setCurrentPage(normalized.page === undefined ? 1 : normalized.page);
		} catch {
			// ignore malformed ?input=
		}
	}, [router.isReady, router.query.input]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withProductsListingTypeFilter({ ...searchFilter, page: value });
		setSearchFilter(next);
		setCurrentPage(value);
		await router.push(`/products?input=${JSON.stringify(next)}`, `/products?input=${JSON.stringify(next)}`, {
			scroll: false,
		});
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({
				variables: { input: id },
			});
			await getProductsRefetch({ input: listingInquiryInputRef.current });
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
				setSearchFilter(
					withProductsListingTypeFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC }),
				);
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter(
					withProductsListingTypeFilter({
						...searchFilter,
						sort: 'propertyPrice',
						direction: Direction.ASC,
					}),
				);
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter(
					withProductsListingTypeFilter({
						...searchFilter,
						sort: 'propertyPrice',
						direction: Direction.DESC,
					}),
				);
				setFilterSortName('Highest Price');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setSearchFilter(
			withProductsListingTypeFilter({
				...searchFilter,
				search: { ...searchFilter.search, text: searchText },
			}),
		);
	};

	if (device === 'mobile') {
		return <h1>PRODUCTS MOBILE</h1>;
	} else {
		return (
			<Stack className="pawpal-static-page pawpal-static-page--products">
				<Stack className="container">
					<ProductsHero />

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

						<Stack className="products-catalog-page__main" mb={'76px'}>
							<ProductsList properties={products} onLike={likeProductHandler} />

							<Stack className="pagination-config">
								{products.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
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
				</Stack>
			</Stack>
		);
	}
};

ProductsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			typeList: [PropertyType.PRODUCT],
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutFull(ProductsListPage);
