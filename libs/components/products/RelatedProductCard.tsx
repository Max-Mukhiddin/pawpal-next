import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';

export interface RelatedProductCardProps {
	product: Property;
	onLike: (user: T, id: string) => Promise<void>;
}

const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ product, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = product?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${product.propertyImages[0]}`
		: '/img/icons/icoAlert.svg';

	return (
		<Stack className="related-product-card" onClick={() => router.push(`/products/detail?id=${product._id}`)}>
			<Box className="related-product-card__image" component={'div'}>
				<img src={image} alt={product.propertyTitle} />
			</Box>
			<Stack className="related-product-card__body">
				<Typography className="related-product-card__title">{product.propertyTitle}</Typography>
				<Typography className="related-product-card__meta">${product.propertyPrice}</Typography>
				<Stack direction={'row'} alignItems={'center'} className="related-product-card__stats">
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{product.propertyViews}</Typography>
					<IconButton
						color={'default'}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							onLike(user, product._id);
						}}
					>
						{product?.meLiked && product?.meLiked[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</IconButton>
					<Typography className="view-cnt">{product.propertyLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default RelatedProductCard;
