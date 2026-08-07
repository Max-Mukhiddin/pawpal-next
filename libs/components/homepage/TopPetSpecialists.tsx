import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import StarIcon from '@mui/icons-material/Star';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import type { Member } from '../../types/member/member';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { hasRealMemberPhoto } from '../../utils/memberSpecialty';
import { getMemberTypeLabel } from '../../utils/memberDisplay';
import { MemberType } from '../../enums/member.enum';

const SPECIALTY_PILLARS = [
	{
		id: 'vets',
		icon: '🩺',
		title: 'Veterinarians',
		description: 'Licensed clinicians for wellness visits, urgent concerns, and ongoing care plans.',
	},
	{
		id: 'groomers',
		icon: '✂️',
		title: 'Groomers',
		description: 'Patient, breed-savvy groomers who keep coats healthy and anxious pets at ease.',
	},
	{
		id: 'trainers',
		icon: '🎓',
		title: 'Trainers',
		description: 'Positive-reinforcement coaches for puppies, rescues, and everyday behavior goals.',
	},
	{
		id: 'sitters',
		icon: '🐾',
		title: 'Sitters & Walkers',
		description: 'Reliable companions for walks, boarding, and the routines your pet already knows.',
	},
] as const;

const EDITORIAL_BODY =
	'Every PawPal specialist is reviewed for credentials, responsiveness, and real care standards before they can list services. Families book with confidence knowing each profile reflects verified experience — not just a photo and a bio.';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const AGENTS_QUERY_VARS = {
	input: {
		page: 1,
		limit: 8,
		sort: 'specialistScore',
		direction: Direction.DESC,
		search: {},
	},
};

const formatRole = (memberType?: string): string => {
	if (!memberType || memberType === MemberType.AGENT) return getMemberTypeLabel(MemberType.AGENT);
	return getMemberTypeLabel(memberType);
};

const getMemberInitial = (name: string): string => {
	const trimmed = name.trim();
	if (!trimmed) return 'P';
	return trimmed.charAt(0).toUpperCase();
};

const formatStatCount = (value: number, fallback: string): string => {
	if (value <= 0) return fallback;
	if (value >= 10000) return `${Math.floor(value / 1000)}K+`;
	if (value >= 500) return '500+';
	return `${value}+`;
};

