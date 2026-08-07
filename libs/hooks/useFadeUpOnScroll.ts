import { useEffect, useRef } from 'react';
import { animate, cubicBezier } from 'animejs';

export const FADE_UP_DURATION = 900;
export const FADE_UP_EASE = cubicBezier(0.16, 1, 0.3, 1);
export const FADE_UP_TRANSLATE_Y: [number, number] = [40, 0];

export type FadeUpOptions = {
	delay?: number;
	duration?: number;
	scale?: [number, number];
};

/**
 * Shared fade-up motion used by scroll reveals and above-the-fold hero entrances.
 */
export const fadeUp = (
	target: Element | NodeListOf<Element> | string,
	options?: FadeUpOptions,
) => {
	const { delay = 0, duration = FADE_UP_DURATION, scale } = options ?? {};
	const targets = Array.from(
		typeof target === 'string'
			? document.querySelectorAll(target)
			: target instanceof NodeList
				? Array.from(target)
				: [target],
	);
	return animate(target, {
		translateY: FADE_UP_TRANSLATE_Y,
		opacity: [0, 1],
		...(scale ? { scale: [...scale] } : {}),
		duration,
		delay,
		ease: FADE_UP_EASE,
		onComplete: () => {
			targets.forEach((el) => {
				const node = el as HTMLElement;
				node.style.removeProperty('transform');
				node.style.removeProperty('will-change');
				// Keep final opacity inline — hero `.is-armed { opacity: 0 }` would re-hide
				// content if we strip the animated opacity value on complete.
				node.style.opacity = '1';
			});
		},
	});
};

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Subtle fade-up reveal for SECTION ROOTS only (never per-card).
 * Uses the project's anime.js v4 `animate()` API (same as HeroSection).
 * Respects prefers-reduced-motion and never leaves content hidden if motion
 * is disabled.
 */
export const useFadeUpOnScroll = <T extends HTMLElement>(options?: FadeUpOptions & { immediate?: boolean }) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (prefersReducedMotion()) return;

		if (options?.immediate) {
			el.style.opacity = '0';
			fadeUp(el, options);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						fadeUp(el, options);
						io.unobserve(el);
					}
				});
			},
			{ threshold: 0.15 },
		);

		el.style.opacity = '0';
		io.observe(el);

		return () => io.disconnect();
	}, [options?.delay, options?.duration, options?.immediate, options?.scale]);

	return ref;
};
