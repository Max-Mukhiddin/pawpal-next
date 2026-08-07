import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import { resolveListingImageUrl } from '../../utils/mediaUrl';
import { sanitizeListingDescription } from '../../utils/listingTextHelpers';
import { normalizeCardText } from '../../utils/truncateText';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';

/** Most recently created service with two uploaded images (Signature Bath & Style Session). */
const PREFERRED_FEATURED_SERVICE_ID = '6a4c9ad7f4cebd54e6216422';

const FALLBACK_PRIMARY_IMAGE = '/images/services/service-grooming.jpg';
const FALLBACK_SECONDARY_IMAGE = '/images/services/service-grooming.jpg';

const FALLBACK = {
	_id: 'fb-featured-service',
	title: 'Full-Service Spa & Grooming',
	primaryDescription:
		'Hand-crafted grooming rituals tailored for serene companions — bath, style, and coat care.',
	toolsTitle: 'Professional Grooming Products',
	toolsDescription:
		'Vet-approved shampoos, conditioners, and styling formulas chosen for sensitive coats and lasting shine.',
	primaryImage: FALLBACK_PRIMARY_IMAGE,
	secondaryImage: FALLBACK_SECONDARY_IMAGE,
	href: '/service',
};

const toolsBlurb = (desc: string | undefined): string => {
	const clean = normalizeCardText(desc);
	const toolsMatch = clean.match(/(?:using|with)\s+(.+?)(?:\.|$)/i);
	if (toolsMatch?.[1]) {
		const phrase = toolsMatch[1].trim();
		return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`;
	}
	return FALLBACK.toolsDescription;
};

const pickFeaturedService = (listings: Listing[]): Listing | null => {
	const preferred = listings.find((listing) => listing._id === PREFERRED_FEATURED_SERVICE_ID);
	if (preferred && (preferred.listingImages?.length ?? 0) >= 2) return preferred;

	return (
		listings.find((listing) => (listing.listingImages?.length ?? 0) >= 2) ?? null
	);
};

export default function FeaturedServices() {
	const variables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 20,
				sort: 'createdAt',
				direction: 'DESC',
				search: { typeList: [ListingType.SERVICE] },
			},
		}),
		[],
	);

	const { data } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	useAnimeSectionReveal({
		sectionSelector: '.pp-featured',
		featuredSelector: '[data-section-reveal="featured"]',
		supportSelector: '[data-section-reveal="support"]',
		deps: [data],
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const featured = pickFeaturedService(listings);

	const title = featured?.listingTitle ?? FALLBACK.title;
	const href = featured?._id ? `/service/detail?id=${featured._id}` : FALLBACK.href;
	const listingDesc = sanitizeListingDescription(
		(featured as Listing & { listingDesc?: string })?.listingDesc,
	);
	const primaryDescription = listingDesc || FALLBACK.primaryDescription;
	const toolsDescription = toolsBlurb(listingDesc || undefined);
	const primaryImage = resolveListingImageUrl(
		featured?.listingImages?.[0],
		FALLBACK_PRIMARY_IMAGE,
	);
	const secondaryImage = resolveListingImageUrl(
		featured?.listingImages?.[1] ?? featured?.listingImages?.[0],
		FALLBACK_SECONDARY_IMAGE,
	);

	return (
		<section className="pp-featured pp-section" aria-labelledby="featured-services-title">
			<div className="pp-container">
				<div className="pp-featured__head" data-section-reveal="header">
					<div className="pp-featured__intro">
						<span className="pp-eyebrow">Featured services</span>
						<h2 id="featured-services-title" className="pp-heading pp-featured__title">
							Our premium <span className="pp-accent">care offerings</span>
						</h2>
						<p className="pp-subtitle pp-featured__desc">
							A curated sanctuary of services designed to treat your pet like royalty — each
							delivered by a vetted specialist who treats every companion like their own.
						</p>
					</div>
					<Link href="/service" className="pp-featured__explore" data-section-reveal="cta">
						Explore all services
						<ArrowForwardOutlinedIcon aria-hidden />
					</Link>
				</div>

				<div className="pp-featured__duo">
					<Link
						href={href}
						className="pp-featured__hero-card pp-card"
						data-section-reveal="featured"
					>
						<img
							className="pp-featured__hero-img"
							src={primaryImage}
							alt=""
							loading="lazy"
							onError={(e) => {
								e.currentTarget.src = FALLBACK_PRIMARY_IMAGE;
							}}
						/>
						<span className="pp-featured__badge">Most popular</span>
						<div className="pp-featured__hero-overlay">
							<h3 className="pp-featured__hero-title">{title}</h3>
							<p className="pp-featured__hero-desc">{primaryDescription}</p>
						</div>
					</Link>

					<article className="pp-featured__side-card" data-section-reveal="support">
						<div className="pp-featured__side-media">
							<img
								className="pp-featured__side-img"
								src={secondaryImage}
								alt=""
								loading="lazy"
								onError={(e) => {
									e.currentTarget.src = FALLBACK_SECONDARY_IMAGE;
								}}
							/>
						</div>
						<div className="pp-featured__side-body">
							<h3 className="pp-featured__side-title">{FALLBACK.toolsTitle}</h3>
							<p className="pp-featured__side-desc">{toolsDescription}</p>
							<Link href={href} className="pp-featured__side-link">
								Learn more
								<ArrowForwardOutlinedIcon aria-hidden />
							</Link>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
