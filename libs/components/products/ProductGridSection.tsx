import React from 'react';
import type { ProductCardItem, ProductsBlockHeading } from '../../types/products/products.page';
import ProductCardCompact from './ProductCardCompact';

export interface ProductGridSectionProps {
	block: ProductsBlockHeading;
	items: ProductCardItem[];
}

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ block, items }) => (
	<section className="pawpal-static-page__block pawpal-static-page__block--products-flat">
		<div className="pawpal-static-page__block-head pawpal-products__section-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-static-page__grid pawpal-static-page__grid--products pawpal-products__grid--dense">
			{items.map((product) => (
				<ProductCardCompact key={product.title} product={product} />
			))}
		</div>
	</section>
);

export default ProductGridSection;
