import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Listing {
	_id: string;
	listingType: ListingType;
	listingStatus: ListingStatus;
	listingLocation: ListingLocation;
	listingAddress: string;
	listingTitle: string;
	listingPrice: number;
	listingSquare: number;
	listingBeds: number;
	listingRooms: number;
	listingViews: number;
	listingLikes: number;
	listingComments: number;
	listingRank: number;
	listingImages: string[];
	listingDesc?: string;
	listingBarter: boolean;
	listingRent: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Listings {
	list: Listing[];
	metaCounter: TotalCounter[];
}
