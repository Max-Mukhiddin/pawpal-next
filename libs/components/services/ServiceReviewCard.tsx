import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface ServiceReviewCardProps {
    comment: Comment;
}

const ServiceReviewCard: React.FC<ServiceReviewCardProps> = ({ comment }) => {
    const imagePath = resolveMemberImageUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');

    return (
        <div className="review-card-item">
            <div className="review-card-item__head">
                <img src={imagePath} alt="" className="review-card-item__avatar" />
                <div className="review-card-item__meta">
                    <span className="review-card-item__name">{comment.memberData?.memberNick}</span>
                    <span className="review-card-item__date">
                        <Moment format={'DD MMMM, YYYY'}>{comment.createdAt}</Moment>
                    </span>
                    <div className="review-card-item__stars" aria-label="5 stars">★★★★★</div>
                </div>
            </div>
            <p className="review-card-item__text">{comment.commentContent}</p>
        </div>
    );
};

export default ServiceReviewCard;