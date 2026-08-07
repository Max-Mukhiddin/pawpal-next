import React from 'react';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import { formatterKrw } from '../../utils';
import { resolveListingImageUrl } from '../../utils/mediaUrl';
import { sanitizeListingDescription } from '../../utils/listingTextHelpers';

export interface ProductCardProps {
	product: Product;
	onLike: (user: T, id: string) => Promise<void>;
	className?: string;
}

const PRODUCT_CATEGORY_KEYWORDS: { label: string; keywords: string[] }[] = [
	{ label: 'Food', keywords: ['food', 'nutrition', 'supplement', 'treat', 'chew', 'diet', 'meal'] },
	{ label: 'Grooming', keywords: ['groom', 'brush', 'shampoo', 'comb', 'nail', 'hair'] },
	{ label: 'Toys', keywords: ['toy', 'ball', 'play', 'chew', 'interactive'] },
	{ label: 'Health', keywords: ['health', 'vitamin', 'dental', 'care', 'flea', 'tick', 'joint'] },
	{ label: 'Accessories', keywords: ['collar', 'leash', 'harness', 'bed', 'bowl', 'carrier', 'kit'] },
];

const getBackendImage = (img?: string) => resolveListingImageUrl(img, '/img/listing/default-listing.webp');

function getProductCategoryLabel(product: Product): string {
	const haystack = `${product.listingTitle} ${product.listingDesc ?? ''}`.toLowerCase();
	for (const cat of PRODUCT_CATEGORY_KEYWORDS) {
		if (cat.keywords.some((kw) => haystack.includes(kw))) {
			return cat.label.toUpperCase();
		}
	}
	if (product.listingType) {
		return String(product.listingType).replaceAll('_', ' ');
	}
	return 'AVAILABLE';
}

/** Simplified catalog card — shared on listing pages and homepage rail. */
const ProductCard: React.FC<ProductCardProps> = ({ product, onLike, className }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const image = getBackendImage(product?.listingImages?.[0]);
	const description = sanitizeListingDescription(product?.listingDesc);
	const isLiked = Boolean(product?.meLiked && product?.meLiked[0]?.myFavorite);
	const categoryLabel = getProductCategoryLabel(product);

	const goDetail = async () => {
		await router.push(`/product/detail?id=${product._id}`);
	};

	return (
		<div className={`pp-product-card${className ? ` ${className}` : ''}`}>
			<div className="pp-product-card__img-wrap" onClick={goDetail} role="presentation">
				<img
					src={image || '/img/listing/default-listing.webp'}
					onError={(e) => {
						e.currentTarget.src = '/img/listing/default-listing.webp';
					}}
					alt={product.listingTitle}
				/>
			</div>

			<div className="pp-product-card__body">
				<div className="pp-product-card__top">
					<span className="pp-product-card__badge">{categoryLabel}</span>
					<span className="pp-product-card__likes">
						<IconButton
							className={`pp-product-card__heart${isLiked ? ' is-liked' : ''}`}
							size="small"
							type="button"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								void onLike(user, product._id);
							}}
							onPointerDown={(e) => e.stopPropagation()}
							aria-label="Like product"
						>
							{isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
						</IconButton>
						<span className="pp-product-card__like-count">{product.listingLikes ?? 0}</span>
					</span>
				</div>

				<h3 className="pp-product-card__name">{product.listingTitle}</h3>

				{description ? <p className="pp-product-card__desc">{description}</p> : null}

				<div className="pp-product-card__foot">
					<span className="pp-product-card__price">{formatterKrw(product.listingPrice)}</span>
					<button
						type="button"
						className="pp-product-card__btn"
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							void goDetail();
						}}
					>
						Send Inquiry
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
