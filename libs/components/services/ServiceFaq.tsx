import React from 'react';
import type { ServicesFaqSection } from '../../types/services/services.page';

export interface ServiceFaqProps {
	data: ServicesFaqSection;
}

const ServiceFaq: React.FC<ServiceFaqProps> = ({ data }) => (
	<section className="pawpal-static-page__block pawpal-static-page__faq">
		<div className="pawpal-static-page__block-head">
			<h2>{data.block.heading}</h2>
			<p>{data.block.subheading}</p>
		</div>
		<div className="pawpal-static-page__faq-grid">
			<div className="pawpal-static-page__faq-list">
				{data.items.map((item) => (
					<details key={item.question} className="pawpal-static-page__faq-item">
						<summary>{item.question}</summary>
						<p>{item.answer}</p>
					</details>
				))}
			</div>
			<div className="pawpal-static-page__faq-media" aria-hidden>
				<img src={data.mediaImageSrc} alt={data.mediaImageAlt} />
			</div>
		</div>
	</section>
);

export default ServiceFaq;
