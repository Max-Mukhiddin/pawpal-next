import React, { useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
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

const TEAM_IMAGES = [
	'/images/team/team-1.jpg',
	'/images/team/team-2.jpg',
	'/images/team/team-3.jpg',
	'/images/team/team-4.jpg',
];

const HISTORY = [
	{ year: '2022', image: '/images/team/team-1.jpg', text: 'PawPal founded to connect pet parents with trusted care.' },
	{ year: '2023', image: '/images/team/team-2.jpg', text: 'Expanded specialist network and launched guided booking flow.' },
	{ year: '2024', image: '/images/team/team-3.jpg', text: 'Introduced service catalog and stronger support for inquiries.' },
	{ year: '2025', image: '/images/team/team-4.jpg', text: 'Scaled community and follow-up care to improve outcomes.' },
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
	const device = useDeviceDetect();
	const timelineRef = useRef<HTMLDivElement>(null);
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

	if (device === 'mobile') {
		return <div>ABOUT US MOBILE</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				<section className="about-page__hero">
					<div className="about-page__hero-content">
						<h1>About PawPal</h1>
						<p>Home / About Us</p>
					</div>
					<div className="about-page__hero-curve" />
				</section>

				<section className="about-page__mission container">
					<div className="about-page__mission-left">
						<span className="eyebrow">About Us</span>
						<h2>We Are Fully Committed To Your Pet&apos;s Well-Being</h2>
						<div className="check-grid">
							<span>Skilled Personnel</span>
							<span>Licensed Vets</span>
							<span>Nutrition &amp; Diet</span>
							<span>Quality Products</span>
							<span>Grooming Tips</span>
							<span>Emergency Care</span>
							<span>Safety First</span>
							<span>Caring Service</span>
						</div>
						<div className="mission-actions">
							<Link href="/service" className="pill-btn">Learn More</Link>
							<div className="phone-row">
								<img src="/img/icons/call.svg" alt="" />
								<span>+1 (800) 555-1234</span>
							</div>
						</div>
					</div>
					<div className="about-page__mission-right">
						{TEAM_IMAGES.map((img, idx) => (
							<img key={img + idx} src={img} alt="" />
						))}
					</div>
				</section>

				<section className="about-page__history container">
					<h2>Our History Throughout The Years</h2>
					<div className="history-controls">
						<button type="button" onClick={() => timelineRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}>
							←
						</button>
						<button type="button" onClick={() => timelineRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}>
							→
						</button>
					</div>
					<div className="history-track" ref={timelineRef}>
						{HISTORY.map((item) => (
							<article key={item.year} className="history-item">
								<strong>{item.year}</strong>
								<img src={item.image} alt="" />
								<p>{item.text}</p>
							</article>
						))}
					</div>
				</section>

				<section className="about-page__services container">
					<div className="section-head">
						<h2>Our All Services Includes</h2>
						<Link href="/service">Browse All Services</Link>
					</div>
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
				</section>

				<section className="about-page__help container">
					<div className="help-image">
						<img src="/images/team/team-main.jpg" alt="" />
					</div>
					<div className="help-steps">
						<h2>How We Help Your Pet</h2>
						<div className="step">
							<strong>01. Schedule A Consultation</strong>
							<p>Browse our specialists and book a time that suits you</p>
						</div>
						<div className="step">
							<strong>02. Specialist Comes To You</strong>
							<p>We handle all coordination and send a confirmed specialist</p>
						</div>
						<div className="step">
							<strong>03. Care &amp; Follow Up</strong>
							<p>Your pet gets expert care with a follow-up report</p>
						</div>
					</div>
				</section>

				<section className="about-page__team container">
					<div className="section-head">
						<h2>Loyal, Passionate, And Driven</h2>
						<Link href="/specialist" className="pill-btn">Explore All Specialists</Link>
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
									<p className="role">Pet Specialist</p>
									<p>{selectedSpecialist.memberDesc || 'Dedicated pet care professional at PawPal'}</p>
									<div className="stats">
										<span>{selectedSpecialist.memberListings || 0} Active Services</span>
										<span>{selectedSpecialist.memberFollowers || 0} Followers</span>
									</div>
									<div className="actions">
										<Link href="/service" className="pill-btn">Book Appointment</Link>
										<Link href={`/specialist/detail?id=${selectedSpecialist._id}`}>View Profile</Link>
									</div>
								</div>
							</div>
						)}
					</div>
					<div className="brand-row">
						<span>Purina</span>
						<span>Royal Canin</span>
						<span>Hill&apos;s</span>
						<span>Pedigree</span>
						<span>Whiskas</span>
					</div>
				</section>

				<section className="about-page__testimonials container">
					<h2>Loyal Hearts, Forever Homes.</h2>
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

				<section className="about-page__cta container">
					<div className="left">
						<strong>Explore Our Comprehensive Petcare Solutions</strong>
					</div>
					<div className="right">
						<Link href="/service" className="pill-btn">Make Appointment</Link>
						<Link href="/specialist" className="pill-btn pill-btn--dark">Our Specialists</Link>
					</div>
				</section>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);
