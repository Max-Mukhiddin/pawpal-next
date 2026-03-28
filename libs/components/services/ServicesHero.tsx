import React from 'react';

/** PawPal services catalog hero — text-first, matches static page rhythm. */
const ServicesHero: React.FC = () => (
	<section className="pawpal-static-page__hero services-hero services-hero--catalog">
		<div className="pawpal-static-page__hero-content">
			<p className="pawpal-static-page__eyebrow">PawPal services</p>
			<h1 className="pawpal-static-page__title">Find the right care for your pet</h1>
			<p className="pawpal-static-page__lead">
				Browse trusted grooming, training, and wellness options from specialists who put pets first.
			</p>
		</div>
	</section>
);

export default ServicesHero;
