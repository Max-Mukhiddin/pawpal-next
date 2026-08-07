import { RefObject, useEffect, useState } from 'react';
import type { ArticleTocItem } from '../utils/articleContentHelpers';

/**
 * Highlights the TOC entry whose heading is nearest the top of the viewport.
 */
export function useArticleTocSpy(
	contentRootRef: RefObject<HTMLElement | null>,
	headings: ArticleTocItem[],
	enabled = true,
): string | null {
	const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

	useEffect(() => {
		if (!enabled || headings.length === 0) {
			setActiveId(null);
			return;
		}

		const root = contentRootRef.current;
		if (!root) return;

		const elements = headings
			.map((h) => root.querySelector<HTMLElement>(`#${CSS.escape(h.id)}`))
			.filter((el): el is HTMLElement => Boolean(el));

		if (elements.length === 0) return;

		const onScroll = () => {
			const offset = 120;
			let current: string | null = headings[0]?.id ?? null;

			for (const el of elements) {
				const top = el.getBoundingClientRect().top;
				if (top <= offset) {
					current = el.id;
				}
			}

			setActiveId(current);
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, [contentRootRef, enabled, headings]);

	return activeId;
}
