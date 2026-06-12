import React from 'react';
import Link from 'next/link';

interface HeroBreadcrumbProps {
	current: string;
	homeHref?: string;
	homeLabel?: string;
}

/** Breadcrumb row for photo heroes (header-basic & catalog-image-hero). */
const HeroBreadcrumb = ({ current, homeHref = '/', homeLabel = 'Home' }: HeroBreadcrumbProps) => (
	<nav className="breadcrumb" aria-label="Breadcrumb">
		<ol className="breadcrumb__list">
			<li className="breadcrumb__item">
				<Link href={homeHref} className="breadcrumb__link">
					{homeLabel}
				</Link>
			</li>
			<li className="breadcrumb__item breadcrumb__item--sep" aria-hidden="true">
				<span className="breadcrumb__sep">/</span>
			</li>
			<li className="breadcrumb__item breadcrumb__item--current" aria-current="page">
				<span className="breadcrumb__current">{current}</span>
			</li>
		</ol>
	</nav>
);

export default HeroBreadcrumb;
