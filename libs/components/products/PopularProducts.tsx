import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import PopularProductCard from './PopularProductCard';
import type { Listing } from '../../types/listing/listing';
import Link from 'next/link';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { ListingType } from '../../enums/listing.enum';

interface PopularProductsProps {
	initialInput: ListingsInquiry;
}

const PopularProducts = (props: PopularProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularProducts, setPopularProducts] = useState<Listing[]>([]);

	/** APOLLO REQUESTS **/

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
			setPopularProducts(data?.getListings?.list);
		},
	});
	/** HANDLERS **/

	if (!popularProducts) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular near you</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-listing-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={25}
							modules={[Autoplay]}
						>
							{popularProducts.map((listing: Listing) => {
								return (
									<SwiperSlide key={listing._id} className={'popular-listing-slide'}>
										<PopularProductCard listing={listing} />
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
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Popular near you</span>
							<p>What shoppers are viewing most</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/listings'}>
									<span>Browse catalog</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-listing-swiper'}
							slidesPerView={'auto'}
							spaceBetween={25}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-popular-next',
								prevEl: '.swiper-popular-prev',
							}}
							pagination={{
								el: '.swiper-popular-pagination',
							}}
						>
							{popularProducts.map((listing: Listing) => {
								return (
									<SwiperSlide key={listing._id} className={'popular-listing-slide'}>
										<PopularProductCard listing={listing} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
					<Stack className={'pagination-box'}>
						<WestIcon className={'swiper-popular-prev'} />
						<div className={'swiper-popular-pagination'}></div>
						<EastIcon className={'swiper-popular-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

PopularProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'listingViews',
		direction: 'DESC',
		search: {
			typeList: [ListingType.PRODUCT],
		},
	},
};

export default PopularProducts;
