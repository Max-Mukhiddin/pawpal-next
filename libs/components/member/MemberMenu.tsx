import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useMutation, useQuery } from '@apollo/client';
import { Member } from '../../types/member/member';
import { GET_MEMBER } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { requireSignIn, handleSignInRequiredError } from '../../auth';
import { successToast, sweetMixinErrorAlert } from '../../sweetAlert';
import { withActionGate } from '../../utils/actionGate';
import { getMemberTypeLabel } from '../../utils/memberDisplay';
import { MemberType } from '../../enums/member.enum';
import ChatPopup from '../messaging/ChatPopup';

type MemberCategory = 'listings' | 'followers' | 'followings' | 'articles';

const MemberMenu = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const category = (router.query?.category as MemberCategory) || 'listings';
	const memberId = router.query?.memberId as string | undefined;
	const [chatOpen, setChatOpen] = useState(false);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { data } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});

	const member = (data?.getMember as Member | undefined) ?? null;
	const isFollowing = Boolean(member?.meFollowed?.[0]?.myFollowing);
	const displayName = member?.memberFullName?.trim() || member?.memberNick || 'Member';
	const roleLabel = getMemberTypeLabel(member?.memberType ?? MemberType.USER);
	const isOwnProfile = Boolean(user?._id && memberId && user._id === memberId);
	const showProfileActions = Boolean(memberId && !isOwnProfile);

	const handleFollow = async () => {
		if (requireSignIn(router, user?._id, 'follow')) return;
		if (!memberId) return;
		await withActionGate(`follow:member:${memberId}`, async () => {
			try {
				if (isFollowing) {
					await unsubscribe({
						variables: { input: memberId },
						refetchQueries: [{ query: GET_MEMBER, variables: { input: memberId } }],
						awaitRefetchQueries: true,
					});
					successToast('Unfollowed');
				} else {
					await subscribe({
						variables: { input: memberId },
						refetchQueries: [{ query: GET_MEMBER, variables: { input: memberId } }],
						awaitRefetchQueries: true,
					});
					successToast('Followed');
				}
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'follow')) return;
				sweetMixinErrorAlert(err?.message || 'Could not update').then();
			}
		});
	};

	const handleMessageClick = () => {
		if (requireSignIn(router, user?._id, 'general')) return;
		if (!memberId || user?._id === memberId) return;
		setChatOpen(true);
	};

	const tabHref = (cat: MemberCategory) => ({
		pathname: '/member',
		query: { ...router.query, category: cat },
	});

	return (
		<aside className="member-sidebar">
			<div className="member-sidebar__avatar-wrap">
				<img
					className="member-sidebar__avatar"
					src={resolveMemberImageUrl(member?.memberImage, '/img/profile/defaultUser.svg')}
					alt={displayName}
				/>
			</div>
			<h2 className="member-sidebar__name">{displayName}</h2>
			{member?.memberPhone ? (
				<div className="member-sidebar__phone">
					<PhoneIcon aria-hidden />
					<span>{member.memberPhone}</span>
				</div>
			) : null}
			<p className="member-sidebar__role">{roleLabel}</p>

			{showProfileActions ? (
				<div className="member-sidebar__actions">
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
					<button type="button" className="pp-btn pp-btn--ghost" onClick={handleMessageClick}>
						<MailOutlineIcon aria-hidden />
						Message
					</button>
				</div>
			) : null}

			<div className="member-sidebar__divider" />

			<nav>
				<ul className="member-sidebar__tabs">
					{member?.memberType === 'AGENT' ? (
						<li>
							<Link
								href={tabHref('listings')}
								scroll={false}
								className={`member-sidebar__tab ${category === 'listings' ? 'is-active' : ''}`}
							>
								<span className="member-sidebar__tab-left">
									<span className="member-sidebar__tab-icon">
										<HomeOutlinedIcon fontSize="small" />
									</span>
									Services &amp; Products
								</span>
								<span className="member-sidebar__tab-count">{member?.memberListings ?? 0}</span>
							</Link>
						</li>
					) : null}
					<li>
						<Link
							href={tabHref('followers')}
							scroll={false}
							className={`member-sidebar__tab ${category === 'followers' ? 'is-active' : ''}`}
						>
							<span className="member-sidebar__tab-left">
								<span className="member-sidebar__tab-icon">
									<PeopleOutlineIcon fontSize="small" />
								</span>
								Followers
							</span>
							<span className="member-sidebar__tab-count">{member?.memberFollowers ?? 0}</span>
						</Link>
					</li>
					<li>
						<Link
							href={tabHref('followings')}
							scroll={false}
							className={`member-sidebar__tab ${category === 'followings' ? 'is-active' : ''}`}
						>
							<span className="member-sidebar__tab-left">
								<span className="member-sidebar__tab-icon">
									<PeopleOutlineIcon fontSize="small" />
								</span>
								Followings
							</span>
							<span className="member-sidebar__tab-count">{member?.memberFollowings ?? 0}</span>
						</Link>
					</li>
					<li>
						<Link
							href={tabHref('articles')}
							scroll={false}
							className={`member-sidebar__tab ${category === 'articles' ? 'is-active' : ''}`}
						>
							<span className="member-sidebar__tab-left">
								<span className="member-sidebar__tab-icon">
									<ArticleOutlinedIcon fontSize="small" />
								</span>
								Articles
							</span>
							<span className="member-sidebar__tab-count">{member?.memberArticles ?? 0}</span>
						</Link>
					</li>
				</ul>
			</nav>

			{memberId ? (
				<ChatPopup open={chatOpen} onClose={() => setChatOpen(false)} targetMemberId={memberId} />
			) : null}
		</aside>
	);
};

export default MemberMenu;
