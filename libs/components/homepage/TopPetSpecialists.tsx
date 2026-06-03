import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import type { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';

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

function backendMemberImageUrl(memberImage?: string | null): string {
    if (!memberImage?.trim()) return '';
    const clean = String(memberImage).replace(/^\/+/, '');
    if (clean.startsWith('http')) return clean;
    if (clean.startsWith('uploads/')) return `${REACT_APP_API_URL}/${clean}`;
    return `${REACT_APP_API_URL}/uploads/member/${clean}`;
}

function initialsFromMember(memberFullName: string | undefined | null, memberNick: string | undefined | null): string {
    return (memberFullName || memberNick || '?')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const initialsPlaceholderDivStyleLg: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(198, 138, 89, 0.15), rgba(160, 106, 66, 0.25))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    fontWeight: 700,
    color: '#a06a42',
};

function initialsFromFallbackName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    const w = name.trim();
    if (w.length >= 2) return w.slice(0, 2).toUpperCase();
    if (w.length === 1) return (w + w).toUpperCase();
    return '??';
}

type TeamRow = {
    id: string;
    name: string;
    role: string;
    thumb: string;
    featured: string;
    initials: string;
    bioParas: readonly string[];
    profileHref: string;
    jobsCount: number;
    likesCount: number;
    experienceYears: number;
};

