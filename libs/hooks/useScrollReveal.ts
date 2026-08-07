import { useEffect } from 'react';

/**
 * Reveals elements matching `selector` as they enter the viewport by adding the
 * `is-visible` class (one-shot). Content is visible by default in CSS; the
 * hidden/animated state is gated behind the `.pp-js` root class this hook adds
 * on mount, so SSR / no-JS / headless renders never ship blank.
 *
 * Presentation only — no data flow. Pass `deps` to re-scan after async content
 * (e.g. a list that renders once a query resolves) enters the DOM.
 */
export function useScrollReveal(selector: string, deps: unknown[] = []): void {
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add('pp-js');

		const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
		if (elements.length === 0) return;

		if (typeof IntersectionObserver === 'undefined') {
			elements.forEach((el) => el.classList.add('is-visible'));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selector, ...deps]);
}

export default useScrollReveal;
