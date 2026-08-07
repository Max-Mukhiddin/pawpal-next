const BRAND_LOGOS = [
	{ name: 'Petco', src: '/img/brands/petco.svg' },
	{ name: 'Chewy', src: '/img/brands/chewy.svg' },
	{ name: 'Royal Canin', src: '/img/brands/royal-canin.svg' },
	{ name: 'Purina', src: '/img/brands/purina.svg' },
	{ name: "Hill's Science Diet", src: '/img/brands/hills-science-diet.svg' },
	{ name: 'VCA', src: '/img/brands/vca.svg' },
	{ name: 'Banfield', src: '/img/brands/banfield.svg' },
] as const;

export default function TrustMarquee() {
	const track = [...BRAND_LOGOS, ...BRAND_LOGOS];

	return (
		<section className="pp-trust-marquee" aria-label="Trusted pet brands">
			<div className="pp-trust-marquee__viewport">
				<div className="pp-trust-marquee__fade pp-trust-marquee__fade--left" aria-hidden />
				<div className="pp-trust-marquee__fade pp-trust-marquee__fade--right" aria-hidden />
				<div className="pp-trust-marquee__track">
					{track.map((brand, i) => (
						<img
							key={`${brand.name}-${i}`}
							className="pp-trust-marquee__logo"
							src={brand.src}
							alt={brand.name}
							width={160}
							height={32}
							loading="lazy"
							decoding="async"
						/>
					))}
				</div>
			</div>
		</section>
	);
}
