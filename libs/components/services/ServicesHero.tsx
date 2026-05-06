import React from 'react';

/** Shared image hero style for service catalog. */
const ServicesHero: React.FC = () => (
	<section className="catalog-image-hero catalog-image-hero--services">
		<div className="catalog-image-hero__bg" aria-hidden />
		<div className="catalog-image-hero__content">
			<h1 className="catalog-image-hero__title">Find the Right Care for Your Pet</h1>
			<p className="catalog-image-hero__crumb">Home / Services</p>
		</div>
	</section>
);

export default ServicesHero;
