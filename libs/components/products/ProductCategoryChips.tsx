import React from 'react';
import type { ProductCategoryChipItem, ProductsBlockHeading } from '../../types/products/products.page';

export type ProductCategoryChipsVariant = 'default' | 'circle';

export interface ProductCategoryChipsProps {
	block: ProductsBlockHeading;
	items: ProductCategoryChipItem[];
	/** Extra section class names (e.g. pawpal-products__categories vs pawpal-products__explore-row). */
	sectionClassName: string;
	chipVariant?: ProductCategoryChipsVariant;
}

const ProductCategoryChips: React.FC<ProductCategoryChipsProps> = ({
	block,
	items,
	sectionClassName,
	chipVariant = 'default',
}) => (
	<section className={`pawpal-static-page__block pawpal-static-page__block--products-flat ${sectionClassName}`.trim()}>
		<div className="pawpal-static-page__block-head pawpal-products__section-head">
			<h2>{block.heading}</h2>
			<p>{block.subheading}</p>
		</div>
		<div className="pawpal-products__categories-row">
			{items.map((item) => (
				<span
					key={item.label}
					className={
						chipVariant === 'circle'
							? 'pawpal-static-page__chip pawpal-static-page__chip--circle'
							: 'pawpal-static-page__chip'
					}
				>
					<b>{item.icon}</b>
					{item.label}
				</span>
			))}
		</div>
	</section>
);

export default ProductCategoryChips;
