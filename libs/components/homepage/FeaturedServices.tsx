import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import { homeFeaturedListingsInquiry } from '../../utils/catalogListingInquiry';
import type { Listing } from '../../types/listing/listing';
import HomeFeaturedItemCard from './HomeFeaturedItemCard';

const SERVICE_HOME_INPUT = homeFeaturedListingsInquiry(ListingType.SERVICE);

export default function FeaturedServices() {
	const variables = useMemo(() => ({ input: SERVICE_HOME_INPUT }), []);

	const { data, loading, error } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const showEmpty = !loading && (error || listings.length === 0);

	return (
		<section className="pawpal-home-section" aria-labelledby="pawpal-home-services-title">
			<div className="pawpal-home-section__inner">
				<header className="featured-products-pawpal__head">
					<div className="featured-products-pawpal__intro">
						<h2 id="pawpal-home-services-title" className="pawpal-home-section__title">
							Featured services
						</h2>
						<p className="pawpal-home-section__lead" style={{ marginBottom: 0 }}>
							Hand-picked care services from PawPal specialists and partners.
						</p>
					</div>
					<Link href="/service" className="featured-products-pawpal__browse">
						<span>Browse all services</span>
						<ArrowForwardOutlinedIcon className="featured-products-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				{loading && (
					<p className="pawpal-home-section__lead" style={{ marginTop: 16 }}>
						Loading featured services…
					</p>
				)}

				{showEmpty && (
					<p className="pawpal-home-section__lead" style={{ marginTop: 16 }}>
						Services will appear here as providers publish on PawPal.
					</p>
				)}

				{listings.length > 0 && (
					<div className="featured-products-pawpal featured-products-pawpal--embedded">
						<div className="featured-products-pawpal__grid">
							{listings.map((listing) => (
								<HomeFeaturedItemCard
									key={listing._id}
									listing={listing}
									detailBasePath="/service/detail"
									viewLabel="View service"
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
