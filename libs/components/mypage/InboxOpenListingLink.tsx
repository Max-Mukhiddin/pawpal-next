import React from 'react';
import Link from 'next/link';
import { Link as MuiLink, Stack } from '@mui/material';
import { getListingDetailHref } from '../../utils/inboxListingContext';

/** Small navigation link to the correct listing detail route. */
const InboxOpenListingLink: React.FC<{
	listingId: string;
	listingType?: string | null;
}> = ({ listingId, listingType }) => {
	const href = getListingDetailHref(listingId, listingType);
	if (!href) return null;

	return (
		<Stack sx={{ mt: 0.5 }}>
			<MuiLink
				component={Link}
				href={href}
				underline="hover"
				sx={{
					fontSize: 13,
					fontWeight: 600,
					color: 'var(--pp-primary)',
					width: 'fit-content',
					'&:hover': { color: 'var(--pp-primary-hover)' },
				}}
			>
				Open listing
			</MuiLink>
		</Stack>
	);
};

export default InboxOpenListingLink;
