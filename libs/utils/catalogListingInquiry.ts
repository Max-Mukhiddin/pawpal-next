import { Direction } from '../enums/common.enum';
import { PropertyLocation, PropertyType } from '../enums/property.enum';
import type { PropertiesInquiry } from '../types/property/property.input';

/** Shared shape for “related items” on service/product detail (enum-locked + optional location). */
export function relatedListingInquiryInput(
	listingKind: PropertyType.SERVICE | PropertyType.PRODUCT,
	location?: PropertyLocation | null,
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

/** Force catalog queries to only return service listings (shared `getProperties` + `search.typeList`). */
export function withServicesListingTypeFilter(input: PropertiesInquiry): PropertiesInquiry {
	return {
		...input,
		search: {
			...input.search,
			typeList: [PropertyType.SERVICE],
		},
	};
}

/** Force catalog queries to only return product listings (shared `getProperties` + `search.typeList`). */
export function withProductsListingTypeFilter(input: PropertiesInquiry): PropertiesInquiry {
	return {
		...input,
		search: {
			...input.search,
			typeList: [PropertyType.PRODUCT],
		},
	};
}
