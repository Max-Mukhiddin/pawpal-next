import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination as MuiPagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import type { Product } from '../../libs/types/products/product';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { GET_COMMENTS, GET_LISTING, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { ListingType } from '../../libs/enums/listing.enum';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ProductReviewCard from '../../libs/components/products/ProductReviewCard';
import ProductDetailInquirySidebar from '../../libs/components/products/ProductDetailInquirySidebar';
import ProductDetailMobile from '../../libs/components/products/ProductDetailMobile';

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
	const [activeTab, setActiveTab] = useState<'about' | 'details'>('about');
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
		() => ({
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: 'DESC',
				search: { typeList: [ListingType.PRODUCT] },
			},
		}),
		[],
	);

	const listingId = useMemo(() => {
		if (!router.isReady) return undefined;
		const raw = router.query.id;
		return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
	}, [router.isReady, router.query.id]);

	const commentsQueryInput = useMemo(
		() => ({
			...commentInquiry,
			search: {
				...commentInquiry.search,
				commentRefId: listingId && listingId.length === 24 ? listingId : commentInquiry.search.commentRefId,
			},
		}),
		[commentInquiry, listingId],
	);

	const { loading: productDetailLoading, refetch: getProductRefetch } = useQuery(GET_LISTING, {
		fetchPolicy: 'network-only',
		variables: { input: listingId },
		skip: !listingId || listingId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListing) setProduct(data.getListing);
			if (data?.getListing?.listingImages?.length) setSlideImage(data.getListing.listingImages[0]);
		},
	});

	const { refetch: getProductsCatalogRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-and-network',
		variables: relatedProductCatalogInquiry,
		skip: !productId && !product,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListings?.list) setRelatedProducts(data?.getListings?.list);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentsQueryInput },
		skip: !listingId || listingId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setProductComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
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
		const refId = commentInquiry.search.commentRefId;
		if (refId && refId.length === 24) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => setSlideImage(image);
	const getImg = (p?: string) => (p ? `${REACT_APP_API_URL}/${p}` : '/images/placeholder-pet.jpg');

	const likeProductHandler = async (userData: T, id: string) => {
		try {
			if (!id) return;
			if (!userData._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({ variables: { input: id } });
			await getProductRefetch({ input: productId });
			await getProductsCatalogRefetch(relatedProductCatalogInquiry);
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
		<div className="product-detail-revamp">
			<section className="product-detail-revamp__hero">
				<div className="product-detail-revamp__hero-inner">
					<h1>{product?.listingTitle}</h1>
					<p>{`Home / Products / ${product?.listingTitle ?? ''}`}</p>
				</div>
			</section>

			<div className="product-detail-revamp__container">
				<div className="product-detail-revamp__grid">
					<div className="product-detail-revamp__left">
						<div className="media-card">
							<img src={getImg(slideImage || product?.listingImages?.[0])} alt="" className="main-image" />
							{(product?.listingImages?.length ?? 0) > 1 && (
								<div className="thumb-row">
									{product?.listingImages?.slice(0, 3).map((img) => (
										<button
											key={img}
											type="button"
											className={slideImage === img ? 'thumb is-active' : 'thumb'}
											onClick={() => changeImageHandler(img)}
										>
											<img src={getImg(img)} alt="" />
										</button>
									))}
								</div>
							)}
						</div>

						<div className="tabs-card">
							<div className="tabs">
								<button type="button" className={activeTab === 'about' ? 'is-active' : ''} onClick={() => setActiveTab('about')}>
									About
								</button>
								<button
									type="button"
									className={activeTab === 'details' ? 'is-active' : ''}
									onClick={() => setActiveTab('details')}
								>
									Details
								</button>
							</div>
							{activeTab === 'about' ? (
								<p className="tab-copy">{product?.listingDesc ?? 'No product description yet.'}</p>
							) : (
								<div className="tab-details">
									<p>
										<strong>Location:</strong> {product?.listingLocation || '-'}
									</p>
									<p>
										<strong>Status:</strong> {product?.listingStatus || '-'}
									</p>
									<p>
										<strong>Views:</strong> {product?.listingViews ?? 0}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="product-detail-revamp__right">
						<div className="summary-card">
							<h2>{product?.listingTitle}</h2>
							<p className="price">From ${formatterStr(product?.listingPrice)}</p>
							{product?.listingLocation ? <span className="location-badge">📍 {product.listingLocation}</span> : null}
							<div className="stats">
								<span>👁 {product?.listingViews ?? 0}</span>
								<button type="button" onClick={() => likeProductHandler(user, product?._id as string)} aria-label="Like product">
									{product?.meLiked && product?.meLiked[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
								</button>
								<span>{product?.listingLikes ?? 0}</span>
							</div>
						</div>

						<div className="specialist-card">
							<img src={getImg(product?.memberData?.memberImage ?? undefined)} alt="" />
							<div>
								<strong>{product?.memberData?.memberNick || 'Specialist'}</strong>
								<Link href={`/specialist/detail?id=${product?.memberData?._id}`}>View Profile →</Link>
							</div>
						</div>

						<div className="inquiry-card">
							<ProductDetailInquirySidebar product={product} user={user} />
						</div>
					</div>
				</div>

				{commentTotal !== 0 && (
					<Stack className={'reviews-config'}>
						<Stack className={'filter-box'}>
							<Stack className={'review-cnt'}>
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

				{relatedProducts.length !== 0 && (
					<section className="related-section">
						<h3>You Might Also Like</h3>
						<div className="related-grid">
							{relatedProducts
								.filter((item) => item._id !== product?._id)
								.slice(0, 4)
								.map((relatedProduct: Product) => (
									<Link href={`/product/detail?id=${relatedProduct._id}`} className="related-card" key={relatedProduct._id}>
										<img src={getImg(relatedProduct.listingImages?.[0])} alt="" />
										<div className="overlay">
											<strong>{relatedProduct.listingTitle}</strong>
										</div>
									</Link>
								))}
						</div>
					</section>
				)}
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
