import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import type { Listing } from '../../types/listing/listing';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { ListingType } from '../../enums/listing.enum';
import TrendingServiceCard from './TrendingServiceCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TrendingServicesProps {
	initialInput: ListingsInquiry;
}

const TrendingServices = (props: TrendingServicesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [trendServices, setTrendServices] = useState<Listing[]>([]);

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
			setTrendServices(data?.getListings?.list);
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

	if (!trendServices) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Trending services</span>
					</Stack>
					<Stack className={'card-box'}>
						{trendServices.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-listing-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
								{trendServices.map((listing: Listing) => {
									return (
										<SwiperSlide key={listing._id} className={'trend-listing-slide'}>
											<TrendingServiceCard listing={listing} likeListingHandler={likeListingHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Trending services</span>
							<p>Most loved care sessions right now</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						{trendServices.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-listing-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
								pagination={{
									el: '.swiper-trend-pagination',
								}}
							>
								{trendServices.map((listing: Listing) => {
									return (
										<SwiperSlide key={listing._id} className={'trend-listing-slide'}>
											<TrendingServiceCard listing={listing} likeListingHandler={likeListingHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TrendingServices.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'listingLikes',
		direction: 'DESC',
		search: {
			typeList: [ListingType.SERVICE],
		},
	},
};

export default TrendingServices;
