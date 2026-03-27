import React from 'react';
import type { ProductCardItem } from '../../types/products/products.page';

export interface ProductCardCompactProps {
	product: ProductCardItem;
}

const ProductCardCompact: React.FC<ProductCardCompactProps> = ({ product }) => (
	<article className="pawpal-static-page__product-card pawpal-static-page__product-card--compact">
		<div className="pawpal-static-page__product-media">
			<img src={product.image} alt={product.title} />
			<span className="pawpal-static-page__product-badge">{product.tag}</span>
		</div>
		<div className="pawpal-static-page__product-body">
			<h3 className="pawpal-static-page__product-title">{product.title}</h3>
			<p className="pawpal-static-page__product-desc">{product.description}</p>
			<div className="pawpal-static-page__product-foot">
				<strong className="pawpal-static-page__product-price">{product.price}</strong>
				<button type="button" className="pawpal-static-page__product-cta">
					{product.cta}
				</button>
			</div>
		</div>
	</article>
);

export default ProductCardCompact;
