import React from 'react';
import { Button, Dialog, DialogContent, Divider } from '@mui/material';

const infoRows = [
	{ icon: '⏱', text: 'Review takes up to 24 hours' },
	{ icon: '📧', text: "We'll notify you once approved" },
	{ icon: '✅', text: 'You can login and track your status' },
];

export interface SpecialistApplicationDialogProps {
	open: boolean;
	onClose: () => void;
}

/** "Application Submitted!" confirmation — shared by the join page and the specialists CTA. */
const SpecialistApplicationDialog: React.FC<SpecialistApplicationDialogProps> = ({ open, onClose }) => (
	<Dialog
		open={open}
		onClose={onClose}
		maxWidth="sm"
		fullWidth
		PaperProps={{ sx: { borderRadius: '16px' } }}
	>
		<DialogContent>
			<div style={{ padding: '40px', textAlign: 'center' }}>
				<div
					style={{
						width: 80,
						height: 80,
						background: 'var(--pp-primary-soft)',
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '40px',
						margin: '0 auto',
					}}
				>
					🐾
				</div>

				<p
					style={{
						fontSize: '24px',
						fontWeight: 700,
						marginTop: '16px',
						marginBottom: 0,
						color: '#181A20',
					}}
				>
					Application Submitted!
				</p>

				<p style={{ color: '#666', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
					We&apos;re reviewing your specialist profile
				</p>

				<Divider sx={{ my: '24px' }} />

				<div style={{ textAlign: 'left', marginBottom: '28px' }}>
					{infoRows.map((row) => (
						<div
							key={row.text}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								padding: '8px 0',
							}}
						>
							<span style={{ fontSize: '20px', lineHeight: 1 }}>{row.icon}</span>
							<span style={{ fontSize: '14px', color: '#333' }}>{row.text}</span>
						</div>
					))}
				</div>

				<Button
					fullWidth
					onClick={onClose}
					sx={{
						background: 'var(--pp-primary)',
						color: 'var(--pp-honey)',
						borderRadius: '50px',
						padding: '12px 0',
						fontSize: '15px',
						fontWeight: 600,
						textTransform: 'none',
						'&:hover': { background: 'var(--pp-primary-hover)' },
					}}
				>
					Got it!
				</Button>
			</div>
		</DialogContent>
	</Dialog>
);

export default SpecialistApplicationDialog;
