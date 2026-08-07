import { Message } from '../enums/common.enum';
import { Messages } from '../config';
import { pushSignInPrompt } from '../toast/toastStore';

export type SignInAction =
	| 'general'
	| 'follow'
	| 'like'
	| 'favorite'
	| 'comment'
	| 'book'
	| 'inquiry'
	| 'article';

const SIGN_IN_MESSAGES: Record<SignInAction, string> = {
	general: 'Please sign in to continue',
	follow: 'Sign in to follow specialists',
	like: 'Sign in to save what you love',
	favorite: 'Sign in to add favorites',
	comment: 'Sign in to leave a comment',
	book: 'Sign in to book or inquire',
	inquiry: 'Sign in to send an inquiry',
	article: 'Sign in to like articles',
};

const KNOWN_SIGN_IN_ERRORS = new Set([
	Messages.error2,
	Message.NOT_AUTHENTICATED,
	'Please login first!',
	'Sign in first',
]);

const REDIRECT_DELAY_MS = 1800;

let promptActive = false;
let redirectTimer: ReturnType<typeof setTimeout> | null = null;

export type RouterLike = { push: (url: string) => void | Promise<boolean> };
export type SignInRouterLike = RouterLike;

export function isSignInRequiredMessage(message?: string): boolean {
	if (!message) return false;
	return KNOWN_SIGN_IN_ERRORS.has(message);
}

/**
 * When the user is not signed in: one branded toast + delayed redirect to /account/join.
 * Returns true if the caller should abort the action (guarded or duplicate prompt).
 */
export function requireSignIn(
	router: RouterLike,
	userId: string | undefined | null,
	action: SignInAction = 'general',
): boolean {
	if (userId) return false;
	if (promptActive) return true;

	promptActive = true;
	pushSignInPrompt(SIGN_IN_MESSAGES[action], REDIRECT_DELAY_MS);

	if (redirectTimer) clearTimeout(redirectTimer);
	redirectTimer = setTimeout(() => {
		promptActive = false;
		void router.push('/account/join');
	}, REDIRECT_DELAY_MS);

	setTimeout(() => {
		promptActive = false;
	}, REDIRECT_DELAY_MS + 800);

	return true;
}

/** Map auth error messages from legacy throw/catch paths to the same prompt flow. */
export function handleSignInRequiredError(
	err: unknown,
	router: RouterLike,
	action: SignInAction = 'general',
): boolean {
	if (!isSignInRequiredMessage((err as { message?: string })?.message)) return false;
	return requireSignIn(router, null, action);
}
