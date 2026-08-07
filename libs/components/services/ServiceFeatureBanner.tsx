import React from 'react';

export interface ServiceFeatureBannerContent {
	title: string;
	description: string;
	chips: string[];
	ctaPrimary: string;
	ctaSecondary: string;
	image: string;
}

export interface ServiceFeatureBannerProps {
	data: ServiceFeatureBannerContent;
	onPrimaryClick?: () => void;
	onSecondaryClick?: () => void;
}

const ServiceFeatureBanner: React.FC<ServiceFeatureBannerProps> = ({
	data,
	onPrimaryClick,
	onSecondaryClick,
}) => (
	<section className="pawpal-products__feature-banner pawpal-services__feature-banner">
		<div className="pawpal-products__feature-media">
			<img src={data.image} alt="" />
		</div>
		<div className="pawpal-products__feature-content">
			<p className="pawpal-products__feature-kicker">Featured service</p>
			<h2>{data.title}</h2>
			<p>{data.description}</p>
			<div className="pawpal-products__feature-chips">
				{data.chips.map((c) => (
					<span key={c}>{c}</span>
				))}
			</div>
			<div className="pawpal-products__feature-actions">
				<button
					type="button"
					className="pawpal-products__feature-cta pawpal-products__feature-cta--primary"
					onClick={onPrimaryClick}
				>
					{data.ctaPrimary}
				</button>
				<button
					type="button"
					className="pawpal-products__feature-cta pawpal-products__feature-cta--secondary"
					onClick={onSecondaryClick}
				>
					{data.ctaSecondary}
				</button>
			</div>
		</div>
	</section>
);

export default ServiceFeatureBanner;
