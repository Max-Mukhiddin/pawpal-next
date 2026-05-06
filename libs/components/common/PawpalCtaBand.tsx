import React from 'react';
import Link from 'next/link';

/**
 * PawpalCtaBand — shared editorial CTA card used on Blog, About,
 * and other major public pages.
 *
 * Design: light cream floating card, pet image on the right,
 * title + buttons on the left.  Sits between page content and footer.
 */
const PawpalCtaBand: React.FC = () => (
	<section className="ppctaband" aria-label="Explore PawPal services">
		<div className="ppctaband__card">
			{/* ── Text + buttons ─────────────────── */}
			<div className="ppctaband__copy">
				<span className="ppctaband__eyebrow">PawPal</span>
				<h2 className="ppctaband__title">
					Explore Our Comprehensive<br />Pet Care Solutions
				</h2>
				<p className="ppctaband__sub">
					Trusted specialists, quality services, and a caring community for you and your companions.
				</p>
				<div className="ppctaband__btns">
					<Link href="/service" className="ppctaband__btn ppctaband__btn--primary">
						Make Appointment
					</Link>
					<Link href="/specialist" className="ppctaband__btn ppctaband__btn--outline">
						Our Specialists →
					</Link>
				</div>
			</div>

			{/* ── Pet visual ─────────────────────── */}
			<div className="ppctaband__visual" aria-hidden>
				<img
					src="/images/hero/pawpal-hero.jpg"
					alt=""
					className="ppctaband__img"
				/>
				{/* Decorative paw accent */}
				<span className="ppctaband__paw ppctaband__paw--1">🐾</span>
				<span className="ppctaband__paw ppctaband__paw--2">🐾</span>
			</div>
		</div>
	</section>
);

export default PawpalCtaBand;
