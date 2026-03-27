import React from 'react';
import type { FeaturedSpecialistSection } from '../../types/specialists/specialists.page';

export interface FeaturedSpecialistProps {
	data: FeaturedSpecialistSection;
}

const FeaturedSpecialist: React.FC<FeaturedSpecialistProps> = ({ data }) => (
	<section className="pawpal-static-page__block pawpal-static-page__block--feature">
		<div className="pawpal-static-page__block-head">
			<h2>{data.block.heading}</h2>
			<p>{data.block.subheading}</p>
		</div>
		<article className="pawpal-static-page__card">
			<h3>{data.name}</h3>
			<p>{data.bio}</p>
		</article>
	</section>
);

export default FeaturedSpecialist;
