export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

/** Preferred threshold for “top” listing badge (rank). */
export const topListingRank = 2;

/** @deprecated Use `topListingRank`. */
export const topPropertyRank = topListingRank;
