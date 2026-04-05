import Link from 'next/link';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import type { Listing } from '../../types/listing/listing';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';

export interface HomeFeaturedItemCardProps {
	listing: Listing;
	detailBasePath: '/product/detail' | '/service/detail';
	viewLabel: string;
}

/** Homepage featured strip tile; matches `.featured-products-pawpal__*` BEM from featured-products.scss */
export default function HomeFeaturedItemCard({ listing, detailBasePath, viewLabel }: HomeFeaturedItemCardProps) {
	const raw = listing.listingImages?.[0];
	const hasImage = Boolean(raw && String(raw).trim() !== '');
	const imageUrl = hasImage ? `${REACT_APP_API_URL}/${String(raw).replace(/^\/+/, '')}` : null;
	const href = `${detailBasePath}?id=${listing._id}`;
	const priceText =
		listing.listingPrice != null && Number(listing.listingPrice) > 0
			? `$${formatterStr(listing.listingPrice)}`
			: 'See details';

	return (
		<Link
			href={href}
			className="featured-products-pawpal__card-link"
			style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
		>
			<article className="featured-products-pawpal__card">
				<div className="featured-products-pawpal__media">
					{hasImage && imageUrl ? (
						<img src={imageUrl} alt={listing.listingTitle} className="featured-products-pawpal__img" />
					) : (
						<div className="featured-products-pawpal__media-placeholder" aria-hidden>
							<span className="featured-products-pawpal__media-placeholder-icon">🐾</span>
						</div>
					)}
				</div>
				<div className="featured-products-pawpal__body">
					<h3 className="featured-products-pawpal__name">{listing.listingTitle}</h3>
					<div className="featured-products-pawpal__meta">
						<span className="featured-products-pawpal__price">{priceText}</span>
					</div>
					<div className="featured-products-pawpal__footer">
						<span className="featured-products-pawpal__rating">{listing.listingViews} views</span>
						<span className="featured-products-pawpal__cta">
							<ArrowForwardOutlinedIcon className="featured-products-pawpal__cta-icon" aria-hidden />
							{viewLabel}
						</span>
					</div>
				</div>
			</article>
		</Link>
	);
}
