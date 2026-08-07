import React, { useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberProperties from '../../libs/components/member/MemberProperties';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { sweetErrorHandling, sweetMixinErrorAlert, successToast } from '../../libs/sweetAlert';
import { likeToastMessage } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { withActionGate } from '../../libs/utils/actionGate';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category;
	const user = useReactiveVar(userVar);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	useEffect(() => {
		if (!router.isReady) return;
		if (category === 'properties') {
			void router.replace(
				{ pathname: router.pathname, query: { ...router.query, category: 'listings' } },
				undefined,
				{ shallow: true },
			);
			return;
		}
		if (!category) {
			void router.replace(
				{ pathname: router.pathname, query: { ...router.query, category: 'listings' } },
				undefined,
				{ shallow: true },
			);
		}
	}, [category, router]);

	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		await withActionGate(`follow:member:${id}`, async () => {
			try {
				if (!id) throw new Error(Messages.error1);
				if (requireSignIn(router, user?._id, 'follow')) return;

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

				successToast('Followed');
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
				if (requireSignIn(router, user?._id, 'follow')) return;

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

				successToast('Unfollowed');
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
				if (requireSignIn(router, user?._id, 'favorite')) return;

				await likeTargetMember({ variables: { input: id } });
				successToast(likeToastMessage(Boolean(wasLiked)));
				await refetch({ input: query });
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'favorite')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}&category=listings`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (device === 'mobile') {
		return <>MEMBER PAGE MOBILE</>;
	}

	return (
		<div id="member-page" className="member-profile-page">
			<div className="member-profile-page__layout">
				<div className="member-profile-page__sidebar">
					<MemberMenu />
				</div>
				<main className="member-profile-page__main">
					{category === 'listings' && <MemberProperties />}
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
					{category === 'articles' && <MemberArticles />}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
