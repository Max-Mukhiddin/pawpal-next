import type { Property } from '../property/property';
import type { T } from '../common';
import type { Service } from './service';

/** Map a single legacy property document to a `Service` view-model (identity during transition). */
export function propertyToService(row: Property): Service {
	return row;
}

/** Map a list of property documents to services (identity during transition). */
export function propertyListToServices(rows: Property[] | undefined | null): Service[] {
	return rows ?? [];
}

/**
 * Extract catalog rows from Apollo `GET_SERVICES` / `GET_PROPERTIES` completion payload.
 * Response root is still `getProperties` until the backend exposes `getServices`.
 */
export function getServiceListFromTransitionQuery(data: T | null | undefined): Service[] {
	return propertyListToServices(data?.getProperties?.list);
}

/**
 * Extract a single service from `GET_SERVICE` / `GET_PROPERTY` completion payload.
 * Response root is still `getProperty` until the backend exposes `getService`.
 */
export function getServiceFromTransitionQuery(data: T | null | undefined): Service | null {
	const row = data?.getProperty;
	return row ? propertyToService(row) : null;
}
