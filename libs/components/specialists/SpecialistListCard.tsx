import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface SpecialistListCardProps {
	specialist: Member;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Specialist directory card; reuses `.agent-general-card` styling; opens PawPal specialist detail. */
const SpecialistListCard: React.FC<SpecialistListCardProps> = ({ specialist, onLike }) => {
	const user = useReactiveVar(userVar);
	const memberListings = specialist?.memberListings ?? 0;
	const memberImage = specialist?.memberImage?.trim();
	const imgSrc = resolveMemberImageUrl(memberImage, '/img/profile/defaultUser.svg');

	const badgeStyle =
		memberListings === 0
			? { background: '#E0E0E0', color: '#666' }
			: memberListings >= 3
				? { background: '#E8F5E9', color: '#2E7D32' }
				: { background: '#E3F2FD', color: '#1565C0' };

	return (
		<Stack className="specialist-general-card" style={{ transition: 'transform 0.3s ease' }}>
			<Link
				href={{
					pathname: '/specialist/detail',
					query: { id: specialist?._id },
				}}
			>
				<Box component={'div'} className={'specialist-img'} sx={{ position: 'relative', overflow: 'hidden' }}>
					<img
						src={imgSrc}
						onError={(e) => {
							e.currentTarget.src = '/img/profile/defaultUser.svg';
						}}
						alt={specialist?.memberNick ?? ''}
						style={{
							display: 'block',
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
					<div style={badgeStyle}>
						{memberListings} {memberListings === 1 ? 'listing' : 'listings'}
					</div>
				</Box>
			</Link>

			<Stack className={'specialist-desc'}>
				<Box component={'div'} className={'specialist-info'}>
					<Link
						href={{
							pathname: '/specialist/detail',
							query: { id: specialist?._id },
						}}
					>
						<strong>{specialist?.memberFullName ?? specialist?.memberNick}</strong>
					</Link>
					<span>Specialist</span>
					{memberListings === 0 && (
						<span style={{ fontSize: 12, color: '#999', fontStyle: 'italic', display: 'block', marginTop: 4 }}>
							No listings yet
						</span>
					)}
				</Box>
				<Box component={'div'} className={'buttons'}>
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{specialist?.memberViews}</Typography>
					<IconButton color={'default'} onClick={() => onLike(user, specialist?._id)}>
						{specialist?.meLiked && specialist?.meLiked[0]?.myFavorite ? (
							<FavoriteIcon color={'primary'} />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
					<Typography className="view-cnt">{specialist?.memberLikes}</Typography>
				</Box>
			</Stack>
		</Stack>
	);
};

export default SpecialistListCard;
