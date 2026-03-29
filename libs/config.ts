export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

/**
 * GraphQL `ListingsInquiry.search.options` values (schema-stable; backend still uses these strings).
 * Prefer these identifiers in new frontend code instead of hardcoding literals.
 */
export const listingBarter = 'propertyBarter' as const;
export const listingRent = 'propertyRent' as const;

/** @deprecated Prefer `listingBarter`, `listingRent`, and `availableListingOptions`. */
export const availableOptions = [listingBarter, listingRent];

/** Preferred alias for filter option keys array (same contents as `availableOptions`). */
export const availableListingOptions = availableOptions;

const thisYear = new Date().getFullYear();

/** @deprecated Use `listingConstructionYears` (same array reference). */
export const propertyYears: string[] = [];
export const listingConstructionYears = propertyYears;

for (let i = 1970; i <= thisYear; i++) {
	propertyYears.push(String(i));
}

/** @deprecated Use `listingSquareOptions` (same array reference). */
export const propertySquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];
export const listingSquareOptions = propertySquare;

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

/** Preferred threshold for “top” listing badge (rank). */
export const topListingRank = 2;

/** @deprecated Use `topListingRank`. */
export const topPropertyRank = topListingRank;
