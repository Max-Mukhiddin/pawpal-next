/**
 * Why PawPal — horizontal stat / value strip (distinct from About page icon grid).
 */

import Link from 'next/link';
import React from 'react';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';

/** Landscape puppies — entropy crop keeps subjects in frame (avoids tall-box cover cropping to green bokeh). */
const PROMISE_IMAGE =
	'https://images.unsplash.com/photo-1546238232-20216dec9f72?fm=jpg&q=80&w=1200&h=800&fit=crop&crop=entropy';
const PROMISE_IMAGE_WIDTH = 1200;
const PROMISE_IMAGE_HEIGHT = 800;

const STATS = [
	{
		id: 'vetted',
		value: '100%',
		label: 'Vetted specialists',
		detail: 'Background-checked and verified before they join PawPal.',
		tone: 'honey' as const,
	},
	{
		id: 'pricing',
		value: 'Clear',
		label: 'Transparent pricing',
		detail: 'Upfront rates — no surprise fees at checkout.',
		tone: 'forest' as const,
	},
	{
		id: 'insured',
		value: 'Insured',
		label: 'Every visit covered',
		detail: 'Safety protocols and coverage for peace of mind.',
		tone: 'forest' as const,
	},
	{
		id: 'booking',
		value: 'Same-day',
		label: 'Easy booking',
		detail: 'Schedule care when you need it, from any device.',
		tone: 'honey' as const,
	},
] as const;

export default function WhyPawPal() {
	useAnimeSectionReveal({
		sectionSelector: '.pp-why',
		supportSelector: '[data-section-reveal="support"]',
	});

	return (
		<section className="pp-why pp-section" aria-labelledby="why-pawpal-title">
			<div className="pp-container pp-why__inner">
				<div className="pp-why__header pp-section-head centered" data-section-reveal="header">
					<span className="pp-eyebrow">Why PawPal</span>
					<h2 id="why-pawpal-title" className="pp-heading pp-why__title">
						The difference is in the details
					</h2>
				</div>

				<div className="pp-why__strip" role="list" data-section-reveal="card">
					{STATS.map((stat, index) => (
						<div key={stat.id} className="pp-why__stat" role="listitem">
							{index > 0 ? <span className="pp-why__divider" aria-hidden /> : null}
							<div className="pp-why__stat-body">
								<p className={`pp-why__value pp-why__value--${stat.tone}`}>{stat.value}</p>
								<p className="pp-why__label">{stat.label}</p>
								<p className="pp-why__detail">{stat.detail}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="pp-why-promise">
				<div className="pp-container pp-why-promise__grid">
					<div className="pp-why-promise__copy" data-section-reveal="support">
						<span className="pp-eyebrow pp-why-promise__eyebrow">Our promise</span>
						<h3 className="pp-why-promise__title">Care That Feels Like Family</h3>
						<p className="pp-why-promise__lead">
							PawPal is built around people who treat your pet like their own — vetted specialists, thoughtful
							follow-up, and a community that stays with you between visits. Every booking is a relationship, not a
							transaction.
						</p>
						<Link href="/specialist" className="pp-btn pp-why-promise__cta">
							Meet our specialists
						</Link>
					</div>
					<div className="pp-why-promise__media" data-section-reveal="card">
						<img
							src={PROMISE_IMAGE}
							alt="Golden retriever puppies playing together"
							width={PROMISE_IMAGE_WIDTH}
							height={PROMISE_IMAGE_HEIGHT}
							loading="eager"
							decoding="async"
							{...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
