import React from 'react';
import type { ProductFeatureBannerContent } from '../../types/products/products.page';

export interface ProductFeatureBannerProps {
	data: ProductFeatureBannerContent;
}

const ProductFeatureBanner: React.FC<ProductFeatureBannerProps> = ({ data }) => (
	<section className="pawpal-products__feature-banner" aria-hidden>
		<div className="pawpal-products__feature-media">
			<img src={data.image} alt="" />
		</div>
		<div className="pawpal-products__feature-content">
			<p className="pawpal-products__feature-kicker">Featured pack</p>
			<h2>{data.title}</h2>
			<p>{data.description}</p>
			<div className="pawpal-products__feature-chips">
				{data.chips.map((c) => (
					<span key={c}>{c}</span>
				))}
			</div>
			<div className="pawpal-products__feature-actions">
				<button type="button" className="pawpal-products__feature-cta pawpal-products__feature-cta--primary">
					{data.ctaPrimary}
				</button>
				<button type="button" className="pawpal-products__feature-cta pawpal-products__feature-cta--secondary">
					{data.ctaSecondary}
				</button>
			</div>
		</div>
	</section>
);

export default ProductFeatureBanner;
