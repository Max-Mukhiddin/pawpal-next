import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import type { Listing } from '../../types/listing/listing';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { ListingType } from '../../enums/listing.enum';
import ServiceCard from '../services/ServiceCard';
import ProductCard from '../products/ProductCard';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, successToast } from '../../sweetAlert';
import { likeToastMessage, readWasLiked } from '../../utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../auth';
import { withActionGate } from '../../utils/actionGate';

const MemberAgentListings: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { memberId } = router.query;
	const [listingInquiry, setListingInquiry] = useState<ListingsInquiry>({ ...initialInput });
	const [agentListings, setAgentListings] = useState<Listing[]>([]);
	const [total, setTotal] = useState<number>(0);

	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const { refetch: getListingsRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: listingInquiry },
		skip: !listingInquiry?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentListings(data?.getListings?.list ?? []);
			setTotal(data?.getListings?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (memberId) {
			setListingInquiry({
				...initialInput,
				search: { ...initialInput.search, memberId: memberId as string },
			});
		}
	}, [memberId]);

	const paginationHandler = (e: T, value: number) => {
		setListingInquiry({ ...listingInquiry, page: value });
	};

	const likeListingHandler = async (u: T, id: string) => {
		await withActionGate(`like:listing:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, u._id, 'like')) return;
				const wasLiked = readWasLiked(agentListings.find((l) => l._id === id));
				await likeTargetListing({ variables: { input: id } });
				await getListingsRefetch({ input: listingInquiry });
				successToast(likeToastMessage(wasLiked));
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'like')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	if (device === 'mobile') {
		return <div>pawpal LISTINGS MOBILE</div>;
	}

	return (
		<div className="member-content">
			<h1 className="member-content__title">Care Listings</h1>
			{agentListings?.length === 0 ? (
				<div className="member-content__empty">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No listings found!</p>
				</div>
			) : (
				<>
					<div className="member-content__grid">
						{agentListings?.map((listing: Listing) =>
							listing.listingType === ListingType.PRODUCT ? (
								<ProductCard key={listing._id} product={listing as any} onLike={likeListingHandler} />
							) : (
								<ServiceCard key={listing._id} service={listing as any} onLike={likeListingHandler} />
							),
						)}
					</div>
					{total > listingInquiry.limit ? (
						<div className="member-content__pagination">
							<Pagination
								className="pp-pagination"
								count={Math.ceil(total / listingInquiry.limit) || 1}
								page={listingInquiry.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</div>
					) : null}
				</>
			)}
		</div>
	);
};

MemberAgentListings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberAgentListings;
