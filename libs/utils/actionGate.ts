/**
 * Prevents duplicate async actions from concurrent taps/clicks
 * (common on touch: ghost click after the first handler starts).
 * The lock is held for the full in-flight call and then for a short
 * cooldown after settle, so a synthetic second tap shortly after the
 * mutation completes is still blocked. Desktop single-clicks are
 * unaffected — the second call is simply ignored.
 */
const locks = new Set<string>();
const ACTION_COOLDOWN_MS = 500;

export const isActionLocked = (key: string): boolean => locks.has(key);

export async function withActionGate<T>(
	key: string,
	fn: () => Promise<T>,
): Promise<T | undefined> {
	if (!key || locks.has(key)) return undefined;
	locks.add(key);
	try {
		return await fn();
	} finally {
		setTimeout(() => {
			locks.delete(key);
		}, ACTION_COOLDOWN_MS);
	}
}
