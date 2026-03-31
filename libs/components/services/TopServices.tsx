import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopServiceCard from './TopServiceCard';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import type { Listing } from '../../types/listing/listing';
import { useMutation, useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { ListingType } from '../../enums/listing.enum';

interface TopServicesProps {
	initialInput: ListingsInquiry;
}

const TopServices = (props: TopServicesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topServices, setTopServices] = useState<Listing[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	const {
		loading: getListingsLoading,
		data: getListingsData,
		error: getListingsError,
		refetch: getListingsRefetch,
	} = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopServices(data?.getListings?.list);
		},
	});
	/** HANDLERS **/
	const likeListingHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({
				variables: { input: id },
			});
			await getListingsRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeListingHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top services near you</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-listing-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topServices.map((listing: Listing) => {
								return (
									<SwiperSlide className={'top-listing-slide'} key={listing?._id}>
										<TopServiceCard listing={listing} likeListingHandler={likeListingHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top services near you</span>
							<p>Highly rated care services in your area</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-listing-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topServices.map((listing: Listing) => {
								return (
									<SwiperSlide className={'top-listing-slide'} key={listing?._id}>
										<TopServiceCard listing={listing} likeListingHandler={likeListingHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopServices.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'listingRank',
		direction: 'DESC',
		search: {
			typeList: [ListingType.SERVICE],
		},
	},
};

export default TopServices;
