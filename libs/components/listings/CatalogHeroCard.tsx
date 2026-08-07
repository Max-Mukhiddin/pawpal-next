import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { Listing } from '../../types/listing/listing';
import { ListingType } from '../../enums/listing.enum';
import { topListingRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { resolveListingImageUrl } from '../../utils/mediaUrl';
import { getListingDetailHref } from '../../utils/inboxListingContext';

interface CatalogHeroCardProps {
	listing: Listing;
	likeListingHandler?: any;
}

const CatalogHeroCard = (props: CatalogHeroCardProps) => {
	const { listing, likeListingHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const cardImage = resolveListingImageUrl(listing?.listingImages?.[0], '/img/listing/default-listing.webp');

	/** HANDLERS **/
	const goListingDetailPage = (listingId: string) => {
		const href = getListingDetailHref(listingId, listing?.listingType);
		if (href) void router.push(href);
	};

	if (device === 'mobile') {
		return <div>CATALOG HERO</div>;
	} else {
		return (
			<Stack className="listing-big-card-box" onClick={() => goListingDetailPage(listing?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${cardImage})` }}
				>
					{listing && listing?.listingRank >= topListingRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(listing?.listingPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{listing?.listingTitle}</strong>
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
									likeListingHandler(user, listing?._id);
								}}
							>
								{listing?.meLiked && listing?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon sx={{ color: 'var(--pp-like-red)' }} />
								) : (
									<FavoriteBorderIcon sx={{ color: 'var(--pp-like-red)' }} />
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

export default CatalogHeroCard;
