import { ListingType } from '../enums/listing.enum';

/** Browse URL with filter state in `?input=` (JSON string, same shape as `ListingsInquiry`). */
export function getListingsIndexHref(listingInquiry: unknown): string {
	return `/service?input=${JSON.stringify(listingInquiry)}`;
}

/** Detail URL for a listing; unknown type defaults to service detail (canonical marketplace). */
export function getListingDetailHref(
	listingId: string | null | undefined,
	listingType: string | null | undefined,
): string | null {
	if (!listingId?.trim()) return null;
	const id = listingId.trim();
	const t = listingType ? String(listingType).toUpperCase() : '';
	if (t === ListingType.PRODUCT) return `/product/detail?id=${encodeURIComponent(id)}`;
	return `/service/detail?id=${encodeURIComponent(id)}`;
}

/** Primary card title: prefer API title, else reference id, else generic label. */
export function inboxListingHeadline(
	listingTitle: string | null | undefined,
	listingId: string | null | undefined,
): string {
	const title = listingTitle?.trim();
	if (title) return title;
	if (listingId?.trim()) return `Reference: ${listingId.trim()}`;
	return 'Catalog item';
}

/** How to refer to the listing owner on “my inquiry” views from `listingType`. */
export function inquiryHostRoleLabel(listingType: string | null | undefined): 'Seller' | 'Specialist' | 'Host' {
	const t = listingType ? String(listingType).toUpperCase() : '';
	if (t === ListingType.PRODUCT) return 'Seller';
	if (t === ListingType.SERVICE) return 'Specialist';
	return 'Host';
}
