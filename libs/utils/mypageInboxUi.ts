/** Shared list card shell for mypage inquiry / booking rows */
export const inboxListCardSx = {
	p: 2,
	mb: 2.5,
	border: '1px solid #ebebeb',
	borderRadius: '8px',
	background: '#fff',
} as const;

export const inboxEmptyHintSx = {
	fontSize: 14,
	color: '#717171',
	lineHeight: 1.5,
	mt: 1,
	maxWidth: 420,
	mx: 'auto',
	textAlign: 'center' as const,
};

export const inboxSectionLabelSx = {
	fontSize: 12,
	fontWeight: 700,
	color: '#717171',
	textTransform: 'uppercase' as const,
	letterSpacing: 0.6,
	mb: 1,
};

export const inboxActionsBlockSx = {
	mt: 2,
	pt: 2,
	borderTop: '1px solid #ebebeb',
};
