import React from 'react';
import type { ServiceCategoryItem, ServicesBlockHeading } from '../../types/services/services.page';

export interface ServiceCategoriesProps {
	block: ServicesBlockHeading;
	items: ServiceCategoryItem[];
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ block, items }) => (
	<section className="pawpal-static-page__block pawpal-static-page__block--soft">
		<div className="pawpal-static-page__block-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-static-page__chips">
			{items.map((item) => (
				<span key={item.label} className="pawpal-static-page__chip">
					<b>{item.icon}</b>
					{item.label}
				</span>
			))}
		</div>
	</section>
);

export default ServiceCategories;
