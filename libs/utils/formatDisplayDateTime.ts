import moment from 'moment';

/** Readable inbox timestamp, e.g. Sep 21, 2026 · 14:30 */
export function formatDisplayDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	const m = moment(iso);
	return m.isValid() ? m.format('MMM D, YYYY · HH:mm') : '—';
}
