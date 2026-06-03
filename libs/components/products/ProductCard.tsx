import React from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import { formatterKrw } from '../../utils';
import { ListingStatus } from '../../enums/listing.enum';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

export interface ProductCardProps {
	product: Product;
	onLike: (user: T, id: string) => Promise<void>;
}

const getBackendImage = (img?: string) => resolveListingImageUrl(img, '/img/listing/default-listing.webp');

function statusBadgeLabel(status?: string): string {
	if (status === ListingStatus.ACTIVE) return 'Available';
	if (status === ListingStatus.SOLD) return 'Sold';
	if (status === ListingStatus.DELETE) return 'Unavailable';
	return status || '—';
}

/** Catalog grid card — white tile, image, meta, inquiry CTA. */
const ProductCard: React.FC<ProductCardProps> = ({ product, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = getBackendImage(product?.listingImages?.[0]);

	const description = product?.listingDesc?.trim() || '';

	const goDetail = async () => {
		await router.push(`/product/detail?id=${product._id}`);
	};

	const isActive = product?.listingStatus === ListingStatus.ACTIVE;

	return (
		<Stack className="products-list-card">
			<Box className="products-list-card__media" component="div" onClick={goDetail} role="presentation">
				<img
					src={image || '/img/listing/default-listing.webp'}
					onError={(e) => {
						e.currentTarget.src = '/img/listing/default-listing.webp';
					}}
					alt={product.listingTitle}
					className="products-list-card__img"
				/>
			</Box>
			<Stack className="products-list-card__body" spacing={0}>
				<Typography component="span" className={`products-list-card__badge ${isActive ? 'is-available' : ''}`} sx={{ mb: 1 }}>
					{statusBadgeLabel(product?.listingStatus)}
				</Typography>
				<Typography className="products-list-card__title">{product.listingTitle}</Typography>
				<Typography className="products-list-card__price">{formatterKrw(product.listingPrice)}</Typography>
				<Typography className="products-list-card__desc">{description}</Typography>
				<Stack className="products-list-card__stats" direction="row" alignItems="center" spacing={1.5}>
					<Typography component="span" className="products-list-card__stat">
						👁 {product.listingViews ?? 0}
					</Typography>
					<Stack direction="row" alignItems="center" spacing={0.5}>
						<IconButton
							size="small"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								onLike(user, product._id);
							}}
							aria-label="Like product"
						>
							{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color="primary" fontSize="small" />
							) : (
								<FavoriteBorderIcon fontSize="small" />
							)}
						</IconButton>
						<Typography component="span" className="products-list-card__stat">
							{product.listingLikes ?? 0}
						</Typography>
					</Stack>
				</Stack>
				<Button
					className="products-list-card__inquiry"
					variant="outlined"
					fullWidth
					onClick={(e) => {
						e.stopPropagation();
						void goDetail();
					}}
				>
					Send Inquiry
				</Button>
			</Stack>
		</Stack>
	);
};

export default ProductCard;