const prefersFinePointer = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TopPetSpecialists() {
	const [imageFailed, setImageFailed] = useState(false);
	const featuredRef = useRef<HTMLAnchorElement>(null);
	const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
	const [tiltActive, setTiltActive] = useState(false);

	const { data, loading } = useQuery(GET_AGENTS, {
		variables: AGENTS_QUERY_VARS,
		fetchPolicy: 'cache-and-network',
	});

	const agentsList = useMemo(
		() => (data?.getAgents?.list as Member[] | undefined) ?? [],
		[data],
	);

	const totalSpecialists = data?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const featuredSpecialist = useMemo(() => {
		if (!agentsList.length) return null;
		const active = agentsList.filter((sp) => (sp.memberListings ?? 0) > 0);
		const pool = active.length > 0 ? active : agentsList;
		return pool[0] ?? null;
	}, [agentsList]);

	const networkAvatars = useMemo(() => {
		if (!featuredSpecialist) return [];
		return agentsList.filter((member) => member._id !== featuredSpecialist._id).slice(0, 4);
	}, [agentsList, featuredSpecialist]);

	const moreSpecialistsCount = useMemo(() => {
		if (totalSpecialists <= networkAvatars.length + 1) return 0;
		return totalSpecialists - networkAvatars.length - 1;
	}, [networkAvatars.length, totalSpecialists]);

	useAnimeSectionReveal({
		sectionSelector: '.pp-spec',
		featuredSelector: '[data-section-reveal="featured"]',
		supportSelector: '[data-section-reveal="support"]',
		pillarSelector: '[data-section-reveal="pillar"]',
		deps: [loading, featuredSpecialist?._id],
	});

	const handleFeaturedMove = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!prefersFinePointer() || prefersReducedMotion()) return;
		const node = featuredRef.current;
		if (!node) return;

		const rect = node.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width - 0.5;
		const y = (event.clientY - rect.top) / rect.height - 0.5;

		setTiltActive(true);
		setTilt({
			rx: Math.max(-6, Math.min(6, -y * 6)),
			ry: Math.max(-6, Math.min(6, x * 6)),
		});
	}, []);

	const handleFeaturedLeave = useCallback(() => {
		setTiltActive(false);
		setTilt({ rx: 0, ry: 0 });
	}, []);

	const displayName =
		featuredSpecialist?.memberFullName?.trim() ||
		featuredSpecialist?.memberNick ||
		getMemberTypeLabel(MemberType.AGENT);
	const hasPhoto = hasRealMemberPhoto(featuredSpecialist?.memberImage) && !imageFailed;
	const imageUrl = hasPhoto ? resolveMemberImageUrl(featuredSpecialist?.memberImage) : '';
	const credential = featuredSpecialist?.memberDesc?.trim() || '';

	const ratingValue =
		typeof featuredSpecialist?.specialistScore === 'number' && featuredSpecialist.specialistScore > 0
			? featuredSpecialist.specialistScore.toFixed(1)
			: '4.9';
	const reviewCount =
		(featuredSpecialist?.memberLikes ?? 0) > 0 ? featuredSpecialist?.memberLikes : 128;

	const specialistsStat = formatStatCount(totalSpecialists, '500+');
	const bookingsStat = '10K+';

	const featuredTransform =
		tilt.rx !== 0 || tilt.ry !== 0
			? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
			: 'perspective(900px) rotateX(0deg) rotateY(0deg)';

	return (
		<section className="pp-spec pp-section" aria-labelledby="team-pawpal-title">
			<div className="pp-container">
				{loading ? (
					<p className="pp-spec__loading">Loading specialists…</p>
				) : featuredSpecialist ? (
					<div className="pp-spec__showcase">
						<Link
							ref={featuredRef}
							href={{
								pathname: '/specialist/detail',
								query: { id: featuredSpecialist._id },
							}}
							className="pp-spec__featured"
							data-section-reveal="featured"
							onMouseMove={handleFeaturedMove}
							onMouseLeave={handleFeaturedLeave}
							style={{
								transform: featuredTransform,
								transition: tiltActive ? 'none' : 'transform 250ms ease-out',
							}}
						>
							<span className="pp-spec__featured-verified">
								<CheckCircleOutlinedIcon fontSize="inherit" aria-hidden />
								Verified
							</span>

							<div className="pp-spec__featured-media">
								{hasPhoto ? (
									<img
										src={imageUrl}
										alt=""
										onError={() => setImageFailed(true)}
									/>
								) : (
									<div className="pp-spec__featured-initials" aria-hidden>
										{getMemberInitial(displayName)}
									</div>
								)}
							</div>
							<div className="pp-spec__featured-scrim" aria-hidden />
							<div className="pp-spec__featured-copy">
								<span className="pp-spec__featured-rating">
									<StarIcon fontSize="inherit" aria-hidden />
									{ratingValue} ({reviewCount} reviews)
								</span>
								<p className="pp-spec__featured-role">
									{formatRole(featuredSpecialist.memberType)}
								</p>
								<h3 className="pp-spec__featured-name">{displayName}</h3>
								{credential && (
									<p className="pp-spec__featured-credential">{credential}</p>
								)}
							</div>
						</Link>

						<aside className="pp-spec__editorial" data-section-reveal="support">
							<span className="pp-spec__editorial-eyebrow">Our specialists</span>
							<h2 id="team-pawpal-title" className="pp-spec__editorial-title">
								Loyal, passionate, and driven
							</h2>
							<p className="pp-spec__editorial-body">{EDITORIAL_BODY}</p>

							{(networkAvatars.length > 0 || moreSpecialistsCount > 0) && (
								<div className="pp-spec__editorial-network">
									{networkAvatars.length > 0 && (
										<div className="pp-spec__editorial-avatars" aria-hidden>
											{networkAvatars.map((member, index) => {
												const avatarSrc = hasRealMemberPhoto(member.memberImage)
													? resolveMemberImageUrl(member.memberImage)
													: DEFAULT_AVATAR;
												return (
													<img
														key={member._id}
														src={avatarSrc}
														alt=""
														style={{ zIndex: networkAvatars.length - index }}
														onError={(e) => {
															e.currentTarget.src = DEFAULT_AVATAR;
														}}
													/>
												);
											})}
										</div>
									)}
									{moreSpecialistsCount > 0 && (
										<span className="pp-spec__editorial-network-label">
											+ {moreSpecialistsCount} more
										</span>
									)}
								</div>
							)}

							<div className="pp-spec__editorial-stats" aria-label="Specialist network highlights">
								<div className="pp-spec__editorial-stat">
									<strong>{specialistsStat}</strong>
									<span>Verified Specialists</span>
								</div>
								<span className="pp-spec__editorial-stat-divider" aria-hidden />
								<div className="pp-spec__editorial-stat">
									<strong>{ratingValue}</strong>
									<span>Avg Rating</span>
								</div>
								<span className="pp-spec__editorial-stat-divider" aria-hidden />
								<div className="pp-spec__editorial-stat">
									<strong>{bookingsStat}</strong>
									<span>Bookings</span>
								</div>
							</div>

							<Link href="/specialist" className="pp-spec__editorial-cta">
								Meet all specialists →
							</Link>
						</aside>
					</div>
				) : (
					<p className="pp-spec__loading">No specialists available yet.</p>
				)}

				<div className="pp-spec__pillars" role="list">
					{SPECIALTY_PILLARS.map((pillar) => (
						<div
							key={pillar.id}
							className="pp-spec__pillar"
							role="listitem"
							data-section-reveal="pillar"
						>
							<span className="pp-spec__pillar-icon" aria-hidden>
								{pillar.icon}
							</span>
							<h4 className="pp-spec__pillar-title">{pillar.title}</h4>
							<p className="pp-spec__pillar-desc">{pillar.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
