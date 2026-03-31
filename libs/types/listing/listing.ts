import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';
import type { MeLiked, TotalCounter } from '../common/aggregates';

export type { MeLiked, TotalCounter };

/** Backend `Listing.memberData` preview on listing payloads. */
export interface ListingMemberData {
	_id: string;
	memberNick?: string | null;
	memberPhone?: string | null;
	memberImage?: string | null;
}

export interface Listing {
	_id: string;
	listingType: ListingType;
	listingStatus: ListingStatus;
	listingLocation: ListingLocation;
	listingAddress: string;
	listingTitle: string;
	listingPrice: number;
	listingViews: number;
	listingLikes: number;
	listingComments: number;
	listingRank: number;
	listingImages: string[];
	listingDesc?: string;
	durationMinutes?: number | null;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: ListingMemberData;
}

export interface Listings {
	list: Listing[];
	metaCounter: TotalCounter[];
}
