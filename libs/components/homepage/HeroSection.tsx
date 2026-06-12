import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const HERO_SLIDES = [
	{ src: '/images/hero/pawpal-hero-1.jpg', alt: 'Veterinarian caring for a dog' },
	{ src: '/images/hero/pawpal-hero-2.jpg', alt: 'Pet parent training a dog' },
	{ src: '/images/hero/pawpal-hero-3.jpg', alt: 'Pet groomer styling a dog' },
] as const;

const STATS = [
	{ value: '562+', label: 'Happy pets' },
	{ value: '250+', label: 'Specialists' },
	{ value: '4.9', label: 'Average rating' },
	{ value: '100%', label: 'Positive reviews' },
] as const;

const AUTOPLAY_MS = 4000;

export default function HeroSection() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const total = HERO_SLIDES.length;

	const goTo = useCallback(
		(next: number) => {
			setActiveIndex(((next % total) + total) % total);
		},
		[total],
	);

	useEffect(() => {
		if (isPaused) return;
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % total);
		}, AUTOPLAY_MS);
		return () => clearInterval(interval);
	}, [isPaused, total, activeIndex]);

	return (
		<section className="hero-pawpal" aria-labelledby="hero-pawpal-title">
			<div className="hero-pawpal__shell">
				<div className="hero-pawpal__frame">
					<div className="hero-pawpal__card">
						<div
							className="hero-pawpal__banner"
							onMouseEnter={() => setIsPaused(true)}
							onMouseLeave={() => setIsPaused(false)}
						>
							<div className="hero-pawpal__media" aria-hidden="true">
								{HERO_SLIDES.map((slide, i) => (
									<img
										key={slide.src}
										className={`hero-pawpal__img ${i === activeIndex ? 'is-active' : ''}`}
										src={slide.src}
										alt=""
										loading={i === 0 ? 'eager' : 'lazy'}
									/>
								))}
								<div className="hero-pawpal__overlay" />
							</div>

							<div className="hero-pawpal__inner">
								<div className="hero-pawpal__content">
									<h1 id="hero-pawpal-title" className="hero-pawpal__title">
										World-Class Care for Your Best Friend
									</h1>
									<div className="hero-pawpal__actions">
										<Link href="/service" className="hero-pawpal__btn hero-pawpal__btn--primary">
											Book Now
										</Link>
										<Link href="/about" className="hero-pawpal__btn hero-pawpal__btn--ghost">
											Learn More
										</Link>
									</div>
								</div>
							</div>

							<div className="hero-pawpal__stats" role="list">
								{STATS.map((s) => (
									<div key={s.label} className="hero-pawpal__stat" role="listitem">
										<strong className="hero-pawpal__stat-value">{s.value}</strong>
										<span className="hero-pawpal__stat-label">{s.label}</span>
									</div>
								))}
							</div>

							<div className="hero-pawpal__dots" role="tablist" aria-label="Hero slide indicators">
								{HERO_SLIDES.map((_, i) => (
									<button
										key={i}
										type="button"
										role="tab"
										aria-selected={i === activeIndex}
										aria-label={`Go to slide ${i + 1}`}
										className={`hero-pawpal__dot ${i === activeIndex ? 'is-active' : ''}`}
										onClick={() => goTo(i)}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
