import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 20;

/**
 * Persistent fixed bottom vignette — ambient depth at the viewport edge.
 * pointer-events: none so FAB, links, and toasts stay fully interactive.
 *
 * Homepage: hidden at scrollY === 0 so the hero loads unobstructed.
 * Site-wide: fades out when the footer enters the viewport so the
 * footer is never obscured at the end of the page.
 */
export default function BottomVignette() {
	const router = useRouter();
	const isHome = router.pathname === '/';
	const [atTop, setAtTop] = useState<boolean | null>(null);
	const [atBottom, setAtBottom] = useState(false);

	useEffect(() => {
		if (!isHome) {
			setAtTop(false);
			return;
		}

		const update = () => {
			setAtTop(window.scrollY <= SCROLL_THRESHOLD);
		};

		update();
		window.addEventListener('scroll', update, { passive: true });
		return () => window.removeEventListener('scroll', update);
	}, [isHome]);

	useEffect(() => {
		let observer: IntersectionObserver | null = null;
		let observed: Element | null = null;
		let cancelled = false;

		const attach = () => {
			if (cancelled) return;
			const footer = document.getElementById('footer') ?? document.querySelector('footer.footer-pawpal');
			if (!footer) {
				requestAnimationFrame(attach);
				return;
			}

			observed = footer;
			observer = new IntersectionObserver(
				([entry]) => {
					setAtBottom(Boolean(entry?.isIntersecting));
				},
				{
					root: null,
					// Expand root bottom so we fade ~260px before the footer fully enters
					rootMargin: '0px 0px 260px 0px',
					threshold: 0,
				},
			);
			observer.observe(footer);
		};

		attach();

		const onRoute = () => {
			setAtBottom(false);
			observer?.disconnect();
			observer = null;
			observed = null;
			requestAnimationFrame(attach);
		};

		router.events.on('routeChangeComplete', onRoute);
		return () => {
			cancelled = true;
			observer?.disconnect();
			if (observed) observed = null;
			router.events.off('routeChangeComplete', onRoute);
		};
	}, [router.events, router.pathname]);

	const hiddenAtTop = isHome && atTop !== false;
	const hidden = hiddenAtTop || atBottom;

	return (
		<div
			className={`pp-bottom-vignette${hidden ? ' pp-bottom-vignette--hidden' : ''}`}
			aria-hidden
		/>
	);
}
