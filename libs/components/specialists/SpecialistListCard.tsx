import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { T } from '../../types/common';

export interface SpecialistListCardProps {
	specialist: Member;
	onLike: (user: T, id: string) => Promise<void>;
}

/** Specialist directory card; reuses `.agent-general-card` styling; opens PawPal specialist detail. */
const SpecialistListCard: React.FC<SpecialistListCardProps> = ({ specialist, onLike }) => {
	const user = useReactiveVar(userVar);
	const imagePath: string = specialist?.memberImage
		? `${REACT_APP_API_URL}/${specialist.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<Stack className="agent-general-card">
			<Link
				href={{
					pathname: '/specialists/detail',
					query: { id: specialist?._id },
				}}
			>
				<Box
					component={'div'}
					className={'agent-img'}
					style={{
						backgroundImage: `url(${imagePath})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
					}}
				>
					<div>
						{specialist?.memberProperties} {specialist?.memberProperties === 1 ? 'listing' : 'listings'}
					</div>
				</Box>
			</Link>

			<Stack className={'agent-desc'}>
				<Box component={'div'} className={'agent-info'}>
					<Link
						href={{
							pathname: '/specialists/detail',
							query: { id: specialist?._id },
						}}
					>
						<strong>{specialist?.memberFullName ?? specialist?.memberNick}</strong>
					</Link>
					<span>Specialist</span>
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
