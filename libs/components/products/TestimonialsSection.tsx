import React from 'react';
import type { ProductTestimonialItem, ProductsBlockHeading } from '../../types/products/products.page';

export interface TestimonialsSectionProps {
	block: ProductsBlockHeading;
	items: ProductTestimonialItem[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ block, items }) => (
	<section className="pawpal-products__testimonials">
		<div className="pawpal-static-page__block-head pawpal-products__section-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-products__testimonials-grid">
			{items.map((t) => (
				<article key={t.name} className="pawpal-products__review-card">
					<div className="pawpal-products__review-top">
						<span className="pawpal-products__review-rating" aria-hidden>
							{t.rating}
						</span>
						<span className="pawpal-products__review-paw" aria-hidden>
							Paw
						</span>
					</div>
					<p>{t.text}</p>
					<strong>
						{t.name} <span>{t.role}</span>
					</strong>
				</article>
			))}
		</div>
	</section>
);

export default TestimonialsSection;
