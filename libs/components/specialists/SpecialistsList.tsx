import React from 'react';
import type { SpecialistsListSection } from '../../types/specialists/specialists.page';

export interface SpecialistsListProps {
	data: SpecialistsListSection;
}

const SpecialistsList: React.FC<SpecialistsListProps> = ({ data }) => (
	<section className="pawpal-static-page__block">
		<div className="pawpal-static-page__block-head">
			<h2>{data.block.heading}</h2>
			<p>{data.block.subheading}</p>
		</div>
		<div className="pawpal-static-page__list">
			{data.items.map((member) => (
				<article key={member.name} className="pawpal-static-page__list-item">
					<div>
						<h3>{member.name}</h3>
						<p>{member.role}</p>
					</div>
					<span>{data.availabilityLabel}</span>
				</article>
			))}
		</div>
	</section>
);

export default SpecialistsList;
