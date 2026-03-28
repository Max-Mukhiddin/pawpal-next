import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { SERVICES_PAGE_MOCK } from '../../libs/data/services/servicesPage.mock';
import type { ServicesPageData } from '../../libs/types/services/services.page';
import ServicesHero from '../../libs/components/services/ServicesHero';
import ServicesFilter from '../../libs/components/services/ServicesFilter';
import ServiceListCard from '../../libs/components/services/ServiceListCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ServicesListPage: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [pageData] = useState<ServicesPageData>(() => SERVICES_PAGE_MOCK);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// getPropertiesRefetch({ input: searchFilter }).then();
		console.log('searchFilter:', searchFilter);
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/services?input=${JSON.stringify(searchFilter)}`,
			`/services?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProperty({
				variables: { input: id },
			});
			await getPropertiesRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likePropertyHandler:', err.message);
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
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC });
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC });
				setFilterSortName('Highest Price');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleHeroPrimaryClick = async () => {
		await router.push('/services');
	};

	const handleHeroSecondaryClick = async () => {
		await router.push('/cs');
	};

	const handleSearchEnter = () => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	};

	if (device === 'mobile') {
		return <h1>SERVICES MOBILE</h1>;
	} else {
		return (
			<Stack className="pawpal-static-page pawpal-static-page--services">
				<Stack className="container">
					<ServicesHero data={pageData.hero} onPrimaryClick={handleHeroPrimaryClick} onSecondaryClick={handleHeroSecondaryClick} />

					<Stack className={'services-catalog-page'}>
						<ServicesFilter
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
							<Stack className={'services-catalog-page__grid'}>
								{properties?.length === 0 ? (
									<div className={'services-catalog-page__no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Services found!</p>
									</div>
								) : (
									properties.map((property: Property) => {
										return <ServiceListCard item={property} onLike={likePropertyHandler} key={property?._id} />;
									})
								)}
							</Stack>

							<Stack className="pagination-config">
								{properties.length !== 0 && (
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

								{properties.length !== 0 && (
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

export default withLayoutBasic(ServicesListPage);
