import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import type { Listing } from '../../types/listing/listing';
import { ListingType } from '../../enums/listing.enum';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { topListingRank } from '../../config';
import { useRouter } from 'next/router';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface PopularProductCardProps {
	listing: Listing;
}

const PopularProductCard = (props: PopularProductCardProps) => {
	const { listing } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const cardImage = resolveListingImageUrl(listing?.listingImages?.[0], '/images/hero/pawpal-hero.jpg');

	/** HANDLERS **/

	const pushDetailHandler = async (listingId: string) => {
		console.log('listingId: ', listingId);
		await router.push({ pathname: '/product/detail', query: { id: listingId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${cardImage})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					{listing && listing?.listingRank >= topListingRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${listing.listingPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(listing._id);
						}}
					>
						{listing.listingTitle}
					</strong>
					<p className={'desc'}>{listing.listingAddress}</p>
					<div className={'options'}>
						<div>
							<span>{listing?.listingType}</span>
						</div>
						<div>
							<span>{listing?.listingViews ?? 0} views</span>
						</div>
						{listing?.listingType === ListingType.SERVICE && listing?.durationMinutes != null && (
							<div>
								<span>{listing.durationMinutes} min</span>
							</div>
						)}
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{listing?.listingStatus}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{listing?.listingViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${cardImage})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					{listing && listing?.listingRank >= topListingRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${listing.listingPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(listing._id);
						}}
					>
						{listing.listingTitle}
					</strong>
					<p className={'desc'}>{listing.listingAddress}</p>
					<div className={'options'}>
						<div>
							<span>{listing?.listingType}</span>
						</div>
						<div>
							<span>{listing?.listingViews ?? 0} views</span>
						</div>
						{listing?.listingType === ListingType.SERVICE && listing?.durationMinutes != null && (
							<div>
								<span>{listing.durationMinutes} min</span>
							</div>
						)}
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{listing?.listingStatus}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{listing?.listingViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PopularProductCard;
