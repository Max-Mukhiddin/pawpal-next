import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { fadeUp } from '../../hooks/useFadeUpOnScroll';
import { useHeroSearchAutocomplete } from '../../hooks/useHeroSearchAutocomplete';
import HeroSearchDropdown from './HeroSearchDropdown';

/**
 * Five verified, in-codebase pet lifestyle photos. Two-layer stacked crossfade
 * (all slides mounted, opacity-toggled) — avoids the flash/flicker of
 * key-remounting and keeps every transition on the GPU (opacity + transform only).
 */
const HERO_SLIDES = [
	{ src: '/images/hero/pawpal-hero.jpg', focus: '38% 42%' },
	{ src: '/images/hero/pawpal-hero-2.jpg', focus: '50% 40%' },
	{ src: '/images/hero/pawpal-hero-3.jpg', focus: '50% 38%' },
	{ src: '/images/hero/pawpal-hero-1.jpg', focus: '50% 42%' },
	{ src: '/img/listing/haerin_vet_checkup.jpg', focus: '50% 30%' },
] as const;

const HERO_BG_FALLBACK = '/images/hero/pawpal-hero-1.jpg';

const HERO_ENTRANCE = [
	{ selector: '.pp-hero__eyebrow', delay: 0 },
	{ selector: '.pp-hero__line--1', delay: 80 },
	{ selector: '.pp-hero__line--2', delay: 180 },
	{ selector: '.pp-hero__sub', delay: 260 },
	{ selector: '.pp-hero__specialist-btn', delay: 320 },
	{ selector: '.pp-hero__search', delay: 400 },
] as const;

