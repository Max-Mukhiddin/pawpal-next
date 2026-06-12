import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface ProductReviewCardProps {
    comment: Comment;
}

const ProductReviewCard: React.FC<ProductReviewCardProps> = ({ comment }) => {
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const imagePath = resolveMemberImageUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');

    const goMemberPage = (id: string) => {
        if (id === user?._id) router.push('/mypage');
        else router.push(`/member?memberId=${id}`);
    };

    return (
        <div className="review-card-item">
            <div className="review-card-item__head">
                <img src={imagePath} alt="" className="review-card-item__avatar" />
                <div className="review-card-item__meta">
                    <span
                        className="review-card-item__name"
                        onClick={() => goMemberPage(comment?.memberData?._id as string)}
                        style={{ cursor: 'pointer' }}
                    >
                        {comment.memberData?.memberNick}
                    </span>
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

export default ProductReviewCard;