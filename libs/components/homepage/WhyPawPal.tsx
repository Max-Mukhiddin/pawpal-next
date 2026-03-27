const ICONS = {
	expert: (
		<svg className="why-pawpal__icon-svg" width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
			<path d="M4 10l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
			<path
				d="M6 11.5V16c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-4.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	),
	safe: (
		<svg className="why-pawpal__icon-svg" width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M12 3l7.5 3.4v5.1c0 4.8-3.2 9.2-7.5 10.1C7.7 20.7 4.5 16.3 4.5 11.5V6.4L12 3Z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinejoin="round"
			/>
		</svg>
	),
	personalized: (
		<svg className="why-pawpal__icon-svg" width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
			<circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.5} />
			<path
				d="M8.5 14.5c1.2 1.2 3.3 1.5 5 .5 1.6-1 2.5-2.8 2-4.5-.4-1.5-2-2.5-3.5-2.5-1 0-2 .4-2.5 1"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
			/>
			<circle cx={9} cy={9.5} r={1} fill="currentColor" />
			<circle cx={15} cy={9.5} r={1} fill="currentColor" />
		</svg>
	),
	easy: (
		<svg className="why-pawpal__icon-svg" width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
			<rect x={4} y={5} width={16} height={15} rx={2} stroke="currentColor" strokeWidth={1.5} />
			<path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
			<path d="M9 14h2M13 14h2M9 17h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
		</svg>
	),
} as const;

const FEATURES = [
	{
		id: 'expert',
		iconKey: 'expert' as const,
		title: 'Expert pet specialists',
		description: 'Certified professionals who truly care',
	},
	{
		id: 'safe',
		iconKey: 'safe' as const,
		title: 'Safe & trusted care',
		description: 'Your pet’s safety is always our priority',
	},
	{
		id: 'personalized',
		iconKey: 'personalized' as const,
		title: 'Personalized services',
		description: 'Tailored care for every pet’s needs',
	},
	{
		id: 'easy',
		iconKey: 'easy' as const,
		title: 'Convenient booking',
		description: 'Easy scheduling anytime, anywhere',
	},
] as const;

const STORY_IMAGE = '/images/hero/pawpal-hero.jpg';

export default function WhyPawPal() {
	return (
		<section className="pawpal-home-section why-pawpal" aria-labelledby="why-pawpal-title">
			<div className="why-pawpal__watermark" aria-hidden />
			<div className="pawpal-home-section__inner why-pawpal__inner">
				<header className="why-pawpal__head">
					<p className="why-pawpal__eyebrow">Why PawPal</p>
					<h2 id="why-pawpal-title" className="why-pawpal__title">
						Care you can trust, love they can feel
					</h2>
					<p className="why-pawpal__lead">
						Trusted care for dogs and cats — thoughtful service, warm humans, and a calmer experience
						for you both.
					</p>
				</header>

				<ul className="why-pawpal__features" role="list">
					{FEATURES.map((item) => (
						<li key={item.id} className="why-pawpal__feature">
							<div className="why-pawpal__icon-wrap" aria-hidden>
								{ICONS[item.iconKey]}
							</div>
							<div className="why-pawpal__feature-body">
								<h3 className="why-pawpal__feature-title">{item.title}</h3>
								<p className="why-pawpal__feature-desc">{item.description}</p>
							</div>
						</li>
					))}
				</ul>

				<div className="why-pawpal__story">
					<div className="why-pawpal__story-frame">
						<img
							className="why-pawpal__story-img"
							src={STORY_IMAGE}
							alt="Pet parent spending time with their dog at home"
							width={1200}
							height={560}
							loading="lazy"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
