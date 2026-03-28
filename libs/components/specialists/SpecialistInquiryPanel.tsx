import React from 'react';
import { Button, Stack, Typography } from '@mui/material';

/** Consultation / booking inquiry block (standalone card; complements agent detail layout). */
const SpecialistInquiryPanel: React.FC = () => (
	<Stack
		sx={{
			width: '100%',
			maxWidth: 400,
			p: 3,
			borderRadius: '12px',
			background: '#fff',
			boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)',
			border: '1px solid rgba(24, 26, 32, 0.06)',
			alignSelf: { xs: 'stretch', md: 'flex-start' },
		}}
	>
		<Typography sx={{ fontSize: 17, fontWeight: 600, color: '#181a20', mb: 0.5 }}>Consultation & booking</Typography>
		<Typography sx={{ fontSize: 13, color: '#717171', lineHeight: 1.6, mb: 2 }}>
			Request a call or session with this specialist. Share your pet’s needs and preferred times—we’ll follow up from here.
		</Typography>
		<Stack spacing={1.5} component="div">
			<Stack spacing={0.5} component="div">
				<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Your name</Typography>
				<input
					type="text"
					placeholder="Full name"
					style={{
						width: '100%',
						padding: '12px 14px',
						borderRadius: 8,
						border: '1px solid #ddd',
						fontSize: 14,
						boxSizing: 'border-box',
					}}
				/>
			</Stack>
			<Stack spacing={0.5} component="div">
				<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Phone</Typography>
				<input
					type="text"
					placeholder="Best number to reach you"
					style={{
						width: '100%',
						padding: '12px 14px',
						borderRadius: 8,
						border: '1px solid #ddd',
						fontSize: 14,
						boxSizing: 'border-box',
					}}
				/>
			</Stack>
			<Stack spacing={0.5} component="div">
				<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Email</Typography>
				<input
					type="text"
					placeholder="hello@pawpal.com"
					style={{
						width: '100%',
						padding: '12px 14px',
						borderRadius: 8,
						border: '1px solid #ddd',
						fontSize: 14,
						boxSizing: 'border-box',
					}}
				/>
			</Stack>
			<Stack spacing={0.5} component="div">
				<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>What do you need?</Typography>
				<textarea
					placeholder="e.g. grooming for a anxious rescue, or a nutrition consult."
					style={{
						width: '100%',
						minHeight: 88,
						padding: '12px 14px',
						borderRadius: 8,
						border: '1px solid #ddd',
						fontSize: 14,
						resize: 'vertical',
						boxSizing: 'border-box',
					}}
				/>
			</Stack>
			<Button
				variant="contained"
				sx={{
					mt: 1,
					py: 1.25,
					borderRadius: '12px',
					textTransform: 'none',
					fontWeight: 600,
					background: '#eb6753',
					'&:hover': { background: '#d95a47' },
				}}
			>
				Send booking inquiry
			</Button>
		</Stack>
	</Stack>
);

export default SpecialistInquiryPanel;
