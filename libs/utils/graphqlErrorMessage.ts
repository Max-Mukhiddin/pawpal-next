/** Pull a readable message from Apollo / network errors for user-facing alerts. */
export function getUserReadableErrorMessage(err: unknown, fallback: string): string {
	if (err && typeof err === 'object') {
		const anyErr = err as {
			graphQLErrors?: { message?: string }[];
			networkError?: { message?: string };
			message?: string;
		};
		const gql = anyErr.graphQLErrors?.[0]?.message;
		if (typeof gql === 'string' && gql.trim()) {
			return gql.replace(/^GraphQL error:\s*/i, '').trim();
		}
		const net = anyErr.networkError?.message;
		if (typeof net === 'string' && net.trim()) return net.trim();
		if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
			return anyErr.message.replace(/^GraphQL error:\s*/i, '').trim();
		}
	}
	return fallback;
}
