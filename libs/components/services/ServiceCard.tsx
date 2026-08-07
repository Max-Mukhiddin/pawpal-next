import React from 'react';
import { IconButton, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import type { Service } from '../../types/services/service';
import { T } from '../../types/common';
import { formatterKrw } from '../../utils';
import { resolveListingImageUrl } from '../../utils/mediaUrl';
import { sanitizeListingDescription } from '../../utils/listingTextHelpers';
import { SERVICE_CATEGORIES } from './ServiceCategories';

export interface ServiceCardProps {
	service: Service;
	onLike: (user: T, id: string) => Promise<void>;
	className?: string;
}

const getBackendImage = (img?: string) => resolveListingImageUrl(img, '/img/listing/default-listing.webp');

function getServiceCategoryLabel(service: Service): string {
	const haystack = `${service.listingTitle} ${service.listingDesc ?? ''}`.toLowerCase();
	for (const cat of SERVICE_CATEGORIES) {
		if (cat.label === 'All') continue;
		if (cat.keywords.some((kw) => haystack.includes(kw))) {
			return cat.label.toUpperCase();
		}
	}
	return 'AVAILABLE';
}

/** Simplified catalog card — shared on listing pages and homepage rail. */
const ServiceCard: React.FC<ServiceCardProps> = ({ service, onLike, className }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const bgUrl = getBackendImage(service?.listingImages?.[0]);
	const isLiked = Boolean(service?.meLiked && service?.meLiked[0]?.myFavorite);
	const description = sanitizeListingDescription(service?.listingDesc);
	const categoryLabel = getServiceCategoryLabel(service);

	const goDetail = async () => {
		await router.push(`/service/detail?id=${service._id}`);
	};

	return (
		<div className={`services-list-card${className ? ` ${className}` : ''}`}>
			<div className="services-list-card__media" onClick={goDetail} role="presentation">
				{service.durationMinutes != null ? (
					<span className="services-list-card__duration-pill">{service.durationMinutes} min</span>
				) : null}
				<img
					src={bgUrl}
					onError={(e) => {
						e.currentTarget.src = '/img/listing/default-listing.webp';
					}}
					alt={service.listingTitle}
					className="services-list-card__img"
				/>
			</div>

			<div className="services-list-card__body">
				<div className="services-list-card__top">
					<span className="services-list-card__badge">{categoryLabel}</span>
					<span className="services-list-card__likes">
						<IconButton
							className={`services-list-card__heart${isLiked ? ' is-liked' : ''}`}
							size="small"
							type="button"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								void onLike(user, service._id);
							}}
							onPointerDown={(e) => e.stopPropagation()}
							aria-label="Like service"
						>
							{isLiked ? (
								<FavoriteIcon fontSize="small" />
							) : (
								<FavoriteBorderIcon fontSize="small" />
							)}
						</IconButton>
						<span className="services-list-card__like-count">{service.listingLikes ?? 0}</span>
					</span>
				</div>

				<Typography component="h3" className="services-list-card__title">
					{service.listingTitle}
				</Typography>

				{description ? (
					<p className="services-list-card__desc">{description}</p>
				) : null}

				<div className="services-list-card__foot">
					<span className="services-list-card__price">{formatterKrw(service.listingPrice)}</span>
					<button
						type="button"
						className="services-list-card__book"
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							void goDetail();
						}}
					>
						Book Service
					</button>
				</div>
			</div>
		</div>
	);
};

export default ServiceCard;
