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

const getBackendImage = (img?: string) =>
	img ? `${REACT_APP_API_URL}/${String(img).replace(/^\/+/, '')}` : '';

/** Babet-style image-overlay catalog card. */
const ServiceCard: React.FC<ServiceCardProps> = ({ service, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const bgUrl = getBackendImage(service?.listingImages?.[0]);

	const goDetail = async () => {
		await router.push(`/service/detail?id=${service._id}`);
	};

	return (
		<Stack className="services-list-card" onClick={goDetail}>
			<Box
				className="services-list-card__media"
				component="div"
				sx={{
					backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
					backgroundColor: '#2a2a2a',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<div className="services-list-card__gradient" aria-hidden />
				{service.durationMinutes != null ? (
					<span className="services-list-card__duration-pill">{service.durationMinutes} min</span>
				) : null}
				<span className="services-list-card__arrow" aria-hidden>
					↗
				</span>
				<Typography component="span" className="services-list-card__title">
					{service.listingTitle}
				</Typography>
				<Typography component="span" className="services-list-card__price">
					${formatterStr(service.listingPrice)}
				</Typography>
				<Stack
					className="services-list-card__actions"
					direction="row"
					alignItems="center"
					onClick={(e) => e.stopPropagation()}
				>
					<IconButton
						size="small"
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							onLike(user, service._id);
						}}
						aria-label="Like service"
					>
						{service?.meLiked && service?.meLiked[0]?.myFavorite ? (
							<FavoriteIcon sx={{ fontSize: 20 }} htmlColor="#fff" />
						) : (
							<FavoriteBorderIcon sx={{ fontSize: 20 }} htmlColor="#fff" />
						)}
					</IconButton>
					<Typography component="span" className="services-list-card__like-cnt">
						{service.listingLikes ?? 0}
					</Typography>
				</Stack>
			</Box>
		</Stack>
	);
};

export default ServiceCard;
