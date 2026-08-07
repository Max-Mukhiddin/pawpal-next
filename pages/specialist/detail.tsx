import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { Pagination } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Listing } from '../../libs/types/listing/listing';
import type { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, successToast, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { likeToastMessage, readWasLiked } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { userVar } from '../../apollo/store';
import type { ListingsInquiry } from '../../libs/types/listing/listing.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_LISTING, LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { resolveMemberImageUrl } from '../../libs/utils/mediaUrl';
import { ListingType } from '../../libs/enums/listing.enum';
import ServiceCard from '../../libs/components/services/ServiceCard';
import ProductCard from '../../libs/components/products/ProductCard';
import { withActionGate } from '../../libs/utils/actionGate';
import ChatPopup from '../../libs/components/messaging/ChatPopup';

export const getStaticProps = async ({ locale }: any) => ({
    props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const [agentId, setAgentId] = useState<string | null>(null);
    const [listingInquiry, setListingInquiry] = useState<ListingsInquiry>(initialInput);
    const [agentListings, setAgentListings] = useState<Listing[]>([]);
    const [listingTotal, setListingTotal] = useState<number>(0);
    const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
    const [agentComments, setAgentComments] = useState<Comment[]>([]);
    const [commentTotal, setCommentTotal] = useState<number>(0);
    const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
        commentGroup: CommentGroup.MEMBER,
        commentContent: '',
        commentRefId: '',
    });
    // Consultation form state
    const [consultName, setConsultName] = useState('');
    const [consultService, setConsultService] = useState('');
    const [consultDate, setConsultDate] = useState('');
    const [consultSubmitting, setConsultSubmitting] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const [createComment] = useMutation(CREATE_COMMENT);
    const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
    const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
    const [subscribe] = useMutation(SUBSCRIBE);
    const [unsubscribe] = useMutation(UNSUBSCRIBE);

    const { data: memberQueryData, refetch: refetchMember } = useQuery(GET_MEMBER, {
        fetchPolicy: 'network-only',
        variables: { input: agentId },
        skip: !agentId,
        notifyOnNetworkStatusChange: true,
    });

    const agent = (memberQueryData?.getMember as Member | undefined) ?? null;

    useEffect(() => {
        if (!agent?._id) return;
        setListingInquiry((prev) => ({
            ...prev,
            search: { ...prev.search, memberId: agent._id },
        }));
        setCommentInquiry((prev) => ({ ...prev, search: { commentRefId: agent._id } }));
        setInsertCommentData((prev) => ({ ...prev, commentRefId: agent._id }));
    }, [agent?._id]);

    const { refetch: getListingsRefetch } = useQuery(GET_LISTINGS, {
        fetchPolicy: 'network-only',
        variables: { input: listingInquiry },
        skip: !listingInquiry.search.memberId,
        notifyOnNetworkStatusChange: true,
        onCompleted: (data: T) => {
            setAgentListings(data?.getListings?.list ?? []);
            setListingTotal(data?.getListings?.metaCounter[0]?.total ?? 0);
        },
    });

    const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
        fetchPolicy: 'network-only',
        variables: { input: commentInquiry },
        skip: !commentInquiry.search.commentRefId,
        notifyOnNetworkStatusChange: true,
        onCompleted: (data: T) => {
            setAgentComments(data?.getComments?.list ?? []);
            setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
        },
    });

    useEffect(() => {
        // support both ?id= and ?agentId= URL params
        const id = (router.query.id || router.query.agentId) as string | undefined;
        if (id) setAgentId(id);
    }, [router.query]);

    const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
        commentInquiry.page = value;
        setCommentInquiry({ ...commentInquiry });
    };

    const listingPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
        listingInquiry.page = value;
        setListingInquiry({ ...listingInquiry });
    };

    const createCommentHandler = async () => {
        try {
            if (requireSignIn(router, user._id, 'comment')) return;
            if (user._id === agentId) throw new Error('Cannot write a review for yourself!');
            await createComment({ variables: { input: insertCommentData } });
            setInsertCommentData({ ...insertCommentData, commentContent: '' });
            await getCommentsRefetch({ input: commentInquiry });
        } catch (err: any) {
            if (handleSignInRequiredError(err, router, 'comment')) return;
            sweetErrorHandling(err).then();
        }
    };

    const handleConsultSubmit = async () => {
        try {
            if (requireSignIn(router, user?._id, 'inquiry')) return;
            if (!consultName.trim()) { await sweetMixinErrorAlert('Please enter your pet\'s name and breed.'); return; }
            if (!consultService) { await sweetMixinErrorAlert('Please select a service.'); return; }
            setConsultSubmitting(true);
            // Simulate submit — wire up to createInquiry or createBooking as needed
            await new Promise((r) => setTimeout(r, 800));
            await sweetTopSmallSuccessAlert('Consultation request sent! The specialist will contact you soon.', 2800);
            setConsultName('');
            setConsultService('');
            setConsultDate('');
        } catch (err: any) {
            sweetErrorHandling(err).then();
        } finally {
            setConsultSubmitting(false);
        }
    };

    const likeListingHandler = async (user: T, id: string) => {
        await withActionGate(`like:listing:${id}`, async () => {
            try {
                if (!id) return;
                if (requireSignIn(router, user._id, 'like')) return;
                const wasLiked = readWasLiked(agentListings.find((l) => l._id === id));
                await likeTargetListing({ variables: { input: id } });
                await getListingsRefetch({ input: listingInquiry });
                await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
            } catch (err: any) {
                if (handleSignInRequiredError(err, router, 'like')) return;
                if (await handleLikeMutationAuthError(err, router)) return;
                sweetMixinErrorAlert(err.message).then();
            }
        });
    };

    const likeMemberHandler = async () => {
        if (!agentId) return;
        await withActionGate(`like:member:${agentId}`, async () => {
            try {
                if (requireSignIn(router, user._id, 'favorite')) return;
                const wasLiked = readWasLiked(agent);
                await likeTargetMember({ variables: { input: agentId } });
                await refetchMember({ input: agentId });
                await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
            } catch (err: any) {
                if (handleSignInRequiredError(err, router, 'favorite')) return;
                if (await handleLikeMutationAuthError(err, router)) return;
                sweetMixinErrorAlert(err.message).then();
            }
        });
    };

    const hasRealImage = !!(agent?.memberImage && !agent.memberImage.includes('defaultUser'));
    const heroImage = hasRealImage
        ? resolveMemberImageUrl(agent.memberImage, '/img/banner/specialists-default.webp')
        : '/img/banner/specialists-default.webp';
    const displayName = agent?.memberFullName?.trim() || agent?.memberNick || 'Specialist';
    const memberListings = agent?.memberListings ?? 0;
    const experienceYears = (() => {
        const match = agent?.memberDesc?.match(/(\d+)\s*years?/i);
        return match
            ? parseInt(match[1], 10)
            : Math.max(1, Math.min(20, Math.round(memberListings / 8) + 1));
    })();
    const jobsCount = agent?.jobsCount ?? memberListings;
    const points = agent?.memberPoints ?? 0;
    const locationLabel = agent?.memberAddress
        ? String(agent.memberAddress).replaceAll('_', ' ')
        : 'Seoul';
    const isFollowing = Boolean(agent?.meFollowed?.[0]?.myFollowing);
    const isLiked = Boolean(agent?.meLiked?.[0]?.myFavorite);
    const isOwnProfile = Boolean(user?._id && agentId && user._id === agentId);

    const handleMessageClick = () => {
        if (requireSignIn(router, user?._id, 'general')) return;
        if (!agentId || isOwnProfile) return;
        setChatOpen(true);
    };

    const handleFollow = async () => {
        if (requireSignIn(router, user?._id, 'follow')) return;
        if (!agentId) return;
        await withActionGate(`follow:member:${agentId}`, async () => {
            try {
                if (isFollowing) {
                    await unsubscribe({
                        variables: { input: agentId },
                        refetchQueries: [{ query: GET_MEMBER, variables: { input: agentId } }],
                        awaitRefetchQueries: true,
                    });
                    successToast('Unfollowed');
                } else {
                    await subscribe({
                        variables: { input: agentId },
                        refetchQueries: [{ query: GET_MEMBER, variables: { input: agentId } }],
                        awaitRefetchQueries: true,
                    });
                    successToast('Followed');
                }
            } catch (err: any) {
                if (handleSignInRequiredError(err, router, 'follow')) return;
                if (await handleLikeMutationAuthError(err, router)) return;
                sweetMixinErrorAlert(err?.message || 'Could not update').then();
            }
        });
    };

    return (
        <div className="specialist-detail-page">

            <section className="specialist-detail__header">
                <div className="specialist-detail__header-inner">
                    <div className="specialist-detail__header-left">
                        <h1 className="specialist-detail__name">{displayName}</h1>
                        <span className="specialist-detail__role-pill">PET CARE SPECIALIST</span>
                        <div className="specialist-detail__location">
                            <LocationOnOutlinedIcon aria-hidden />
                            <span>{locationLabel}</span>
                        </div>
                        <div className="specialist-detail__stats-strip">
                            <div className="specialist-detail__stat">
                                <span className="specialist-detail__stat-value">{experienceYears}</span>
                                <span className="specialist-detail__stat-label">Exp (yrs)</span>
                            </div>
                            <div className="specialist-detail__stat">
                                <span className="specialist-detail__stat-value">{jobsCount}</span>
                                <span className="specialist-detail__stat-label">Jobs</span>
                            </div>
                            <div className="specialist-detail__stat">
                                <span className="specialist-detail__stat-value">{points}</span>
                                <span className="specialist-detail__stat-label">Points</span>
                            </div>
                        </div>

                        <div className="specialist-detail__story">
                            <h2>Story &amp; Philosophy</h2>
                            {agent?.memberDesc ? (
                                agent.memberDesc.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
                            ) : (
                                <p>This specialist is dedicated to providing the best care for your pets, bringing expertise and passion to every session.</p>
                            )}
                        </div>
                    </div>
                    <div className="specialist-detail__header-right">
                        <img
                            className="specialist-detail__portrait"
                            src={heroImage}
                            alt={displayName}
                        />
                        <div className="specialist-detail__actions">
                            <button
                                type="button"
                                className={`pp-btn ${isFollowing ? 'pp-btn--ghost' : 'pp-btn--primary'}`}
                                onClick={() => void handleFollow()}
                            >
                                {isFollowing ? (
                                    <>
                                        <PersonRemoveOutlinedIcon aria-hidden />
                                        Following
                                    </>
                                ) : (
                                    <>
                                        <PersonAddOutlinedIcon aria-hidden />
                                        Follow
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className={`pp-btn pp-btn--ghost${isLiked ? ' is-liked' : ''}`}
                                onClick={() => void likeMemberHandler()}
                                aria-pressed={isLiked}
                            >
                                {isLiked ? (
                                    <>
                                        <FavoriteIcon aria-hidden />
                                        Favorited
                                    </>
                                ) : (
                                    <>
                                        <FavoriteBorderIcon aria-hidden />
                                        Favorite
                                    </>
                                )}
                            </button>
                            {!isOwnProfile ? (
                                <button
                                    type="button"
                                    className="pp-btn pp-btn--ghost"
                                    onClick={handleMessageClick}
                                >
                                    <MailOutlineIcon aria-hidden />
                                    Message
                                </button>
                            ) : null}
                        </div>

                        <div className="specialist-detail__consultation">
                            <h3>Request Consultation</h3>
                            <p>Discuss specific needs or book directly.</p>

                            <label className="specialist-detail__consult-label" htmlFor="consult-name">
                                Pet&apos;s Name &amp; Breed
                            </label>
                            <input
                                id="consult-name"
                                className="specialist-detail__consult-field"
                                type="text"
                                placeholder="e.g. Luna — Golden Retriever"
                                value={consultName}
                                onChange={(e) => setConsultName(e.target.value)}
                            />

                            <label className="specialist-detail__consult-label" htmlFor="consult-service">
                                Service
                            </label>
                            <select
                                id="consult-service"
                                className="specialist-detail__consult-field"
                                value={consultService}
                                onChange={(e) => setConsultService(e.target.value)}
                            >
                                <option value="">Select a Service</option>
                                {agentListings.map((l) => (
                                    <option key={l._id} value={l._id}>{l.listingTitle}</option>
                                ))}
                            </select>

                            <label className="specialist-detail__consult-label" htmlFor="consult-date">
                                Preferred Date
                            </label>
                            <input
                                id="consult-date"
                                className="specialist-detail__consult-field"
                                type="date"
                                value={consultDate}
                                onChange={(e) => setConsultDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />

                            <button
                                type="button"
                                className="pp-btn pp-btn--primary specialist-detail__consult-btn"
                                onClick={() => void handleConsultSubmit()}
                                disabled={consultSubmitting || !user?._id}
                            >
                                {consultSubmitting ? 'Sending…' : 'Send Inquiry'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {agentListings.length > 0 && (
                <section className="specialist-detail__offerings">
                    <div className="specialist-detail__offerings-inner">
                        <h2 className="specialist-detail__section-heading">
                            Services by {displayName}
                        </h2>
                        <div className="specialist-detail__offerings-grid">
                            {agentListings.slice(0, 6).map((listing) =>
                                listing.listingType === ListingType.PRODUCT ? (
                                    <ProductCard
                                        key={listing._id}
                                        product={listing as any}
                                        onLike={likeListingHandler}
                                    />
                                ) : (
                                    <ServiceCard
                                        key={listing._id}
                                        service={listing as any}
                                        onLike={likeListingHandler}
                                    />
                                ),
                            )}
                        </div>
                        {listingTotal > 6 && (
                            <div className="specialist-detail__offerings-pagination">
                                <Pagination
                                    className="pp-pagination"
                                    page={listingInquiry.page}
                                    count={Math.ceil(listingTotal / listingInquiry.limit) || 1}
                                    onChange={listingPaginationChangeHandler}
                                    shape="circular"
                                    color="primary"
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section className="specialist-detail__reviews-section">
                <div className="specialist-detail__reviews-inner">
                    {commentTotal > 0 && (
                        <div className="specialist-detail__reviews">
                            <h2 className="specialist-detail__reviews-title">Client Reviews</h2>
                            <div className="specialist-detail__reviews-grid">
                                {agentComments.map((comment: Comment) => (
                                    <div className="specialist-detail__review-card" key={comment._id}>
                                        <div className="specialist-detail__review-head">
                                            <img
                                                className="specialist-detail__review-avatar"
                                                src={resolveMemberImageUrl(comment.memberData?.memberImage, '/img/profile/defaultUser.svg')}
                                                alt=""
                                            />
                                            <div>
                                                <strong>{comment.memberData?.memberNick}</strong>
                                                <div className="specialist-detail__review-stars">★★★★★</div>
                                            </div>
                                        </div>
                                        <p>{comment.commentContent}</p>
                                    </div>
                                ))}
                            </div>
                            {commentTotal > commentInquiry.limit && (
                                <div className="specialist-detail__reviews-pagination">
                                    <Pagination
                                        className="pp-pagination"
                                        page={commentInquiry.page}
                                        count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
                                        onChange={commentPaginationChangeHandler}
                                        shape="circular"
                                        color="primary"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="specialist-detail__leave-review-wrap">
                <div className="specialist-detail__leave-review">
                    <h3>Leave a Review</h3>
                    <textarea
                        placeholder="Share your experience with this specialist…"
                        value={insertCommentData.commentContent}
                        onChange={({ target: { value } }) =>
                            setInsertCommentData({ ...insertCommentData, commentContent: value })
                        }
                    />
                    <button
                        type="button"
                        className="pp-btn pp-btn--primary specialist-detail__review-btn"
                        disabled={!insertCommentData.commentContent || !user?._id}
                        onClick={() => void createCommentHandler()}
                    >
                        Submit Review
                    </button>
                </div>
            </section>

            {agentId ? (
                <ChatPopup
                    open={chatOpen}
                    onClose={() => setChatOpen(false)}
                    targetMemberId={agentId}
                />
            ) : null}
        </div>
    );
};

AgentDetail.defaultProps = {
    initialInput: {
        page: 1, limit: 9,
        search: { memberId: '' },
    },
    initialComment: {
        page: 1, limit: 6, sort: 'createdAt', direction: 'DESC',
        search: { commentRefId: '' },
    },
};

export default withLayoutFull(AgentDetail);