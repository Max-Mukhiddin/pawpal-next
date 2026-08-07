import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SpecialistCatalog from '../../libs/components/mypage/SpecialistCatalog';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddNewListing from '../../libs/components/mypage/AddNewListing';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyInquiries from '../../libs/components/mypage/MyInquiries';
import SpecialistInquiries from '../../libs/components/mypage/SpecialistInquiries';
import MyBookings from '../../libs/components/mypage/MyBookings';
import SpecialistBookings from '../../libs/components/mypage/SpecialistBookings';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';

const WriteArticle = dynamic(() => import('../../libs/components/mypage/WriteArticle'), { ssr: false });
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { likeToastMessage } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { withActionGate } from '../../libs/utils/actionGate';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	useEffect(() => {
		if (!router.isReady) return;
		const redirectMap: Record<string, string> = {
			myBookings: '/activity?type=BOOKING',
			myInquiries: '/activity?type=INQUIRY',
			specialistBookings: '/activity?type=BOOKING',
			specialistInquiries: '/activity?type=INQUIRY',
			agentBookings: '/activity?type=BOOKING',
			agentInquiries: '/activity?type=INQUIRY',
		};
		const cat = String(router.query.category ?? '');
		if (redirectMap[cat]) void router.replace(redirectMap[cat]);
	}, [router.isReady, router.query.category, router]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		await withActionGate(`follow:member:${id}`, async () => {
			try {
				if (!id) throw new Error(Messages.error1);
				if (requireSignIn(router, user._id, 'follow')) return;

				await subscribe({
					variables: { input: id.toString() },
					refetchQueries: [
						{
							query: category === 'followers' ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS,
							variables: { input: query },
						},
					],
					awaitRefetchQueries: true,
				});

				await sweetTopSmallSuccessAlert('Followed!', 800);
				await refetch({ input: query });
			} catch (err: any) {
				sweetErrorHandling(err, { router, action: 'follow' }).then();
			}
		});
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		await withActionGate(`follow:member:${id}`, async () => {
			try {
				if (!id) throw new Error(Messages.error1);
				if (requireSignIn(router, user._id, 'follow')) return;

				await unsubscribe({
					variables: { input: id.toString() },
					refetchQueries: [
						{
							query: category === 'followers' ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS,
							variables: { input: query },
						},
					],
					awaitRefetchQueries: true,
				});

				await sweetTopSmallSuccessAlert('Unfollowed!', 800);
				await refetch({ input: query });
			} catch (err: any) {
				sweetErrorHandling(err, { router, action: 'follow' }).then();
			}
		});
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any, wasLiked?: boolean) => {
		await withActionGate(`like:member:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'favorite')) return;

				await likeTargetMember({
					variables: {
						input: id,
					},
				});

				await sweetTopSmallSuccessAlert(likeToastMessage(Boolean(wasLiked)), 800);
				await refetch({ input: query });
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'favorite')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.log('ERROR, likeMemberHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="my-page">
			<div className="container">
				<Stack className="mypage-body">
					<Stack className="back-frame mypage-content">
						<Stack className="left-config mypage-sidebar">
							<MyMenu />
						</Stack>
						<Stack className="main-config mypage-main" mb={'76px'}>
							<div className="mypage-content-fade">
								<Stack className="list-config">
									{category === 'addListing' && <AddNewListing />}
									{(category === 'myProducts' ||
										category === 'myServices' ||
										category === 'myListings') && <SpecialistCatalog />}
									{category === 'myFavorites' && <MyFavorites />}
									{category === 'myInquiries' && <MyInquiries />}
									{(category === 'specialistInquiries' || category === 'agentInquiries') && (
										<SpecialistInquiries />
									)}
									{category === 'myBookings' && <MyBookings />}
									{(category === 'specialistBookings' || category === 'agentBookings') && (
										<SpecialistBookings />
									)}
									{category === 'recentlyVisited' && <RecentlyVisited />}
									{category === 'myArticles' && <MyArticles />}
									{category === 'writeArticle' && <WriteArticle />}
								{category === 'editArticle' && (
									<WriteArticle articleId={router.query.articleId as string} />
								)}
									{category === 'myProfile' && <MyProfile />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
								</Stack>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
