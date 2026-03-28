import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';

export interface SpecialistProfileSummaryProps {
	specialist: Member | null;
	onOpenMemberProfile: (memberId: string) => void;
}

/** Hero row + PawPal bio and activity stats; reuses `.agent-info` image/title styles from agent detail SCSS. */
const SpecialistProfileSummary: React.FC<SpecialistProfileSummaryProps> = ({ specialist, onOpenMemberProfile }) => {
	if (!specialist) return null;

	return (
		<Stack className={'agent-info'}>
			<img
				src={specialist?.memberImage ? `${REACT_APP_API_URL}/${specialist.memberImage}` : '/img/profile/defaultUser.svg'}
				alt=""
				onClick={() => onOpenMemberProfile(specialist._id)}
				style={{ cursor: 'pointer' }}
			/>
			<Stack sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
				<Box component={'div'} className={'info'} onClick={() => onOpenMemberProfile(specialist._id)}>
					<strong>{specialist?.memberFullName ?? specialist?.memberNick}</strong>
					<Typography sx={{ mt: 0.5, fontSize: 14, color: '#717171', fontWeight: 500 }}>PawPal specialist</Typography>
					<div>
						<img src="/img/icons/call.svg" alt="" />
						<span>{specialist?.memberPhone}</span>
					</div>
				</Box>
				<Typography sx={{ mt: 2, fontSize: 14, lineHeight: 1.65, color: '#181a20', maxWidth: 720 }}>
					{specialist?.memberDesc?.trim()
						? specialist.memberDesc
						: 'This specialist partners with PawPal to offer thoughtful, pet-first care. Message them to discuss your companion’s needs.'}
				</Typography>
				<Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberProperties}</strong> active {specialist.memberProperties === 1 ? 'listing' : 'listings'}
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberViews}</strong> profile views
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#181a20' }}>
						<strong>{specialist.memberLikes}</strong> client likes
					</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default SpecialistProfileSummary;
