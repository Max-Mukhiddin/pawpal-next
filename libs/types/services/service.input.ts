import type { PropertiesInquiry } from '../property/property.input';

/**
 * Inquiry for the public services catalog (pagination, sort, text/location filters).
 * GraphQL still accepts `PropertiesInquiry!` until dedicated service inputs exist.
 */
export type ServicesInquiry = PropertiesInquiry;
