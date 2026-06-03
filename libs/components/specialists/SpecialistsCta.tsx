import React from 'react';

interface CtaData {
	title: string;
	lead: string;
	primaryCta: string;
}

interface SpecialistsCtaProps {
	data: CtaData;
	onPrimaryClick?: () => void;
}

const SpecialistsCta: React.FC<SpecialistsCtaProps> = ({ data, onPrimaryClick }) => (
	<section className="pawpal-static-page__cta">
		<h2>{data.title}</h2>
		<p>{data.lead}</p>
		<div className="pawpal-static-page__cta-actions">
			<button type="button" onClick={onPrimaryClick}>
				{data.primaryCta}
			</button>
		</div>
	</section>
);

export default SpecialistsCta;
