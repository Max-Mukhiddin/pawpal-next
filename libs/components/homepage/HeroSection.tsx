import Link from 'next/link';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

const HERO_IMG = '/images/hero/pawpal-hero.jpg';

const AVATAR_IMAGES = [
	'/images/services/service-grooming.jpg',
	'/images/services/service-walking.jpg',
	'/images/services/service-training.jpg',
] as const;

const STATS = [
	{ value: '562+', label: 'Happy pets' },
	{ value: '250+', label: 'Specialists' },
	{ value: '100%', label: 'Positive reviews' },
] as const;

function HeroBadge() {
	return (
		<div className="hero-pawpal__badge">
			<svg
				className="hero-pawpal__badge-svg"
				viewBox="0 0 100 100"
				aria-hidden
			>
				<defs>
					<path
						id="hero-pawpal-badge-arc"
						d="M 14 50a36 36 0 1 1 72 0"
						fill="none"
					/>
				</defs>
				<circle className="hero-pawpal__badge-disk" cx="50" cy="50" r="48" />
				<text className="hero-pawpal__badge-ring-text" fill="currentColor">
					<textPath
						href="#hero-pawpal-badge-arc"
						startOffset="50%"
						textAnchor="middle"
					>
						PAWPAL · TRUSTED CARE
					</textPath>
				</text>
				<circle className="hero-pawpal__badge-inner" cx="50" cy="52" r="17" />
			</svg>
			<span className="hero-pawpal__badge-icon" aria-hidden>
				<KeyboardArrowDownOutlinedIcon />
			</span>
		</div>
	);
}

export default function HeroSection() {
	return (
		<section className="hero-pawpal" aria-labelledby="hero-pawpal-title">
			<div className="hero-pawpal__shell">
				<div className="hero-pawpal__frame">
					<div className="hero-pawpal__card">
						<div className="hero-pawpal__banner">
							<div className="hero-pawpal__media" aria-hidden="true">
								<img
									className="hero-pawpal__img"
									src={HERO_IMG}
									alt="Pet parent with a happy dog — PawPal care"
								/>
								<div className="hero-pawpal__overlay" />
							</div>
							<div className="hero-pawpal__inner">
								<div className="hero-pawpal__content">
									<h1 id="hero-pawpal-title" className="hero-pawpal__title">
										Everything Your Pet <span className="hero-pawpal__accent">Needs</span>
									</h1>
									<p className="hero-pawpal__subtitle">
										Trusted grooming, walks, training, and pet essentials — all in one
										place.
									</p>
									<div className="hero-pawpal__actions">
										<Link href="/services" className="hero-pawpal__btn hero-pawpal__btn--primary">
											Explore Services
										</Link>
										<Link
											href="/#pawpal-home-products-title"
											className="hero-pawpal__btn hero-pawpal__btn--ghost"
										>
											Browse Products
										</Link>
									</div>
								</div>
							</div>
							<div className="hero-pawpal__arrows" role="group" aria-label="Hero slides">
								<button
									type="button"
									className="hero-pawpal__arrow"
									aria-label="Previous slide"
								>
									<WestIcon fontSize="small" />
								</button>
								<button
									type="button"
									className="hero-pawpal__arrow"
									aria-label="Next slide"
								>
									<EastIcon fontSize="small" />
								</button>
							</div>
						</div>

						<div className="hero-pawpal__junction">
							<HeroBadge />
						</div>

						<div className="hero-pawpal__strip">
							<div className="hero-pawpal__reviews">
								<div className="hero-pawpal__avatars">
									{AVATAR_IMAGES.map((src) => (
										<div key={src} className="hero-pawpal__avatar">
											<img src={src} alt="" width={40} height={40} loading="lazy" />
										</div>
									))}
								</div>
								<div className="hero-pawpal__review-copy">
									<div className="hero-pawpal__stars" aria-hidden>
										{'★★★★★'}
									</div>
									<p className="hero-pawpal__review-text">
										4.9 reviews based on happy pet parents
									</p>
								</div>
							</div>
							<div className="hero-pawpal__strip-spacer" aria-hidden />
							<div className="hero-pawpal__stats" role="list">
								{STATS.map((s) => (
									<div key={s.label} className="hero-pawpal__stat" role="listitem">
										<strong className="hero-pawpal__stat-value">{s.value}</strong>
										<span className="hero-pawpal__stat-label">{s.label}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
