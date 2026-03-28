import type { MeLiked, Properties, Property, TotalCounter } from '../property/property';

/**
 * PawPal catalog “product” row.
 * Today the API still returns property-shaped documents; this alias keeps a stable frontend name for migration.
 */
export type Product = Property;

/**
 * Paginated products list + counters (legacy `getProperties` / future `getProducts` list shape).
 */
export type ProductsListPayload = Properties;

export type { MeLiked, TotalCounter };
