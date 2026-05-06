import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface SpecialistReviewCardProps {
	comment: Comment;
}

/** Specialist profile review row; uses `.review-card` for agent detail SCSS. */
const SpecialistReviewCard: React.FC<SpecialistReviewCardProps> = ({ comment }) => {
	const device = useDeviceDetect();
	const imagePath: string = resolveMemberImageUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');

	if (device === 'mobile') {
		return <div>REVIEW CARD</div>;
	}

	return (
		<Box component={'div'} className={'review-card'}>
			<div className={'info'}>
				<div className={'left'}>
					<img src={imagePath} alt="" />
					<div>
						<strong>{comment.memberData?.memberNick}</strong>
						<span>
							<Moment format={'DD MMMM'}>{comment.createdAt}</Moment>
						</span>
					</div>
				</div>
			</div>
			<p>{comment.commentContent}</p>
		</Box>
	);
};

export default SpecialistReviewCard;
