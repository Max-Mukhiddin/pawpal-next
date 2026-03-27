import React from 'react';
import type { SpecialistsHeroContent } from '../../types/specialists/specialists.page';

export interface SpecialistsHeroProps {
	data: SpecialistsHeroContent;
}

const SpecialistsHero: React.FC<SpecialistsHeroProps> = ({ data }) => (
	<section className="pawpal-static-page__hero">
		<div className="pawpal-static-page__hero-content">
			<p className="pawpal-static-page__eyebrow">{data.eyebrow}</p>
			<h1 className="pawpal-static-page__title">{data.title}</h1>
			<p className="pawpal-static-page__lead">{data.lead}</p>
		</div>
	</section>
);

export default SpecialistsHero;
