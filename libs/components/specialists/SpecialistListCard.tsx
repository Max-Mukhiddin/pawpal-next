import React from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface SpecialistListCardProps {
	specialist: Member;
	onLike: (user: T, id: string) => Promise<void>;
}

// Warm PawPal-palette avatar backgrounds — cycles by position
const AVATAR_BG_COLORS = [
	'rgba(255, 122, 26, 0.18)',   // orange
	'rgba(255, 200, 100, 0.22)',  // golden
	'rgba(150, 210, 180, 0.25)',  // sage green
	'rgba(160, 200, 240, 0.25)',  // sky blue
	'rgba(230, 180, 220, 0.22)',  // soft lilac
	'rgba(250, 210, 140, 0.22)',  // warm yellow
	'rgba(200, 230, 190, 0.25)',  // mint
	'rgba(255, 160, 120, 0.2)',   // peach
];

const formatRole = (memberType?: string): string => {
	if (!memberType) return 'Specialist';
	if (memberType === 'AGENT') return 'Pet Care Specialist';
	return memberType.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const getExperienceYears = (desc: string, listings: number): number => {
	const match = desc?.match(/(\d+)\s*years?/i);
	return match
		? parseInt(match[1], 10)
		: Math.max(1, Math.min(20, Math.round(listings / 8) + 1));
};

// Deterministic color index from member ID
const getColorIndex = (id: string): number => {
	const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return sum % AVATAR_BG_COLORS.length;
};

const SpecialistListCard: React.FC<SpecialistListCardProps> = ({ specialist, onLike }) => {
	const user = useReactiveVar(userVar);
	const memberListings = specialist?.memberListings ?? 0;
	const imgSrc = resolveMemberImageUrl(specialist?.memberImage, '/img/profile/defaultUser.svg');
	const displayName = specialist?.memberFullName?.trim() || specialist?.memberNick || 'Specialist';
	const bio = specialist?.memberDesc?.trim() || 'Pet care specialist on PawPal.';
	const points = specialist?.totalEngagement ?? specialist?.memberLikes ?? 0;
	const experienceYears = getExperienceYears(specialist?.memberDesc || '', memberListings);
	const detailHref = { pathname: '/specialist/detail', query: { id: specialist?._id } };
	const bgColor = AVATAR_BG_COLORS[getColorIndex(specialist?._id ?? '0')];
	const isDefaultAvatar = !specialist?.memberImage;

	return (
		<Link href={detailHref} className="specialist-list-card">
			{/* Avatar circle */}
			<div className="specialist-list-card__avatar-wrap">
				<div
					className="specialist-list-card__avatar-bg"
					style={{ background: bgColor }}
				>
					<img
						src={imgSrc}
						alt={displayName}
						className={`specialist-list-card__avatar${isDefaultAvatar ? ' specialist-list-card__avatar--default' : ''}`}
						onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }}
					/>
				</div>

				{memberListings > 0 && (
					<span className="specialist-list-card__badge">
						{memberListings} {memberListings === 1 ? 'listing' : 'listings'}
					</span>
				)}

				<IconButton
					className="specialist-list-card__like"
					size="small"
					aria-label="Like specialist"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onLike(user, specialist?._id);
					}}
				>
					{specialist?.meLiked?.[0]?.myFavorite ? (
						<FavoriteIcon fontSize="small" color="primary" />
					) : (
						<FavoriteBorderIcon fontSize="small" />
					)}
				</IconButton>
			</div>

			{/* Info */}
			<div className="specialist-list-card__body">
				<h3 className="specialist-list-card__name">{displayName}</h3>
				<p className="specialist-list-card__role">{formatRole(specialist?.memberType)}</p>
				<p className="specialist-list-card__bio">{bio}</p>

				<div className="specialist-list-card__stats">
					<div className="specialist-list-card__stat">
						<strong>{experienceYears}y</strong>
						<span>Exp</span>
					</div>
					<div className="specialist-list-card__stat">
						<strong>{memberListings}+</strong>
						<span>Jobs</span>
					</div>
					<div className="specialist-list-card__stat">
						<strong style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
							{points >= 1000 ? (points / 1000).toFixed(1) + 'k' : points}
							<StarRoundedIcon style={{ fontSize: '1.1rem', color: '#e8745a', marginBottom: '2px' }} />
						</strong>
						<span>Points</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default SpecialistListCard;