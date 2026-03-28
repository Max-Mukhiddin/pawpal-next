import { GET_PROPERTIES, GET_PROPERTY } from '../user/query';

/**
 * PawPal products domain — GraphQL documents alias legacy property operations until
 * `getProducts` / `getProduct` resolvers exist. Operation names inside the AST remain
 * `GetProperties` / `GetProperty` for server compatibility.
 */
export const GET_PRODUCTS = GET_PROPERTIES;
export const GET_PRODUCT = GET_PROPERTY;
