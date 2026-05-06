import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
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

const BRAND_STRIP = ['PawPal', 'PetCare+', 'SafePaws', 'VetLink'] as const;

/** Returns CDN URL or empty string when no profile image (placeholders use initials). */
function backendMemberImageUrl(memberImage?: string | null): string {
	if (!memberImage?.trim()) return '';
	const clean = String(memberImage).replace(/^\/+/, '');
	if (clean.startsWith('http')) return clean;
	if (clean.startsWith('uploads/')) return `${REACT_APP_API_URL}/${clean}`;
	return `${REACT_APP_API_URL}/uploads/member/${clean}`;
}

function initialsFromMember(memberFullName: string | undefined | null, memberNick: string | undefined | null): string {
	const initials = (memberFullName || memberNick || '?')
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
	return initials;
}

const initialsPlaceholderDivStyleLg: React.CSSProperties = {
	width: '100%',
	height: '100%',
	background: 'linear-gradient(135deg, #E07B3A22, #E07B3A55)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: 48,
	fontWeight: 700,
	color: '#E07B3A',
};

const initialsPlaceholderDivStyleRail: React.CSSProperties = {
	width: 40,
	height: 40,
	borderRadius: '50%',
	background: 'linear-gradient(135deg, #E07B3A22, #E07B3A55)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: 13,
	fontWeight: 700,
	color: '#E07B3A',
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
	subline: string;
	thumb: string;
	featured: string;
	initials: string;
	bioParas: readonly string[];
	profileHref: string;
};

function mapMemberToRow(m: Member): TeamRow {
	const n = m.memberListings ?? 0;
	const servicesLabel = `${n} ${n === 1 ? 'service' : 'services'}`;
	const desc = m.memberDesc?.trim();
	const img = backendMemberImageUrl(m.memberImage);
	return {
		id: m._id,
		name: m.memberFullName?.trim() || m.memberNick || 'Specialist',
		subline: servicesLabel,
		thumb: img,
		featured: img,
		initials: initialsFromMember(m.memberFullName, m.memberNick),
		bioParas: [desc || 'Pet care specialist'],
		profileHref: `/specialist/detail?id=${m._id}`,
	};
}

function mapFallbackToRow(m: (typeof SPECIALISTS)[number]): TeamRow {
	return {
		id: m.id,
		name: m.name,
		subline: m.role,
		thumb: m.thumb,
		featured: m.featured,
		initials: initialsFromFallbackName(m.name),
		bioParas: m.bio,
		profileHref: '/specialist',
	};
}

const AGENTS_QUERY_VARS = {
	input: {
		page: 1,
		limit: 4,
		sort: 'memberRank',
		direction: Direction.DESC,
		search: {},
	},
};

function TeamLoadingSkeleton() {
	return (
		<div className="team-pawpal__card">
			<div className="team-pawpal__rail-col">
				<div className="team-pawpal__rail-line" aria-hidden />
				<div className="team-pawpal__rail" role="status" aria-label="Loading specialists">
					{[0, 1, 2, 3].map((i) => (
						<div
							key={i}
							className="team-pawpal__member"
							style={{ pointerEvents: 'none', opacity: 0.85 }}
						>
							<Skeleton variant="text" width={28} height={20} sx={{ flexShrink: 0 }} />
							<span className="team-pawpal__member-avatar">
								<Skeleton variant="circular" width={40} height={40} />
							</span>
							<span className="team-pawpal__member-text" style={{ flex: 1, minWidth: 0 }}>
								<Skeleton variant="text" width="80%" height={18} />
								<Skeleton variant="text" width="55%" height={14} sx={{ mt: 0.5 }} />
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="team-pawpal__photo" aria-hidden>
				<div className="team-pawpal__photo-frame">
					<div className="team-pawpal__photo-well">
						<Skeleton
							variant="rounded"
							className="team-pawpal__photo-img"
							width="100%"
							height="100%"
							sx={{ minHeight: 360, borderRadius: 2 }}
						/>
					</div>
				</div>
			</div>

			<div className="team-pawpal__detail">
				<div className="team-pawpal__detail-head">
					<Skeleton variant="text" width="70%" height={36} />
					<Skeleton variant="text" width="40%" height={22} sx={{ mt: 1 }} />
				</div>
				<div className="team-pawpal__detail-bio">
					<Skeleton variant="text" width="100%" />
					<Skeleton variant="text" width="100%" />
					<Skeleton variant="text" width="85%" />
				</div>
				<Skeleton variant="rounded" width={200} height={44} sx={{ borderRadius: 999, mt: 1 }} />
				<div className="team-pawpal__socials" style={{ marginTop: 12 }}>
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} variant="circular" width={36} height={36} />
					))}
				</div>
			</div>
		</div>
	);
}

