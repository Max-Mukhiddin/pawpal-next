import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
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
import { relatedListingInquiryInput } from '../../libs/utils/catalogListingInquiry';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ServiceReviewCard from '../../libs/components/services/ServiceReviewCard';
import ServiceDetailMobile from '../../libs/components/services/ServiceDetailMobile';
import ServiceDetailInquirySidebar from '../../libs/components/inquiry/ServiceDetailInquirySidebar';
import { resolveListingImageUrl, resolveMemberImageUrl } from '../../libs/utils/mediaUrl';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ServiceDetail: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [serviceId, setServiceId] = useState<string | null>(null);
	const [service, setService] = useState<Service | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [activeTab, setActiveTab] = useState<'about' | 'details'>('about');
	const [relatedServices, setRelatedServices] = useState<Service[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [serviceComments, setServiceComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
	const [createComment] = useMutation(CREATE_COMMENT);

	const relatedServiceCatalogInquiry = useMemo(
		() => relatedListingInquiryInput(ListingType.SERVICE, service?.listingLocation),
		[service?.listingLocation],
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

	const {
		loading: serviceDetailLoading,
		refetch: getServiceRefetch,
	} = useQuery(GET_LISTING, {
		fetchPolicy: 'network-only',
		variables: { input: listingId },
		skip: !listingId || listingId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListing) setService(data.getListing);
			if (data?.getListing?.listingImages?.length) setSlideImage(data.getListing.listingImages[0]);
		},
	});

	const { refetch: getServicesCatalogRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: relatedServiceCatalogInquiry },
		skip: !serviceId && !service,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListings?.list) setRelatedServices(data?.getListings?.list);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentsQueryInput },
		skip: !listingId || listingId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setServiceComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES — sync route id once router is ready (avoids pre-hydration / stale query churn). */
	useEffect(() => {
		if (!router.isReady) return;
		const raw = router.query.id;
		const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
		if (!id) return;

		setServiceId(id);
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
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const getListingImg = (p?: string) => resolveListingImageUrl(p, '/img/listing/girlBrunette.png');
	const getMemberImg = (p?: string) => resolveMemberImageUrl(p, '/img/profile/defaultUser.svg');
	const heroImage = service?.listingImages?.[0]
		? resolveListingImageUrl(service.listingImages[0], '/img/banner/services.webp')
		: '/img/banner/services.webp';

	const likeServiceHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({
				variables: { input: id },
			});
			await getServiceRefetch({ input: serviceId });
			await getServicesCatalogRefetch({
				input: relatedServiceCatalogInquiry,
			});
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeServiceHandler:', err.message);
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

	if (serviceDetailLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return (
			<ServiceDetailMobile
				service={service}
				user={user}
				slideImage={slideImage}
				onSlideImageChange={changeImageHandler}
				onLike={likeServiceHandler}
				relatedServices={relatedServices}
				serviceComments={serviceComments}
				commentTotal={commentTotal}
				commentInquiry={commentInquiry}
				onCommentPageChange={commentPaginationChangeHandler}
				insertCommentData={insertCommentData}
				onCommentTextChange={(value) => setInsertCommentData((prev) => ({ ...prev, commentContent: value }))}
				onSubmitComment={createCommentHandler}
			/>
		);
	}

	return (
		<div className="service-detail-revamp">
			<section
				className="service-detail-revamp__hero"
				style={{
					backgroundImage: `url('${heroImage}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<div className="service-detail-revamp__hero-inner">
					<h1>{service?.listingTitle}</h1>
					<p>{`Home / Services / ${service?.listingTitle ?? ''}`}</p>
				</div>
			</section>

			<div className="service-detail-revamp__container">
				<div className="service-detail-revamp__grid">
					<div className="service-detail-revamp__left">
						<div className="media-card">
							<img src={getListingImg(slideImage || service?.listingImages?.[0])} alt="" className="main-image" />
							{(service?.listingImages?.length ?? 0) > 1 && (
								<div className="thumb-row">
									{service?.listingImages?.slice(0, 3).map((img) => (
										<button
											key={img}
											type="button"
											className={slideImage === img ? 'thumb is-active' : 'thumb'}
											onClick={() => changeImageHandler(img)}
										>
											<img src={getListingImg(img)} alt="" />
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
								<p className="tab-copy">{service?.listingDesc ?? 'No service description yet.'}</p>
							) : (
								<div className="tab-details">
									<p>
										<strong>Location:</strong> {service?.listingLocation || '-'}
									</p>
									<p>
										<strong>Status:</strong> {service?.listingStatus || '-'}
									</p>
									<p>
										<strong>Views:</strong> {service?.listingViews ?? 0}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="service-detail-revamp__right">
						<div className="summary-card">
							<h2>{service?.listingTitle}</h2>
							<p className="price">From ${formatterStr(service?.listingPrice)}</p>
							{service?.durationMinutes ? <p className="meta">⏱ {service.durationMinutes} min</p> : null}
							{service?.listingLocation ? <span className="location-badge">📍 {service.listingLocation}</span> : null}
							<div className="stats">
								<span>👁 {service?.listingViews ?? 0}</span>
								<button type="button" onClick={() => likeServiceHandler(user, service?._id as string)} aria-label="Like service">
									{service?.meLiked && service?.meLiked[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
								</button>
								<span>{service?.listingLikes ?? 0}</span>
							</div>
						</div>

						<div className="specialist-card">
							<img src={getMemberImg(service?.memberData?.memberImage ?? undefined)} alt="" />
							<div>
								<strong>{service?.memberData?.memberNick || 'Specialist'}</strong>
								<Link href={`/specialist/detail?id=${service?.memberData?._id}`}>View Profile →</Link>
							</div>
						</div>

						<div className="inquiry-card">
							<ServiceDetailInquirySidebar
								service={service}
								user={user}
								mainTitle="Have a question?"
								profileLinkLabel="View Profile →"
							/>
						</div>
					</div>
				</div>

				{commentTotal !== 0 && (
					<Stack className={'service-reviews-config'}>
						<Stack className={'filter-box'}>
							<Stack className={'review-cnt'}>
								<Typography className={'reviews'}>{commentTotal} reviews</Typography>
							</Stack>
						</Stack>
						<Stack className={'review-list'}>
							{serviceComments?.map((comment: Comment) => {
								return <ServiceReviewCard comment={comment} key={comment?._id} />;
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
					<Typography className={'main-title'}>Leave A Review</Typography>
					<Typography className={'review-title'}>Review</Typography>
					<textarea
						onChange={({ target: { value } }: any) => {
							setInsertCommentData({ ...insertCommentData, commentContent: value });
						}}
						value={insertCommentData.commentContent}
					></textarea>
					<Box className={'submit-btn'} component={'div'}>
						<Button
							className={'submit-review'}
							disabled={insertCommentData.commentContent === '' || user?._id === ''}
							onClick={createCommentHandler}
						>
							<Typography className={'title'}>Submit Review</Typography>
						</Button>
					</Box>
				</Stack>

				{relatedServices.length !== 0 && (
					<section className="related-section">
						<h3>You Might Also Like</h3>
						<div className="related-grid">
							{relatedServices
								.filter((item) => item._id !== service?._id)
								.slice(0, 4)
								.map((relatedService: Service) => (
									<Link href={`/service/detail?id=${relatedService._id}`} className="related-card" key={relatedService._id}>
										<img src={getListingImg(relatedService.listingImages?.[0])} alt="" />
										<div className="overlay">
											<strong>{relatedService.listingTitle}</strong>
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

ServiceDetail.defaultProps = {
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

export default withLayoutFull(ServiceDetail);

