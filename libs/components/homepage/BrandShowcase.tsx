import { useEffect, useRef, useState } from 'react';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';

const VIDEO_SRC = '/video/pawpal-care.mp4';
const POSTER_SRC = '/images/about/brand-showcase.jpg';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function BrandShowcase() {
	const mediaRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [loadVideo, setLoadVideo] = useState(false);
	const [useStaticPoster, setUseStaticPoster] = useState(false);

	useAnimeSectionReveal({ sectionSelector: '.pp-about' });

	useEffect(() => {
		if (prefersReducedMotion()) {
			setUseStaticPoster(true);
			return;
		}

		const node = mediaRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setLoadVideo(true);
					observer.disconnect();
				}
			},
			{ rootMargin: '120px 0px', threshold: 0.12 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!loadVideo || useStaticPoster) return;

		const video = videoRef.current;
		if (!video) return;

		video.src = VIDEO_SRC;
		video.load();
		void video.play().catch(() => {
			/* Autoplay blocked — poster remains visible */
		});
	}, [loadVideo, useStaticPoster]);

	return (
		<section className="pp-about pp-section" aria-label="About PawPal">
			<div className="pp-container pp-about__inner">
				<div className="pp-about__media" data-section-reveal="card" ref={mediaRef}>
					<div className="pp-about__video-wrap">
						{(useStaticPoster || !loadVideo) && (
							<img
								className="pp-about__poster"
								src={POSTER_SRC}
								alt=""
								loading="lazy"
								onError={(e) => {
									e.currentTarget.src = '/images/services/service-grooming.jpg';
								}}
							/>
						)}

						{loadVideo && !useStaticPoster ? (
							<video
								ref={videoRef}
								className="pp-about__video"
								autoPlay
								muted
								loop
								playsInline
								preload="none"
								poster={POSTER_SRC}
								aria-hidden
							/>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}
