import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';

export interface ListingUpdate {
	_id: string;
	listingType?: ListingType;
	listingStatus?: ListingStatus;
	listingLocation?: ListingLocation;
	listingAddress?: string;
	listingTitle?: string;
	listingPrice?: number;
	listingSquare?: number;
	listingBeds?: number;
	listingRooms?: number;
	listingImages?: string[];
	listingDesc?: string;
	listingBarter?: boolean;
	listingRent?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
}
