import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import { homeFeaturedListingsInquiry } from '../../utils/catalogListingInquiry';
import type { Listing } from '../../types/listing/listing';
import HomeFeaturedItemCard from './HomeFeaturedItemCard';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

const PRODUCT_HOME_INPUT = homeFeaturedListingsInquiry(ListingType.PRODUCT);
const TARGET_COUNT = 3;
const FALLBACK_PRODUCTS = [
	{
		_id: 'fp-1',
		title: 'Premium pet food',
		price: 24,
		image: '/images/services/service-shop.jpg',
	},
	{
		_id: 'fp-2',
		title: 'Cozy pet bed',
		price: 49,
		image: '/images/services/service-grooming.jpg',
	},
	{
		_id: 'fp-3',
		title: 'Interactive toy bundle',
		price: 18,
		image: '/images/services/service-walking.jpg',
	},
] as const;

const getImageUrl = (imagePath: string | undefined): string => resolveListingImageUrl(imagePath, '/img/listing/default-listing.webp');

export default function FeaturedProducts() {
	const variables = useMemo(() => ({ input: PRODUCT_HOME_INPUT }), []);

	const { data, loading, error } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const normalizedListings = listings.map((listing) => ({
		...listing,
		listingImages: listing.listingImages?.length ? [getImageUrl(listing.listingImages[0]), ...listing.listingImages.slice(1)] : [],
	}));
	const placeholderCount = Math.max(0, TARGET_COUNT - normalizedListings.length);
	const placeholders = FALLBACK_PRODUCTS.slice(0, placeholderCount);
	const showLoading = loading && normalizedListings.length === 0;
	const showEmpty = !loading && error && normalizedListings.length === 0;

	return (
		<section className="section-pawpal section-pawpal--white featured-products-pawpal animate-on-scroll" aria-labelledby="pawpal-home-products-title">
			<div className="section-container featured-products-pawpal__inner">
				<header className="section-header">
					<p className="section-label">OUR PRODUCTS</p>
					<h2 id="pawpal-home-products-title" className="section-title">
						Everything your pet needs
					</h2>
					<p className="section-subtitle">
						From nutrition to comfort, discover quality picks trusted by PawPal families.
					</p>
					<Link href="/product" className="section-action">
						Browse all products
						<ArrowForwardOutlinedIcon className="featured-products-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				{showLoading && (
					<p className="section-subtitle" style={{ marginTop: 0 }}>
						Loading featured products…
					</p>
				)}

				{showEmpty && (
					<p className="section-subtitle" style={{ marginTop: 0 }}>
						Products will appear here as sellers publish on PawPal.
					</p>
				)}

				{(normalizedListings.length > 0 || placeholders.length > 0) && (
					<div className="featured-products-pawpal__grid">
						{normalizedListings.map((listing) => (
							<HomeFeaturedItemCard
								key={listing._id}
								listing={listing}
								detailBasePath="/product/detail"
								viewLabel="View product"
							/>
						))}
						{placeholders.map((p) => (
							<Link
								href="/product"
								key={p._id}
								className="featured-products-pawpal__card-link"
								style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
							>
								<article className="featured-products-pawpal__card">
									<div className="featured-products-pawpal__media">
										<img
											src={p.image}
											alt={p.title}
											className="featured-products-pawpal__img"
											onError={(e) => {
												e.currentTarget.src = '/img/listing/default-listing.webp';
											}}
										/>
									</div>
									<div className="featured-products-pawpal__body">
										<h3 className="featured-products-pawpal__name">{p.title}</h3>
										<div className="featured-products-pawpal__meta">
											<span className="featured-products-pawpal__price">${p.price}</span>
										</div>
										<div className="featured-products-pawpal__footer">
											<span className="featured-products-pawpal__rating">Coming soon</span>
											<span className="featured-products-pawpal__cta">
												<ArrowForwardOutlinedIcon className="featured-products-pawpal__cta-icon" aria-hidden />
												Browse
											</span>
										</div>
									</div>
								</article>
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
