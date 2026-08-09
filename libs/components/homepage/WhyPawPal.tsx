/**
 * Why PawPal — horizontal stat / value strip (distinct from About page icon grid).
 */

import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';

/** Landscape puppies — entropy crop keeps subjects in frame (avoids tall-box cover cropping to green bokeh). */
const PROMISE_IMAGE =
	'https://images.unsplash.com/photo-1546238232-20216dec9f72?fm=jpg&q=80&w=1200&h=800&fit=crop&crop=entropy';
const PROMISE_IMAGE_WIDTH = 1200;
const PROMISE_IMAGE_HEIGHT = 800;

/** Ids + tone are static; copy is resolved per-locale inside the component. */
const STAT_IDS = [
	{ id: 'vetted', tone: 'honey' as const },
	{ id: 'pricing', tone: 'forest' as const },
	{ id: 'insured', tone: 'forest' as const },
	{ id: 'booking', tone: 'honey' as const },
] as const;

export default function WhyPawPal() {
	const { t } = useTranslation('common');

	const stats = useMemo(
		() =>
			STAT_IDS.map(({ id, tone }) => ({
				id,
				tone,
				value: t(`whyPawpal.stats.${id}.value`),
				label: t(`whyPawpal.stats.${id}.label`),
				detail: t(`whyPawpal.stats.${id}.detail`),
			})),
		[t],
	);

	useAnimeSectionReveal({
		sectionSelector: '.pp-why',
		supportSelector: '[data-section-reveal="support"]',
	});

	return (
		<section className="pp-why pp-section" aria-labelledby="why-pawpal-title">
			<div className="pp-container pp-why__inner">
				<div className="pp-why__header pp-section-head centered" data-section-reveal="header">
					<span className="pp-eyebrow">{t('whyPawpal.eyebrow')}</span>
					<h2 id="why-pawpal-title" className="pp-heading pp-why__title">
						{t('whyPawpal.heading')}
					</h2>
				</div>

				<div className="pp-why__strip" role="list" data-section-reveal="card">
					{stats.map((stat, index) => (
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
						<span className="pp-eyebrow pp-why-promise__eyebrow">{t('whyPawpal.promise.eyebrow')}</span>
						<h3 className="pp-why-promise__title">{t('whyPawpal.promise.title')}</h3>
						<p className="pp-why-promise__lead">{t('whyPawpal.promise.lead')}</p>
						<Link href="/specialist" className="pp-btn pp-why-promise__cta">
							{t('whyPawpal.promise.cta')}
						</Link>
					</div>
					<div className="pp-why-promise__media" data-section-reveal="card">
						<img
							src={PROMISE_IMAGE}
							alt={t('whyPawpal.promise.imageAlt')}
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
