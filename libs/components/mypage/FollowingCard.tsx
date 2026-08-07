import React from 'react';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Member } from '../../types/member/member';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { getMemberTypeLabel } from '../../utils/memberDisplay';
import { MemberType } from '../../enums/member.enum';

export interface FollowingCardProps {
	member: Member;
	isFollowing: boolean;
	onCardClick: () => void;
	onFollowToggle: (e: React.MouseEvent) => void;
	showFollowAction?: boolean;
}

const formatRole = (memberType?: string): string => {
	if (memberType === MemberType.AGENT) return getMemberTypeLabel(MemberType.AGENT);
	return 'Pet Owner';
};

const FollowingCard: React.FC<FollowingCardProps> = ({
	member,
	isFollowing,
	onCardClick,
	onFollowToggle,
	showFollowAction = true,
}) => {
	const imagePath = resolveMemberImageUrl(member?.memberImage, '/img/profile/defaultUser.svg');
	const isDefaultAvatar = imagePath.includes('defaultUser');

	return (
		<article className="following-card" onClick={onCardClick} role="presentation">
			<img
				className={`following-card__photo${isDefaultAvatar ? ' following-card__photo--default' : ''}`}
				src={imagePath}
				alt={member?.memberNick || 'Member'}
			/>
			<div className="following-card__body">
				<h3 className="following-card__name">{member?.memberNick || 'Member'}</h3>
				<span className="following-card__role">{formatRole(member?.memberType)}</span>
				<div className="following-card__stats">
					<span>
						<PeopleOutlineIcon fontSize="inherit" aria-hidden />
						{member?.memberFollowers ?? 0} followers
					</span>
					<span>
						<ArticleOutlinedIcon fontSize="inherit" aria-hidden />
						{member?.memberArticles ?? 0} articles
					</span>
				</div>
			</div>
			{showFollowAction ? (
				<div className="following-card__actions">
					<button
						type="button"
						className={`pp-btn pp-btn--ghost following-card__btn${isFollowing ? ' following-card__btn--following' : ''}`}
						onClick={onFollowToggle}
					>
						{isFollowing ? (
							<>
								<PersonRemoveOutlinedIcon fontSize="small" aria-hidden />
								Following
							</>
						) : (
							<>
								<PersonAddOutlinedIcon fontSize="small" aria-hidden />
								Follow
							</>
						)}
					</button>
				</div>
			) : null}
		</article>
	);
};

export default FollowingCard;
