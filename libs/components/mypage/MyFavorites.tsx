import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CatalogBrowseCard from '../listings/CatalogBrowseCard';
import type { Listing } from '../../types/listing/listing';
import { T } from '../../types/common';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [myFavorites, setMyFavorites] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFavorites,
		},
		skip: !user?._id || user._id.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMyFavorites(data.getFavorites?.list || []);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likeListingHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetListing({
				variables: {
					input: id,
				},
			});

			await getFavoritesRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.error('ERROR, likeListingHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>pawpal MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Favorites</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites?.map((listing: Listing) => {
							return (
								<CatalogBrowseCard
									listing={listing}
									myFavorites={true}
									likeListingHandler={likeListingHandler}
									key={listing._id}
								/>
							);
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Favorites found!</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} favorite listing{total > 1 ? 's' : ''}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default MyFavorites;
