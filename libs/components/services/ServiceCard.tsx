import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import type { Service } from '../../types/services/service';
import { T } from '../../types/common';
import { formatterStr } from '../../utils';

export interface ServiceCardProps {
	service: Service;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Single service row in the catalog; reuses `services-list-card` classes for grid styling. */
const ServiceCard: React.FC<ServiceCardProps> = ({ service, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = service?.listingImages?.[0]
		? `${REACT_APP_API_URL}/${service.listingImages[0]}`
		: '/img/icons/icoAlert.svg';

	const shortDesc =
		service?.listingDesc?.trim() || service?.listingAddress || 'Thoughtful care tailored to your companion.';

	const goDetail = async () => {
		await router.push(`/services/detail?id=${service._id}`);
	};

	return (
		<Stack className="services-list-card" onClick={goDetail}>
			<Box className="services-list-card__media" component={'div'}>
				<img src={image} alt={service.listingTitle} />
			</Box>
			<Stack className="services-list-card__body">
				<Typography className="services-list-card__title">{service.listingTitle}</Typography>
				<Typography className="services-list-card__desc">{shortDesc}</Typography>
				<Stack className="services-list-card__meta" direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
					<Typography className="services-list-card__price">From ${formatterStr(service.listingPrice)}</Typography>
					<Typography className="services-list-card__duration">{service.listingRooms} step care</Typography>
				</Stack>
				<Stack className="services-list-card__actions" direction={'row'} alignItems={'center'}>
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{service.listingViews}</Typography>
					<IconButton
						color={'default'}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							onLike(user, service._id);
						}}
					>
						{service?.meLiked && service?.meLiked[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</IconButton>
					<Typography className="view-cnt">{service.listingLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default ServiceCard;
