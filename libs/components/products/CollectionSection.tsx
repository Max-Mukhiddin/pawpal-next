import React from 'react';
import type { ProductCollectionBlock } from '../../types/products/products.page';
import ProductCardCompact from './ProductCardCompact';

export interface CollectionSectionProps {
	collection: ProductCollectionBlock;
}

const CollectionSection: React.FC<CollectionSectionProps> = ({ collection }) => (
	<section className="pawpal-products__collection" aria-label={collection.ariaLabel}>
		<div className="pawpal-products__collection-head">
			<h2>{collection.heading}</h2>
			<button type="button" className="pawpal-products__collection-view">
				View all
			</button>
		</div>
		<div className="pawpal-products__collection-grid">
			<article className="pawpal-products__collection-promo">
				<img src={collection.promo.image} alt="" aria-hidden />
				<div className="pawpal-products__collection-promo-content">
					<h3>{collection.promo.title}</h3>
					<p>{collection.promo.description}</p>
					<button type="button">{collection.promo.cta}</button>
				</div>
			</article>
			<div className="pawpal-products__collection-products">
				{collection.products.map((product) => (
					<ProductCardCompact key={product.title} product={product} />
				))}
			</div>
		</div>
	</section>
);

export default CollectionSection;
