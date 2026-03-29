import { useState } from 'react';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const SPECIALISTS = [
	{
		id: '1',
		name: 'Maya Alvarez',
		role: 'Lead groomer',
		thumb: '/images/team/team-1.jpg',
		featured: '/images/team/team-main.jpg',
		bio: [
			'Maya has spent a decade refining gentle handling techniques that keep anxious pets calm from check-in to finish.',
			'She trains our grooming team on breed-specific care and PawPal’s safety-first standards.',
		],
	},
	{
		id: '2',
		name: 'Jordan Lee',
		role: 'Certified dog trainer',
		thumb: '/images/team/team-2.jpg',
		featured: '/images/team/team-2.jpg',
		bio: [
			'Jordan builds positive-reinforcement plans for puppies, rescues, and energetic adolescents.',
			'Their sessions focus on real-world routines so training sticks at home.',
		],
	},
	{
		id: '3',
		name: 'Priya Nair',
		role: 'Vet care coordinator',
		thumb: '/images/team/team-3.jpg',
		featured: '/images/team/team-3.jpg',
		bio: [
			'Priya coordinates wellness visits and follow-ups so nothing slips through the cracks.',
			'Pet parents rely on her clear guidance before and after every appointment.',
		],
	},
	{
		id: '4',
		name: 'Ethan Brooks',
		role: 'Head of pet experiences',
		thumb: '/images/team/team-4.jpg',
		featured: '/images/team/team-4.jpg',
		bio: [
			'Ethan makes sure every PawPal touchpoint feels thoughtful — from booking to pickup.',
			'He works across specialists to keep quality consistent in every neighborhood we serve.',
		],
	},
] as const;

const BRAND_STRIP = ['PawPal', 'PetCare+', 'SafePaws', 'VetLink'] as const;

export default function TopPetSpecialists() {
	const [active, setActive] = useState(0);
	const person = SPECIALISTS[active];

	return (
		<section className="pawpal-home-section team-pawpal" aria-labelledby="team-pawpal-title">
			<div className="pawpal-home-section__inner team-pawpal__inner">
				<header className="team-pawpal__head">
					<div className="team-pawpal__head-main">
						<p className="team-pawpal__eyebrow">Top pet specialists</p>
						<h2 id="team-pawpal-title" className="team-pawpal__title">
							Loyal, skilled, and trusted by pet parents
						</h2>
						<p className="team-pawpal__lead">
							Meet the people behind PawPal’s trusted care experience.
						</p>
					</div>
					<Link href="/specialists" className="team-pawpal__explore">
						Explore all specialists
					</Link>
				</header>

				<div className="team-pawpal__card">
					<div className="team-pawpal__rail-col">
						<div className="team-pawpal__rail-line" aria-hidden />
						<div className="team-pawpal__rail" role="tablist" aria-label="Choose a specialist">
							{SPECIALISTS.map((m, i) => (
								<button
									key={m.id}
									type="button"
									role="tab"
									aria-selected={i === active}
									className={`team-pawpal__member${i === active ? ' team-pawpal__member--active' : ''}`}
									onClick={() => setActive(i)}
								>
									<span className="team-pawpal__member-idx" aria-hidden>
										{String(i + 1).padStart(2, '0')}
									</span>
									<span className="team-pawpal__member-avatar">
										<img src={m.thumb} alt="" width={52} height={52} loading="lazy" />
									</span>
									<span className="team-pawpal__member-text">
										<span className="team-pawpal__member-name">{m.name}</span>
										<span className="team-pawpal__member-role">{m.role}</span>
									</span>
								</button>
							))}
						</div>
					</div>

					<div className="team-pawpal__photo" aria-hidden={false}>
						<div className="team-pawpal__photo-frame">
							<div className="team-pawpal__photo-well">
								<img
									key={person.featured}
									className="team-pawpal__photo-img"
									src={person.featured}
									alt={`${person.name}, ${person.role}`}
									width={720}
									height={900}
								/>
							</div>
						</div>
					</div>

					<div className="team-pawpal__detail">
						<div className="team-pawpal__detail-head">
							<h3 className="team-pawpal__detail-name">{person.name}</h3>
							<p className="team-pawpal__detail-role">{person.role}</p>
						</div>
						<div className="team-pawpal__detail-bio">
							{person.bio.map((p, idx) => (
								<p key={idx}>{p}</p>
							))}
						</div>
						<Link href="/cs" className="team-pawpal__cta">
							<PhoneIcon className="team-pawpal__cta-icon" aria-hidden />
							Contact specialist
						</Link>
						<div className="team-pawpal__socials">
							<button type="button" className="team-pawpal__social" aria-label="Facebook">
								<FacebookIcon fontSize="small" />
							</button>
							<button type="button" className="team-pawpal__social" aria-label="X">
								<TwitterIcon fontSize="small" />
							</button>
							<button type="button" className="team-pawpal__social" aria-label="LinkedIn">
								<LinkedInIcon fontSize="small" />
							</button>
							<button type="button" className="team-pawpal__social" aria-label="Instagram">
								<InstagramIcon fontSize="small" />
							</button>
						</div>
						<button type="button" className="team-pawpal__corner" aria-label="View profile">
							<NorthEastIcon fontSize="small" />
						</button>
					</div>
				</div>

				<div className="team-pawpal__brands" aria-label="Partner brands">
					<span className="team-pawpal__brands-label">Trusted by teams at</span>
					<ul className="team-pawpal__brands-list">
						{BRAND_STRIP.map((name) => (
							<li key={name} className="team-pawpal__brands-item">
								{name}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
