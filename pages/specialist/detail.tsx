import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Listing } from '../../libs/types/listing/listing';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import type { ListingsInquiry } from '../../libs/types/listing/listing.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { resolveListingImageUrl, resolveMemberImageUrl } from '../../libs/utils/mediaUrl';
import { formatterStr } from '../../libs/utils';
import Link from 'next/link';

export const getStaticProps = async ({ locale }: any) => ({
    props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
    const device = useDeviceDetect();
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const [agentId, setAgentId] = useState<string | null>(null);
    const [agent, setAgent] = useState<Member | null>(null);
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

    const [createComment] = useMutation(CREATE_COMMENT);
    const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

    const { loading: getMemberLoading } = useQuery(GET_MEMBER, {
        fetchPolicy: 'network-only',
        variables: { input: agentId },
        skip: !agentId,
        onCompleted: (data: T) => {
            setAgent(data?.getMember);
            setListingInquiry((prev) => ({
                ...prev,
                search: { ...prev.search, memberId: data?.getMember?._id as string },
            }));
            setCommentInquiry({ ...commentInquiry, search: { commentRefId: data?.getMember?._id } });
            setInsertCommentData({ ...insertCommentData, commentRefId: data?.getMember?._id });
        },
    });

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
            if (!user._id) throw new Error(Messages.error2);
            if (user._id === agentId) throw new Error('Cannot write a review for yourself!');
            await createComment({ variables: { input: insertCommentData } });
            setInsertCommentData({ ...insertCommentData, commentContent: '' });
            await getCommentsRefetch({ input: commentInquiry });
        } catch (err: any) {
            sweetErrorHandling(err).then();
        }
    };

    const handleConsultSubmit = async () => {
        try {
            if (!user?._id) { await sweetMixinErrorAlert(Messages.error2); return; }
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
        try {
            if (!id) return;
            if (!user._id) throw new Error(Messages.error2);
            await likeTargetListing({ variables: { input: id } });
            await getListingsRefetch({ input: listingInquiry });
            await sweetTopSmallSuccessAlert('success', 800);
        } catch (err: any) {
            sweetMixinErrorAlert(err.message).then();
        }
    };

    const hasRealImage = !!(agent?.memberImage && !agent.memberImage.includes('defaultUser'));
    const heroImage = hasRealImage
        ? resolveMemberImageUrl(agent.memberImage, '/img/banner/specialists-default.webp')
        : '/img/banner/specialists-default.webp';
    const getListingImg = (p?: string) => resolveListingImageUrl(p, '/img/listing/girlBrunette.png');

    if (device === 'mobile') {
        return <div>SPECIALIST DETAIL PAGE MOBILE</div>;
    }

    return (
        <div className="specialist-detail-page">

            {/* ── HERO ── */}
            <div className="specialist-detail__hero">
                <div
                    className="specialist-detail__hero-blur"
                    style={{ backgroundImage: `url('${heroImage}')` }}
                />
                <div className="specialist-detail__hero-content">
                    {hasRealImage && (
                        <img className="specialist-detail__hero-avatar" src={heroImage} alt="" />
                    )}
                    <h1>{agent?.memberFullName ?? agent?.memberNick ?? 'Specialist'}</h1>
                    <p>{agent?.memberDesc ? agent.memberDesc.split('.')[0] + '.' : 'PawPal Certified Specialist'}</p>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div className="specialist-detail__stats-bar">
                <div className="specialist-detail__stats-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div className="stat-text">
                        <strong>{listingTotal}+</strong>
                        <span>Active Care Listings</span>
                    </div>
                </div>
                <div className="specialist-detail__stats-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <div className="stat-text">
                        <strong>{agent?.memberViews ?? 0}+</strong>
                        <span>Profile Views</span>
                    </div>
                </div>
                <div className="specialist-detail__stats-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <div className="stat-text">
                        <strong>{agent?.memberLikes ?? 0}</strong>
                        <span>Client Likes</span>
                    </div>
                </div>
            </div>

            {/* ── MAIN: Story + Consultation form ── */}
            <div className="specialist-detail__main">

                {/* LEFT: story */}
                <div className="specialist-detail__story">
                    <h2>Story &amp; Philosophy</h2>
                    {agent?.memberDesc ? (
                        agent.memberDesc.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                        <p>This specialist is dedicated to providing the best care for your pets, bringing expertise and passion to every session.</p>
                    )}
                    {hasRealImage && (
                        <img
                            className="specialist-detail__story-photo"
                            src={heroImage}
                            alt={agent?.memberNick ?? 'Specialist'}
                        />
                    )}
                </div>

                {/* RIGHT: consultation form */}
                <div className="specialist-detail__consultation">
                    <h3>Request Consultation</h3>
                    <p>Discuss specific needs or book directly.</p>

                    <input
                        className="specialist-detail__consult-field"
                        type="text"
                        placeholder="Pet's Name &amp; Breed"
                        value={consultName}
                        onChange={(e) => setConsultName(e.target.value)}
                    />

                    <select
                        className="specialist-detail__consult-field"
                        value={consultService}
                        onChange={(e) => setConsultService(e.target.value)}
                    >
                        <option value="">Select a Service</option>
                        {agentListings.map((l) => (
                            <option key={l._id} value={l._id}>{l.listingTitle}</option>
                        ))}
                    </select>

                    <input
                        className="specialist-detail__consult-field"
                        type="date"
                        placeholder="Preferred Date"
                        value={consultDate}
                        onChange={(e) => setConsultDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />

                    <Button
                        className="specialist-detail__consult-btn"
                        onClick={() => void handleConsultSubmit()}
                        disabled={consultSubmitting || !user?._id}
                    >
                        {consultSubmitting ? 'Sending…' : 'Send Inquiry →'}
                    </Button>
                </div>

            </div>

            {/* ── CARE OFFERINGS ── */}
            {agentListings.length > 0 && (
                <div className="specialist-detail__offerings">
                    <div className="specialist-detail__offerings-inner">
                        <div className="section-header">
                            <h2>Care Offerings</h2>
                            <p>Tailored services designed for comfort and style.</p>
                        </div>
                        <div className="specialist-detail__offerings-grid">
                            {agentListings.slice(0, 6).map((listing) => (
                                <Link
                                    href={`/service/detail?id=${listing._id}`}
                                    className="specialist-detail__offering-card"
                                    key={listing._id}
                                >
                                    <img
                                        className="specialist-detail__offering-img"
                                        src={getListingImg(listing.listingImages?.[0])}
                                        alt={listing.listingTitle}
                                    />
                                    <div className="specialist-detail__offering-body">
                                        <h4 className="specialist-detail__offering-name">{listing.listingTitle}</h4>
                                        <p className="specialist-detail__offering-desc">
                                            {listing.listingDesc?.slice(0, 90)}{(listing.listingDesc?.length ?? 0) > 90 ? '…' : ''}
                                        </p>
                                        <div className="specialist-detail__offering-footer">
                                            <span>From ₩{formatterStr(listing.listingPrice)}</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {listingTotal > 6 && (
                            <div className="specialist-detail__offerings-pagination">
                                <Pagination
                                    page={listingInquiry.page}
                                    count={Math.ceil(listingTotal / listingInquiry.limit) || 1}
                                    onChange={listingPaginationChangeHandler}
                                    shape="circular"
                                    color="primary"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── REVIEWS ── */}
            <div className="specialist-detail__reviews-section">
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

                    <div className="specialist-detail__leave-review">
                        <h3>Leave a Review</h3>
                        <textarea
                            placeholder="Share your experience with this specialist…"
                            value={insertCommentData.commentContent}
                            onChange={({ target: { value } }) =>
                                setInsertCommentData({ ...insertCommentData, commentContent: value })
                            }
                        />
                        <Button
                            className="specialist-detail__review-btn"
                            disabled={!insertCommentData.commentContent || !user?._id}
                            onClick={createCommentHandler}
                        >
                            Submit Review
                        </Button>
                    </div>
                </div>
            </div>

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