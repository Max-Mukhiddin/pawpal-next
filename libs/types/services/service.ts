import type { MeLiked, Properties, Property, TotalCounter } from '../property/property';

/**
 * PawPal catalog “service” row.
 * Today the API still returns property-shaped documents; this alias keeps a stable frontend name for migration.
 */
export type Service = Property;

/**
 * Paginated services list + counters (legacy `getProperties` / future `getServices` list shape).
 */
export type ServicesListPayload = Properties;

export type { MeLiked, TotalCounter };
