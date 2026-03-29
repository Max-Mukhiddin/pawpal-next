/** Input for `createBooking` (service listings only). */
export interface BookingInput {
	listingId: string;
	dateTime: string;
	note?: string;
}