const HERO_ENTRANCE_DURATION = 410;
const SLIDE_DURATION = 5500;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroSection() {
	const { t } = useTranslation('common');
	const router = useRouter();
	const heroRef = useRef<HTMLElement>(null);
	const bgRef = useRef<HTMLDivElement>(null);
	const searchWrapRef = useRef<HTMLDivElement>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeResultIndex, setActiveResultIndex] = useState(-1);
	const [activeSlideIndex, setActiveSlideIndex] = useState(0);
	const [reduced, setReduced] = useState(false);
	const listboxId = 'pp-hero-search-listbox';

	const {
		groups,
		flatItems,
		loading,
		showDropdown,
		hasMore,
		seeAllHref,
		close,
		setOpen,
	} = useHeroSearchAutocomplete(searchQuery);

	useEffect(() => {
		setActiveResultIndex(-1);
	}, [searchQuery, groups]);

	useEffect(() => {
		if (!showDropdown) return;

		const onPointerDown = (event: MouseEvent) => {
			if (!searchWrapRef.current?.contains(event.target as Node)) {
				close();
			}
		};

		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [showDropdown, close]);

	useEffect(() => {
		const hero = heroRef.current;
		const stage = hero?.closest('.pp-hero-stage');
		hero?.classList.toggle('is-search-open', showDropdown);
		stage?.classList.toggle('is-search-open', showDropdown);
		return () => {
			hero?.classList.remove('is-search-open');
			stage?.classList.remove('is-search-open');
		};
	}, [showDropdown]);

	// Content entrance + idle breathe arming
	useEffect(() => {
		const hero = heroRef.current;
		if (!hero) return;

		if (prefersReducedMotion()) {
			setReduced(true);
			return;
		}

		hero.classList.add('is-armed');

		HERO_ENTRANCE.forEach(({ selector, delay }) => {
			const el = hero.querySelector(selector);
			if (!el) return;
			fadeUp(el, {
				delay,
				duration: HERO_ENTRANCE_DURATION,
			});
		});

		const maxEntranceDelay = Math.max(...HERO_ENTRANCE.map(({ delay }) => delay));
		const revealDoneTimer = setTimeout(() => {
			hero.classList.remove('is-armed');
		}, maxEntranceDelay + HERO_ENTRANCE_DURATION + 80);

		const breatheTimer = setTimeout(() => hero.classList.add('is-breathing'), 1200);
		return () => {
			clearTimeout(revealDoneTimer);
			clearTimeout(breatheTimer);
		};
	}, []);

	// Pure auto-rotation — setInterval loops indefinitely, no user controls.
	useEffect(() => {
		if (reduced) return;

		const interval = setInterval(() => {
			setActiveSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
		}, SLIDE_DURATION);

		return () => clearInterval(interval);
	}, [reduced]);

	// Subtle background parallax — desktop only, transform-only, rAF-throttled.
	useEffect(() => {
		if (reduced) return;
		if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches)
			return;
		const bg = bgRef.current;
		const hero = heroRef.current;
		if (!bg || !hero) return;

		let raf = 0;
		const update = () => {
			raf = 0;
			const rect = hero.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) return;
			const offset = Math.max(-40, Math.min(40, -rect.top * 0.08));
			bg.style.transform = `translate3d(0, ${offset}px, 0)`;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [reduced]);

	const goToSpecialists = () => {
		void router.push('/specialist');
	};

	const handleResultSelect = () => {
		close();
		setSearchQuery('');
	};

	const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!showDropdown) {
			if (event.key === 'Escape') {
				close();
			}
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}

		if (flatItems.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActiveResultIndex((prev) => (prev + 1) % flatItems.length);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActiveResultIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
			return;
		}

		if (event.key === 'Enter' && activeResultIndex >= 0) {
			event.preventDefault();
			const item = flatItems[activeResultIndex];
			if (item) {
				close();
				void router.push(item.href);
			}
		}
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (showDropdown && activeResultIndex >= 0 && flatItems[activeResultIndex]) {
			void router.push(flatItems[activeResultIndex].href);
			close();
			return;
		}
		if (searchQuery.trim()) {
			void router.push(seeAllHref);
			close();
			return;
		}
		goToSpecialists();
	};

	return (
		<section
			className={`pp-hero${showDropdown ? ' is-search-open' : ''}`}
			aria-labelledby="hero-pawpal-title"
			ref={heroRef}
		>
			<div className="pp-hero__bg" aria-hidden ref={bgRef}>
				<div className="pp-hero__slides">
					{HERO_SLIDES.map((slide, i) => (
						<div
							key={slide.src}
							className={`pp-hero__slide${i === activeSlideIndex ? ' is-active' : ''}`}
						>
							<img
								className="pp-hero__slide-img"
								src={slide.src}
								alt=""
								loading={i === 0 ? 'eager' : 'lazy'}
								style={{ objectPosition: slide.focus }}
								onError={(e) => {
									e.currentTarget.src = HERO_BG_FALLBACK;
								}}
							/>
						</div>
					))}
				</div>
				<div className="pp-hero__bg-scrim" />
			</div>

			<div className="pp-hero__inner">
				<div className="pp-hero__content">
					<span className="pp-hero__eyebrow">{t('hero.eyebrow')}</span>

					<h1 id="hero-pawpal-title" className="pp-hero__title">
						<span className="pp-hero__line pp-hero__line--1">{t('hero.title.line1')}</span>
						<span className="pp-hero__line pp-hero__line--2">{t('hero.title.line2')}</span>
					</h1>

					<p className="pp-hero__sub">{t('hero.subtitle')}</p>

					<div className="pp-hero__search-wrap" ref={searchWrapRef}>
						<button
							type="button"
							className="pp-hero__specialist-btn"
							onClick={goToSpecialists}
						>
							{t('hero.ctaSpecialist')}
							<ArrowForwardOutlinedIcon aria-hidden />
						</button>

						<form className="pp-hero__search" onSubmit={handleSearchSubmit}>
							<SearchOutlinedIcon className="pp-hero__search-icon" aria-hidden />
							<input
								type="search"
								className="pp-hero__search-input"
								placeholder={t('hero.searchPlaceholder')}
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setOpen(true);
								}}
								onFocus={() => {
									if (searchQuery.trim().length >= 2) setOpen(true);
								}}
								onKeyDown={handleSearchKeyDown}
								aria-label={t('hero.searchPlaceholder')}
								aria-expanded={showDropdown}
								aria-controls={showDropdown ? listboxId : undefined}
								aria-autocomplete="list"
								role="combobox"
								autoComplete="off"
							/>
							<button type="submit" className="pp-hero__search-btn" aria-label={t('hero.searchSubmit')}>
								<ArrowForwardOutlinedIcon fontSize="small" aria-hidden />
							</button>
						</form>

						{showDropdown ? (
							<HeroSearchDropdown
								query={searchQuery.trim()}
								groups={groups}
								loading={loading}
								activeIndex={activeResultIndex}
								hasMore={hasMore}
								seeAllHref={seeAllHref}
								onSelect={handleResultSelect}
								listboxId={listboxId}
							/>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}
