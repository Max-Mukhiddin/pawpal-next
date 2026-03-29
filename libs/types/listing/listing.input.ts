import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';
import { Direction } from '../../enums/common.enum';

export interface ListingInput {
	listingType: ListingType;
	listingLocation: ListingLocation;
	listingAddress: string;
	listingTitle: string;
	listingPrice: number;
	listingSquare: number;
	listingBeds: number;
	listingRooms: number;
	listingImages: string[];
	listingDesc?: string;
	listingBarter?: boolean;
	listingRent?: boolean;
	memberId?: string;
	constructedAt?: Date;
}

interface ListingsSearch {
	memberId?: string;
	locationList?: ListingLocation[];
	typeList?: ListingType[];
	roomsList?: Number[];
	options?: string[];
	bedsList?: Number[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	squaresRange?: Range;
	text?: string;
}

export interface ListingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ListingsSearch;
}

interface AgentListingsSearch {
	listingStatus?: ListingStatus;
}

export interface AgentListingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentListingsSearch;
}

interface AllListingsSearch {
	listingStatus?: ListingStatus;
	listingLocationList?: ListingLocation[];
}

export interface AllListingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AllListingsSearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
