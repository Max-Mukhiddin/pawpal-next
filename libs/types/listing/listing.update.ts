import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';

export interface ListingUpdate {
	_id: string;
	listingType?: ListingType;
	listingStatus?: ListingStatus;
	listingLocation?: ListingLocation;
	listingAddress?: string;
	listingTitle?: string;
	listingPrice?: number;
	listingImages?: string[];
	listingDesc?: string;
	durationMinutes?: number | null;
}
