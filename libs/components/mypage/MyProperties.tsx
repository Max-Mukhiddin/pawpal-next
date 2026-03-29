import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import type { Listing } from '../../types/listing/listing';
import type { AgentListingsInquiry } from '../../types/listing/listing.input';
import { T } from '../../types/common';
import { ListingStatus } from '../../enums/listing.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_AGENT_LISTINGS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { UPDATE_LISTING } from '../../../apollo/user/mutation';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<AgentListingsInquiry>(initialInput);
	const [agentListings, setAgentListings] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

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
		setSearchFilter({ ...searchFilter, search: { listingStatus: value } });
	};

	const deleteListingHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this property?')) {
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
		return <div>pawpal PROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Properties</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
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
							<Typography className="title-text">Listing title</Typography>
							<Typography className="title-text">Date Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter.search.listingStatus === 'ACTIVE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{agentListings?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Property found!</p>
							</div>
						) : (
							agentListings.map((listing: Listing) => {
								return (
									<PropertyCard
										listing={listing}
										deleteListingHandler={deleteListingHandler}
										updateListingHandler={updateListingHandler}
										key={listing._id}
									/>
								);
							})
						)}

						{agentListings.length !== 0 && (
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
									<Typography>{total} property available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			listingStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;
