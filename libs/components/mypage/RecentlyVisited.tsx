import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CatalogBrowseCard from '../listings/CatalogBrowseCard';
import type { Listing } from '../../types/listing/listing';
import { T } from '../../types/common';
import { GET_VISITED } from '../../../apollo/user/query';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [recentlyVisited, setRecentlyVisited] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/

	const {
		loading: getVisitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchVisited,
		},
		skip: !user?._id || user._id.length !== 24,
		onCompleted(data: T) {
			setRecentlyVisited(data.getVisited?.list);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	if (device === 'mobile') {
		return <div>pawpal MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Recently Visited</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{recentlyVisited?.length ? (
						recentlyVisited?.map((listing: Listing) => {
							return <CatalogBrowseCard listing={listing} recentlyVisited={true} key={listing._id} />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No recently visited items yet.</p>
						</div>
					)}
				</Stack>
				{recentlyVisited?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchVisited.limit)}
								page={searchVisited.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} recently visited item{total === 1 ? '' : 's'}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default RecentlyVisited;
