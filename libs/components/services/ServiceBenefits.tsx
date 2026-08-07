import React from 'react';
import type { ServiceBenefitItem, ServicesBlockHeading } from '../../types/services/services.page';

export interface ServiceBenefitsProps {
	block: ServicesBlockHeading;
	items: ServiceBenefitItem[];
}

const ServiceBenefits: React.FC<ServiceBenefitsProps> = ({ block, items }) => (
	<section className="pawpal-static-page__block pawpal-static-page__benefits">
		<div className="pawpal-static-page__block-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-static-page__benefits-grid">
			{items.map((benefit, index) => (
				<article key={benefit.title} className="pawpal-static-page__benefit">
					<span className="pawpal-static-page__benefit-icon" aria-hidden>
						{String(index + 1).padStart(2, '0')}
					</span>
					<h3>{benefit.title}</h3>
					<p>{benefit.text}</p>
				</article>
			))}
		</div>
	</section>
);

export default ServiceBenefits;
