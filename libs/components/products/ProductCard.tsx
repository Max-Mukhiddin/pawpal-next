import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { formatterStr } from '../../utils';

export interface ProductCardProps {
	property: Property;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Catalog tile; `Property`-backed; reuses `products-list-card` classes. */
const ProductCard: React.FC<ProductCardProps> = ({ property, onLike }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = property?.propertyImages?.[0] ? `${REACT_APP_API_URL}/${property.propertyImages[0]}` : '/img/icons/icoAlert.svg';

	const description =
		property?.propertyDesc?.trim() || property?.propertyAddress || 'In stock for your pet’s daily routine.';

	const goDetail = async () => {
		await router.push(`/products/detail?id=${property._id}`);
	};

	return (
		<Stack className="products-list-card" onClick={goDetail}>
			<Box className="products-list-card__media" component={'div'}>
				<img src={image} alt={property.propertyTitle} />
			</Box>
			<Stack className="products-list-card__body">
				<Typography className="products-list-card__title">{property.propertyTitle}</Typography>
				<Typography className="products-list-card__desc">{description}</Typography>
				<Stack className="products-list-card__meta" direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
					<Typography className="products-list-card__price">${formatterStr(property.propertyPrice)}</Typography>
					<Typography className="products-list-card__stock">In catalog</Typography>
				</Stack>
				<Stack className="products-list-card__actions" direction={'row'} alignItems={'center'}>
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{property.propertyViews}</Typography>
					<IconButton
						color={'default'}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							onLike(user, property._id);
						}}
					>
						{property?.meLiked && property?.meLiked[0]?.myFavorite ? <FavoriteIcon color={'primary'} /> : <FavoriteBorderIcon />}
					</IconButton>
					<Typography className="view-cnt">{property.propertyLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default ProductCard;
