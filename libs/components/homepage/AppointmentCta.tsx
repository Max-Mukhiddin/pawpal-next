import Link from 'next/link';

export default function AppointmentCta() {
	return (
		<section className="section-pawpal section-pawpal--white appointment-cta animate-on-scroll" aria-labelledby="appointment-cta-title">
			<div className="section-container">
				<header className="section-header">
					<p className="section-label">GET STARTED</p>
					<h2 id="appointment-cta-title" className="section-title">
						Ready to give your pet the best care?
					</h2>
					<p className="section-subtitle">Book your first appointment today</p>
				</header>
				<div className="appointment-cta__actions">
					<Link href="/service" className="appointment-cta__btn appointment-cta__btn--primary">
						Book Now
					</Link>
					<Link href="/service" className="appointment-cta__btn appointment-cta__btn--outline">
						Browse Services
					</Link>
				</div>
			</div>
		</section>
	);
}
