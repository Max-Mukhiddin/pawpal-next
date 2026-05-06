import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import { formatterStr } from '../../utils';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

export interface RelatedProductCardProps {
	product: Product;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Related product slide card; navigates to product detail. */
const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ product, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = resolveListingImageUrl(product?.listingImages?.[0], '/images/hero/pawpal-hero.jpg');

	const raw = (product?.listingDesc || product?.listingAddress || '').trim();
	const blurb =
		raw.length > 72 ? `${raw.slice(0, 72)}…` : raw || 'Popular with PawPal shoppers.';

	return (
		<Stack className="related-product-card" onClick={() => router.push(`/product/detail?id=${product._id}`)}>
			<Box className="related-product-card__image" component={'div'}>
				<img
					src={image}
					onError={(e) => {
						e.currentTarget.src = '/images/hero/pawpal-hero.jpg';
					}}
					alt={product.listingTitle}
				/>
			</Box>
			<Stack className="related-product-card__body">
				<Typography className="related-product-card__title">{product.listingTitle}</Typography>
				<Typography className="related-product-card__blurb" sx={{ fontSize: 12, color: '#717171', lineHeight: 1.45, mb: 0.5 }}>
					{blurb}
				</Typography>
				<Typography className="related-product-card__meta">From ${formatterStr(product.listingPrice)}</Typography>
				<Stack direction={'row'} alignItems={'center'} className="related-product-card__stats">
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{product.listingViews}</Typography>
					<IconButton
						color={'default'}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							onLike(user, product._id);
						}}
					>
						{product?.meLiked && product?.meLiked[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</IconButton>
					<Typography className="view-cnt">{product.listingLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default RelatedProductCard;
