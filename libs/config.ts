/**
 * Absolute base URL of the backend API.
 *
 * `next.config.js` exposes `REACT_APP_API_URL` to the browser bundle, so that name
 * must be read first — `NEXT_PUBLIC_API_URL` is not defined anywhere in this project
 * and resolving to `undefined` turns API calls into page-relative paths.
 */
export const REACT_APP_API_URL = (
	process.env.REACT_APP_API_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3007'
).replace(/\/+$/, '');

export const REACT_APP_API_GRAPHQL_URL =
	process.env.REACT_APP_API_GRAPHQL_URL ||
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
	'http://localhost:3007/graphql';

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Sign in first',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

/** Preferred threshold for “top” listing badge (rank). */
export const topListingRank = 2;

/** @deprecated Use `topListingRank`. */
export const topPropertyRank = topListingRank;