// Formats large numbers cleanly (e.g., 1200 -> 1.2k)
function formatLikes(num: number): string {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function mapMemberToRow(m: Member): TeamRow {
    const n = m.jobsCount ?? m.memberListings ?? 0;
    const desc = m.memberDesc?.trim() || '';
    const img = backendMemberImageUrl(m.memberImage);
    
    // Real total engagement from backend: profile likes + listing likes + article likes
    const baseLikes = m.totalEngagement ?? m.memberLikes ?? 0;
    
    const expMatch = desc.match(/(\d+)\s*years?/i);
    const experienceYears = expMatch ? parseInt(expMatch[1], 10) : Math.max(1, Math.min(20, Math.round(n / 8) + 1));

    return {
        id: m._id,
        name: m.memberFullName?.trim() || m.memberNick || 'Specialist',
        role: m.memberType ? String(m.memberType).toLowerCase().replaceAll('_', ' ') : 'Pet specialist',
        thumb: img,
        featured: img,
        initials: initialsFromMember(m.memberFullName, m.memberNick),
        bioParas: [desc || 'Pet care specialist'],
        profileHref: `/specialist/detail?id=${m._id}`,
        jobsCount: n,
        likesCount: baseLikes,
        experienceYears,
    };
}

function mapFallbackToRow(m: (typeof SPECIALISTS)[number]): TeamRow {
    const jobsCount = 120 + Number(m.id) * 18;
    const likesCount = 840 + Number(m.id) * 115;
    
    const bioText = m.bio.join(' ');
    const expMatch = bioText.match(/(\d+)\s*years?/i);
    const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 7 + Number(m.id);

    return {
        id: m.id,
        name: m.name,
        role: m.role,
        thumb: m.thumb,
        featured: m.featured,
        initials: initialsFromFallbackName(m.name),
        bioParas: m.bio,
        profileHref: '/specialist',
        jobsCount,
        likesCount,
        experienceYears,
    };
}

const AGENTS_QUERY_VARS = {
    input: {
        page: 1,
        limit: 8,
        sort: 'specialistScore',
        direction: Direction.DESC,
        search: {},
    },
};

function TeamLoadingSkeleton() {
    return <p className="section-subtitle" style={{ color: '#5c4433' }}>Loading specialists...</p>;
}

export default function TopPetSpecialists() {
    const { data, loading } = useQuery(GET_AGENTS, {
        variables: AGENTS_QUERY_VARS,
        fetchPolicy: 'cache-and-network',
    });

    const specialists: TeamRow[] = useMemo(() => {
        const list = data?.getAgents?.list;
        const fallbackRows = SPECIALISTS.map(mapFallbackToRow);
        if (list && list.length > 0) {
            const activeSpecialists = list.filter((sp: Member) => (sp.memberListings ?? 0) > 0);
            const specialistsToShow = activeSpecialists.length > 0 ? activeSpecialists : list;
            const apiRows = specialistsToShow.map(mapMemberToRow);
            return apiRows.length > 0 ? apiRows : fallbackRows;
        }
        return fallbackRows;
    }, [data]);

    const [selectedId, setSelectedId] = useState<string>('');

    useEffect(() => {
        if (!selectedId && specialists.length > 0) setSelectedId(specialists[0].id);
    }, [selectedId, specialists]);

    const selectedSpecialist = specialists.find((s) => s.id === selectedId) ?? specialists[0];
    const selectedIndex = Math.max(
        0,
        specialists.findIndex((s) => s.id === selectedId),
    );

    return (
        <section className="section-pawpal team-pawpal animate-on-scroll" aria-labelledby="team-pawpal-title">
            <div className="section-container">
                <header className="section-header team-pawpal__header">
                    <p className="section-label team-pawpal__label">OUR SPECIALISTS</p>
                    <h2 id="team-pawpal-title" className="section-title team-pawpal__title">
                        Loyal, Passionate, And Driven
                    </h2>
                    <p className="section-subtitle team-pawpal__subtitle">Meet the experts who treat your pets like family.</p>
                    <Link href="/specialist" className="section-action team-pawpal__top-action">
                        Explore all specialists
                        <ArrowForwardOutlinedIcon fontSize="small" />
                    </Link>
                </header>

                {loading ? (
                    <TeamLoadingSkeleton />
                ) : (
                    <>
                        <div className="team-pawpal__showcase">
                            <div className="team-pawpal__list" role="list" aria-label="Specialist list">
                                {specialists.map((person) => (
                                    <button
                                        type="button"
                                        key={person.id}
                                        className={`team-pawpal__list-item ${person.id === selectedId ? 'is-active' : ''}`}
                                        onClick={() => setSelectedId(person.id)}
                                        role="listitem"
                                    >
                                        <div className="team-pawpal__mini-avatar">
                                            {person.thumb ? (
                                                <img
                                                    src={person.thumb}
                                                    alt=""
                                                    width={60}
                                                    height={60}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/img/listing/default-listing.webp';
                                                    }}
                                                />
                                            ) : (
                                                <div className="team-pawpal__mini-initials" aria-hidden>
                                                    {person.initials}
                                                </div>
                                            )}
                                        </div>
                                        <div className="team-pawpal__mini-copy">
                                            <span className="team-pawpal__mini-name">{person.name}</span>
                                            <span className="team-pawpal__mini-role">{person.role}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="team-pawpal__featured-photo" aria-label="Featured specialist photo">
                                {selectedSpecialist?.featured ? (
                                    <img
                                        key={selectedSpecialist.id}
                                        src={selectedSpecialist.featured}
                                        alt={`${selectedSpecialist.name} with a pet`}
                                        onError={(e) => {
                                            e.currentTarget.src = '/img/listing/default-listing.webp';
                                        }}
                                    />
                                ) : (
                                    <div style={initialsPlaceholderDivStyleLg} aria-hidden>
                                        {selectedSpecialist?.initials}
                                    </div>
                                )}
                            </div>

                            <div className="team-pawpal__details" aria-live="polite">
                                <div key={selectedSpecialist?.id} className="team-pawpal__details-inner">
                                    <h3 className="team-pawpal__featured-name">{selectedSpecialist?.name}</h3>
                                    <p className="team-pawpal__featured-role">{selectedSpecialist?.role}</p>
                                    <p className="team-pawpal__featured-bio">
                                        {selectedSpecialist?.bioParas?.[0] ?? 'Pet care specialist'}
                                    </p>

                                    <div className="team-pawpal__metrics" role="list" aria-label="Specialist stats">
                                        <div className="team-pawpal__metric" role="listitem">
                                            <strong>{selectedSpecialist?.experienceYears ?? 1}y</strong>
                                            <span>Experience</span>
                                        </div>
                                        <div className="team-pawpal__metric" role="listitem">
                                            <strong>{selectedSpecialist?.jobsCount ?? 0}+</strong>
                                            <span>Jobs</span>
                                        </div>
                                        <div className="team-pawpal__metric" role="listitem">
                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                {formatLikes(selectedSpecialist?.likesCount ?? 0)}
                                                <StarRoundedIcon style={{ fontSize: '1.1rem', color: '#e8745a', marginBottom: '2px' }} />
                                            </strong>
                                            <span>Points</span>
                                        </div>
                                    </div>

                                    <Link href={selectedSpecialist?.profileHref ?? '/specialist'} className="team-pawpal__contact">
                                        Contact Specialist
                                    </Link>

                                    <div className="team-pawpal__social" aria-label="Social links">
                                        <a className="team-pawpal__social-btn" href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                                            <FacebookOutlinedIcon fontSize="small" />
                                        </a>
                                        <a className="team-pawpal__social-btn" href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                                            <InstagramIcon fontSize="small" />
                                        </a>
                                        <a className="team-pawpal__social-btn" href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
                                            <TwitterIcon fontSize="small" />
                                        </a>
                                        <a className="team-pawpal__social-btn" href="#" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                                            <LinkedInIcon fontSize="small" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="team-pawpal__dots" role="tablist" aria-label="Specialist navigation">
                            {specialists.slice(0, 6).map((sp, idx) => (
                                <button
                                    key={sp.id}
                                    type="button"
                                    className={`team-pawpal__dot ${idx === selectedIndex ? 'is-active' : ''}`}
                                    onClick={() => setSelectedId(sp.id)}
                                    aria-label={`Show ${sp.name}`}
                                    role="tab"
                                    aria-selected={idx === selectedIndex}
                                />
                            ))}
                        </div>

                        <div className="team-pawpal__logos" aria-label="Partner logos">
                            <span className="team-pawpal__logo team-pawpal__logo--serif">ROYAL CANIN</span>
                            <span className="team-pawpal__logo team-pawpal__logo--script">Purina Pro Plan</span>
                            <span className="team-pawpal__logo team-pawpal__logo--caps">VETAPPROVED</span>
                            <span className="team-pawpal__logo team-pawpal__logo--light">GLOBAL PET CARE</span>
                            <span className="team-pawpal__logo team-pawpal__logo--mono">EcoPaws</span>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}