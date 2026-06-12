import React from 'react';
import HeroBreadcrumb from '../common/HeroBreadcrumb';

/** Shared image hero style for service catalog. */
const ServicesHero: React.FC = () => (
	<section className="catalog-image-hero catalog-image-hero--services">
		<div className="catalog-image-hero__bg" aria-hidden />
		<div className="catalog-image-hero__content">
			<h1 className="catalog-image-hero__title">Find the Right Care for Your Pet</h1>
			<HeroBreadcrumb current="Services" />
		</div>
	</section>
);

export default ServicesHero;
