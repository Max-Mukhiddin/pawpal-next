import React from 'react';
import type { ProductTrustItem } from '../../types/products/products.page';

export interface ProductsTrustRowProps {
	items: ProductTrustItem[];
}

const ProductsTrustRow: React.FC<ProductsTrustRowProps> = ({ items }) => (
	<section className="pawpal-products__trust-row">
		<div className="pawpal-products__trust-grid">
			{items.map((item) => (
				<div key={item.title} className="pawpal-products__trust-item">
					<strong>{item.title}</strong>
					<span>{item.text}</span>
				</div>
			))}
		</div>
	</section>
);

export default ProductsTrustRow;
