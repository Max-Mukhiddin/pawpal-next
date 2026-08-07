/** Collapse whitespace for card copy. */
export function normalizeCardText(text?: string | null): string {
	return String(text ?? '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Truncate at the last word boundary before maxChars (JS safety net; CSS line-clamp is primary). */
export function truncateAtWordBoundary(
	text: string | undefined | null,
	maxChars: number,
	ellipsis = '…',
): string {
	const plain = normalizeCardText(text);
	if (!plain || plain.length <= maxChars) return plain;

	const slice = plain.slice(0, maxChars);
	const lastSpace = slice.lastIndexOf(' ');
	const cut =
		lastSpace > Math.floor(maxChars * 0.45)
			? slice.slice(0, lastSpace)
			: slice.trimEnd();

	return `${cut}${ellipsis}`;
}
