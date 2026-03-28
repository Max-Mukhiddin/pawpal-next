import type { PropertiesInquiry } from '../property/property.input';

/**
 * Inquiry for the public products catalog (pagination, sort, text/location filters).
 * GraphQL still accepts `PropertiesInquiry!` until dedicated product inputs exist.
 */
export type ProductsInquiry = PropertiesInquiry;
