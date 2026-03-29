import React from 'react';
import { Stack, Box, Divider, Typography, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Listing } from '../../types/listing/listing';
import { REACT_APP_API_URL, topListingRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { T } from '../../types/common';

export interface RelatedSpecialistListingCardProps {
	listing: Listing;
	onLike: (user: T, id: string) => Promise<void>;
	selectedListingId?: string | null;
	onSelectForInquiry?: (listing: Listing) => void;
}

/** Care offering card; listing-backed; opens PawPal service detail. */
const RelatedSpecialistListingCard: React.FC<RelatedSpecialistListingCardProps> = ({
	listing,
	onLike,
	selectedListingId,
	onSelectForInquiry,
}) => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const goOfferingDetail = (listingId: string) => {
		router.push(`/services/detail?id=${listingId}`);
	};

	const coverUrl = listing?.listingImages?.[0]
		? `${REACT_APP_API_URL}/${listing.listingImages[0]}`
		: '/img/icons/icoAlert.svg';

	const isSelected = Boolean(selectedListingId && listing?._id === selectedListingId);

	return (
		<Stack
			className="property-big-card-box"
			onClick={() => goOfferingDetail(listing?._id)}
			sx={
				isSelected
					? {
							outline: '2px solid #eb6753',
							outlineOffset: 2,
							borderRadius: 1,
					  }
					: undefined
			}
		>
			<Box component={'div'} className={'card-img'} style={{ backgroundImage: `url(${coverUrl})` }}>
				{listing && listing?.listingRank >= topListingRank && (
					<div className={'status'}>
						<img src="/img/icons/electricity.svg" alt="" />
						<span>featured</span>
					</div>
				)}

				<div className={'price'}>From ${formatterStr(listing?.listingPrice)}</div>
			</Box>
			<Box component={'div'} className={'info'}>
				<strong className={'title'}>{listing?.listingTitle}</strong>
				<p className={'desc'}>{listing?.listingDesc || listing?.listingAddress || 'Care offering'}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/bed.svg" alt="" />
						<span>{listing?.listingBeds} care steps</span>
					</div>
					<div>
						<img src="/img/icons/room.svg" alt="" />
						<span>{listing?.listingRooms} sessions</span>
					</div>
					<div>
						<img src="/img/icons/expand.svg" alt="" />
						<span>{listing?.listingSquare} score</span>
					</div>
				</div>
				<Divider sx={{ mt: '15px', mb: '17px' }} />
				{onSelectForInquiry && (
					<Button
						fullWidth
						variant="outlined"
						size="small"
						sx={{ mb: 1.5, textTransform: 'none', fontWeight: 600 }}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							onSelectForInquiry(listing);
						}}
					>
						Select for inquiry
					</Button>
				)}
				<div className={'bott'}>
					<div>
						{listing?.listingRent ? <p>On-demand</p> : <span>On-demand</span>}
						{listing?.listingBarter ? <p>Package</p> : <span>Package</span>}
					</div>
					<div className="buttons-box">
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{listing?.listingViews}</Typography>
						<IconButton
							color={'default'}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								onLike(user, listing?._id);
							}}
						>
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
};

export default RelatedSpecialistListingCard;
