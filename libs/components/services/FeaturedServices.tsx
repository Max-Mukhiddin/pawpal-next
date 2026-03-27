import React from 'react';
import type { FeaturedServiceItem, ServicesBlockHeading } from '../../types/services/services.page';

export interface FeaturedServicesProps {
	block: ServicesBlockHeading;
	items: FeaturedServiceItem[];
	onCardFabClick?: (service: FeaturedServiceItem) => void;
	onCardCtaClick?: (service: FeaturedServiceItem) => void;
}

const FeaturedServices: React.FC<FeaturedServicesProps> = ({
	block,
	items,
	onCardFabClick,
	onCardCtaClick,
}) => (
	<section className="pawpal-static-page__block pawpal-static-page__featured">
		<div className="pawpal-static-page__block-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-static-page__grid">
			{items.map((service) => (
				<article key={service.title} className="pawpal-static-page__card">
					<div className="pawpal-static-page__card-media">
						<img src={service.image} alt={service.title} />
						<button
							type="button"
							className="pawpal-static-page__card-fab"
							aria-label={`Open ${service.title}`}
							onClick={onCardFabClick ? () => onCardFabClick(service) : undefined}
						>
							↗
						</button>
						<div className="pawpal-static-page__card-overlay">
							<h3>{service.title}</h3>
							<p>{service.desc}</p>
							<span className="pawpal-static-page__card-meta">{service.meta}</span>
						</div>
					</div>
					<button
						type="button"
						className="pawpal-static-page__card-cta"
						onClick={onCardCtaClick ? () => onCardCtaClick(service) : undefined}
					>
						{service.cta}
					</button>
				</article>
			))}
		</div>
	</section>
);

export default FeaturedServices;
