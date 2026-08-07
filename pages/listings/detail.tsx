import type { GetServerSideProps } from 'next';
import { REACT_APP_API_GRAPHQL_URL } from '../../libs/config';
import { ListingType } from '../../libs/enums/listing.enum';

/**
 * Legacy Nestar listing detail — redirect to /service/detail or /product/detail
 * based on the listing's type from the API.
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const rawId = ctx.query.id;
	const id = typeof rawId === 'string' ? rawId.trim() : Array.isArray(rawId) ? rawId[0]?.trim() : '';

	if (!id) {
		return {
			redirect: {
				destination: '/service',
				permanent: false,
			},
		};
	}

	let listingType = '';
	try {
		const res = await fetch(REACT_APP_API_GRAPHQL_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `
					query GetListingType($input: String!) {
						getListing(listingId: $input) {
							listingType
						}
					}
				`,
				variables: { input: id },
			}),
		});
		const json = (await res.json()) as {
			data?: { getListing?: { listingType?: string } };
		};
		listingType = String(json?.data?.getListing?.listingType ?? '').toUpperCase();
	} catch {
		listingType = '';
	}

	const base =
		listingType === ListingType.PRODUCT ? '/product/detail' : '/service/detail';

	return {
		redirect: {
			destination: `${base}?id=${encodeURIComponent(id)}`,
			permanent: false,
		},
	};
};

export default function ListingsDetailRedirect() {
	return null;
}
