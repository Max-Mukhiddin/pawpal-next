import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CatalogBrowseCard from '../listings/CatalogBrowseCard';
import type { Listing } from '../../types/listing/listing';
import { T } from '../../types/common';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { likeToastMessage } from '../../utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../auth';
import { withActionGate } from '../../utils/actionGate';

const MyFavorites: NextPage = () => {
	const router = useRouter();
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
		await withActionGate(`like:listing:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'like')) return;

				await likeTargetListing({
					variables: {
						input: id,
					},
				});

				await getFavoritesRefetch({ input: searchFavorites });
				await sweetTopSmallSuccessAlert(likeToastMessage(true), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'like')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.error('ERROR, likeListingHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

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
							<span className="mypage-empty-icon" aria-hidden>
								🐾
							</span>
							<p>No favorites yet</p>
							<Link href="/service" className="mypage-empty-cta">
								Browse services
							</Link>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								className="pp-pagination"
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
};

export default MyFavorites;
