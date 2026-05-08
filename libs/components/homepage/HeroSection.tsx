import Link from 'next/link';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';

const HERO_IMG = '/images/hero/pawpal-hero.jpg';

const STATS = [
	{ value: '562+', label: 'Happy pets' },
	{ value: '250+', label: 'Specialists' },
	{ value: '4.9', label: 'Average rating' },
	{ value: '100%', label: 'Positive reviews' },
] as const;

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
							<div className="hero-pawpal__decor hero-pawpal__decor--paw" aria-hidden>
								🐾
							</div>
							<div className="hero-pawpal__inner">
								<div className="hero-pawpal__content">
									<h1 id="hero-pawpal-title" className="hero-pawpal__title">
										The Best Pet Care <span className="hero-pawpal__accent">Services</span>
									</h1>
									<p className="hero-pawpal__subtitle">
										Warm, trusted care from grooming to training, delivered by specialists
										who treat pets like family.
									</p>
									<div className="hero-pawpal__actions">
										<Link href="/service" className="hero-pawpal__btn hero-pawpal__btn--primary">
											Book Now
										</Link>
										<Link href="/service" className="hero-pawpal__btn hero-pawpal__btn--ghost">
											Our Services
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

						<div className="hero-pawpal__strip" role="list">
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
		</section>
	);
}
