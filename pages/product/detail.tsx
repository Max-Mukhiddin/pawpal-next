import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination as MuiPagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import type { Product } from '../../libs/types/products/product';
import { formatterStr } from '../../libs/utils';
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
import { likeToastMessage } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import ProductReviewCard from '../../libs/components/products/ProductReviewCard';
import ProductDetailInquirySidebar from '../../libs/components/products/ProductDetailInquirySidebar';
import PpLoader from '../../libs/components/common/PpLoader';
import { resolveListingImageUrl, resolveMemberImageUrl } from '../../libs/utils/mediaUrl';
import { useFadeUpOnScroll } from '../../libs/hooks/useFadeUpOnScroll';

export const getStaticProps = async ({ locale }: any) => ({
    props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const ProductDetail: NextPage = ({ initialComment }: any) => {
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
        commentGroup: CommentGroup.LISTING,
        commentContent: '',
        commentRefId: '',
    });

    const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
    const [createComment] = useMutation(CREATE_COMMENT);
    const mainRevealRef = useFadeUpOnScroll<HTMLDivElement>();
    const bottomRevealRef = useFadeUpOnScroll<HTMLDivElement>();

    const relatedProductCatalogInquiry = useMemo(
        () => ({ input: { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC', search: { typeList: [ListingType.PRODUCT] } } }),
        [],
    );

    const listingId = useMemo(() => {
        if (!router.isReady) return undefined;
        const raw = router.query.id;
        return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
    }, [router.isReady, router.query.id]);

    const commentsQueryInput = useMemo(
        () => ({ ...commentInquiry, search: { ...commentInquiry.search, commentRefId: listingId && listingId.length === 24 ? listingId : commentInquiry.search.commentRefId } }),
        [commentInquiry, listingId],
    );

    const { loading: productDetailLoading, refetch: getProductRefetch } = useQuery(GET_LISTING, {
        fetchPolicy: 'cache-and-network',
        variables: { input: listingId },
        skip: !listingId || listingId.length !== 24,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getListing) setProduct(data.getListing);
            if (data?.getListing?.listingImages?.length) setSlideImage(data.getListing.listingImages[0]);
        },
    });

    useQuery(GET_LISTINGS, {
        fetchPolicy: 'cache-and-network',
        variables: relatedProductCatalogInquiry,
        skip: !productId && !product,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getListings?.list) setRelatedProducts(data?.getListings?.list);
        },
    });

    const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
        fetchPolicy: 'cache-and-network',
        variables: { input: commentsQueryInput },
        skip: !listingId || listingId.length !== 24,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getComments?.list) setProductComments(data?.getComments?.list);
            setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
        },
    });

    useEffect(() => {
        if (!router.isReady) return;
        const raw = router.query.id;
        const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
        if (!id) return;
        setProductId(id);
        setCommentInquiry((prev) => ({ ...prev, search: { ...prev.search, commentRefId: id } }));
        setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
    }, [router.isReady, router.query.id]);

    useEffect(() => {
        const refId = commentInquiry.search.commentRefId;
        if (refId && refId.length === 24) getCommentsRefetch({ input: commentInquiry });
    }, [commentInquiry]);

    const getListingImg = (p?: string) => resolveListingImageUrl(p, '/img/listing/default-listing.webp');
    const getMemberImg = (p?: string) => resolveMemberImageUrl(p, '/img/profile/defaultUser.svg');
    const heroImage = product?.listingImages?.[0]
        ? resolveListingImageUrl(product.listingImages[0], '/img/listing/minjun_trainer_treats.jpg')
        : '/img/listing/minjun_trainer_treats.jpg';

    // Optimistic like — no page reload
    const likeProductHandler = async (userData: T, id: string) => {
        await withActionGate(`like:listing:${id}`, async () => {
            try {
                if (!id) return;
                if (requireSignIn(router, userData._id, 'like')) return;
                const wasLiked = product?.meLiked?.[0]?.myFavorite;
                setProduct((prev) => prev ? {
                    ...prev,
                    listingLikes: wasLiked ? Math.max(0, (prev.listingLikes ?? 0) - 1) : (prev.listingLikes ?? 0) + 1,
                    meLiked: [{ memberId: userData._id, likeRefId: id, myFavorite: !wasLiked }],
                } : prev);
                await likeTargetListing({ variables: { input: id } });
                await sweetTopSmallSuccessAlert(likeToastMessage(Boolean(wasLiked)), 800);
            } catch (err: any) {
                if (handleSignInRequiredError(err, router, 'like')) return;
                if (await handleLikeMutationAuthError(err, router)) return;
                void getProductRefetch({ input: productId });
                sweetMixinErrorAlert(err.message).then();
            }
        });
    };

    const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
        commentInquiry.page = value;
        setCommentInquiry({ ...commentInquiry });
    };

    const createCommentHandler = async () => {
        try {
            if (requireSignIn(router, user._id, 'comment')) return;
            await createComment({ variables: { input: insertCommentData } });
            setInsertCommentData({ ...insertCommentData, commentContent: '' });
            await getCommentsRefetch({ input: commentInquiry });
        } catch (err: any) {
            await sweetErrorHandling(err, { router, action: 'comment' });
        }
    };

    const isLiked = product?.meLiked?.[0]?.myFavorite;

    if (productDetailLoading && !product) {
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
                <PpLoader size={64} />
            </Stack>
        );
    }

    return (
        <div className="detail-page">

            {/* ── MAIN: left panel | right sidebar ── */}
            <div ref={mainRevealRef} className="detail-page__main">

                {/* LEFT: hero bg + floating card */}
                <div className="detail-page__left-panel">
                    <div className="detail-page__hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} />

                    <div className="detail-card detail-card--main">
                        {/* Product image */}
                        <div className="detail-card__product-image">
                            <img
                                src={getListingImg(slideImage || product?.listingImages?.[0])}
                                alt={product?.listingTitle}
                                onError={(e) => { e.currentTarget.src = '/img/listing/default-listing.webp'; }}
                            />
                        </div>

                        {(product?.listingImages?.length ?? 0) > 1 && (
                            <div className="detail-card__thumbs">
                                {product?.listingImages?.slice(0, 4).map((img) => (
                                    <button key={img} type="button" className={`detail-card__thumb ${slideImage === img ? 'is-active' : ''}`} onClick={() => setSlideImage(img)}>
                                        <img src={getListingImg(img)} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <h1 className="detail-card__title">{product?.listingTitle ?? 'Product'}</h1>
                        <p className="detail-card__price">From ₩{formatterStr(product?.listingPrice)}</p>

                        <div className="detail-card__meta">
                            {product?.listingLocation && <span className="detail-card__location">📍 {product.listingLocation}</span>}
                            <span className="detail-card__stats">
                                <span className="detail-card__stat">
                                    <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 8s4-7 11-7 11 7 11 7-4 7-11 7S1 8 1 8z"/><circle cx="12" cy="8" r="3"/></svg>
                                    {product?.listingViews ?? 0}
                                </span>
                                <button type="button" className="detail-card__like-btn" onClick={() => likeProductHandler(user, product?._id as string)}>
                                    {isLiked ? <FavoriteIcon sx={{ fontSize: 14, color: 'var(--pp-like-red)' }} /> : <FavoriteBorderIcon sx={{ fontSize: 14, color: 'var(--pp-like-red)' }} />}
                                    <span>{product?.listingLikes ?? 0}</span>
                                </button>
                            </span>
                        </div>

                        <div className="detail-card__tabs">
                            <button type="button" className={`detail-card__tab ${activeTab === 'about' ? 'is-active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
                            <button type="button" className={`detail-card__tab ${activeTab === 'details' ? 'is-active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
                        </div>

                        <div className="detail-card__tab-body">
                            {activeTab === 'about' ? (
                                <p>{product?.listingDesc ?? 'No description available.'}</p>
                            ) : (
                                <>
                                    <p><strong>Location:</strong> {product?.listingLocation || '—'}</p>
                                    <p><strong>Status:</strong> {product?.listingStatus || '—'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: sidebar */}
                <div className="detail-page__sidebar">
                    <div className="detail-card detail-card--specialist">
                        <img className="detail-card__avatar" src={getMemberImg(product?.memberData?.memberImage ?? undefined)} alt={product?.memberData?.memberNick ?? 'Specialist'} />
                        <div className="detail-card__specialist-info">
                            <strong>{product?.memberData?.memberNick ?? 'Specialist'}</strong>
                            {product?.memberData?.memberPhone && <p className="detail-card__specialist-phone">{product.memberData.memberPhone}</p>}
                            <Link href={`/specialist/detail?id=${product?.memberData?._id}`} className="detail-card__specialist-link">View Profile →</Link>
                        </div>
                    </div>

                    <div className="detail-card detail-card--inquiry">
                        <ProductDetailInquirySidebar product={product} user={user} />
                    </div>
                </div>

            </div>

            {/* ── BOTTOM ── */}
            <div ref={bottomRevealRef} className="detail-page__bottom">
                <div className="detail-page__container">
                    {commentTotal !== 0 && (
                        <Stack className="detail-reviews">
                            <Typography className="detail-reviews__count">Shopper Reviews</Typography>
                            <Stack className="detail-reviews__list">
                                {productComments?.map((comment: Comment) => (
                                    <ProductReviewCard comment={comment} key={comment?._id} />
                                ))}
                                <Box component="div" className="detail-reviews__pagination">
                                    <MuiPagination className="pp-pagination" page={commentInquiry.page} count={Math.ceil(commentTotal / commentInquiry.limit)} onChange={commentPaginationChangeHandler} shape="circular" color="primary" />
                                </Box>
                            </Stack>
                        </Stack>
                    )}

                    <Stack className="detail-leave-review">
                        <Typography className="detail-leave-review__title">Write a Review</Typography>
                        <textarea className="detail-leave-review__textarea" placeholder="Tell other pet parents what worked well (or what did not)." onChange={({ target: { value } }: any) => setInsertCommentData({ ...insertCommentData, commentContent: value })} value={insertCommentData.commentContent} />
                        <Button className="detail-leave-review__btn" disabled={!insertCommentData.commentContent || !user?._id} onClick={createCommentHandler}>Submit Review</Button>
                    </Stack>

                    {relatedProducts.length !== 0 && (
                        <section className="detail-related">
                            <h3 className="detail-related__title">You Might Also Like</h3>
                            <div className="detail-related__grid">
                                {relatedProducts.filter((item) => item._id !== product?._id).slice(0, 4).map((p) => (
                                    <Link href={`/product/detail?id=${p._id}`} className="detail-related__card" key={p._id}>
                                        <img src={getListingImg(p.listingImages?.[0])} alt={p.listingTitle} />
                                        <div className="detail-related__overlay"><strong>{p.listingTitle}</strong></div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

        </div>
    );
};

ProductDetail.defaultProps = {
    initialComment: { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: { commentRefId: '' } },
};

export default withLayoutFull(ProductDetail);