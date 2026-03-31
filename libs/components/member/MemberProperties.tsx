import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { SpecialistCatalogRow } from '../mypage/SpecialistCatalogRow';
import type { Listing } from '../../types/listing/listing';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

const MemberAgentListings: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [listingInquiry, setListingInquiry] = useState<ListingsInquiry>({ ...initialInput });
	const [agentListings, setAgentListings] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getListingsLoading,
		data: getListingsData,
		error: getListingsError,
		refetch: getListingsRefetch,
	} = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: listingInquiry },
		skip: !listingInquiry?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentListings(data?.getListings?.list);
			setTotal(data?.getListings?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getListingsRefetch().then();
	}, [listingInquiry]);

	useEffect(() => {
		if (memberId)
			setListingInquiry({
				...initialInput,
				search: { ...initialInput.search, memberId: memberId as string },
			});
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setListingInquiry({ ...listingInquiry, page: value });
	};

	if (device === 'mobile') {
		return <div>pawpal LISTINGS MOBILE</div>;
	} else {
		return (
			<div id="member-properties-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Listings</Typography>
					</Stack>
				</Stack>
				<Stack className="properties-list-box">
					<Stack className="list-box">
						{agentListings?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Listing title</Typography>
								<Typography className="title-text">Date Published</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">View</Typography>
							</Stack>
						)}
						{agentListings?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No listings found!</p>
							</div>
						)}
						{agentListings?.map((listing: Listing) => {
							return <SpecialistCatalogRow listing={listing} memberPage={true} key={listing?._id} />;
						})}

						{agentListings.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / listingInquiry.limit)}
										page={listingInquiry.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} listing(s) available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MemberAgentListings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberAgentListings;
