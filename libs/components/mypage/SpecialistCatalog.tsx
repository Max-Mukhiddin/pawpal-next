import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { SpecialistCatalogRow } from './SpecialistCatalogRow';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import type { Listing } from '../../types/listing/listing';
import type { AgentListingsInquiry } from '../../types/listing/listing.input';
import { T } from '../../types/common';
import { ListingStatus, ListingType } from '../../enums/listing.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_AGENT_LISTINGS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { UPDATE_LISTING } from '../../../apollo/user/mutation';

const SpecialistCatalog: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category = router.query?.category as string | undefined;
	const pageTitle = useMemo(() => {
		if (category === 'myProducts') return 'My products';
		if (category === 'myServices' || category === 'myListings') return 'My services';
		return 'My catalog';
	}, [category]);

	const [searchFilter, setSearchFilter] = useState<AgentListingsInquiry>(initialInput);
	const [agentListings, setAgentListings] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);

	useEffect(() => {
		if (!router.isReady) return;
		setSearchFilter((prev) => ({ ...prev, page: 1 }));
	}, [router.isReady, category]);

	const filteredAgentListings = useMemo(() => {
		if (category === 'myProducts') {
			return agentListings.filter((l) => l.listingType === ListingType.PRODUCT);
		}
		if (category === 'myServices' || category === 'myListings') {
			return agentListings.filter((l) => l.listingType === ListingType.SERVICE);
		}
		return agentListings;
	}, [agentListings, category]);

	/** APOLLO REQUESTS **/
	const [updateListing] = useMutation(UPDATE_LISTING);

	const {
		loading: getAgentListingsLoading,
		data: getAgentListingsData,
		error: getAgentListingsError,
		refetch: getAgentListingsRefetch,
	} = useQuery(GET_AGENT_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setAgentListings(data?.getAgentListings?.list);
			setTotal(data?.getAgentListings?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ListingStatus) => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, listingStatus: value },
		});
	};

	const deleteListingHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure you want to delete this item?')) {
				await updateListing({
					variables: {
						input: {
							_id: id,
							listingStatus: ListingStatus.DELETE,
						},
					},
				});
			}

			await getAgentListingsRefetch({ input: searchFilter });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateListingHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure change to ${status} status?`)) {
				await updateListing({
					variables: {
						input: {
							_id: id,
							listingStatus: status as ListingStatus,
						},
					},
				});
			}

			await getAgentListingsRefetch({ input: searchFilter });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>pawpal CATALOG MOBILE</div>;
	} else {
		return (
			<div id="my-listings-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{pageTitle}</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="listing-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(ListingStatus.ACTIVE)}
							className={searchFilter.search.listingStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							On Sale
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ListingStatus.SOLD)}
							className={searchFilter.search.listingStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							On Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Title</Typography>
							<Typography className="title-text">Date Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter.search.listingStatus === 'ACTIVE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{filteredAgentListings?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No items found.</p>
							</div>
						) : (
							filteredAgentListings.map((listing: Listing) => {
								return (
									<SpecialistCatalogRow
										listing={listing}
										deleteListingHandler={deleteListingHandler}
										updateListingHandler={updateListingHandler}
										key={listing._id}
									/>
								);
							})
						)}

						{filteredAgentListings.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} item{total === 1 ? '' : 's'} in your catalog</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

SpecialistCatalog.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			listingStatus: 'ACTIVE',
		},
	},
};

export default SpecialistCatalog;
