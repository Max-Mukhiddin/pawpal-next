export type ToastType = 'success' | 'error' | 'info' | 'signin';

export type ToastItem = {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
	kind?: 'signin';
	onDone?: () => void;
};

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listener: ToastListener | null = null;

/** Same-message dedupe window (desktop click bounce + quick double-taps). */
const DEDUPE_MS = 900;

/**
 * Opposite toggle messages (Liked/Removed, Followed/Unfollowed) must not stack
 * when a touch ghost-click flips state twice — keep only the latest in the pair.
 */
const TOGGLE_GROUP: Record<string, string> = {
	'Liked!': 'like-toggle',
	Removed: 'like-toggle',
	Followed: 'follow-toggle',
	Unfollowed: 'follow-toggle',
};

let lastToastKey = '';
let lastToastAt = 0;

export const subscribeToasts = (fn: ToastListener) => {
	listener = fn;
	fn(toasts);
	return () => {
		if (listener === fn) listener = null;
	};
};

export const pushToast = (
	message: string,
	type: ToastType = 'success',
	duration = 2400,
	onDone?: () => void,
) => {
	const key = `${type}:${message}`;
	const now = Date.now();
	if (key === lastToastKey && now - lastToastAt < DEDUPE_MS) return;

	const toggleGroup = type === 'success' ? TOGGLE_GROUP[message] : undefined;
	if (toggleGroup && now - lastToastAt < DEDUPE_MS) {
		const prevMessage = lastToastKey.startsWith('success:') ? lastToastKey.slice('success:'.length) : '';
		if (TOGGLE_GROUP[prevMessage] === toggleGroup) {
			// Drop the prior toggle toast; show only the latest outcome.
			toasts = toasts.filter((t) => !(t.type === 'success' && TOGGLE_GROUP[t.message] === toggleGroup));
		}
	}

	lastToastKey = key;
	lastToastAt = now;

	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	toasts = [...toasts, { id, message, type, duration, onDone }];
	listener?.(toasts);
};

/** Single sign-in prompt — replaces any prior sign-in toast so clicks never stack. */
export const pushSignInPrompt = (message: string, duration = 1800) => {
	toasts = toasts.filter((t) => t.kind !== 'signin');
	const id = `signin-${Date.now()}`;
	lastToastKey = `signin:${message}`;
	lastToastAt = Date.now();
	toasts = [...toasts, { id, message, type: 'signin', duration, kind: 'signin' }];
	listener?.(toasts);
};

export const removeToast = (id: string) => {
	const removed = toasts.find((t) => t.id === id);
	toasts = toasts.filter((t) => t.id !== id);
	listener?.(toasts);
	removed?.onDone?.();
};
