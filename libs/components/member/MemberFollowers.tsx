import React, { ChangeEvent, useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import FollowingCard from '../mypage/FollowingCard';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const isMypage = router.pathname === '/mypage';
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	const { loading, error, refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip:
			!user?._id ||
			user._id.length !== 24 ||
			!followInquiry?.search?.followingId ||
			followInquiry.search.followingId.length !== 24,
		errorPolicy: 'all',
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMemberFollowers(data?.getMemberFollowers?.list ?? []);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total || 0);
		},
	});

	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followingId: router.query.memberId as string },
			}));
		} else {
			setFollowInquiry((prev) => ({ ...prev, search: { followingId: user?._id ?? '' } }));
		}
	}, [router.query.memberId, user?._id]);

	useEffect(() => {
		const id = followInquiry?.search?.followingId;
		if (id && id.length === 24) {
			void getMemberFollowersRefetch({ input: followInquiry });
		}
	}, [followInquiry]);

	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry({ ...followInquiry, page: value });
	};

	if (device === 'mobile') {
		return <div>pawpal FOLLOWS MOBILE</div>;
	}

	if (isMypage) {
		return (
			<div className="mp-followings">
				<div className="mp-followings__header">
					<h2 className="mp-followings__title">My Followers</h2>
					<p className="mp-followings__subtitle">{total} people follow you</p>
				</div>

				{!loading && (memberFollowers?.length === 0 || error) ? (
					<div className="mp-followings__empty">
						<PersonSearchOutlinedIcon aria-hidden />
						<h3>No followers yet</h3>
						<p>When people follow you, they&apos;ll show up here.</p>
					</div>
				) : (
					<>
						<div className="mp-followings__grid">
							{memberFollowers.map((follower: Follower) => {
								const memberData = follower?.followerData;
								if (!memberData) return null;
								const isFollowing = Boolean(follower?.meFollowed?.[0]?.myFollowing);

								return (
									<FollowingCard
										key={follower._id}
										member={memberData}
										isFollowing={isFollowing}
										onCardClick={() => redirectToMemberPageHandler(memberData._id)}
										onFollowToggle={(e) => {
											e.stopPropagation();
											if (isFollowing) {
												void unsubscribeHandler(
													memberData._id,
													getMemberFollowersRefetch,
													followInquiry,
												);
											} else {
												void subscribeHandler(
													memberData._id,
													getMemberFollowersRefetch,
													followInquiry,
												);
											}
										}}
										showFollowAction={user?._id !== follower?.followerId}
									/>
								);
							})}
						</div>
						{memberFollowers.length > 0 ? (
							<div className="mp-followings__pagination">
								<Pagination
									className="pp-pagination"
									page={followInquiry.page}
									count={Math.ceil(total / followInquiry.limit) || 1}
									onChange={paginationHandler}
									shape="circular"
									color="primary"
								/>
							</div>
						) : null}
					</>
				)}
			</div>
		);
	}

	return (
		<div className="member-content">
			<h1 className="member-content__title">Followers</h1>
			{!loading && (memberFollowers?.length === 0 || error) ? (
				<div className="member-content__empty">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No followers yet!</p>
				</div>
			) : (
				<div className="member-content__grid member-content__grid--members">
					{memberFollowers.map((follower: Follower) => {
						const memberData = follower?.followerData;
						if (!memberData) return null;
						const isFollowing = Boolean(follower?.meFollowed?.[0]?.myFollowing);

						return (
							<FollowingCard
								key={follower._id}
								member={memberData}
								isFollowing={isFollowing}
								onCardClick={() => redirectToMemberPageHandler(memberData._id)}
								onFollowToggle={(e) => {
									e.stopPropagation();
									if (isFollowing) {
										void unsubscribeHandler(
											memberData._id,
											getMemberFollowersRefetch,
											followInquiry,
										);
									} else {
										void subscribeHandler(
											memberData._id,
											getMemberFollowersRefetch,
											followInquiry,
										);
									}
								}}
								showFollowAction={user?._id !== follower?.followerId}
							/>
						);
					})}
				</div>
			)}
			{memberFollowers.length > 0 ? (
				<div className="member-content__pagination">
					<Pagination
						className="pp-pagination"
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit) || 1}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
				</div>
			) : null}
		</div>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
