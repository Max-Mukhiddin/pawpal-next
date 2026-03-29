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
import type { Service } from '../../libs/types/services/service';
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
import RelatedServiceCard from '../../libs/components/services/RelatedServiceCard';
import ServiceReviewCard from '../../libs/components/services/ServiceReviewCard';
import ServiceDetailMobile from '../../libs/components/services/ServiceDetailMobile';
import ServiceDetailInquirySidebar from '../../libs/components/inquiry/ServiceDetailInquirySidebar';

SwiperCore.use([Autoplay, Navigation, Pagination]);

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

	const {
		loading: serviceDetailLoading,
		refetch: getServiceRefetch,
	} = useQuery(GET_LISTING, {
		fetchPolicy: 'network-only',
		variables: { input: serviceId },
		skip: !router.isReady || !serviceId,
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
		variables: { input: initialComment },
		skip: !commentInquiry.search.commentRefId,
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
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

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
			<div id={'service-detail-page'}>
				<div className={'container'}>
					<Stack className={'service-detail-page'}>
						<Stack className={'service-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{service?.listingTitle}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>{service?.listingLocation}</Typography>
										<Stack className={'divider'}></Stack>
										<Stack className={'buy-rent-box'}>
											{service?.listingBarter && (
												<>
													<Stack className={'circle'}>
														<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
															<circle cx="3" cy="3" r="3" fill="#EB6753" />
														</svg>
													</Stack>
													<Typography className={'buy-rent'}>Package</Typography>
												</>
											)}
											{service?.listingRent && (
												<>
													<Stack className={'circle'}>
														<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
															<circle cx="3" cy="3" r="3" fill="#EB6753" />
														</svg>
													</Stack>
													<Typography className={'buy-rent'}>On-demand</Typography>
												</>
											)}
										</Stack>
										<Stack className={'divider'}></Stack>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
											<g clipPath="url(#clip0_time)">
												<path
													d="M7 14C5.61553 14 4.26216 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303297 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303297 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26216 14 5.61553 14 7Z"
													fill="#181A20"
												/>
											</g>
											<defs>
												<clipPath id="clip0_time">
													<rect width="14" height="14" fill="white" />
												</clipPath>
											</defs>
										</svg>
										<Typography className={'date'}>{moment().diff(service?.createdAt, 'days')} days ago</Typography>
									</Stack>
									<Stack className={'bottom-box'}>
										<Stack className="option">
											<img src="/img/icons/bed.svg" alt="" /> <Typography>{service?.listingBeds} care step</Typography>
										</Stack>
										<Stack className="option">
											<img src="/img/icons/room.svg" alt="" /> <Typography>{service?.listingRooms} session</Typography>
										</Stack>
										<Stack className="option">
											<img src="/img/icons/expand.svg" alt="" /> <Typography>{service?.listingSquare} service score</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{service?.listingViews}</Typography>
										</Stack>
										<Stack className="button-box">
											{service?.meLiked && service?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon color="primary" fontSize={'medium'} onClick={() => likeServiceHandler(user, service?._id as string)} />
											) : (
												<FavoriteBorderIcon fontSize={'medium'} onClick={() => likeServiceHandler(user, service?._id as string)} />
											)}
											<Typography>{service?.listingLikes}</Typography>
										</Stack>
									</Stack>
									<Typography>From ${formatterStr(service?.listingPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
										alt={'service-main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{service?.listingImages?.map((subImg: string) => {
										const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
										return (
											<Stack className={'sub-img-box'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={imagePath} alt={'service-sub-image'} />
											</Stack>
										);
									})}
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'service-detail-content'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Care Steps</Typography>
											<Typography className={'option-data'}>{service?.listingBeds}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Sessions</Typography>
											<Typography className={'option-data'}>{service?.listingRooms}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Since</Typography>
											<Typography className={'option-data'}>{moment(service?.createdAt).format('YYYY')}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Service Value</Typography>
											<Typography className={'option-data'}>{service?.listingSquare}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Service Type</Typography>
											<Typography className={'option-data'}>{service?.listingType}</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>About This Service</Typography>
										<Typography className={'desc'}>{service?.listingDesc ?? 'No service description yet.'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Service Details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Starting Price</Typography>
													<Typography className={'data'}>${formatterStr(service?.listingPrice)}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Service Value</Typography>
													<Typography className={'data'}>{service?.listingSquare}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Sessions</Typography>
													<Typography className={'data'}>{service?.listingRooms}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Care Steps</Typography>
													<Typography className={'data'}>{service?.listingBeds}</Typography>
												</Box>
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Since</Typography>
													<Typography className={'data'}>{moment(service?.createdAt).format('YYYY')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Service Type</Typography>
													<Typography className={'data'}>{service?.listingType}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Service Options</Typography>
													<Typography className={'data'}>
														{service?.listingBarter ? 'Package ' : ''}
														{service?.listingRent ? 'On-demand' : ''}
													</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'service-process-config'}>
									<Typography className={'title'}>How This Service Works</Typography>
									<Stack className={'service-process-config__steps'}>
										<Typography className={'service-process-config__step'}>
											1. Share your pet profile and preferred care schedule.
										</Typography>
										<Typography className={'service-process-config__step'}>
											2. We match you with the best specialist and confirm session details.
										</Typography>
										<Typography className={'service-process-config__step'}>
											3. Receive service updates and follow-up care recommendations.
										</Typography>
									</Stack>
								</Stack>
								<Stack className={'address-config'}>
									<Typography className={'title'}>Service Coverage</Typography>
									<Stack className={'map-box'}>
										<iframe
											src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25867.098915951767!2d128.68632810247993!3d35.86402299180927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660bba427bf179%3A0x1fc02da732b9072f!2sGeumhogangbyeon-ro%2C%20Dong-gu%2C%20Daegu!5e0!3m2!1suz!2skr!4v1695537640704!5m2!1suz!2skr"
											width="100%"
											height="100%"
											style={{ border: 0 }}
											allowFullScreen={true}
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
										></iframe>
									</Stack>
								</Stack>

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
							</Stack>
							<ServiceDetailInquirySidebar service={service} user={user} />
						</Stack>
						{relatedServices.length !== 0 && (
							<Stack className={'related-services-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Related Services</Typography>
										<Typography className={'sub-title'}>Recommended services you can book next.</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'related-services-swiper'}
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
										{relatedServices.map((relatedService: Service) => {
											return (
												<SwiperSlide className={'related-services-slide'} key={relatedService._id}>
													<RelatedServiceCard service={relatedService} onLike={likeServiceHandler} />
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

