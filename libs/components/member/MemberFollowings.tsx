import React, { ChangeEvent, useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import FollowingCard from '../mypage/FollowingCard';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const isMypage = router.pathname === '/mypage';
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const user = useReactiveVar(userVar);

	const { loading, error, refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip:
			!user?._id ||
			user._id.length !== 24 ||
			!followInquiry?.search?.followerId ||
			followInquiry.search.followerId.length !== 24,
		errorPolicy: 'all',
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMemberFollowings(data?.getMemberFollowings?.list ?? []);
			setTotal(data?.getMemberFollowings?.metaCounter[0]?.total || 0);
		},
	});

	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followerId: router.query.memberId as string },
			}));
		} else {
			setFollowInquiry((prev) => ({ ...prev, search: { followerId: user?._id ?? '' } }));
		}
	}, [router.query.memberId, user?._id]);

	useEffect(() => {
		const id = followInquiry?.search?.followerId;
		if (id && id.length === 24) {
			void getMemberFollowingsRefetch({ input: followInquiry });
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
					<h2 className="mp-followings__title">My Followings</h2>
					<p className="mp-followings__subtitle">{total} people you follow</p>
				</div>

				{!loading && (memberFollowings?.length === 0 || error) ? (
					<div className="mp-followings__empty">
						<PersonSearchOutlinedIcon aria-hidden />
						<h3>No followings yet</h3>
						<p>When you follow specialists, they&apos;ll show up here.</p>
						<Link href="/specialist" className="pp-btn pp-btn--primary">
							Browse Specialists
						</Link>
					</div>
				) : (
					<>
						<div className="mp-followings__grid">
							{memberFollowings.map((following: Following) => {
								const memberData = following?.followingData;
								if (!memberData) return null;
								const isFollowing = Boolean(following?.meFollowed?.[0]?.myFollowing);

								return (
									<FollowingCard
										key={following._id}
										member={memberData}
										isFollowing={isFollowing}
										onCardClick={() => redirectToMemberPageHandler(memberData._id)}
										onFollowToggle={(e) => {
											e.stopPropagation();
											if (isFollowing) {
												void unsubscribeHandler(
													memberData._id,
													getMemberFollowingsRefetch,
													followInquiry,
												);
											} else {
												void subscribeHandler(
													memberData._id,
													getMemberFollowingsRefetch,
													followInquiry,
												);
											}
										}}
										showFollowAction={user?._id !== following?.followingId}
									/>
								);
							})}
						</div>
						{memberFollowings.length > 0 ? (
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
			<h1 className="member-content__title">Followings</h1>
			{!loading && (memberFollowings?.length === 0 || error) ? (
				<div className="member-content__empty">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No followings yet!</p>
				</div>
			) : (
				<div className="member-content__grid member-content__grid--members">
					{memberFollowings.map((following: Following) => {
						const memberData = following?.followingData;
						if (!memberData) return null;
						const isFollowing = Boolean(following?.meFollowed?.[0]?.myFollowing);

						return (
							<FollowingCard
								key={following._id}
								member={memberData}
								isFollowing={isFollowing}
								onCardClick={() => redirectToMemberPageHandler(memberData._id)}
								onFollowToggle={(e) => {
									e.stopPropagation();
									if (isFollowing) {
										void unsubscribeHandler(
											memberData._id,
											getMemberFollowingsRefetch,
											followInquiry,
										);
									} else {
										void subscribeHandler(
											memberData._id,
											getMemberFollowingsRefetch,
											followInquiry,
										);
									}
								}}
								showFollowAction={user?._id !== following?.followingId}
							/>
						);
					})}
				</div>
			)}
			{memberFollowings.length > 0 ? (
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

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;
