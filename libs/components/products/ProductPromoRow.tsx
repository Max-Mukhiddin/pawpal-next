import React from 'react';
import type { ProductPromoItem } from '../../types/products/products.page';

export interface ProductPromoRowProps {
	items: ProductPromoItem[];
}

const ProductPromoRow: React.FC<ProductPromoRowProps> = ({ items }) => (
	<section className="pawpal-products__promo-row">
		{items.map((promo) => (
			<article
				key={promo.title}
				className={`pawpal-products__promo-card pawpal-products__promo-card--${promo.tone}`}
			>
				<div className="pawpal-products__promo-media" aria-hidden>
					<img src={promo.image} alt="" />
				</div>
				<div className="pawpal-products__promo-content">
					<h2>{promo.title}</h2>
					<p>{promo.description}</p>
					<button type="button" className="pawpal-products__promo-cta">
						{promo.cta}
					</button>
				</div>
			</article>
		))}
	</section>
);

export default ProductPromoRow;
