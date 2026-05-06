import React from 'react';
import { Stack, Box, Divider, Typography, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Listing } from '../../types/listing/listing';
import { topListingRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { T } from '../../types/common';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

export interface RelatedSpecialistServiceCardProps {
	listing: Listing;
	onLike: (user: T, id: string) => Promise<void>;
	selectedListingId?: string | null;
	onSelectForInquiry?: (listing: Listing) => void;
}

/** Care offering card; listing-backed; opens PawPal service detail. */
const RelatedSpecialistServiceCard: React.FC<RelatedSpecialistServiceCardProps> = ({
	listing,
	onLike,
	selectedListingId,
	onSelectForInquiry,
}) => {
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const goOfferingDetail = (listingId: string) => {
		router.push(`/service/detail?id=${listingId}`);
	};

	const coverUrl = resolveListingImageUrl(listing?.listingImages?.[0], '/img/icons/icoAlert.svg');

	const isSelected = Boolean(selectedListingId && listing?._id === selectedListingId);

	return (
		<Stack
			className="listing-big-card-box"
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
						<span>{listing?.durationMinutes != null ? `${listing.durationMinutes} min` : '—'}</span>
					</div>
					<div>
						<span>{listing?.listingViews ?? 0} views</span>
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
						<span>{listing?.listingStatus}</span>
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

export default RelatedSpecialistServiceCard;
