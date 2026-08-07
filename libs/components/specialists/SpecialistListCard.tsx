import React, { useState } from 'react';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { getMemberSpecialtyCategory, hasRealMemberPhoto } from '../../utils/memberSpecialty';
import { getMemberTypeLabel } from '../../utils/memberDisplay';
import { MemberType } from '../../enums/member.enum';

export interface SpecialistListCardProps {
	specialist: Member;
	onLike: (user: T, id: string) => Promise<void>;
	/** `editorial` — open portrait layout for /specialist listing only. */
	variant?: 'default' | 'editorial';
	/** 1-based grid position for editorial eyebrow numbering. */
	index?: number;
}

const formatRole = (memberType?: string): string => {
	if (!memberType || memberType === MemberType.AGENT) return getMemberTypeLabel(MemberType.AGENT);
	return getMemberTypeLabel(memberType);
};

const getMemberInitial = (name: string): string => {
	const trimmed = name.trim();
	if (!trimmed) return 'P';
	return trimmed.charAt(0).toUpperCase();
};

const formatEditorialIndex = (index: number): string => String(index).padStart(2, '0');

const DEFAULT_PROFILE_AVATAR = '/img/profile/defaultUser.svg';

const SpecialistListCard: React.FC<SpecialistListCardProps> = ({
	specialist,
	onLike,
	variant = 'default',
	index = 1,
}) => {
	const user = useReactiveVar(userVar);
	const [imageFailed, setImageFailed] = useState(false);
	const displayName = specialist?.memberFullName?.trim() || specialist?.memberNick || getMemberTypeLabel(MemberType.AGENT);
	const hasPhoto = hasRealMemberPhoto(specialist?.memberImage) && !imageFailed;
	const agentImage = hasPhoto ? resolveMemberImageUrl(specialist.memberImage) : '';
	const bio = specialist?.memberDesc?.trim() || 'Trusted pet care professional on PawPal.';
	const detailHref = { pathname: '/specialist/detail', query: { id: specialist?._id } };
	const isLiked = Boolean(specialist?.meLiked?.[0]?.myFavorite);
	const rating =
		typeof specialist?.specialistScore === 'number' && specialist.specialistScore > 0
			? specialist.specialistScore.toFixed(1)
			: null;
	const listingsCount = specialist?.memberListings ?? 0;
	const showListings = listingsCount > 0;

	const heartButton = (
		<IconButton
			className={`specialist-card__heart${isLiked ? ' liked' : ''}`}
			size="small"
			aria-label="Like specialist"
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void onLike(user, specialist?._id);
			}}
			onPointerDown={(e) => {
				// Keep the parent <Link> from treating this tap as navigation on touch.
				e.stopPropagation();
			}}
		>
			{isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
		</IconButton>
	);

	if (variant === 'editorial') {
		const category = getMemberSpecialtyCategory(specialist);

		return (
			<Link href={detailHref} className="specialist-card specialist-card--editorial">
				<div className="specialist-card__media">
					<div
						className={`specialist-card__photo-wrap${
							hasPhoto ? '' : ' specialist-card__photo-wrap--placeholder'
						}`}
					>
						{hasPhoto ? (
							<img
								className="specialist-card__photo"
								src={agentImage}
								alt={displayName}
								loading="lazy"
								onError={() => setImageFailed(true)}
							/>
						) : (
							<div className="specialist-card__photo-fallback" aria-hidden>
								<img src={DEFAULT_PROFILE_AVATAR} alt="" />
							</div>
						)}
					</div>
					{heartButton}
				</div>

				<div className="specialist-card__copy">
					<p className="specialist-card__eyebrow">
						{formatEditorialIndex(index)} / {category}
					</p>
					<h3 className="specialist-card__name">{displayName}</h3>
					<p className="specialist-card__role">{formatRole(specialist?.memberType)}</p>
					<span className="specialist-card__cta">
						View profile
						<ArrowForwardOutlinedIcon className="specialist-card__cta-icon" aria-hidden />
					</span>
				</div>
			</Link>
		);
	}

	return (
		<Link href={detailHref} className="specialist-card">
			{heartButton}

			<div className="specialist-card__avatar-wrap">
				{hasPhoto ? (
					<img
						className="specialist-card__avatar"
						src={agentImage}
						alt={displayName}
						onError={() => setImageFailed(true)}
					/>
				) : (
					<div className="specialist-card__avatar specialist-card__avatar--placeholder" aria-hidden>
						<span>{getMemberInitial(displayName)}</span>
					</div>
				)}
			</div>

			<div className="specialist-card__body">
				<h3 className="specialist-card__name">{displayName}</h3>
				<p className="specialist-card__role">{formatRole(specialist?.memberType)}</p>
				<p className="specialist-card__bio">{bio}</p>

				{(rating || showListings) && (
					<div className="specialist-card__stats">
						{rating && (
							<span className="specialist-card__stat">
								<strong>{rating}</strong> rating
							</span>
						)}
						{showListings && (
							<span className="specialist-card__stat">
								<strong>{listingsCount}</strong>{' '}
								{listingsCount === 1 ? 'listing' : 'listings'}
							</span>
						)}
					</div>
				)}

				<span className="specialist-card__cta">View profile</span>
			</div>
		</Link>
	);
};

export default SpecialistListCard;
