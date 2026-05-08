import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

const CARDS = [
	{
		slug: 'grooming',
		title: 'Grooming',
		description: 'Spa baths, trims, and coat care with a gentle touch.',
		image: '/images/services/service-grooming.jpg',
		href: '/service',
	},
	{
		slug: 'walking',
		title: 'Walking',
		description: 'Daily walks that match your pet’s energy and routine.',
		image: '/images/services/service-walking.jpg',
		href: '/service',
	},
	{
		slug: 'training',
		title: 'Training',
		description: 'Positive coaching for calmer habits at home.',
		image: '/images/services/service-training.jpg',
		href: '/service',
	},
	{
		slug: 'vet',
		title: 'Vet Care',
		description: 'Checkups and trusted support when they need it.',
		image: '/images/services/service-vet.jpg',
		href: '/service',
	},
	{
		slug: 'boarding',
		title: 'Boarding',
		description: 'Comfortable stays with routines they already know.',
		image: '/images/services/service-boarding.jpg',
		href: '/service',
	},
	{
		slug: 'shop',
		title: 'Pet Shop',
		description: 'Curated food, toys, and essentials in one place.',
		image: '/images/services/service-shop.jpg',
		href: '/service',
	},
] as const;

const getImageUrl = (imagePath: string | undefined): string =>
	resolveListingImageUrl(imagePath, '/img/listing/default-listing.webp');

export default function OurServices() {
	const variables = useMemo(
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

	const { data } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];

	const cards =
		listings.length > 0
			? listings.map((listing) => {
					return {
						slug: listing._id,
						title: listing.listingTitle,
						description: `$${listing.listingPrice ?? 0}`,
						image: listing.listingImages?.[0] ?? '',
						href: `/service/detail?id=${listing._id}`,
					};
				})
			: CARDS;

	return (
		<section className="section-pawpal section-pawpal--cream our-services animate-on-scroll" aria-labelledby="our-services-title">
			<div className="section-container">
				<header className="section-header">
					<p className="section-label">OUR SERVICES</p>
					<h2 id="our-services-title" className="section-title">
						Care Your Pet Will Love
					</h2>
					<p className="section-subtitle">Thoughtfully designed care for every stage of your pet&apos;s life.</p>
					<Link href="/service" className="section-action">
						Browse all services
						<ArrowForwardOutlinedIcon className="our-services__browse-icon" aria-hidden />
					</Link>
				</header>

				<div className="our-services__grid">
					{cards.map((card) => {
						const imageUrl = getImageUrl(card.image);
						return (
							<Link href={card.href} className="our-services__card" key={card.slug}>
								<div className="our-services__card-media">
									<img
										src={imageUrl}
										alt={card.title}
										className="our-services__card-img"
										loading="lazy"
										onError={(e) => {
											e.currentTarget.src = '/img/listing/default-listing.webp';
										}}
									/>
								</div>
								<div className="our-services__card-body">
									<h3 className="our-services__card-title">{card.title}</h3>
									<p className="our-services__card-text">{card.description}</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
