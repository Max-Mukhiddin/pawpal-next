import type { Listing } from '../listing/listing';
import type { T } from '../common';
import type { Service } from './service';

export function listingToService(row: Listing): Service {
	return row;
}

export function listingListToServices(rows: Listing[] | undefined | null): Service[] {
	return rows ?? [];
}

/** Apollo `GET_LISTINGS` completion payload. */
export function getServiceListFromTransitionQuery(data: T | null | undefined): Service[] {
	return listingListToServices(data?.getListings?.list);
}

/** Apollo `GET_LISTING` completion payload. */
export function getServiceFromTransitionQuery(data: T | null | undefined): Service | null {
	const row = data?.getListing;
	return row ? listingToService(row) : null;
}
