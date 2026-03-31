import { ListingLocation, ListingStatus, ListingType } from '../../enums/listing.enum';
import { Direction } from '../../enums/common.enum';

export interface ListingInput {
	listingType: ListingType;
	listingLocation: ListingLocation;
	listingAddress: string;
	listingTitle: string;
	listingPrice: number;
	listingImages: string[];
	listingDesc?: string;
	durationMinutes?: number | null;
	memberId?: string;
}

interface ListingsSearch {
	memberId?: string;
	locationList?: ListingLocation[];
	typeList?: ListingType[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
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
	/** When set, restricts agent catalog to products or services (backend-supported filter). */
	typeList?: ListingType[];
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
