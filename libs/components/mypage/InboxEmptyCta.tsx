import React from 'react';
import Link from 'next/link';
import { Button, Stack } from '@mui/material';

export type InboxEmptyCtaVariant = 'myBookings' | 'agentBookings' | 'myInquiries' | 'agentInquiries';

const CTA: Record<InboxEmptyCtaVariant, { href: string; label: string }> = {
	myBookings: { href: '/services', label: 'Browse services' },
	agentBookings: { href: '/specialists', label: 'View specialists' },
	myInquiries: { href: '/products', label: 'Browse products' },
	agentInquiries: { href: '/services', label: 'Browse services' },
};

/** Single primary CTA under inbox empty states (existing app routes only). */
const InboxEmptyCta: React.FC<{ variant: InboxEmptyCtaVariant }> = ({ variant }) => {
	const { href, label } = CTA[variant];
	return (
		<Stack alignItems="center" sx={{ mt: 2 }}>
			<Button
				component={Link}
				href={href}
				variant="contained"
				size="small"
				sx={{
					textTransform: 'none',
					fontWeight: 600,
					background: '#eb6753',
					'&:hover': { background: '#d95a47' },
				}}
			>
				{label}
			</Button>
		</Stack>
	);
};

export default InboxEmptyCta;
