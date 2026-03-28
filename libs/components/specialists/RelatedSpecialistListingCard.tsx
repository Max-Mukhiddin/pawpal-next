import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { T } from '../../types/common';

export interface RelatedSpecialistListingCardProps {
	listing: Property;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Temporary property-backed offering card with specialist-facing copy; opens PawPal service detail. */
const RelatedSpecialistListingCard: React.FC<RelatedSpecialistListingCardProps> = ({ listing, onLike }) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const goOfferingDetail = (propertyId: string) => {
		router.push(`/services/detail?id=${propertyId}`);
	};

	if (device === 'mobile') {
		return <div>OFFERING CARD</div>;
	}

	return (
		<Stack className="property-big-card-box" onClick={() => goOfferingDetail(listing?._id)}>
			<Box
				component={'div'}
				className={'card-img'}
				style={{ backgroundImage: `url(${REACT_APP_API_URL}/${listing?.propertyImages?.[0]})` }}
			>
				{listing && listing?.propertyRank >= topPropertyRank && (
					<div className={'status'}>
						<img src="/img/icons/electricity.svg" alt="" />
						<span>featured</span>
					</div>
				)}

				<div className={'price'}>From ${formatterStr(listing?.propertyPrice)}</div>
			</Box>
			<Box component={'div'} className={'info'}>
				<strong className={'title'}>{listing?.propertyTitle}</strong>
				<p className={'desc'}>{listing?.propertyDesc || listing?.propertyAddress || 'Care offering'}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/bed.svg" alt="" />
						<span>{listing?.propertyBeds} care steps</span>
					</div>
					<div>
						<img src="/img/icons/room.svg" alt="" />
						<span>{listing?.propertyRooms} sessions</span>
					</div>
					<div>
						<img src="/img/icons/expand.svg" alt="" />
						<span>{listing?.propertySquare} score</span>
					</div>
				</div>
				<Divider sx={{ mt: '15px', mb: '17px' }} />
				<div className={'bott'}>
					<div>
						{listing?.propertyRent ? <p>On-demand</p> : <span>On-demand</span>}
						{listing?.propertyBarter ? <p>Package</p> : <span>Package</span>}
					</div>
					<div className="buttons-box">
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{listing?.propertyViews}</Typography>
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
						<Typography className="view-cnt">{listing?.propertyLikes}</Typography>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default RelatedSpecialistListingCard;
