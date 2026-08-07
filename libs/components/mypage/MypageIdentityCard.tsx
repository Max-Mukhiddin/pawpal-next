import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { getMemberTypeLabel } from '../../utils/memberDisplay';

const MypageIdentityCard = () => {
	const user = useReactiveVar(userVar);

	return (
		<div className="mypage-identity-card" aria-label="Account identity">
			<Box component="div" className="mypage-identity-card__avatar">
				<img
					src={resolveMemberImageUrl(user?.memberImage, '/img/profile/defaultUser.svg')}
					alt=""
				/>
			</Box>
			<Stack className="mypage-identity-card__info">
				<Typography className="mypage-identity-card__name" component="div">
					{user?.memberNick ?? '—'}
				</Typography>
				<Typography className="mypage-identity-card__phone" component="div">
					{user?.memberPhone ?? '—'}
				</Typography>
				{user?.memberType === 'ADMIN' ? (
					<a
						href="/_admin/users"
						target="_blank"
						rel="noreferrer"
						className="mypage-identity-card__badge mypage-identity-card__badge--admin"
					>
						{getMemberTypeLabel(user.memberType)}
					</a>
				) : (
					<span
						className={`mypage-identity-card__badge ${
							user?.memberType === 'AGENT'
								? 'mypage-identity-card__badge--agent'
								: 'mypage-identity-card__badge--user'
						}`}
					>
						{getMemberTypeLabel(user?.memberType)}
					</span>
				)}
			</Stack>
		</div>
	);
};

export default MypageIdentityCard;
