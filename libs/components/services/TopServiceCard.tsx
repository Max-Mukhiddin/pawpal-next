import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Listing } from '../../types/listing/listing';
import { ListingType } from '../../enums/listing.enum';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface TopServiceCardProps {
	listing: Listing;
	likeListingHandler: any;
}

const TopServiceCard = (props: TopServiceCardProps) => {
	const { listing, likeListingHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const cardImage = resolveListingImageUrl(listing?.listingImages?.[0], '/images/hero/pawpal-hero.jpg');

	/** HANDLERS **/
	const pushDetailHandler = async (listingId: string) => {
		console.log('listingId: ', listingId);
		await router.push({ pathname: '/service/detail', query: { id: listingId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${cardImage})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					<div>${listing?.listingPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(listing._id);
						}}
					>
						{listing?.listingTitle}
					</strong>
					<p className={'desc'}>{listing?.listingAddress}</p>
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
							<IconButton color={'default'} onClick={() => likeListingHandler(user, listing?._id)}>
								{listing?.meLiked && listing?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{listing?.listingLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${cardImage})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					<div>${listing?.listingPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(listing._id);
						}}
					>
						{listing?.listingTitle}
					</strong>
					<p className={'desc'}>{listing?.listingAddress}</p>
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
							<IconButton color={'default'} onClick={() => likeListingHandler(user, listing?._id)}>
								{listing?.meLiked && listing?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{listing?.listingLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default TopServiceCard;
