import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface FeaturedCard {
	_id: string;
	title: string;
	description: string;
	image: string;
	href: string;
}

const FALLBACK_CARDS: FeaturedCard[] = [
	{
		_id: 'fb-1',
		title: 'Spa & Wellness Journeys',
		description: 'Hand-crafted grooming rituals tailored for serene companions.',
		image: '/images/services/service-spa.jpg',
		href: '/service',
	},
	{
		_id: 'fb-2',
		title: 'Culinary Pet Dining',
		description: 'Nutritionist-designed menus with fresh, seasonal ingredients.',
		image: '/images/services/service-dining.jpg',
		href: '/service',
	},
	{
		_id: 'fb-3',
		title: 'Luxury Accommodation',
		description: 'Quiet, climate-controlled overnight stays for restful nights.',
		image: '/images/services/service-boarding.jpg',
		href: '/service',
	},
	{
		_id: 'fb-4',
		title: 'Behavioral Architecture',
		description: 'One-on-one training to shape confident, well-adjusted behavior.',
		image: '/images/services/service-training.jpg',
		href: '/service',
	},
];

const truncate = (text: string, max = 90): string => {
	const clean = (text || '').trim();
	if (!clean) return 'Premium care crafted with attention to every detail.';
	if (clean.length <= max) return clean;
	return `${clean.slice(0, max).trimEnd()}…`;
};

export default function FeaturedServices() {
	const variables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 4,
				sort: 'listingViews',
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

	const listings: Listing[] = data?.getListings?.list ?? [];

	const cards: FeaturedCard[] = listings.length >= 4
		? listings.slice(0, 4).map((l) => ({
				_id: l._id,
				title: l.listingTitle,
				description: truncate((l as any).listingDesc),
				image: l.listingImages?.[0] ?? '',
				href: `/service/detail?id=${l._id}`,
			}))
		: FALLBACK_CARDS;

	return (
		<section className="featured-services animate-on-scroll" aria-labelledby="featured-services-title">
			<div className="featured-services__shapes" aria-hidden>
				<span className="featured-services__shape featured-services__shape--1" />
				<span className="featured-services__shape featured-services__shape--2" />
				<span className="featured-services__shape featured-services__shape--3" />
			</div>
			<div className="featured-services__container">
				<header className="featured-services__header">
					<p className="featured-services__label">FEATURED SERVICES</p>
					<h2 id="featured-services-title" className="featured-services__title">
						Premium Pet Care Atelier
					</h2>
				</header>

				<div className="featured-services__grid">
					{cards.map((card, index) => {
						const imageUrl = resolveListingImageUrl(card.image, '/img/listing/default-listing.webp');
						return (
							<Link
								href={card.href}
								className={`featured-services__card featured-services__card--${index + 1}`}
								key={card._id}
							>
								<div className="featured-services__media">
									<img
										src={imageUrl}
										alt={card.title}
										className="featured-services__img"
										loading="lazy"
										onError={(e) => {
											e.currentTarget.src = '/img/listing/default-listing.webp';
										}}
									/>
								</div>
								<h3 className="featured-services__card-title">{card.title}</h3>
								<p className="featured-services__card-desc">{card.description}</p>
								<span className="featured-services__cta">Explore Service</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
