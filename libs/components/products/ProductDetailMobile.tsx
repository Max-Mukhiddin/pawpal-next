import React, { ChangeEvent } from 'react';
import { Button, Stack, Typography, Pagination as MuiPagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import moment from 'moment';
import type { Product } from '../../types/products/product';
import type { Comment } from '../../types/comment/comment';
import type { CommentInput, CommentsInquiry } from '../../types/comment/comment.input';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { T } from '../../types/common';
import RelatedProductCard from './RelatedProductCard';
import ProductReviewCard from './ProductReviewCard';

export interface ProductDetailMobileProps {
	product: Product | null;
	user: T;
	slideImage: string;
	onSlideImageChange: (image: string) => void;
	onLike: (user: T, id: string) => Promise<void>;
	relatedProducts: Product[];
	productComments: Comment[];
	commentTotal: number;
	commentInquiry: CommentsInquiry;
	onCommentPageChange: (event: ChangeEvent<unknown>, value: number) => void;
	insertCommentData: CommentInput;
	onCommentTextChange: (value: string) => void;
	onSubmitComment: () => void;
}

/** Stacked product detail for small screens; same data/actions as desktop. */
function ProductDetailMobile({
	product,
	user,
	slideImage,
	onSlideImageChange,
	onLike,
	relatedProducts,
	productComments,
	commentTotal,
	commentInquiry,
	onCommentPageChange,
	insertCommentData,
	onCommentTextChange,
	onSubmitComment,
}: ProductDetailMobileProps) {
	return (
	<div id="listing-detail-page" className="product-detail-mobile">
		<div className="container">
			<Stack spacing={2} sx={{ py: 2, px: { xs: 1, sm: 0 } }}>
				<Stack className="images">
					<Stack className="main-image" sx={{ borderRadius: 2, overflow: 'hidden' }}>
						<img
							src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/listing/bigImage.png'}
							alt=""
							style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover' }}
						/>
					</Stack>
					<Stack direction="row" className="sub-images" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
						{product?.listingImages?.map((subImg: string) => (
							<Stack
								className="sub-img-box"
								key={subImg}
								onClick={() => onSlideImageChange(subImg)}
								sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }}
							>
								<img
									src={`${REACT_APP_API_URL}/${subImg}`}
									alt=""
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack spacing={1}>
					<Typography className="title-main" sx={{ fontSize: 22, fontWeight: 700 }}>
						{product?.listingTitle}
					</Typography>
					<Typography className="city" sx={{ color: '#717171', fontSize: 14 }}>
						Category · {product?.listingLocation}
					</Typography>
					<Stack direction="row" alignItems="center" spacing={2}>
						<Typography sx={{ fontSize: 24, fontWeight: 700 }}>${formatterStr(product?.listingPrice)}</Typography>
						<Stack direction="row" alignItems="center" spacing={0.5}>
							<RemoveRedEyeIcon fontSize="small" />
							<Typography variant="body2">{product?.listingViews}</Typography>
						</Stack>
						<Stack direction="row" alignItems="center" spacing={0.5}>
							{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color="primary" onClick={() => onLike(user, product?._id as string)} sx={{ cursor: 'pointer' }} />
							) : (
								<FavoriteBorderIcon onClick={() => onLike(user, product?._id as string)} sx={{ cursor: 'pointer' }} />
							)}
							<Typography variant="body2">{product?.listingLikes}</Typography>
						</Stack>
					</Stack>
					<Stack direction="row" flexWrap="wrap" gap={1} className="bottom-box">
						<Typography variant="caption">{product?.listingType}</Typography>
						<Typography variant="caption">Comments {product?.listingComments ?? 0}</Typography>
					</Stack>
				</Stack>

				<Stack className="prop-desc-config" spacing={2}>
					<Stack className="top">
						<Typography className="title">About this product</Typography>
						<Typography className="desc">{product?.listingDesc ?? 'No product description yet.'}</Typography>
					</Stack>
					<Stack className="bottom">
						<Typography className="title">Product details</Typography>
						<Stack spacing={1} sx={{ mt: 1 }}>
							<Typography variant="body2">Price: ${formatterStr(product?.listingPrice)}</Typography>
							<Typography variant="body2">Status: {product?.listingStatus}</Typography>
							<Typography variant="body2">Views: {product?.listingViews ?? 0}</Typography>
							<Typography variant="body2">Comments: {product?.listingComments ?? 0}</Typography>
							<Typography variant="body2">Listed {moment(product?.createdAt).format('YYYY-MM-DD')}</Typography>
						</Stack>
					</Stack>
				</Stack>

				<Stack className="floor-plans-config">
					<Typography className="title">What&apos;s in the box</Typography>
					<Typography className="desc" sx={{ mt: 1, fontSize: 14, color: '#717171' }}>
						Everything ships together so you can open one parcel and start using it right away. Includes the main product,
						care sheet where applicable, and PawPal support details.
					</Typography>
				</Stack>

				<Stack className="address-config">
					<Typography className="title">Shipping & delivery coverage</Typography>
					<Typography className="desc" sx={{ mb: 1, color: '#717171', fontSize: 13 }}>
						Shipping speeds depend on your postcode—confirm options at checkout.
					</Typography>
					<Stack className="map-box" sx={{ minHeight: 200, borderRadius: 2, overflow: 'hidden' }}>
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25867.098915951767!2d128.68632810247993!3d35.86402299180927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660bba427bf179%3A0x1fc02da732b9072f!2sGeumhogangbyeon-ro%2C%20Dong-gu%2C%20Daegu!5e0!3m2!1suz!2skr!4v1695537640704!5m2!1suz!2skr"
							width="100%"
							height="100%"
							style={{ border: 0, minHeight: 200 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Shipping and delivery coverage map"
						/>
					</Stack>
				</Stack>

				{commentTotal !== 0 && (
					<Stack className="reviews-config">
						<Typography sx={{ fontWeight: 600, mb: 1 }}>{commentTotal} shopper reviews</Typography>
						<Stack className="review-list" spacing={1}>
							{productComments?.map((comment: Comment) => (
								<ProductReviewCard comment={comment} key={comment?._id} />
							))}
							<div className="pagination-box">
								<MuiPagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
									onChange={onCommentPageChange}
									shape="circular"
									color="primary"
									size="small"
								/>
							</div>
						</Stack>
					</Stack>
				)}

				<Stack className="leave-review-config">
					<Typography className="main-title">Write a product review</Typography>
					<Typography className="review-title">Your product review</Typography>
					<textarea
						onChange={({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => onCommentTextChange(value)}
						value={insertCommentData.commentContent}
						placeholder="Tell other pet parents what worked well (or what did not)."
					/>
					<div className="submit-btn">
						<Button
							className="submit-review"
							disabled={!insertCommentData.commentContent || !user?._id}
							onClick={onSubmitComment}
						>
							<Typography className="title">Submit product review</Typography>
						</Button>
					</div>
				</Stack>

				{relatedProducts.length > 0 && (
					<Stack className="similar-properties-config" spacing={1}>
						<Typography className="main-title">Related products</Typography>
						<Stack
							direction="row"
							className="cards-box"
							sx={{ overflowX: 'auto', gap: 2, pb: 1, flexWrap: 'nowrap' }}
						>
							{relatedProducts.map((relatedProduct: Product) => (
								<div key={relatedProduct._id} style={{ flex: '0 0 260px', minWidth: 260 }}>
									<RelatedProductCard product={relatedProduct} onLike={onLike} />
								</div>
							))}
						</Stack>
					</Stack>
				)}
			</Stack>
		</div>
	</div>
	);
}

export default ProductDetailMobile;
