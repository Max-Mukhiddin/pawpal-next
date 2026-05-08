import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import HomeFeaturedItemCard from './HomeFeaturedItemCard';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

const FEATURED_SERVICES_INPUT = {
	page: 1,
	limit: 3,
	sort: 'listingViews',
	direction: 'DESC',
	search: { typeList: [ListingType.SERVICE] },
} as const;

const FALLBACK_SERVICES = [
	{
		_id: 'fs-1',
		title: 'Gentle grooming session',
		price: 55,
		image: '/images/services/service-grooming.jpg',
	},
	{
		_id: 'fs-2',
		title: 'Personalized dog training',
		price: 75,
		image: '/images/services/service-training.jpg',
	},
	{
		_id: 'fs-3',
		title: 'Daily walk package',
		price: 30,
		image: '/images/services/service-walking.jpg',
	},
] as const;

const getImageUrl = (imagePath: string | undefined): string =>
	resolveListingImageUrl(imagePath, '/img/listing/default-listing.webp');

export default function FeaturedServices() {
	const variables = useMemo(() => ({ input: FEATURED_SERVICES_INPUT }), []);

	const { data, loading, error } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const normalizedListings = listings.map((listing) => ({
		...listing,
		listingImages: listing.listingImages?.length
			? [getImageUrl(listing.listingImages[0]), ...listing.listingImages.slice(1)]
			: [],
	}));
	const showLoading = loading && normalizedListings.length === 0;
	const showEmpty = !loading && error && normalizedListings.length === 0;

	return (
		<section className="section-pawpal section-pawpal--cream featured-services-pawpal animate-on-scroll" aria-labelledby="featured-services-title">
			<div className="section-container featured-products-pawpal__inner">
				<header className="section-header">
					<p className="section-label">FEATURED SERVICES</p>
					<h2 id="featured-services-title" className="section-title">
						Our most-loved care services
					</h2>
					<p className="section-subtitle">
						Top performing services trusted by pet parents, selected by real views and repeat bookings.
					</p>
					<Link href="/service" className="section-action">
						View all services
						<ArrowForwardOutlinedIcon className="featured-products-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				{showLoading && (
					<p className="section-subtitle" style={{ marginTop: 0 }}>
						Loading featured services…
					</p>
				)}

				{showEmpty && (
					<p className="section-subtitle" style={{ marginTop: 0 }}>
						Featured services will appear here soon.
					</p>
				)}

				<div className="featured-products-pawpal__grid">
					{(normalizedListings.length > 0 ? normalizedListings.slice(0, 3) : []).map((listing) => (
						<HomeFeaturedItemCard
							key={listing._id}
							listing={listing}
							detailBasePath="/service/detail"
							viewLabel="View service"
						/>
					))}
					{normalizedListings.length === 0 &&
						FALLBACK_SERVICES.map((service) => (
							<Link
								href="/service"
								key={service._id}
								className="featured-products-pawpal__card-link"
								style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
							>
								<article className="featured-products-pawpal__card">
									<div className="featured-products-pawpal__media">
										<img
											src={service.image}
											alt={service.title}
											className="featured-products-pawpal__img"
											onError={(e) => {
												e.currentTarget.src = '/img/listing/default-listing.webp';
											}}
										/>
									</div>
									<div className="featured-products-pawpal__body">
										<h3 className="featured-products-pawpal__name">{service.title}</h3>
										<div className="featured-products-pawpal__meta">
											<span className="featured-products-pawpal__price">${service.price}</span>
										</div>
										<div className="featured-products-pawpal__footer">
											<span className="featured-products-pawpal__rating">Top service</span>
											<span className="featured-products-pawpal__cta">
												<ArrowForwardOutlinedIcon className="featured-products-pawpal__cta-icon" aria-hidden />
												Explore
											</span>
										</div>
									</div>
								</article>
							</Link>
						))}
				</div>
			</div>
		</section>
	);
}
