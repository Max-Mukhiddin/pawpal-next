import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { useRouter } from 'next/router';
import { ServicesInquiry } from '../../libs/types/services/service.input';
import type { Service } from '../../libs/types/services/service';
import { PropertyType } from '../../libs/enums/property.enum';
import { withServicesListingTypeFilter } from '../../libs/utils/catalogListingInquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SERVICES } from '../../apollo/services/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_SERVICE } from '../../apollo/services/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ServicesHero from '../../libs/components/services/ServicesHero';
import ServicesFilterBar from '../../libs/components/services/ServicesFilterBar';
import ServicesList from '../../libs/components/services/ServicesList';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ServicesListPage: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ServicesInquiry>(() =>
		withServicesListingTypeFilter(
			router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
		),
	);
	const [services, setServices] = useState<Service[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>('');

	const listingInquiryInput = useMemo(
		() => withServicesListingTypeFilter(searchFilter),
		[searchFilter],
	);
	const listingInquiryInputRef = useRef(listingInquiryInput);
	listingInquiryInputRef.current = listingInquiryInput;

	/** APOLLO REQUESTS **/
	const [likeTargetService] = useMutation(LIKE_TARGET_SERVICE);

	const { refetch: getServicesRefetch } = useQuery(GET_SERVICES, {
		fetchPolicy: 'network-only',
		variables: { input: listingInquiryInput },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setServices(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (!router.query.input) return;
		try {
			const inputObj = JSON.parse(router.query.input as string);
			const normalized = withServicesListingTypeFilter(inputObj);
			setSearchFilter(normalized);
			setCurrentPage(normalized.page === undefined ? 1 : normalized.page);
		} catch {
			// ignore malformed ?input=
		}
	}, [router.isReady, router.query.input]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const next = withServicesListingTypeFilter({ ...searchFilter, page: value });
		setSearchFilter(next);
		setCurrentPage(value);
		await router.push(`/services?input=${JSON.stringify(next)}`, `/services?input=${JSON.stringify(next)}`, {
			scroll: false,
		});
	};

	const likeServiceHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetService({
				variables: { input: id },
			});
			await getServicesRefetch({ input: listingInquiryInputRef.current });
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
				setSearchFilter(
					withServicesListingTypeFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC }),
				);
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter(
					withServicesListingTypeFilter({
						...searchFilter,
						sort: 'propertyPrice',
						direction: Direction.ASC,
					}),
				);
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter(
					withServicesListingTypeFilter({
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
			withServicesListingTypeFilter({
				...searchFilter,
				search: { ...searchFilter.search, text: searchText },
			}),
		);
	};

	if (device === 'mobile') {
		return <h1>SERVICES MOBILE</h1>;
	} else {
		return (
			<Stack className="pawpal-static-page pawpal-static-page--services">
				<Stack className="container">
					<ServicesHero />

					<Stack className={'services-catalog-page'}>
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
						<Stack className="services-catalog-page__main" mb={'76px'}>
							<ServicesList properties={services} onLike={likeServiceHandler} />

							<Stack className="pagination-config">
								{services.length !== 0 && (
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

								{services.length !== 0 && (
									<Stack className="total-result">
										<Typography>Total {total} service{total > 1 ? 's' : ''} available</Typography>
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

ServicesListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			typeList: [PropertyType.SERVICE],
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

export default withLayoutFull(ServicesListPage);
