import type { GetServerSideProps } from 'next';

/** Legacy agent directory — redirect to Specialists */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const q = ctx.query.input;
	const destination =
		typeof q === 'string' && q.length > 0
			? `/specialist?input=${encodeURIComponent(q)}`
			: '/specialist';

	return {
		redirect: {
			destination,
			permanent: false,
		},
	};
};

export default function AgentIndexRedirect() {
	return null;
}
