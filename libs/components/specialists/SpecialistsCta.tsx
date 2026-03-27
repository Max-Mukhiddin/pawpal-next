import React from 'react';
import type { SpecialistsCtaContent } from '../../types/specialists/specialists.page';

export interface SpecialistsCtaProps {
	data: SpecialistsCtaContent;
}

const SpecialistsCta: React.FC<SpecialistsCtaProps> = ({ data }) => (
	<section className="pawpal-static-page__cta">
		<h2>{data.title}</h2>
		<p>{data.lead}</p>
		<button type="button">{data.primaryCta}</button>
	</section>
);

export default SpecialistsCta;
