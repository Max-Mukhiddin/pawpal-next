import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useFadeUpOnScroll } from '../../libs/hooks/useFadeUpOnScroll';
import type { SvgIconComponent } from '@mui/icons-material';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const HISTORY = [
	{
		year: '2022',
		image: '/img/listing/minjun_trainer_puppy-training.jpg',
		text: 'PawPal launched to help pet parents find trusted specialists and book care with confidence.',
	},
	{
		year: '2023',
		image: '/img/listing/haerin_vet_vaccine.jpg',
		text: 'We grew our specialist network and introduced guided booking so visits are easy to schedule.',
	},
	{
		year: '2024',
		image: '/img/listing/jiwoo_catcare_consult.jpg',
		text: 'The service catalog went live with clearer listings and stronger tools for questions and follow-ups.',
	},
	{
		year: '2025',
		image: '/img/listing/junho_groom_fullgroom.jpg',
		text: 'We scaled community support and follow-up care to help every pet stay on track after a visit.',
	},
];

/** Row1: DARK, LIGHT, DARK, LIGHT · Row2: LIGHT, DARK, LIGHT, LIGHT */
type FeatureTone = 'dark' | 'light';

const FEATURE_CARDS: {
	title: string;
	desc: string;
	tone: FeatureTone;
	Icon: SvgIconComponent;
}[] = [
	{
		title: 'Skilled Caregivers',
		desc: 'Hands-on specialists who know breed and temperament.',
		tone: 'dark',
		Icon: PeopleAltOutlinedIcon,
	},
	{
		title: 'Licensed Vets',
		desc: 'Clinical care you can trust for every life stage.',
		tone: 'light',
		Icon: HealthAndSafetyOutlinedIcon,
	},
	{
		title: 'Nutrition & Diet',
		desc: "Guidance that fits your pet's routine and needs.",
		tone: 'dark',
		Icon: RestaurantOutlinedIcon,
	},
	{
		title: 'Quality Products',
		desc: 'Curated essentials recommended by our network.',
		tone: 'light',
		Icon: Inventory2OutlinedIcon,
	},
	{
		title: 'Grooming Tips',
		desc: 'Practical advice for coats, nails, and calm visits.',
		tone: 'light',
		Icon: ContentCutOutlinedIcon,
	},
	{
		title: 'Emergency Help',
		desc: 'Clear next steps when something feels urgent.',
		tone: 'dark',
		Icon: WarningAmberOutlinedIcon,
	},
	{
		title: 'Safety First',
		desc: 'Background-checked pros and transparent standards.',
		tone: 'light',
		Icon: VerifiedUserOutlinedIcon,
	},
	{
		title: 'Thoughtful Service',
		desc: 'Communication that keeps you in the loop.',
		tone: 'light',
		Icon: ChatBubbleOutlineOutlinedIcon,
	},
];

/** Single warm pet portrait — not a collage */
const HERO_PHOTO = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const About: NextPage = () => {
	const { t } = useTranslation('common');
	const introRef = useFadeUpOnScroll<HTMLElement>();
	const featuresRef = useFadeUpOnScroll<HTMLElement>();
	const ctaRef = useFadeUpOnScroll<HTMLElement>();
	const historyRef = useRef<HTMLElement>(null);
	const [historyVisible, setHistoryVisible] = useState(false);

	useEffect(() => {
		if (prefersReducedMotion()) {
			setHistoryVisible(true);
			return;
		}

		const node = historyRef.current;
		if (!node) return;

		const reveal = () => setHistoryVisible(true);

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					reveal();
					observer.disconnect();
				}
			},
			{ threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
		);

		const rect = node.getBoundingClientRect();
		const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
		if (rect.height > 0 && visibleHeight / rect.height >= 0.18) {
			reveal();
			return;
		}

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<Stack className="about-page about-pawpal" component="div">
			{/* ── A. Hero intro ── */}
			<section ref={introRef} className="about-page__intro">
				<div className="about-page__intro-inner container">
					<header className="about-page__intro-head">
						<span className="about-page__intro-eyebrow">Our Promise</span>
						<h1 className="about-page__intro-title">
							Fully Committed To Your Pet&apos;s Well-Being
						</h1>
					</header>

					<div className="about-page__intro-row">
						<article className="about-page__intro-copy">
							<h2>Care built around pets and the people who love them</h2>
							<p>
								PawPal connects you with vetted specialists, clear communication, and services
								designed for every stage of your pet&apos;s life — so booking care feels calm,
								confident, and personal.
							</p>
						</article>
						<figure className="about-page__intro-photo">
							<img src={HERO_PHOTO} alt="Happy puppy" />
						</figure>
					</div>
				</div>
			</section>

			{/* ── B. Feature cards 4×2 ── */}
			<section ref={featuresRef} className="about-page__features" aria-label="What we stand for">
				<div className="about-page__features-inner container">
					<div className="about-page__features-grid">
						{FEATURE_CARDS.map(({ title, desc, tone, Icon }) => (
							<article
								key={title}
								className={`about-page__feature-card about-page__feature-card--${tone}`}
							>
								<span className="about-page__feature-icon" aria-hidden>
									<Icon fontSize="small" />
								</span>
								<strong>{title}</strong>
								<p>{desc}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* ── C. Milestones (closing beat before CTA) ── */}
			<section
				ref={historyRef}
				className={`about-page__history${historyVisible ? ' is-visible' : ''}`}
				aria-labelledby="about-milestones-title"
			>
				<div className="about-page__history-inner container">
					<header className="about-page__history-head">
						<span className="about-page__section-label">Our story</span>
						<h2 id="about-milestones-title">Milestones along the way</h2>
					</header>

					<div className="history-timeline">
						<div className="history-timeline__line" aria-hidden />
						<div className="history-track">
							{HISTORY.map((item, index) => (
								<article
									key={item.year}
									className="history-item"
									style={{ '--history-delay': `${index * 100}ms` } as React.CSSProperties}
								>
									<div className="history-item__media-wrap">
										<div className="history-item__media">
											<span className="history-item__year-pill">{item.year}</span>
											<img
												className="history-item__thumb"
												src={item.image}
												alt=""
												loading="lazy"
											/>
										</div>
									</div>
									<p className="history-item__text">{item.text}</p>
								</article>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── D. CTA banner ── */}
			<section ref={ctaRef} className="about-page__cta-band">
				<div className="about-page__cta-band-inner container">
					<div className="about-page__cta-banner">
						<div className="about-page__cta-copy">
							<h2>Ready to experience the difference?</h2>
							<p>Join our network of happy pets and parents today.</p>
						</div>
						<Link href="/service" className="about-page__cta-btn">
							{t('Learn More')}
						</Link>
					</div>
				</div>
			</section>
		</Stack>
	);
};

export default withLayoutBasic(About);
