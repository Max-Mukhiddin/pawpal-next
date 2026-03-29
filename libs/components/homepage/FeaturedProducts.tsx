import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import { homeFeaturedListingsInquiry } from '../../utils/catalogListingInquiry';
import type { Listing } from '../../types/listing/listing';
import HomeFeaturedListingCard from './HomeFeaturedListingCard';

const PRODUCT_HOME_INPUT = homeFeaturedListingsInquiry(ListingType.PRODUCT);

export default function FeaturedProducts() {
	const variables = useMemo(() => ({ input: PRODUCT_HOME_INPUT }), []);

	const { data, loading, error } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const showEmpty = !loading && (error || listings.length === 0);

	return (
		<section className="pawpal-home-section featured-products-pawpal" aria-labelledby="pawpal-home-products-title">
			<div className="pawpal-home-section__inner featured-products-pawpal__inner">
				<header className="featured-products-pawpal__head">
					<div className="featured-products-pawpal__intro">
						<p className="featured-products-pawpal__eyebrow">Featured products</p>
						<h2 id="pawpal-home-products-title" className="featured-products-pawpal__title">
							Essentials pets love every day
						</h2>
						<p className="featured-products-pawpal__lead">
							From nutrition to comfort, discover quality picks trusted by PawPal families.
						</p>
					</div>
					<Link href="/products" className="featured-products-pawpal__browse">
						<span>Browse all products</span>
						<ArrowForwardOutlinedIcon className="featured-products-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				{loading && (
					<p className="pawpal-home-section__lead" style={{ marginTop: 0 }}>
						Loading featured products…
					</p>
				)}

				{showEmpty && (
					<p className="pawpal-home-section__lead" style={{ marginTop: 0 }}>
						Product listings will appear here as sellers publish on PawPal.
					</p>
				)}

				{listings.length > 0 && (
					<div className="featured-products-pawpal__grid">
						{listings.map((listing) => (
							<HomeFeaturedListingCard
								key={listing._id}
								listing={listing}
								detailBasePath="/products/detail"
								viewLabel="View product"
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
