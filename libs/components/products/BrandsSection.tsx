import React from 'react';
import type { ProductsBlockHeading } from '../../types/products/products.page';

export interface BrandsSectionProps {
	block: ProductsBlockHeading;
	names: string[];
}

const BrandsSection: React.FC<BrandsSectionProps> = ({ block, names }) => (
	<section className="pawpal-products__brands">
		<div className="pawpal-static-page__block-head pawpal-products__section-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-products__brand-bubbles">
			{names.map((b) => (
				<span key={b} className="pawpal-products__brand-bubble">
					{b}
				</span>
			))}
		</div>
	</section>
);

export default BrandsSection;
