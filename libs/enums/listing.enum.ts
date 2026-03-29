/** PawPal / Nestar listing-kind and geography — GraphQL `Listing` / `ListingsInquiry` enums. */
export enum ListingType {
	APARTMENT = 'APARTMENT',
	VILLA = 'VILLA',
	HOUSE = 'HOUSE',
	/** Catalog discrimination via `search.typeList` on `getListings`. */
	PRODUCT = 'PRODUCT',
	SERVICE = 'SERVICE',
}

export enum ListingStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export enum ListingLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
