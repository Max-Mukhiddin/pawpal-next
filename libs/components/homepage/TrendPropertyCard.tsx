import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Listing } from '../../types/listing/listing';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrendPropertyCardProps {
	listing: Listing;
	likeListingHandler: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const { listing, likeListingHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const pushDetailHandler = async (listingId: string) => {
		console.log('listingId: ', listingId);
		await router.push({ pathname: '/property/detail', query: { id: listingId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={listing._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${listing?.listingImages[0]})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					<div>${listing.listingPrice}</div>
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
					<p className={'desc'}>{listing.listingDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{listing.listingBeds} bed</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{listing.listingRooms} rooms</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{listing.listingSquare} m2</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{listing.listingRent ? 'Rent' : ''} {listing.listingRent && listing.listingBarter && '/'}{' '}
							{listing.listingBarter ? 'Barter' : ''}
						</p>
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
			<Stack className="trend-card-box" key={listing._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${listing?.listingImages[0]})` }}
					onClick={() => {
						pushDetailHandler(listing._id);
					}}
				>
					<div>${listing.listingPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(listing._id);
						}}
					>
						{listing.listingTitle}{' '}
					</strong>
					<p className={'desc'}>{listing.listingDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{listing.listingBeds} bed</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{listing.listingRooms} rooms</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{listing.listingSquare} m2</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{listing.listingRent ? 'Rent' : ''} {listing.listingRent && listing.listingBarter && '/'}{' '}
							{listing.listingBarter ? 'Barter' : ''}
						</p>
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

export default TrendPropertyCard;
