import { GET_PROPERTIES, GET_PROPERTY } from '../user/query';

/**
 * PawPal services domain — GraphQL documents alias legacy property operations until
 * `getServices` / `getService` resolvers exist. Operation names inside the AST remain
 * `GetProperties` / `GetProperty` for server compatibility.
 */
export const GET_SERVICES = GET_PROPERTIES;
export const GET_SERVICE = GET_PROPERTY;
