import { useEffect } from 'react';
import { animate, eases, stagger } from 'animejs';

const SECTION_REVEAL_DURATION = 600;
const INTRO_REVEAL_DURATION = 680;
const SECTION_REVEAL_Y: [number, number] = [24, 0];
const SECTION_REVEAL_EASE = eases.outCubic;
const CARD_STAGGER_MS = 100;

/** Read a computed letter-spacing in px, or null when 'normal'/unavailable. */
const readLetterSpacingPx = (el: Element): number | null => {
	if (typeof window === 'undefined') return null;
	const raw = window.getComputedStyle(el).letterSpacing;
	if (!raw || raw === 'normal') return null;
	const px = parseFloat(raw);
	return Number.isFinite(px) ? px : null;
};

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Remove inline motion styles so transform layers don't paint above the nav. */
const clearMotionInlineStyles = (els: Element[]) => {
	els.forEach((el) => {
		const node = el as HTMLElement;
		node.style.removeProperty('transform');
		node.style.removeProperty('opacity');
		node.style.removeProperty('will-change');
	});
};

export type AnimeSectionRevealConfig = {
	sectionSelector: string;
	headerSelector?: string;
	ctaSelector?: string;
	cardSelector?: string;
	featuredSelector?: string;
	supportSelector?: string;
	pillarSelector?: string;
	deps?: unknown[];
};

/**
 * One-shot scroll reveal for a homepage section: headers/CTAs fade in first,
 * then cards ripple in with stagger. Headers use opacity-only (no translateY)
 * so text never gets a transform stacking context while scrolling under the nav.
 */
export function useAnimeSectionReveal({
	sectionSelector,
	headerSelector = '[data-section-reveal="header"]',
	ctaSelector = '[data-section-reveal="cta"]',
	cardSelector = '[data-section-reveal="card"]',
	featuredSelector,
	supportSelector,
	pillarSelector,
	deps = [],
}: AnimeSectionRevealConfig) {
	useEffect(() => {
		if (prefersReducedMotion()) return;

		const section = document.querySelector(sectionSelector);
		if (!section) return;

		const headerEls = Array.from(section.querySelectorAll(headerSelector));
		const ctaEls = Array.from(section.querySelectorAll(ctaSelector));
		const cardEls = Array.from(section.querySelectorAll(cardSelector));
		const featuredEls = featuredSelector ? Array.from(section.querySelectorAll(featuredSelector)) : [];
		const supportEls = supportSelector ? Array.from(section.querySelectorAll(supportSelector)) : [];
		const pillarEls = pillarSelector ? Array.from(section.querySelectorAll(pillarSelector)) : [];
		const introEls = [...headerEls, ...ctaEls];
		const editorialEls = [...featuredEls, ...supportEls, ...pillarEls];

		introEls.forEach((el) => {
			(el as HTMLElement).style.opacity = '0';
		});
		cardEls.forEach((el) => {
			(el as HTMLElement).style.opacity = '0';
		});
		editorialEls.forEach((el) => {
			const node = el as HTMLElement;
			node.style.opacity = '0';
			if (featuredEls.includes(el)) {
				node.style.transform = 'scale(0.98)';
			}
		});

		let revealed = false;

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting || revealed) return;
					revealed = true;

					if (introEls.length > 0) {
						animate(introEls, {
							opacity: [0, 1],
							duration: INTRO_REVEAL_DURATION,
							ease: SECTION_REVEAL_EASE,
							onComplete: () => clearMotionInlineStyles(introEls),
						});

						const eyebrowEls = Array.from(section.querySelectorAll('.pp-eyebrow'));
						eyebrowEls.forEach((el) => {
							const target = readLetterSpacingPx(el);
							if (target === null) return;
							animate(el, {
								letterSpacing: [`${(target * 0.5).toFixed(2)}px`, `${target}px`],
								duration: INTRO_REVEAL_DURATION + 120,
								ease: SECTION_REVEAL_EASE,
							});
						});
					}

					if (featuredEls.length > 0) {
						animate(featuredEls, {
							opacity: [0, 1],
							scale: [0.98, 1],
							duration: SECTION_REVEAL_DURATION,
							ease: SECTION_REVEAL_EASE,
							onComplete: () => clearMotionInlineStyles(featuredEls),
						});
					}

					if (supportEls.length > 0) {
						animate(supportEls, {
							translateY: SECTION_REVEAL_Y,
							opacity: [0, 1],
							duration: SECTION_REVEAL_DURATION,
							delay: 150,
							ease: SECTION_REVEAL_EASE,
							onComplete: () => clearMotionInlineStyles(supportEls),
						});
					}

					if (pillarEls.length > 0) {
						animate(pillarEls, {
							translateY: SECTION_REVEAL_Y,
							opacity: [0, 1],
							duration: SECTION_REVEAL_DURATION,
							delay: stagger(CARD_STAGGER_MS, { start: 350 }),
							ease: SECTION_REVEAL_EASE,
							onComplete: () => clearMotionInlineStyles(pillarEls),
						});
					}

					if (cardEls.length > 0) {
						animate(cardEls, {
							translateY: SECTION_REVEAL_Y,
							opacity: [0, 1],
							duration: SECTION_REVEAL_DURATION,
							delay: stagger(CARD_STAGGER_MS),
							ease: SECTION_REVEAL_EASE,
							onComplete: () => clearMotionInlineStyles(cardEls),
						});
					}

					io.disconnect();
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
		);

		io.observe(section);
		return () => io.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		sectionSelector,
		headerSelector,
		ctaSelector,
		cardSelector,
		featuredSelector,
		supportSelector,
		pillarSelector,
		...deps,
	]);
}
