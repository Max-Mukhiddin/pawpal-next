import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Service } from '../../libs/types/services/service';
import { formatterStr } from '../../libs/utils';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_COMMENTS, GET_LISTING, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { ListingType } from '../../libs/enums/listing.enum';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { likeToastMessage } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import ServiceReviewCard from '../../libs/components/services/ServiceReviewCard';
import ServiceDetailBookingSection from '../../libs/components/services/ServiceDetailBookingSection';
import { resolveListingImageUrl, resolveMemberImageUrl } from '../../libs/utils/mediaUrl';
import PpLoader from '../../libs/components/common/PpLoader';
import { useFadeUpOnScroll } from '../../libs/hooks/useFadeUpOnScroll';

export const getStaticProps = async ({ locale }: any) => ({
    props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const ServiceDetail: NextPage = ({ initialComment }: any) => {
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'details'>('about');
    const [relatedServices, setRelatedServices] = useState<Service[]>([]);
    const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
    const [serviceComments, setServiceComments] = useState<Comment[]>([]);
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

    const relatedServiceCatalogInquiry = useMemo(
        () => ({ page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: { typeList: [ListingType.SERVICE] } }),
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

    const { loading: serviceDetailLoading, refetch: getServiceRefetch } = useQuery(GET_LISTING, {
        fetchPolicy: 'cache-and-network',
        variables: { input: listingId },
        skip: !listingId || listingId.length !== 24,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getListing) setService(data.getListing);
        },
    });

    useQuery(GET_LISTINGS, {
        fetchPolicy: 'cache-and-network',
        variables: { input: relatedServiceCatalogInquiry },
        skip: !serviceId && !service,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getListings?.list) setRelatedServices(data?.getListings?.list);
        },
    });

    const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
        fetchPolicy: 'cache-and-network',
        variables: { input: commentsQueryInput },
        skip: !listingId || listingId.length !== 24,
        notifyOnNetworkStatusChange: false,
        onCompleted: (data: T) => {
            if (data?.getComments?.list) setServiceComments(data?.getComments?.list);
            setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
        },
    });

    useEffect(() => {
        if (!router.isReady) return;
        const raw = router.query.id;
        const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
        if (!id) return;
        setServiceId(id);
        setCommentInquiry((prev) => ({ ...prev, search: { ...prev.search, commentRefId: id } }));
        setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
    }, [router.isReady, router.query.id]);

    useEffect(() => {
        const refId = commentInquiry.search.commentRefId;
        if (refId && refId.length === 24) getCommentsRefetch({ input: commentInquiry });
    }, [commentInquiry]);

    const getListingImg = (p?: string) => resolveListingImageUrl(p, '/img/listing/default-listing.webp');
    const getMemberImg = (p?: string) => resolveMemberImageUrl(p, '/img/profile/defaultUser.svg');
    const heroImage = service?.listingImages?.[0]
        ? resolveListingImageUrl(service.listingImages[0], '/img/banner/services.webp')
        : '/img/banner/services.webp';

    // Optimistic like — no page reload
    const likeServiceHandler = async (user: T, id: string) => {
        await withActionGate(`like:listing:${id}`, async () => {
            try {
                if (!id) return;
                if (requireSignIn(router, user._id, 'like')) return;
                const wasLiked = service?.meLiked?.[0]?.myFavorite;
                setService((prev) => prev ? {
                    ...prev,
                    listingLikes: wasLiked ? Math.max(0, (prev.listingLikes ?? 0) - 1) : (prev.listingLikes ?? 0) + 1,
                    meLiked: [{ memberId: user._id, likeRefId: id, myFavorite: !wasLiked }],
                } : prev);
                await likeTargetListing({ variables: { input: id } });
                await sweetTopSmallSuccessAlert(likeToastMessage(Boolean(wasLiked)), 800);
            } catch (err: any) {
                if (handleSignInRequiredError(err, router, 'like')) return;
                if (await handleLikeMutationAuthError(err, router)) return;
                void getServiceRefetch({ input: serviceId });
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

    const isLiked = service?.meLiked?.[0]?.myFavorite;

    if (serviceDetailLoading && !service) {
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
                <PpLoader size={64} />
            </Stack>
        );
    }

    return (
        <div className="detail-page">

            {/* ── MAIN: left hero panel | right sidebar ── */}
            <div ref={mainRevealRef} className="detail-page__main">

                {/* LEFT: hero background + floating card */}
                <div className="detail-page__left-panel">
                    <div className="detail-page__hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} />

                    <div className="detail-card detail-card--main">
                        <p className="detail-card__label">PawPal Service</p>
                        <h1 className="detail-card__title">{service?.listingTitle ?? 'Service'}</h1>
                        <p className="detail-card__price">From ₩{formatterStr(service?.listingPrice)}</p>

                        <div className="detail-card__meta">
                            {service?.durationMinutes && (
                                <span className="detail-card__meta-item">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    {service.durationMinutes} min
                                </span>
                            )}
                            {service?.listingLocation && (
                                <span className="detail-card__location">📍 {service.listingLocation}</span>
                            )}
                            <span className="detail-card__stats">
                                <span className="detail-card__stat">
                                    <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 8s4-7 11-7 11 7 11 7-4 7-11 7S1 8 1 8z"/><circle cx="12" cy="8" r="3"/></svg>
                                    {service?.listingViews ?? 0}
                                </span>
                                <button type="button" className="detail-card__like-btn" onClick={() => likeServiceHandler(user, service?._id as string)}>
                                    {isLiked ? <FavoriteIcon sx={{ fontSize: 14, color: 'var(--pp-like-red)' }} /> : <FavoriteBorderIcon sx={{ fontSize: 14, color: 'var(--pp-like-red)' }} />}
                                    <span>{service?.listingLikes ?? 0}</span>
                                </button>
                            </span>
                        </div>

                        <div className="detail-card__tabs">
                            <button type="button" className={`detail-card__tab ${activeTab === 'about' ? 'is-active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
                            <button type="button" className={`detail-card__tab ${activeTab === 'details' ? 'is-active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
                        </div>

                        <div className="detail-card__tab-body">
                            {activeTab === 'about' ? (
                                <p>{service?.listingDesc ?? 'No description available.'}</p>
                            ) : (
                                <>
                                    <p><strong>Location:</strong> {service?.listingLocation || '—'}</p>
                                    <p><strong>Duration:</strong> {service?.durationMinutes ? `${service.durationMinutes} min` : '—'}</p>
                                    <p><strong>Status:</strong> {service?.listingStatus || '—'}</p>
                                </>
                            )}
                        </div>

                        {(service?.listingImages?.length ?? 0) > 1 && (
                            <section className="detail-card__gallery" aria-label="Service gallery">
                                <h3 className="detail-card__gallery-title">Tools &amp; products we use</h3>
                                <div className="detail-card__gallery-grid">
                                    {service?.listingImages?.slice(1).map((img, index) => (
                                        <figure key={`${img}-${index}`} className="detail-card__gallery-item">
                                            <img
                                                src={getListingImg(img)}
                                                alt=""
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/img/banner/services.webp';
                                                }}
                                            />
                                        </figure>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* RIGHT: sidebar */}
                <div className="detail-page__sidebar">
                    {/* Specialist — horizontal */}
                    <div className="detail-card detail-card--specialist">
                        <img className="detail-card__avatar" src={getMemberImg(service?.memberData?.memberImage ?? undefined)} alt={service?.memberData?.memberNick ?? 'Specialist'} />
                        <div className="detail-card__specialist-info">
                            <strong>{service?.memberData?.memberNick ?? 'Specialist'}</strong>
                            {service?.memberData?.memberPhone && <p className="detail-card__specialist-phone">{service.memberData.memberPhone}</p>}
                            <Link href={`/specialist/detail?id=${service?.memberData?._id}`} className="detail-card__specialist-link">View Profile →</Link>
                        </div>
                    </div>

                    {/* Booking form */}
                    <div className="detail-card detail-card--booking">
                        <ServiceDetailBookingSection service={service} user={user} />
                    </div>
                </div>

            </div>

            {/* ── BOTTOM: reviews + leave review + related ── */}
            <div ref={bottomRevealRef} className="detail-page__bottom">
                <div className="detail-page__container">
                    {commentTotal !== 0 && (
                        <Stack className="detail-reviews">
                            <Typography className="detail-reviews__count">Client Experiences</Typography>
                            <Stack className="detail-reviews__list">
                                {serviceComments?.map((comment: Comment) => (
                                    <ServiceReviewCard comment={comment} key={comment?._id} />
                                ))}
                                <Box component="div" className="detail-reviews__pagination">
                                    <MuiPagination className="pp-pagination" page={commentInquiry.page} count={Math.ceil(commentTotal / commentInquiry.limit)} onChange={commentPaginationChangeHandler} shape="circular" color="primary" />
                                </Box>
                            </Stack>
                        </Stack>
                    )}

                    <Stack className="detail-leave-review">
                        <Typography className="detail-leave-review__title">Share Your Experience</Typography>
                        <textarea className="detail-leave-review__textarea" placeholder="Tell us about your experience…" onChange={({ target: { value } }: any) => setInsertCommentData({ ...insertCommentData, commentContent: value })} value={insertCommentData.commentContent} />
                        <Button className="detail-leave-review__btn" disabled={!insertCommentData.commentContent || !user?._id} onClick={createCommentHandler}>Submit Review</Button>
                    </Stack>

                    {relatedServices.length !== 0 && (
                        <section className="detail-related">
                            <h3 className="detail-related__title">You Might Also Like</h3>
                            <div className="detail-related__grid">
                                {relatedServices.filter((item) => item._id !== service?._id).slice(0, 4).map((s) => (
                                    <Link href={`/service/detail?id=${s._id}`} className="detail-related__card" key={s._id}>
                                        <img src={getListingImg(s.listingImages?.[0])} alt={s.listingTitle} />
                                        <div className="detail-related__overlay"><strong>{s.listingTitle}</strong></div>
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

ServiceDetail.defaultProps = {
    initialComment: { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: { commentRefId: '' } },
};

export default withLayoutFull(ServiceDetail);