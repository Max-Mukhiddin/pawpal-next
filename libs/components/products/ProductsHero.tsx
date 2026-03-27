import React from 'react';
import type { ProductsHeroContent } from '../../types/products/products.page';

export interface ProductsHeroProps {
	data: ProductsHeroContent;
}

const ProductsHero: React.FC<ProductsHeroProps> = ({ data }) => (
	<section className="pawpal-static-page__hero">
		<div className="pawpal-static-page__hero-content">
			<p className="pawpal-static-page__eyebrow">{data.eyebrow}</p>
			<h1 className="pawpal-static-page__title">{data.title}</h1>
			<p className="pawpal-static-page__lead">{data.lead}</p>
			<div className="pawpal-static-page__hero-actions">
				<button type="button" className="pawpal-static-page__hero-btn pawpal-static-page__hero-btn--primary">
					{data.primaryCta}
				</button>
				<button type="button" className="pawpal-static-page__hero-btn pawpal-static-page__hero-btn--secondary">
					{data.secondaryCta}
				</button>
			</div>
		</div>
		<div className="pawpal-static-page__hero-media" aria-hidden>
			<img src={data.mediaImageSrc} alt={data.mediaImageAlt} />
		</div>
	</section>
);

export default ProductsHero;
