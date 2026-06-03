import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { GET_AGENTS, GET_LISTINGS } from '../../apollo/user/query';
import { ListingType } from '../../libs/enums/listing.enum';
import type { Listing } from '../../libs/types/listing/listing';
import type { Member } from '../../libs/types/member/member';
import { resolveMemberImageUrl, resolveListingImageUrl } from '../../libs/utils/mediaUrl';

export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
});

const HISTORY = [
    {
        year: '2022',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
        text: 'PawPal launched to help pet parents find trusted specialists and book care with confidence.',
    },
    {
        year: '2023',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80',
        text: 'We grew our specialist network and introduced guided booking so visits are easy to schedule.',
    },
    {
        year: '2024',
        image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80',
        text: 'The service catalog went live with clearer listings and stronger tools for questions and follow-ups.',
    },
    {
        year: '2025',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
        text: 'We scaled community support and follow-up care to help every pet stay on track after a visit.',
    },
];

const TRUST_BADGES = [
    { icon: '🛡️', label: 'Vetted, safety-first care' },
    { icon: '🎓', label: 'Experienced pet specialists' },
    { icon: '📅', label: 'Simple booking & messaging' },
    { icon: '🐾', label: 'Personalized for your pet' },
];

const TESTIMONIALS = [
    {
        name: 'Aisha K.',
        role: 'Pet Parent',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        text: 'PawPal made booking care simple. The specialist updates gave me total peace of mind.',
    },
    {
        name: 'Liam R.',
        role: 'Dog Owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        text: 'From first consult to follow-up, everything felt thoughtful and professional.',
    },
    {
        name: 'Mina S.',
        role: 'Cat Parent',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        text: 'Great communication, kind specialists, and clear service details before booking.',
    },
    {
        name: 'Dani P.',
        role: 'Pet Parent',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        text: 'I found reliable care quickly and the whole process was smooth and transparent.',
    },
];

const MISSION_IMAGES = [
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80',
];

const About: NextPage = () => {
    const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');

    const servicesVariables = useMemo(() => ({
        input: {
            page: 1,
            limit: 4,
            sort: 'createdAt',
            direction: 'DESC',
            search: { typeList: [ListingType.SERVICE] },
        },
    }), []);

    const agentsVariables = useMemo(() => ({
        input: {
            page: 1,
            limit: 4,
            sort: 'memberRank',
            direction: 'DESC',
            search: {},
        },
    }), []);

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

    const getMemberImage = (img?: string) =>
        resolveMemberImageUrl(img, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80');

    const getServiceImage = (img?: string) =>
        resolveListingImageUrl(img, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80');

    return (
        <Stack className="about-page about-pawpal" component="div">

            {/* ── 1. Mission ── */}
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
                        <Link href="/service" className="pill-btn">Learn more</Link>
                        <div className="phone-row">
                            <span>📞</span>
                            <span>+1 (800) 555-1234</span>
                        </div>
                    </div>
                </div>
                <div className="about-page__mission-right">
                    <img src={MISSION_IMAGES[0]} alt="Pet grooming" />
                    <img src={MISSION_IMAGES[1]} alt="Dog walking" />
                    <div className="about-page__mission-right-accent" aria-hidden>
                        <span className="about-page__mission-paw">🐾</span>
                    </div>
                    <img src={MISSION_IMAGES[2]} alt="Pet care" />
                </div>
            </section>

            {/* ── 2. History ── */}
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

            {/* ── 3. Services grid ── */}
            <section className="about-page__services container">
                <div className="section-head">
                    <h2>Our pet care services</h2>
                    <Link href="/service" className="section-head__link">Browse all services</Link>
                </div>
                {serviceListings.length > 0 ? (
                    <div className="services-grid">
                        {serviceListings.map((item) => (
                            <Link href={`/service/detail?id=${item._id}`} key={item._id} className="service-card">
                                <img
                                    src={getServiceImage(item.listingImages?.[0])}
                                    alt={item.listingTitle}
                                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80'; }}
                                />
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

            {/* ── 4. How we help ── */}
            <section className="about-page__help container">
                <div className="help-image">
                    <img
                        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80"
                        alt="Pet care"
                    />
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

            {/* ── 5. Team ── */}
            <section className="about-page__team container">
                <div className="section-head">
                    <h2>Loyal, passionate, and driven</h2>
                    <Link href="/specialist" className="pill-btn">Explore all specialists</Link>
                </div>

                {specialists.length > 0 && (
                    <div className="team-layout">
                        <div className="team-list">
                            {specialists.map((sp) => (
                                <button
                                    type="button"
                                    key={sp._id}
                                    className={selectedSpecialist?._id === sp._id ? 'active' : ''}
                                    onClick={() => setSelectedSpecialistId(sp._id)}
                                >
                                    <img
                                        src={getMemberImage(sp.memberImage)}
                                        alt={sp.memberFullName || sp.memberNick}
                                        onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }}
                                    />
                                    <span>{sp.memberFullName || sp.memberNick}</span>
                                </button>
                            ))}
                        </div>

                        {selectedSpecialist && (
                            <div className="team-detail">
                                <img
                                    src={getMemberImage(selectedSpecialist.memberImage)}
                                    alt={selectedSpecialist.memberFullName || selectedSpecialist.memberNick}
                                    onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }}
                                />
                                <div className="copy">
                                    <h3>{selectedSpecialist.memberFullName || selectedSpecialist.memberNick}</h3>
                                    <p className="role">Pet specialist</p>
                                    <p>{selectedSpecialist.memberDesc || 'Dedicated pet care professional at PawPal.'}</p>
                                    <div className="stats">
                                        <span>{selectedSpecialist.memberListings || 0} active services</span>
                                        <span>{selectedSpecialist.memberFollowers || 0} followers</span>
                                    </div>
                                    <div className="actions">
                                        <Link href="/service" className="pill-btn">Book appointment</Link>
                                        <Link href={`/specialist/detail?id=${selectedSpecialist._id}`}>View profile</Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Trust badges — emoji icons, no missing SVG files */}
                <div className="about-pawpal-trust" aria-label="Why pet parents choose PawPal">
                    <p className="about-pawpal-trust__eyebrow">Trusted by pet parents</p>
                    <ul className="about-pawpal-trust__badges">
                        {TRUST_BADGES.map((b) => (
                            <li key={b.label} className="about-pawpal-trust__badge">
                                <span className="about-pawpal-trust__badge-icon">{b.icon}</span>
                                <span>{b.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── 6. Testimonials ── */}
            <section className="about-page__testimonials container">
                <h2>Loyal hearts, forever homes</h2>
                <div className="testimonial-grid">
                    {TESTIMONIALS.map((item) => (
                        <article key={item.name} className="testimonial-card">
                            <div className="top">
                                <img
                                    src={item.avatar}
                                    alt={item.name}
                                    onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }}
                                />
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
        </Stack>
    );
};

export default withLayoutBasic(About);