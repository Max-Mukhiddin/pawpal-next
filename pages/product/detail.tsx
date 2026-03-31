import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Product } from '../../libs/types/products/product';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_LISTING, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { ListingType } from '../../libs/enums/listing.enum';
import { relatedListingInquiryInput } from '../../libs/utils/catalogListingInquiry';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import RelatedProductCard from '../../libs/components/products/RelatedProductCard';
import ProductReviewCard from '../../libs/components/products/ProductReviewCard';
import ProductDetailInquirySidebar from '../../libs/components/products/ProductDetailInquirySidebar';
import ProductDetailMobile from '../../libs/components/products/ProductDetailMobile';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductDetail: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [productId, setProductId] = useState<string | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [productComments, setProductComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
	const [createComment] = useMutation(CREATE_COMMENT);

	const relatedProductCatalogInquiry = useMemo(
		() => relatedListingInquiryInput(ListingType.PRODUCT, product?.listingLocation),
		[product?.listingLocation],
	);

	const {
		loading: productDetailLoading,
		refetch: getProductRefetch,
	} = useQuery(GET_LISTING, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !router.isReady || !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListing) setProduct(data.getListing);
			if (data?.getListing?.listingImages?.length) setSlideImage(data.getListing.listingImages[0]);
		},
	});

	const { refetch: getProductsCatalogRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: relatedProductCatalogInquiry },
		skip: !productId && !product,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListings?.list) setRelatedProducts(data?.getListings?.list);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialComment },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setProductComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES — sync route id once router is ready (avoids pre-hydration / stale query churn). */
	useEffect(() => {
		if (!router.isReady) return;
		const raw = router.query.id;
		const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
		if (!id) return;

		setProductId(id);
		setCommentInquiry((prev) => ({
			...prev,
			search: { ...prev.search, commentRefId: id },
		}));
		setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
	}, [router.isReady, router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({
				variables: { input: id },
			});
			await getProductRefetch({ input: productId });
			await getProductsCatalogRefetch({
				input: relatedProductCatalogInquiry,
			});
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (productDetailLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return (
			<>
				<ProductDetailMobile
					product={product}
					user={user}
					slideImage={slideImage}
					onSlideImageChange={changeImageHandler}
					onLike={likeProductHandler}
					relatedProducts={relatedProducts}
					productComments={productComments}
					commentTotal={commentTotal}
					commentInquiry={commentInquiry}
					onCommentPageChange={commentPaginationChangeHandler}
					insertCommentData={insertCommentData}
					onCommentTextChange={(value) => setInsertCommentData((prev) => ({ ...prev, commentContent: value }))}
					onSubmitComment={createCommentHandler}
				/>
				<div className="container" style={{ paddingLeft: 8, paddingRight: 8, paddingBottom: 32 }}>
					<ProductDetailInquirySidebar product={product} user={user} />
				</div>
			</>
		);
	}

	return (
			<div id={'listing-detail-page'}>
				<div className={'container'}>
					<Stack className={'listing-detail-config'}>
						<Stack className={'listing-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{product?.listingTitle}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>Category · {product?.listingLocation}</Typography>
										<Stack className={'divider'}></Stack>
										<Stack className={'buy-rent-box'}>
											<Stack className={'circle'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
													<circle cx="3" cy="3" r="3" fill="#EB6753" />
												</svg>
											</Stack>
											<Typography className={'buy-rent'}>{product?.listingType}</Typography>
										</Stack>
										<Stack className={'divider'}></Stack>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
											<g clipPath="url(#clip0_product_time)">
												<path
													d="M7 14C5.61553 14 4.26216 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303297 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303297 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26216 14 5.61553 14 7Z"
													fill="#181A20"
												/>
											</g>
											<defs>
												<clipPath id="clip0_product_time">
													<rect width="14" height="14" fill="white" />
												</clipPath>
											</defs>
										</svg>
										<Typography className={'date'}>Added to catalog {moment().diff(product?.createdAt, 'days')} days ago</Typography>
									</Stack>
									<Stack className={'bottom-box'}>
										<Stack className="option">
											<Typography variant="body2">Views {product?.listingViews ?? 0}</Typography>
										</Stack>
										<Stack className="option">
											<Typography variant="body2">Comments {product?.listingComments ?? 0}</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{product?.listingViews}</Typography>
										</Stack>
										<Stack className="button-box">
											{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													fontSize={'medium'}
													onClick={() => likeProductHandler(user, product?._id as string)}
												/>
											) : (
												<FavoriteBorderIcon fontSize={'medium'} onClick={() => likeProductHandler(user, product?._id as string)} />
											)}
											<Typography>{product?.listingLikes}</Typography>
										</Stack>
									</Stack>
									<Typography>${formatterStr(product?.listingPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/listing/bigImage.png'}
										alt={'product-main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{product?.listingImages?.map((subImg: string) => {
										const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
										return (
											<Stack className={'sub-img-box'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={imagePath} alt={'product-gallery-thumb'} />
											</Stack>
										);
									})}
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'listing-desc-config'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Price</Typography>
											<Typography className={'option-data'}>${formatterStr(product?.listingPrice)}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Rank</Typography>
											<Typography className={'option-data'}>{product?.listingRank ?? 0}</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>About this product</Typography>
										<Typography className={'desc'}>{product?.listingDesc ?? 'No product description yet.'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Product details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${formatterStr(product?.listingPrice)}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Type</Typography>
													<Typography className={'data'}>{product?.listingType}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Status</Typography>
													<Typography className={'data'}>{product?.listingStatus}</Typography>
												</Box>
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Listed</Typography>
													<Typography className={'data'}>{moment(product?.createdAt).format('YYYY-MM-DD')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Views</Typography>
													<Typography className={'data'}>{product?.listingViews ?? 0}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Comments</Typography>
													<Typography className={'data'}>{product?.listingComments ?? 0}</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'floor-plans-config'}>
									<Typography className={'title'}>What&apos;s in the box</Typography>
									<Stack className={'image-box'} sx={{ p: 3, alignItems: 'flex-start' }}>
										<Typography className={'desc'} sx={{ mb: 1.5 }}>
											Everything ships together so you can open one parcel and start using it right away.
										</Typography>
										<Typography className={'desc'} sx={{ mb: 1 }}>
											• Main product unit(s) matching the pack size above
										</Typography>
										<Typography className={'desc'} sx={{ mb: 1 }}>
											• Quick-start care sheet and ingredient or materials card where applicable
										</Typography>
										<Typography className={'desc'}>
											• PawPal support QR for returns, exchanges, or vet-adjacent questions
										</Typography>
									</Stack>
								</Stack>
								<Stack className={'address-config'}>
									<Typography className={'title'}>Shipping & delivery coverage</Typography>
									<Typography className={'desc'} sx={{ mb: 2, color: '#717171', fontSize: 14 }}>
										Shipping speeds and pickup partners depend on your postcode. This map shows our wider fulfillment
										network—always confirm delivery options at checkout.
									</Typography>
									<Stack className={'map-box'}>
										<iframe
											src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25867.098915951767!2d128.68632810247993!3d35.86402299180927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660bba427bf179%3A0x1fc02da732b9072f!2sGeumhogangbyeon-ro%2C%20Dong-gu%2C%20Daegu!5e0!3m2!1suz!2skr!4v1695537640704!5m2!1suz!2skr"
											width="100%"
											height="100%"
											style={{ border: 0 }}
											allowFullScreen={true}
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
											title="Shipping and delivery coverage map"
										></iframe>
									</Stack>
								</Stack>
								{commentTotal !== 0 && (
									<Stack className={'reviews-config'}>
										<Stack className={'filter-box'}>
											<Stack className={'review-cnt'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
													<g clipPath="url(#clip0_product_reviews)">
														<path
															d="M15.7183 4.60288C15.6171 4.3599 15.3413 4.18787 15.0162 4.16489L10.5822 3.8504L8.82988 0.64527C8.7005 0.409792 8.40612 0.257812 8.07846 0.257812C7.7508 0.257812 7.4563 0.409792 7.32774 0.64527L5.57541 3.8504L1.14072 4.16489C0.815641 4.18832 0.540363 4.36035 0.438643 4.60288C0.337508 4.84586 0.430908 5.11238 0.676772 5.28084L4.02851 7.57692L3.04025 10.9774C2.96794 11.2275 3.09216 11.486 3.35771 11.636C3.50045 11.717 3.66815 11.7575 3.83643 11.7575C3.98105 11.7575 4.12577 11.7274 4.25503 11.667L8.07846 9.88098L11.9012 11.667C12.1816 11.7979 12.5342 11.7859 12.7992 11.636C13.0648 11.486 13.189 11.2275 13.1167 10.9774L12.1284 7.57692L15.4801 5.28084C15.7259 5.11238 15.8194 4.84641 15.7183 4.60288Z"
															fill="#181A20"
														/>
													</g>
													<defs>
														<clipPath id="clip0_product_reviews">
															<rect width="15.36" height="12" fill="white" transform="translate(0.398438)" />
														</clipPath>
													</defs>
												</svg>
												<Typography className={'reviews'}>{commentTotal} shopper reviews for this product</Typography>
											</Stack>
										</Stack>
										<Stack className={'review-list'}>
											{productComments?.map((comment: Comment) => {
												return <ProductReviewCard comment={comment} key={comment?._id} />;
											})}
											<Box component={'div'} className={'pagination-box'}>
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
													color="primary"
												/>
											</Box>
										</Stack>
									</Stack>
								)}
								<Stack className={'leave-review-config'}>
									<Typography className={'main-title'}>Write a product review</Typography>
									<Typography className={'review-title'}>Your product review</Typography>
									<textarea
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
										placeholder={'Tell other pet parents what worked well (or what did not).'}
									></textarea>
									<Box className={'submit-btn'} component={'div'}>
										<Button
											className={'submit-review'}
											disabled={insertCommentData.commentContent === '' || user?._id === ''}
											onClick={createCommentHandler}
										>
											<Typography className={'title'}>Submit product review</Typography>
										</Button>
									</Box>
								</Stack>
							</Stack>
							<ProductDetailInquirySidebar product={product} user={user} />
						</Stack>
						{relatedProducts.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Related products</Typography>
										<Typography className={'sub-title'}>You may also like — from the same PawPal catalog category.</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'similar-homes-swiper'}
										slidesPerView={'auto'}
										spaceBetween={35}
										modules={[Autoplay, Navigation, Pagination]}
										navigation={{
											nextEl: '.swiper-similar-next',
											prevEl: '.swiper-similar-prev',
										}}
										pagination={{
											el: '.swiper-similar-pagination',
										}}
									>
										{relatedProducts.map((relatedProduct: Product) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={relatedProduct._id}>
													<RelatedProductCard product={relatedProduct} onLike={likeProductHandler} />
												</SwiperSlide>
											);
										})}
									</Swiper>
								</Stack>
							</Stack>
						)}
					</Stack>
				</div>
			</div>
	);
};

ProductDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(ProductDetail);
