import React from 'react';
import Link from 'next/link';
import { Button, Stack } from '@mui/material';

export type InboxEmptyCtaVariant =
	| 'myBookings'
	| 'agentBookings'
	| 'specialistBookings'
	| 'myInquiries'
	| 'agentInquiries'
	| 'specialistInquiries';

const CTA: Record<InboxEmptyCtaVariant, { href: string; label: string }> = {
	myBookings: { href: '/service', label: 'Browse services' },
	agentBookings: { href: '/specialist', label: 'View specialists' },
	specialistBookings: { href: '/specialist', label: 'View specialists' },
	myInquiries: { href: '/product', label: 'Browse products' },
	agentInquiries: { href: '/service', label: 'Browse services' },
	specialistInquiries: { href: '/service', label: 'Browse services' },
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
					background: 'var(--pp-primary)',
					color: 'var(--pp-honey)',
					'&:hover': { background: 'var(--pp-primary-hover)' },
				}}
			>
				{label}
			</Button>
		</Stack>
	);
};

export default InboxEmptyCta;