export default function TopPetSpecialists() {
	const [active, setActive] = useState(0);

	const { data, loading } = useQuery(GET_AGENTS, {
		variables: AGENTS_QUERY_VARS,
		fetchPolicy: 'cache-and-network',
	});

	const rows: TeamRow[] = useMemo(() => {
		const list = data?.getAgents?.list;
		if (list && list.length > 0) {
			const activeSpecialists = list.filter((sp: Member) => (sp.memberListings ?? 0) > 0);
			const specialistsToShow = activeSpecialists.length > 0 ? activeSpecialists : list;
			return specialistsToShow.map(mapMemberToRow);
		}
		return SPECIALISTS.map(mapFallbackToRow);
	}, [data]);

	useEffect(() => {
		setActive((a) => (a >= rows.length ? 0 : a));
	}, [rows.length]);

	const person = rows[active];

	const sectionBody = loading ? (
		<TeamLoadingSkeleton />
	) : (
		<div className="team-pawpal__card">
			<div className="team-pawpal__rail-col">
				<div className="team-pawpal__rail-line" aria-hidden />
				<div className="team-pawpal__rail" role="tablist" aria-label="Choose a specialist">
					{rows.map((m, i) => (
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
								{m.thumb ? (
									<img src={m.thumb} alt="" width={40} height={40} loading="lazy" />
								) : (
									<div style={initialsPlaceholderDivStyleRail} aria-hidden>
										{m.initials}
									</div>
								)}
							</span>
							<span className="team-pawpal__member-text">
								<span className="team-pawpal__member-name">{m.name}</span>
								<span className="team-pawpal__member-role">{m.subline}</span>
							</span>
						</button>
					))}
				</div>
			</div>

			<div className="team-pawpal__photo" aria-hidden={false}>
				<div className="team-pawpal__photo-frame">
					<div className="team-pawpal__photo-well">
						<div key={person.id} className="team-pawpal__photo-panel">
							{person.featured ? (
								<img
									className="team-pawpal__photo-img"
									src={person.featured}
									alt={`${person.name}, ${person.subline}`}
									width={720}
									height={900}
								/>
							) : (
								<div className="team-pawpal__photo-img" style={initialsPlaceholderDivStyleLg} aria-hidden>
									{person.initials}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="team-pawpal__detail">
				<div className="team-pawpal__detail-head">
					<h3 className="team-pawpal__detail-name">{person.name}</h3>
					<p className="team-pawpal__detail-role">{person.subline}</p>
				</div>
				<div className="team-pawpal__detail-bio">
					{person.bioParas.map((p, idx) => (
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
				<Link
					href={person.profileHref}
					className="team-pawpal__corner"
					aria-label="View profile"
					style={{ textDecoration: 'none', color: 'inherit' }}
				>
					<NorthEastIcon fontSize="small" />
				</Link>
			</div>
		</div>
	);

	return (
		<section className="pawpal-home-section team-pawpal animate-on-scroll" aria-labelledby="team-pawpal-title">
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
					<Link href="/specialist" className="team-pawpal__explore">
						Explore all specialists
					</Link>
				</header>

				{sectionBody}

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
