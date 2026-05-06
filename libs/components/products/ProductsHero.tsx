import React from 'react';

/** Shared image hero style for product catalog. */
const ProductsHero: React.FC = () => (
	<section className="catalog-image-hero catalog-image-hero--products">
		<div className="catalog-image-hero__bg" aria-hidden />
		<div className="catalog-image-hero__content">
			<h1 className="catalog-image-hero__title">Everyday Essentials for Your Pet</h1>
			<p className="catalog-image-hero__crumb">Home / Products</p>
		</div>
	</section>
);

export default ProductsHero;
