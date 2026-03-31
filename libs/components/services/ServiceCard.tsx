import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
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
		: '/images/services/service-grooming.jpg';

	const goDetail = async () => {
		await router.push(`/service/detail?id=${service._id}`);
	};

	return (
		<Stack className="services-list-card" onClick={goDetail}>
			<Box className="services-list-card__media" component={'div'}>
				<img src={image} alt={service.listingTitle} />
				{service.durationMinutes != null ? (
					<span className="services-list-card__duration-pill">{service.durationMinutes} min</span>
				) : null}
				<span className="services-list-card__arrow">↗</span>
				<div className="services-list-card__overlay">
					<Typography className="services-list-card__title">{service.listingTitle}</Typography>
					<Typography className="services-list-card__price">${formatterStr(service.listingPrice)}</Typography>
				</div>
			</Box>
			<Stack className="services-list-card__actions" direction={'row'} alignItems={'center'}>
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
	);
};

export default ServiceCard;
