import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import Link from 'next/link';
import PawpalCtaBand from '../../libs/components/common/PawpalCtaBand';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { GET_AGENTS, GET_LISTINGS } from '../../apollo/user/query';
import { ListingType } from '../../libs/enums/listing.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import type { Listing } from '../../libs/types/listing/listing';
import type { Member } from '../../libs/types/member/member';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** PawPal story — pet-care imagery only (hero + service art from public/images). */
const HISTORY = [
	{
		year: '2022',
		image: '/images/hero/pawpal-hero.jpg',
		text: 'PawPal launched to help pet parents find trusted specialists and book care with confidence.',
	},
	{
		year: '2023',
		image: '/images/services/service-boarding.jpg',
		text: 'We grew our specialist network and introduced guided booking so visits are easy to schedule.',
	},
	{
		year: '2024',
		image: '/images/services/service-training.jpg',
		text: 'The service catalog went live with clearer listings and stronger tools for questions and follow-ups.',
	},
	{
		year: '2025',
		image: '/images/services/service-vet.jpg',
		text: 'We scaled community support and follow-up care to help every pet stay on track after a visit.',
	},
];

const TRUST_BADGES: { icon: string; label: string }[] = [
	{ icon: '/icons/why-safe.svg', label: 'Vetted, safety-first care' },
	{ icon: '/icons/why-expert.svg', label: 'Experienced pet specialists' },
	{ icon: '/icons/why-easy.svg', label: 'Simple booking & messaging' },
	{ icon: '/icons/why-personalized.svg', label: 'Personalized for your pet' },
];

const TESTIMONIALS = [
	{
		name: 'Aisha K.',
		role: 'Pet Parent',
		avatar: '/images/team/team-1.jpg',
		text: 'PawPal made booking care simple. The specialist updates gave me total peace of mind.',
	},
	{
		name: 'Liam R.',
		role: 'Dog Owner',
		avatar: '/images/team/team-2.jpg',
		text: 'From first consult to follow-up, everything felt thoughtful and professional.',
	},
	{
		name: 'Mina S.',
		role: 'Cat Parent',
		avatar: '/images/team/team-3.jpg',
		text: 'Great communication, kind specialists, and clear service details before booking.',
	},
	{
		name: 'Dani P.',
		role: 'Pet Parent',
		avatar: '/images/team/team-4.jpg',
		text: 'I found reliable care quickly and the whole process was smooth and transparent.',
	},
];

