import type { GetServerSideProps } from 'next';

/** Legacy Nestar route — redirect to Listings admin */
export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: {
		destination: '/_admin/listings',
		permanent: false,
	},
});

export default function AdminPropertiesRedirect() {
	return null;
}
