import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import { formatterStr } from '../../utils';

export interface ProductCardProps {
	product: Product;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Catalog tile; listing-backed PawPal product row. */
const ProductCard: React.FC<ProductCardProps> = ({ product, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = product?.listingImages?.[0] ? `${REACT_APP_API_URL}/${product.listingImages[0]}` : '/img/icons/icoAlert.svg';

	const description =
		product?.listingDesc?.trim() || product?.listingAddress || 'In stock for your pet’s daily routine.';

	const goDetail = async () => {
		await router.push(`/products/detail?id=${product._id}`);
	};

	return (
		<Stack className="products-list-card" onClick={goDetail}>
			<Box className="products-list-card__media" component={'div'}>
				<img src={image} alt={product.listingTitle} />
			</Box>
			<Stack className="products-list-card__body">
				<Typography className="products-list-card__title">{product.listingTitle}</Typography>
				<Typography className="products-list-card__desc">{description}</Typography>
				<Stack className="products-list-card__meta" direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
					<Typography className="products-list-card__price">${formatterStr(product.listingPrice)}</Typography>
					<Typography className="products-list-card__stock">In catalog</Typography>
				</Stack>
				<Stack className="products-list-card__actions" direction={'row'} alignItems={'center'}>
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

export default ProductCard;
