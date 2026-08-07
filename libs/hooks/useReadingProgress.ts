import { RefObject, useEffect, useState } from 'react';

/**
 * Scroll-linked reading progress (0–100) between article body start and end.
 * Tied directly to scroll position — no easing delay.
 */
export function useReadingProgress(
	startRef: RefObject<HTMLElement | null>,
	endRef: RefObject<HTMLElement | null>,
	enabled = true,
): number {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (!enabled) {
			setProgress(0);
			return;
		}

		const calc = () => {
			const startEl = startRef.current;
			const endEl = endRef.current;
			if (!startEl || !endEl) {
				setProgress(0);
				return;
			}

			const start = startEl.getBoundingClientRect().top + window.scrollY;
			const end = endEl.getBoundingClientRect().top + window.scrollY + endEl.offsetHeight;
			const range = Math.max(1, end - start - window.innerHeight * 0.25);
			const scrolled = window.scrollY - start + 80;
			const pct = Math.min(100, Math.max(0, (scrolled / range) * 100));
			setProgress(pct);
		};

		calc();
		window.addEventListener('scroll', calc, { passive: true });
		window.addEventListener('resize', calc, { passive: true });

		return () => {
			window.removeEventListener('scroll', calc);
			window.removeEventListener('resize', calc);
		};
	}, [enabled, startRef, endRef]);

	return progress;
}
