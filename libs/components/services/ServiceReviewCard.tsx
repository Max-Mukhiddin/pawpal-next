import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface ServiceReviewCardProps {
	comment: Comment;
}

const ServiceReviewCard: React.FC<ServiceReviewCardProps> = ({ comment }) => {
	const imagePath: string = resolveMemberImageUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');

	return (
		<Stack className={'service-review-card'}>
			<Stack className={'service-review-card__head'}>
				<img src={imagePath} alt="" className={'service-review-card__avatar'} />
				<Stack>
					<Typography className={'service-review-card__name'}>{comment.memberData?.memberNick}</Typography>
					<Typography className={'service-review-card__date'}>
						<Moment format={'DD MMMM, YYYY'}>{comment.createdAt}</Moment>
					</Typography>
					<Typography sx={{ fontSize: 11, color: '#717171', mt: 0.25 }}>PawPal service review</Typography>
				</Stack>
			</Stack>
			<Typography className={'service-review-card__content'}>{comment.commentContent}</Typography>
		</Stack>
	);
};

export default ServiceReviewCard;
