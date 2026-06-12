import { ListingType } from '../../enums/listing.enum';

export function isProductListingType(t: ListingType | string): boolean {
	return String(t) === ListingType.PRODUCT;
}

export function isServiceListingType(t: ListingType | string): boolean {
	return String(t) === ListingType.SERVICE;
}

export function listingFormTitleLabel(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Product title';
	if (isServiceListingType(t)) return 'Service title';
	return 'Title';
}

export function listingFormTitlePlaceholder(t: ListingType | string): string {
	if (isProductListingType(t)) return 'e.g. Grain-free salmon kibble, 5kg';
	if (isServiceListingType(t)) return 'e.g. Full grooming — small dogs';
	return 'Title';
}

export function listingFormPriceLabel(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Product price';
	if (isServiceListingType(t)) return 'Starting price';
	return 'Price';
}

export function listingFormPricePlaceholder(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Price in your currency';
	if (isServiceListingType(t)) return 'From price (per session or consult)';
	return 'Price';
}

export function listingFormDescriptionHeading(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Product description';
	if (isServiceListingType(t)) return 'Service description';
	return 'Description';
}

export function listingFormDescriptionLabel(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Product description';
	if (isServiceListingType(t)) return 'Service description';
	return 'Description';
}

export function listingFormUploadHeading(t: ListingType | string): string {
	if (isProductListingType(t)) return 'Product photos';
	if (isServiceListingType(t)) return 'Service photos';
	return 'Upload photos';
}

export const listingFormPhotoFormatHint = 'Photos must be in JPEG or PNG format';

export function listingFormIntro(t: ListingType | string): string {
	if (isProductListingType(t)) {
		return 'List a physical or catalog product. Clear photos and specs help buyers decide.';
	}
	if (isServiceListingType(t)) {
		return 'Offer a bookable care or service session. Set duration so customers know what to expect.';
	}
	return 'We are glad to see you again!';
}

export function listingFormPageTitle(isEdit: boolean, t: ListingType | string): string {
	if (isEdit) {
		if (isProductListingType(t)) return 'Edit product';
		if (isServiceListingType(t)) return 'Edit service';
		return 'Edit item';
	}
	if (isProductListingType(t)) return 'Add product';
	if (isServiceListingType(t)) return 'Add service';
	return 'Add product or service';
}
