import type { GetServerSideProps } from 'next';

/** Legacy agent detail — redirect to Specialist detail (`id` or `agentId` query) */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const raw = ctx.query.id ?? ctx.query.agentId;
	const id = typeof raw === 'string' ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : '';

	if (!id) {
		return {
			redirect: {
				destination: '/specialist',
				permanent: false,
			},
		};
	}

	return {
		redirect: {
			destination: `/specialist/detail?id=${encodeURIComponent(id)}`,
			permanent: false,
		},
	};
};

export default function AgentDetailRedirect() {
	return null;
}
