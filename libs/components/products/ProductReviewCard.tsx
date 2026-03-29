import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import { REACT_APP_API_URL } from '../../config';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

export interface ProductReviewCardProps {
	comment: Comment;
}

/** Product detail review row; keeps `.review-config` tree for shared detail SCSS. */
const ProductReviewCard: React.FC<ProductReviewCardProps> = ({ comment }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	return (
		<Stack className={'review-config'} role="article" aria-label="Product review">
			<Stack className={'review-mb-info'}>
				<Stack className={'img-name-box'}>
					<img src={imagePath} alt="" className={'img-box'} />
					<Stack>
						<Typography className={'name'} onClick={() => goMemberPage(comment?.memberData?._id as string)}>
							{comment.memberData?.memberNick}
						</Typography>
						<Typography className={'date'}>
							<Moment format={'DD MMMM, YYYY'}>{comment.createdAt}</Moment>
						</Typography>
						<Typography sx={{ fontSize: 11, color: '#717171', mt: 0.25, fontWeight: 400, lineHeight: 1.3 }}>
							Shopper review for this product
						</Typography>
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'desc-box'}>
				<Typography className={'description'}>{comment.commentContent}</Typography>
			</Stack>
		</Stack>
	);
};

export default ProductReviewCard;
