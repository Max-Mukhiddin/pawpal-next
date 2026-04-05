import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import type { Listing } from '../../libs/types/listing/listing';
import { ListingsInquiry } from '../../libs/types/listing/listing.input';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_LISTING, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_LISTINGS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import SpecialistProfileSummary from '../../libs/components/specialists/SpecialistProfileSummary';
import SpecialistInquiryPanel from '../../libs/components/specialists/SpecialistInquiryPanel';
import RelatedSpecialistServiceCard from '../../libs/components/specialists/RelatedSpecialistServiceCard';
import SpecialistReviewCard from '../../libs/components/specialists/SpecialistReviewCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SpecialistDetail: NextPage = ({ initialInput, initialComment }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [specialistId, setSpecialistId] = useState<string | null>(null);
	const [specialist, setSpecialist] = useState<Member | null>(null);
	const [specialistListingsInquiry, setSpecialistListingsInquiry] = useState<ListingsInquiry>(initialInput);
	const [specialistListings, setSpecialistListings] = useState<Listing[]>([]);
	const [listingTotal, setListingTotal] = useState<number>(0);
	const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [specialistReviews, setSpecialistReviews] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	const specialistListingsInquiryRef = useRef(specialistListingsInquiry);
	specialistListingsInquiryRef.current = specialistListingsInquiry;

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { loading: getMemberLoading } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: specialistId },
		skip: !specialistId || specialistId.length !== 24,
		onCompleted: (data: T) => {
			setSpecialist(data?.getMember);
			setSelectedListing(null);
			const memberId = data?.getMember?._id as string | undefined;
			setSpecialistListingsInquiry((prev) => ({
				...prev,
				search: {
					memberId,
				},
			}));

			setCommentInquiry((prev) => ({
				...prev,
				search: {
					commentRefId: memberId ?? '',
				},
			}));

			setInsertCommentData((prev) => ({
				...prev,
				commentRefId: memberId ?? '',
			}));
		},
	});

	const { refetch: getSpecialistListingsRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: specialistListingsInquiry },
		skip: !specialistListingsInquiry.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSpecialistListings(data?.getListings?.list);
			setListingTotal(data?.getListings?.metaCounter[0]?.total ?? 0);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip:
			!commentInquiry.search.commentRefId ||
			commentInquiry.search.commentRefId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSpecialistReviews(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) setSpecialistId(router.query.id as string);
	}, [router]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const listingPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setSelectedListing(null);
		setSpecialistListingsInquiry((prev) => ({ ...prev, page: value }));
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === specialistId) throw new Error('You cannot review your own specialist profile.');

			await createComment({
				variables: {
					input: insertCommentData,
				},
			});

			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeListingHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetListing({
				variables: {
					input: id,
				},
			});

			await getSpecialistListingsRefetch({ input: specialistListingsInquiryRef.current });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeListingHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followToggleHandler = async (memberId: string, isFollowing: boolean) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!memberId) return;
			if (isFollowing) {
				await unsubscribe({ variables: { input: memberId.toString() } });
			} else {
				await subscribe({ variables: { input: memberId.toString() } });
			}
			await sweetTopSmallSuccessAlert(isFollowing ? 'Unfollowed!' : 'Followed!', 800);
			setSpecialist((prev) =>
				prev
					? ({
							...prev,
							meFollowed: [
								{
									followingId: memberId,
									followerId: user._id,
									myFollowing: !isFollowing,
								},
							],
						} as Member)
					: prev,
			);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (!router.isReady) {
		return (
			<Stack sx={{ minHeight: 400, justifyContent: 'center', alignItems: 'center' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (!router.query.id) {
		return (
			<Stack className={'specialist-detail-page'} sx={{ py: 10, alignItems: 'center' }}>
				<Typography>Open a specialist from the directory to view their profile.</Typography>
			</Stack>
		);
	}

	if (getMemberLoading && !specialist) {
		return (
			<Stack sx={{ minHeight: '70vh', justifyContent: 'center', alignItems: 'center' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	return (
		<Stack className={'specialist-detail-page'} sx={{ px: { xs: 1, sm: 0 } }}>
			<Stack className={'container'}>
				<SpecialistProfileSummary
					specialist={specialist}
					onOpenMemberProfile={redirectToMemberPageHandler}
					onToggleFollow={followToggleHandler}
					isLoggedIn={Boolean(user?._id)}
				/>

				<Stack
					direction={{ xs: 'column', lg: 'row' }}
					spacing={3}
					alignItems="flex-start"
					sx={{ width: '100%', mt: 1 }}
				>
					<Stack flex={1} minWidth={0} sx={{ width: '100%' }}>
						<Typography sx={{ fontSize: 20, fontWeight: 600, color: '#181a20', mb: 1, mt: 2 }}>
							Care listings & offerings
						</Typography>
						<Typography sx={{ fontSize: 14, color: '#717171', mb: 2, maxWidth: 720 }}>
							Services and packages this specialist hosts on PawPal. Use &quot;Select for inquiry&quot; on a card to message about
							that service, or open the card for full details and the same flows on the service page.
						</Typography>

						<Stack className={'specialist-home-list'}>
							<Stack className={'card-wrap'}>
								{specialistListings.map((listing: Listing) => {
									return (
										<div className={'wrap-main'} key={listing?._id}>
											<RelatedSpecialistServiceCard
												listing={listing}
												onLike={likeListingHandler}
												selectedListingId={selectedListing?._id ?? null}
												onSelectForInquiry={setSelectedListing}
											/>
										</div>
									);
								})}
							</Stack>
							<Stack className={'pagination'}>
								{listingTotal ? (
									<>
										<Stack className="pagination-box">
											<Pagination
												page={specialistListingsInquiry.page}
												count={Math.ceil(listingTotal / specialistListingsInquiry.limit) || 1}
												onChange={listingPaginationChangeHandler}
												shape="circular"
												color="primary"
											/>
										</Stack>
										<span>
											Total {listingTotal} care service{listingTotal === 1 ? '' : 's'} available
										</span>
									</>
								) : (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No care listings yet for this specialist.</p>
									</div>
								)}
							</Stack>
						</Stack>

						<Stack className={'review-box'}>
							<Stack className={'main-intro'}>
								<span>Specialist reviews</span>
								<p>Feedback from pet parents who have worked with this professional through PawPal.</p>
							</Stack>
							{commentTotal !== 0 && (
								<Stack className={'review-wrap'}>
									<Box component={'div'} className={'title-box'}>
										<StarIcon />
										<span>
											{commentTotal} specialist review{commentTotal > 1 ? 's' : ''}
										</span>
									</Box>
									{specialistReviews?.map((comment: Comment) => {
										return <SpecialistReviewCard comment={comment} key={comment?._id} />;
									})}
									<Box component={'div'} className={'pagination-box'}>
										<Pagination
											page={commentInquiry.page}
											count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
											onChange={commentPaginationChangeHandler}
											shape="circular"
											color="primary"
										/>
									</Box>
								</Stack>
							)}

							<Stack className={'leave-review-config'}>
								<Typography className={'main-title'}>Share your experience</Typography>
								<Typography className={'review-title'}>Your review</Typography>
								<textarea
									onChange={({ target: { value } }: any) => {
										setInsertCommentData((prev) => ({ ...prev, commentContent: value }));
									}}
									value={insertCommentData.commentContent}
									placeholder={'How did this specialist help you and your pet?'}
								></textarea>
								<Box className={'submit-btn'} component={'div'}>
									<Button
										className={'submit-review'}
										disabled={insertCommentData.commentContent === '' || user?._id === ''}
										onClick={createCommentHandler}
									>
										<Typography className={'title'}>Submit specialist review</Typography>
										<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
											<g clipPath="url(#clip0_specialist_review_submit)">
												<path
													d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
													fill="#181A20"
												/>
											</g>
											<defs>
												<clipPath id="clip0_specialist_review_submit">
													<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
												</clipPath>
											</defs>
										</svg>
									</Button>
								</Box>
							</Stack>
						</Stack>
					</Stack>

					<SpecialistInquiryPanel
						user={user}
						selectedListing={selectedListing}
						onClearSelectedListing={() => setSelectedListing(null)}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};

SpecialistDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(SpecialistDetail);
