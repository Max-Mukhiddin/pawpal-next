import { ListingType } from '../enums/listing.enum';

/** Detail URL for a listing; unknown type → `/property/detail` (safe fallback). */
export function getListingDetailHref(
	listingId: string | null | undefined,
	listingType: string | null | undefined,
): string | null {
	if (!listingId?.trim()) return null;
	const id = listingId.trim();
	const t = listingType ? String(listingType).toUpperCase() : '';
	if (t === ListingType.PRODUCT) return `/products/detail?id=${encodeURIComponent(id)}`;
	if (t === ListingType.SERVICE) return `/services/detail?id=${encodeURIComponent(id)}`;
	return `/property/detail?id=${encodeURIComponent(id)}`;
}

/** Primary card title: prefer API listing title, else `Listing ID: …`, else `Listing`. */
export function inboxListingHeadline(
	listingTitle: string | null | undefined,
	listingId: string | null | undefined,
): string {
	const title = listingTitle?.trim();
	if (title) return title;
	if (listingId?.trim()) return `Listing ID: ${listingId.trim()}`;
	return 'Listing';
}

/** How to refer to the listing owner on “my inquiry” views from `listingType`. */
export function inquiryHostRoleLabel(listingType: string | null | undefined): 'Seller' | 'Specialist' | 'Host' {
	const t = listingType ? String(listingType).toUpperCase() : '';
	if (t === ListingType.PRODUCT) return 'Seller';
	if (t === ListingType.SERVICE) return 'Specialist';
	return 'Host';
}