const About: NextPage = () => {
	const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');

	const servicesVariables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: 'DESC',
				search: { typeList: [ListingType.SERVICE] },
			},
		}),
		[],
	);

	const agentsVariables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 4,
				sort: 'memberRank',
				direction: 'DESC',
				search: {},
			},
		}),
		[],
	);

	const { data: servicesData } = useQuery(GET_LISTINGS, {
		variables: servicesVariables,
		fetchPolicy: 'cache-and-network',
	});
	const { data: agentsData } = useQuery(GET_AGENTS, {
		variables: agentsVariables,
		fetchPolicy: 'cache-and-network',
	});

	const serviceListings: Listing[] = servicesData?.getListings?.list ?? [];
	const specialists: Member[] = agentsData?.getAgents?.list ?? [];

	const selectedSpecialist =
		specialists.find((s) => s._id === selectedSpecialistId) ?? specialists[0] ?? null;

	const getBackendImage = (img?: string) => (img ? `${REACT_APP_API_URL}/${img}` : '/images/team/team-main.jpg');

	return (
		<Stack className="about-page about-pawpal" component="div">
			<section className="about-page__hero">
				<div
					className="about-page__hero-bg"
					aria-hidden
					style={{
						backgroundImage: `url('/img/banner/agents.webp')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center top',
					}}
				/>
				<div className="about-page__hero-content">
					<h1 className="about-page__hero-title">About Us</h1>
				</div>
				<div className="about-page__hero-curve">
					<span>Home / About Us</span>
				</div>
			</section>

			<section className="about-page__mission container">
				<div className="about-page__mission-left">
					<span className="eyebrow">About PawPal</span>
					<h2>We Are Fully Committed To Your Pet&apos;s Well-Being</h2>
					<p className="about-page__mission-lead">
						Trusted care, clear communication, and services built around pets and their families.
					</p>
					<div className="check-grid">
						<span>Skilled caregivers</span>
						<span>Licensed veterinarians</span>
						<span>Nutrition &amp; diet</span>
						<span>Quality products</span>
						<span>Grooming tips</span>
						<span>Emergency guidance</span>
						<span>Safety first</span>
						<span>Thoughtful service</span>
					</div>
					<div className="mission-actions">
						<Link href="/service" className="pill-btn">
							Learn more
						</Link>
						<div className="phone-row">
							<img src="/img/icons/call.svg" alt="" />
							<span>+1 (800) 555-1234</span>
						</div>
					</div>
				</div>
				<div className="about-page__mission-right">
					<img src="/images/services/service-boarding.jpg" alt="" />
					<img src="/images/services/service-training.jpg" alt="" />
					<div className="about-page__mission-right-accent" aria-hidden>
						<span className="about-page__mission-paw">🐾</span>
					</div>
					<img src="/images/services/service-walking.jpg" alt="" />
				</div>
			</section>

			<section className="about-page__history container">
				<span className="about-page__section-label">Our story</span>
				<h2>Milestones along the way</h2>
				<div className="history-track">
					{HISTORY.map((item) => (
						<article key={item.year} className="history-item">
							<strong>{item.year}</strong>
							<img className="history-item__thumb" src={item.image} alt="" />
							<p>{item.text}</p>
						</article>
					))}
				</div>
			</section>

			<section className="about-page__services container">
				<div className="section-head">
					<h2>Our pet care services</h2>
					<Link href="/service" className="section-head__link">
						Browse all services
					</Link>
				</div>
				{serviceListings.length > 0 ? (
					<div className="services-grid">
						{serviceListings.map((item) => (
							<Link href={`/service/detail?id=${item._id}`} key={item._id} className="service-card">
								<img src={getBackendImage(item.listingImages?.[0])} alt="" />
								<div className="overlay">
									<strong>{item.listingTitle}</strong>
								</div>
							</Link>
						))}
					</div>
				) : (
					<p className="about-page__services-empty">Services will appear here as our specialists add them</p>
				)}
			</section>

			<section className="about-page__help container">
				<div className="help-image">
					<img src="/images/hero/pawpal-hero.jpg" alt="" />
				</div>
				<div className="help-steps">
					<h2>How We Help Your Pet</h2>
					<div className="step">
						<strong>01. Schedule a consultation</strong>
						<p>Browse our specialists and book a time that suits you</p>
					</div>
					<div className="step">
						<strong>02. Specialist comes to you</strong>
						<p>We coordinate details and confirm your specialist</p>
					</div>
					<div className="step">
						<strong>03. Care &amp; follow-up</strong>
						<p>Your pet gets expert care with a clear follow-up summary</p>
					</div>
				</div>
			</section>

			<section className="about-page__team container">
				<div className="section-head">
					<h2>Loyal, passionate, and driven</h2>
					<Link href="/specialist" className="pill-btn">
						Explore all specialists
					</Link>
				</div>
				<div className="team-layout">
					<div className="team-list">
						{specialists.map((sp) => (
							<button
								type="button"
								key={sp._id}
								className={selectedSpecialist?._id === sp._id ? 'active' : ''}
								onClick={() => setSelectedSpecialistId(sp._id)}
							>
								<img src={getBackendImage(sp.memberImage)} alt="" />
								<span>{sp.memberFullName || sp.memberNick}</span>
							</button>
						))}
					</div>
					{selectedSpecialist && (
						<div className="team-detail">
							<img src={getBackendImage(selectedSpecialist.memberImage)} alt="" />
							<div className="copy">
								<h3>{selectedSpecialist.memberFullName || selectedSpecialist.memberNick}</h3>
								<p className="role">Pet specialist</p>
								<p>{selectedSpecialist.memberDesc || 'Dedicated pet care professional at PawPal'}</p>
								<div className="stats">
									<span>{selectedSpecialist.memberListings || 0} active services</span>
									<span>{selectedSpecialist.memberFollowers || 0} followers</span>
								</div>
								<div className="actions">
									<Link href="/service" className="pill-btn">
										Book appointment
									</Link>
									<Link href={`/specialist/detail?id=${selectedSpecialist._id}`}>View profile</Link>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="about-pawpal-trust" aria-label="Why pet parents choose PawPal">
					<p className="about-pawpal-trust__eyebrow">Trusted by pet parents</p>
					<ul className="about-pawpal-trust__badges">
						{TRUST_BADGES.map((b) => (
							<li key={b.label} className="about-pawpal-trust__badge">
								<img src={b.icon} alt="" width={28} height={28} />
								<span>{b.label}</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="about-page__testimonials container">
				<h2>Loyal hearts, forever homes</h2>
				<div className="testimonial-grid">
					{TESTIMONIALS.map((item) => (
						<article key={item.name} className="testimonial-card">
							<div className="top">
								<img src={item.avatar} alt="" />
								<div>
									<strong>{item.name}</strong>
									<span>{item.role}</span>
								</div>
							</div>
							<p className="stars">★★★★★</p>
							<p>{item.text}</p>
						</article>
					))}
				</div>
			</section>

			<PawpalCtaBand />
		</Stack>
	);
};

export default withLayoutBasic(About);
