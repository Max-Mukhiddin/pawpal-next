import type { GetServerSideProps } from 'next';

/** Legacy Nestar route — redirect to Services catalog */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const q = ctx.query.input;
	const destination =
		typeof q === 'string' && q.length > 0 ? `/service?input=${encodeURIComponent(q)}` : '/service';

	return {
		redirect: {
			destination,
			permanent: false,
		},
	};
};

export default function ListingsIndexRedirect() {
	return null;
}
