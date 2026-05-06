import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Member } from '../../types/member/member';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface SpecialistProfileSummaryProps {
	specialist: Member | null;
	onOpenMemberProfile: (memberId: string) => void;
	onToggleFollow: (memberId: string, isFollowing: boolean) => void;
	isLoggedIn: boolean;
}

/** Hero row + PawPal bio and activity stats; reuses `.specialist-info` image/title styles from specialist detail SCSS. */
const SpecialistProfileSummary: React.FC<SpecialistProfileSummaryProps> = ({
	specialist,
	onOpenMemberProfile,
	onToggleFollow,
	isLoggedIn,
}) => {
	if (!specialist) return null;

	return (
		<Stack className={'specialist-info'}>
			<img
				src={resolveMemberImageUrl(specialist?.memberImage, '/img/profile/defaultUser.svg')}
				alt=""
				onClick={() => onOpenMemberProfile(specialist._id)}
				style={{ cursor: 'pointer' }}
			/>
			<Stack sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
				<Box component={'div'} className={'info'} onClick={() => onOpenMemberProfile(specialist._id)}>
					<strong>{specialist?.memberFullName ?? specialist?.memberNick}</strong>
					<Typography sx={{ mt: 0.5, fontSize: 14, color: '#717171', fontWeight: 500 }}>PawPal specialist</Typography>
					<div>
						<img src="/img/icons/call.svg" alt="" />
						<span>{specialist?.memberPhone}</span>
					</div>
				</Box>
				<Typography sx={{ mt: 2, fontSize: 14, lineHeight: 1.65, color: '#181a20', maxWidth: 720 }}>
					{specialist?.memberDesc?.trim()
						? specialist.memberDesc
						: 'This specialist partners with PawPal to offer thoughtful, pet-first care. Message them to discuss your companion’s needs.'}
				</Typography>
				<Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberListings}</strong> active{' '}
						{specialist.memberListings === 1 ? 'PawPal care listing' : 'PawPal care listings'}
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberViews}</strong> profile views
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberLikes}</strong> client likes
					</Typography>
				</Stack>
				<Stack sx={{ mt: 2 }}>
					{isLoggedIn ? (
						<button
							type="button"
							onClick={() => onToggleFollow(specialist._id, Boolean(specialist?.meFollowed?.[0]?.myFollowing))}
							style={{
								padding: '8px 14px',
								borderRadius: 999,
								border: '1px solid #eb6753',
								background: specialist?.meFollowed?.[0]?.myFollowing ? '#fff' : '#eb6753',
								color: specialist?.meFollowed?.[0]?.myFollowing ? '#eb6753' : '#fff',
								fontWeight: 700,
								cursor: 'pointer',
							}}
						>
							{specialist?.meFollowed?.[0]?.myFollowing ? 'Unfollow' : 'Follow'}
						</button>
					) : (
						<Typography sx={{ fontSize: 13, fontWeight: 700, color: '#eb6753' }}>Login to follow</Typography>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default SpecialistProfileSummary;
