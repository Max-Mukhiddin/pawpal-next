import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/listings/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import CatalogHeroCard from '../../libs/components/listings/CatalogHeroCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Listing } from '../../libs/types/listing/listing';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { resolveListingImageUrl } from '../../libs/utils/mediaUrl';
import { ListingType } from '../../libs/enums/listing.enum';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_LISTINGS, GET_LISTING } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_LISTING } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ListingDetailInquirySidebar from '../../libs/components/inquiry/ListingDetailInquirySidebar';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ListingDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [listingId, setListingId] = useState<string | null>(null);
	const [listing, setListing] = useState<Listing | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationListings, setDestinationListings] = useState<Listing[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [listingComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.LISTING,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
	const [createComment] = useMutation(CREATE_COMMENT);
	const { loading: listingDetailLoading, refetch: getListingRefetch } = useQuery(GET_LISTING, {
		fetchPolicy: 'network-only',
		variables: { input: listingId },
		skip: !listingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListing) setListing(data.getListing);
			if (data?.getListing?.listingImages?.length) setSlideImage(data.getListing.listingImages[0]);
		},
	});

	const { refetch: getListingsRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					text: listing?.listingLocation ?? '',
				},
			},
		},
		skip: !listingId && !listing,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getListings?.list) setDestinationListings(data?.getListings?.list);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialComment },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setPropertyComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setListingId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: router.query.id as string,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeListingHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetListing({
				variables: { input: id },
			});
			await getListingRefetch({ input: listingId });
			await getListingsRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {
						text: listing?.listingLocation ?? '',
					},
				},
			});
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeListingHandler:', err.message);
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

	if (listingDetailLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <div>PROPERTY DETAIL PAGE</div>;
	} else {
		return (
			<div id={'listing-detail-page'}>
				<div className={'container'}>
					<Stack className={'listing-detail-config'}>
						<Stack className={'listing-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{listing?.listingTitle}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>{listing?.listingLocation}</Typography>
										<Stack className={'divider'}></Stack>
										<Stack className={'buy-rent-box'}>
											<Stack className={'circle'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
													<circle cx="3" cy="3" r="3" fill="#EB6753" />
												</svg>
											</Stack>
											<Typography className={'buy-rent'}>{listing?.listingType}</Typography>
										</Stack>
										<Stack className={'divider'}></Stack>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
											<g clipPath="url(#clip0_6505_6282)">
												<path
													d="M7 14C5.61553 14 4.26216 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303297 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303297 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26216 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9498 11.9498C10.637 13.2625 8.85652 14 7 14ZM7 0.931878C5.79984 0.931878 4.62663 1.28777 3.62873 1.95454C2.63084 2.62132 1.85307 3.56903 1.39379 4.67783C0.934505 5.78664 0.814336 7.00673 1.04848 8.18384C1.28262 9.36094 1.86055 10.4422 2.70919 11.2908C3.55783 12.1395 4.63907 12.7174 5.81617 12.9515C6.99327 13.1857 8.21337 13.0655 9.32217 12.6062C10.431 12.1469 11.3787 11.3692 12.0455 10.3713C12.7122 9.37337 13.0681 8.20016 13.0681 7C13.067 5.39099 12.4273 3.84821 11.2895 2.71047C10.1518 1.57273 8.60901 0.933037 7 0.931878Z"
													fill="#181A20"
												/>
												<path
													d="M9.0372 9.7275C8.97153 9.72795 8.90643 9.71543 8.84562 9.69065C8.7848 9.66587 8.72948 9.62933 8.68282 9.58313L6.68345 7.58375C6.63724 7.53709 6.6007 7.48177 6.57592 7.42096C6.55115 7.36015 6.53863 7.29504 6.53907 7.22938V2.7275C6.53907 2.59464 6.59185 2.46723 6.6858 2.37328C6.77974 2.27934 6.90715 2.22656 7.04001 2.22656C7.17287 2.22656 7.30028 2.27934 7.39423 2.37328C7.48817 2.46723 7.54095 2.59464 7.54095 2.7275V7.01937L9.39595 8.87438C9.47462 8.9425 9.53001 9.03354 9.55436 9.13472C9.57871 9.2359 9.5708 9.34217 9.53173 9.43863C9.49266 9.53509 9.4244 9.61691 9.3365 9.67264C9.24861 9.72836 9.14548 9.75519 9.04157 9.74938L9.0372 9.7275Z"
													fill="#181A20"
												/>
											</g>
											<defs>
												<clipPath id="clip0_6505_6282">
													<rect width="14" height="14" fill="white" />
												</clipPath>
											</defs>
										</svg>
										<Typography className={'date'}>{moment().diff(listing?.createdAt, 'days')} days ago</Typography>
									</Stack>
									<Stack className={'bottom-box'}>
										<Stack className="option">
											<Typography variant="body2">Views {listing?.listingViews ?? 0}</Typography>
										</Stack>
										<Stack className="option">
											<Typography variant="body2">Comments {listing?.listingComments ?? 0}</Typography>
										</Stack>
										{listing?.listingType === ListingType.SERVICE && listing?.durationMinutes != null && (
											<Stack className="option">
												<Typography variant="body2">{listing.durationMinutes} min</Typography>
											</Stack>
										)}
									</Stack>
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{listing?.listingViews}</Typography>
										</Stack>
										<Stack className="button-box">
											{listing?.meLiked && listing?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													fontSize={'medium'}
													// @ts_ignore
													onClick={() => likeListingHandler(user, listing?._id)}
												/>
											) : (
												<FavoriteBorderIcon
													fontSize={'medium'}
													// @ts-ignore
													onClick={() => likeListingHandler(user, listing?._id)}
												/>
											)}
											<Typography>{listing?.listingLikes}</Typography>
										</Stack>
									</Stack>
									<Typography>${formatterStr(listing?.listingPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={resolveListingImageUrl(slideImage, '/img/listing/bigImage.png')}
										alt={'main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{listing?.listingImages?.map((subImg: string) => {
										const imagePath: string = resolveListingImageUrl(subImg, '/img/listing/bigImage.png');
										return (
											<Stack className={'sub-img-box'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={imagePath} alt={'sub-image'} />
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
											<Typography className={'option-data'}>${formatterStr(listing?.listingPrice)}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Rank</Typography>
											<Typography className={'option-data'}>{listing?.listingRank ?? 0}</Typography>
										</Stack>
									</Stack>
									{listing?.listingType === ListingType.SERVICE && (
										<Stack className={'option'}>
											<Stack className={'option-includes'}>
												<Typography className={'title'}>Duration</Typography>
												<Typography className={'option-data'}>
													{listing?.durationMinutes != null ? `${listing.durationMinutes} min` : '—'}
												</Typography>
											</Stack>
										</Stack>
									)}
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>Description</Typography>
										<Typography className={'desc'}>{listing?.listingDesc ?? 'No Description!'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Listing details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${formatterStr(listing?.listingPrice)}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Type</Typography>
													<Typography className={'data'}>{listing?.listingType}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Status</Typography>
													<Typography className={'data'}>{listing?.listingStatus}</Typography>
												</Box>
												{listing?.listingType === ListingType.SERVICE && (
													<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Duration</Typography>
														<Typography className={'data'}>
															{listing?.durationMinutes != null ? `${listing.durationMinutes} min` : '—'}
														</Typography>
													</Box>
												)}
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Listed</Typography>
													<Typography className={'data'}>{moment(listing?.createdAt).format('YYYY-MM-DD')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Views</Typography>
													<Typography className={'data'}>{listing?.listingViews ?? 0}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Comments</Typography>
													<Typography className={'data'}>{listing?.listingComments ?? 0}</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'floor-plans-config'}>
									<Typography className={'title'}>Layout</Typography>
									<Stack className={'image-box'}>
										<img src={'/img/listing/floorPlan.png'} alt={'image'} />
									</Stack>
								</Stack>
								<Stack className={'address-config'}>
									<Typography className={'title'}>Address</Typography>
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
									<Stack className={'reviews-config'}>
										<Stack className={'filter-box'}>
											<Stack className={'review-cnt'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
													<g clipPath="url(#clip0_6507_7309)">
														<path
															d="M15.7183 4.60288C15.6171 4.3599 15.3413 4.18787 15.0162 4.16489L10.5822 3.8504L8.82988 0.64527C8.7005 0.409792 8.40612 0.257812 8.07846 0.257812C7.7508 0.257812 7.4563 0.409792 7.32774 0.64527L5.57541 3.8504L1.14072 4.16489C0.815641 4.18832 0.540363 4.36035 0.438643 4.60288C0.337508 4.84586 0.430908 5.11238 0.676772 5.28084L4.02851 7.57692L3.04025 10.9774C2.96794 11.2275 3.09216 11.486 3.35771 11.636C3.50045 11.717 3.66815 11.7575 3.83643 11.7575C3.98105 11.7575 4.12577 11.7274 4.25503 11.667L8.07846 9.88098L11.9012 11.667C12.1816 11.7979 12.5342 11.7859 12.7992 11.636C13.0648 11.486 13.189 11.2275 13.1167 10.9774L12.1284 7.57692L15.4801 5.28084C15.7259 5.11238 15.8194 4.84641 15.7183 4.60288Z"
															fill="#181A20"
														/>
													</g>
													<defs>
														<clipPath id="clip0_6507_7309">
															<rect width="15.36" height="12" fill="white" transform="translate(0.398438)" />
														</clipPath>
													</defs>
												</svg>
												<Typography className={'reviews'}>{commentTotal} reviews</Typography>
											</Stack>
										</Stack>
										<Stack className={'review-list'}>
											{listingComments?.map((comment: Comment) => {
												return <Review comment={comment} key={comment?._id} />;
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
											<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
												<g clipPath="url(#clip0_6975_3642)">
													<path
														d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
														fill="#181A20"
													/>
												</g>
												<defs>
													<clipPath id="clip0_6975_3642">
														<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
													</clipPath>
												</defs>
											</svg>
										</Button>
									</Box>
								</Stack>
							</Stack>
							<ListingDetailInquirySidebar listing={listing} user={user} />
						</Stack>
						{destinationListings.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>You may also like</Typography>
										<Typography className={'sub-title'}>Aliquam lacinia diam quis lacus euismod</Typography>
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
										{destinationListings.map((destListing: Listing) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={destListing.listingTitle}>
													<CatalogHeroCard
														listing={destListing}
														likeListingHandler={likeListingHandler}
														key={destListing._id}
													/>
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
	}
};

ListingDetail.defaultProps = {
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

export default withLayoutFull(ListingDetail);
