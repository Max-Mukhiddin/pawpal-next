import React from 'react';

/** Catalog intro for `/products` listing — text-first PawPal tone, no marketing composition. */
const ProductsHero: React.FC = () => (
	<section className="pawpal-static-page__hero products-hero products-hero--catalog">
		<div className="pawpal-static-page__hero-content">
			<p className="pawpal-static-page__eyebrow">PawPal shop</p>
			<h1 className="pawpal-static-page__title">Everyday essentials for happier pets</h1>
			<p className="pawpal-static-page__lead">
				Quality food, gear, and care picks curated for real homes with dogs and cats.
			</p>
		</div>
	</section>
);

export default ProductsHero;
