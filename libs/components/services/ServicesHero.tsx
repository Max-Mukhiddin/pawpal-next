import React from 'react';
import type { ServicesHeroContent } from '../../types/services/services.page';

export interface ServicesHeroProps {
	data: ServicesHeroContent;
	onPrimaryClick?: () => void;
	onSecondaryClick?: () => void;
}

const ServicesHero: React.FC<ServicesHeroProps> = ({ data, onPrimaryClick, onSecondaryClick }) => (
	<section className="pawpal-static-page__hero">
		<div className="pawpal-static-page__hero-content">
			<p className="pawpal-static-page__eyebrow">{data.eyebrow}</p>
			<h1 className="pawpal-static-page__title">{data.title}</h1>
			<p className="pawpal-static-page__lead">{data.lead}</p>
			<div className="pawpal-static-page__hero-actions">
				<button
					type="button"
					className="pawpal-static-page__hero-btn pawpal-static-page__hero-btn--primary"
					onClick={onPrimaryClick}
				>
					{data.primaryCta}
				</button>
				<button
					type="button"
					className="pawpal-static-page__hero-btn pawpal-static-page__hero-btn--secondary"
					onClick={onSecondaryClick}
				>
					{data.secondaryCta}
				</button>
			</div>
		</div>
		<div className="pawpal-static-page__hero-media" aria-hidden>
			<img src={data.mediaImageSrc} alt={data.mediaImageAlt} />
		</div>
	</section>
);

export default ServicesHero;
