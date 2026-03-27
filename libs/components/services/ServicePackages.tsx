import React from 'react';
import type { ServicePackageItem, ServicesBlockHeading } from '../../types/services/services.page';

export interface ServicePackagesProps {
	block: ServicesBlockHeading;
	items: ServicePackageItem[];
	onPackageCtaClick?: (pkg: ServicePackageItem) => void;
}

const ServicePackages: React.FC<ServicePackagesProps> = ({ block, items, onPackageCtaClick }) => {
	if (!items.length) return null;

	const [featured, ...rest] = items;

	return (
		<section className="pawpal-static-page__block pawpal-static-page__packages">
			<div className="pawpal-static-page__block-head">
				<h2>{block.heading}</h2>
				<p>{block.subheading}</p>
			</div>
			<div className="pawpal-static-page__packages-grid">
				<article className="pawpal-static-page__package pawpal-static-page__package--large">
					<img src={featured.image} alt={featured.title} />
					<div className="pawpal-static-page__package-content">
						<h3>{featured.title}</h3>
						<p>{featured.desc}</p>
						<div className="pawpal-static-page__package-foot">
							<strong>{featured.price}</strong>
							<button type="button" onClick={onPackageCtaClick ? () => onPackageCtaClick(featured) : undefined}>
								{featured.cta}
							</button>
						</div>
					</div>
				</article>

				<div className="pawpal-static-page__package-stack">
					{rest.map((pkg) => (
						<article key={pkg.title} className="pawpal-static-page__package">
							<img src={pkg.image} alt={pkg.title} />
							<div className="pawpal-static-page__package-content">
								<h3>{pkg.title}</h3>
								<p>{pkg.desc}</p>
								<div className="pawpal-static-page__package-foot">
									<strong>{pkg.price}</strong>
									<button type="button" onClick={onPackageCtaClick ? () => onPackageCtaClick(pkg) : undefined}>
										{pkg.cta}
									</button>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
};

export default ServicePackages;
