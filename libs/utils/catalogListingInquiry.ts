import { Direction } from '../enums/common.enum';
import { ListingLocation, ListingType } from '../enums/listing.enum';
import type { ListingsInquiry } from '../types/listing/listing.input';

/** Related carousel / strip on product & service detail (`getListings` + `search.typeList` + optional location). */
export function relatedListingInquiryInput(
	listingKind: ListingType.SERVICE | ListingType.PRODUCT,
	location?: ListingLocation | null,
) {
	return {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			typeList: [listingKind],
			locationList: location ? [location] : [],
		},
	};
}

/** Lock catalog inquiry to `ListingType.SERVICE`. */
export function withServicesListingTypeFilter(input: ListingsInquiry): ListingsInquiry {
	return {
		...input,
		search: {
			...input.search,
			typeList: [ListingType.SERVICE],
		},
	};
}

/** Lock catalog inquiry to `ListingType.PRODUCT`. */
export function withProductsListingTypeFilter(input: ListingsInquiry): ListingsInquiry {
	return {
		...input,
		search: {
			...input.search,
			typeList: [ListingType.PRODUCT],
		},
	};
}

/** Homepage featured strip: single type slice, ranked for discovery. */
export function homeFeaturedListingsInquiry(listingKind: ListingType.PRODUCT | ListingType.SERVICE): ListingsInquiry {
	return {
		page: 1,
		limit: 6,
		sort: 'listingRank',
		direction: Direction.DESC,
		search: {
			typeList: [listingKind],
		},
	};
}
