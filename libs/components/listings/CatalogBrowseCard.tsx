import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { Listing } from '../../types/listing/listing';
import { ListingType } from '../../enums/listing.enum';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { topListingRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { resolveListingImageUrl } from '../../utils/mediaUrl';
import { getListingDetailHref } from '../../utils/inboxListingContext';

interface CatalogBrowseCardProps {
	listing: Listing;
	likeListingHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const CatalogBrowseCard = (props: CatalogBrowseCardProps) => {
	const { listing, likeListingHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = resolveListingImageUrl(listing?.listingImages?.[0], '/img/listing/default-listing.webp');
	const detailHref = getListingDetailHref(listing?._id, listing?.listingType) ?? '/service';

	if (device === 'mobile') {
		return <div>CATALOG CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link href={detailHref}>
						<img
							src={imagePath}
							onError={(e) => {
								e.currentTarget.src = '/img/listing/default-listing.webp';
							}}
							alt=""
						/>
					</Link>
					{listing && listing?.listingRank > topListingRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>${formatterStr(listing?.listingPrice)}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link href={detailHref}>
								<Typography>{listing.listingTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{listing.listingAddress}, {listing.listingLocation}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<Typography>{listing.listingType}</Typography>
						</Stack>
						<Stack className="option">
							<Typography>{listing.listingViews} views</Typography>
						</Stack>
						{listing.listingType === ListingType.SERVICE && listing.durationMinutes != null && (
							<Stack className="option">
								<Typography>{listing.durationMinutes} min</Typography>
							</Stack>
						)}
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{listing.listingStatus}</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{listing?.listingViews}</Typography>
								<IconButton
									color={'default'}
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										void likeListingHandler(user, listing?._id);
									}}
									onPointerDown={(e) => e.stopPropagation()}
								>
									{myFavorites || (listing?.meLiked && listing?.meLiked[0]?.myFavorite) ? (
										<FavoriteIcon sx={{ color: 'var(--pp-like-red)' }} />
									) : (
										<FavoriteBorderIcon sx={{ color: 'var(--pp-like-red)' }} />
									)}
								</IconButton>
								<Typography className="view-cnt">{listing?.listingLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CatalogBrowseCard;
