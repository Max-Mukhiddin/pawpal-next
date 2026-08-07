/**
 * Clean listing description text for card display (strip markdown artifacts).
 */
export function sanitizeListingDescription(text?: string | null): string {
	if (!text) return '';

	let cleaned = String(text).trim();

	// Strip wrapping backticks from markdown-style inline code
	while (/^`+/.test(cleaned) && /`+$/.test(cleaned)) {
		cleaned = cleaned.replace(/^`+/, '').replace(/`+$/, '').trim();
	}

	// Lone leading/trailing backtick
	cleaned = cleaned.replace(/^`+/, '').replace(/`+$/, '').trim();

	return cleaned;
}
