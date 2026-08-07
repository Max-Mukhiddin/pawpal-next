import { getJwtToken } from '../auth';
import { REACT_APP_API_URL } from '../config';

export type AIMessage = { role: 'user' | 'assistant'; content: string };

export type AIChatResponse = { reply: string };

export class AIChatError extends Error {
	readonly code: 'auth' | 'network' | 'server';

	constructor(message: string, code: 'auth' | 'network' | 'server') {
		super(message);
		this.name = 'AIChatError';
		this.code = code;
	}
}

export const sendAIMessage = async (messages: AIMessage[]): Promise<AIChatResponse> => {
	const token = getJwtToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	let res: Response;
	try {
		res = await fetch(`${REACT_APP_API_URL}/ai-chat`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ messages }),
		});
	} catch {
		throw new AIChatError('Something went wrong, please try again.', 'network');
	}

	if (!res.ok) {
		if (res.status === 401 || res.status === 400) {
			throw new AIChatError('Please sign in to use Ask AI.', 'auth');
		}
		throw new AIChatError('Something went wrong, please try again.', 'server');
	}

	const data = (await res.json()) as Partial<AIChatResponse>;
	const reply = data.reply?.trim();
	if (!reply) {
		throw new AIChatError('Something went wrong, please try again.', 'server');
	}

	return { reply };
};
