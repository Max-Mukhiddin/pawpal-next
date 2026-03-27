import React from 'react';
import type { ServicesCtaContent } from '../../types/services/services.page';

export interface ServicesCtaProps {
	data: ServicesCtaContent;
	onPrimaryClick?: () => void;
	onSecondaryClick?: () => void;
}

const ServicesCta: React.FC<ServicesCtaProps> = ({ data, onPrimaryClick, onSecondaryClick }) => (
	<section className="pawpal-static-page__cta">
		<h2>{data.title}</h2>
		<p>{data.lead}</p>
		<div className="pawpal-static-page__cta-actions">
			<button type="button" onClick={onPrimaryClick}>
				{data.primaryCta}
			</button>
			<button type="button" className="pawpal-static-page__cta-secondary" onClick={onSecondaryClick}>
				{data.secondaryCta}
			</button>
		</div>
	</section>
);

export default ServicesCta;
