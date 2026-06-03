import React from 'react';
import type { ProductsCtaContent } from '../../types/products/products.page';

export interface ProductsCtaProps {
	data: ProductsCtaContent;
	onPrimaryClick?: () => void;
	onSecondaryClick?: () => void;
}

const ProductsCta: React.FC<ProductsCtaProps> = ({ data, onPrimaryClick, onSecondaryClick }) => (
	<section className="pawpal-static-page__cta">
		<h2>{data.title}</h2>
		<p>{data.lead}</p>
		<div className="pawpal-static-page__cta-actions">
			<button type="button" onClick={onPrimaryClick}>{data.primaryCta}</button>
			<button type="button" className="pawpal-static-page__cta-secondary" onClick={onSecondaryClick}>
				{data.secondaryCta}
			</button>
		</div>
	</section>
);

export default ProductsCta;
