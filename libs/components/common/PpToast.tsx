import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import pawCheck from '../../../public/lottie/paw-check.json';
import type { PpLottieProps } from './PpLottie';
import type { ToastType } from '../../toast/toastStore';

const PpLottie = dynamic<PpLottieProps>(
	() => import('./PpLottie').then((mod) => mod.PpLottie),
	{ ssr: false },
);

const InfoPawIcon = () => (
	<svg
		className="pp-toast__paw"
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden
	>
		<circle cx="7" cy="9.5" r="2" fill="currentColor" />
		<circle cx="12" cy="6.5" r="2" fill="currentColor" />
		<circle cx="17" cy="9.5" r="2" fill="currentColor" />
		<path
			d="M12 12.5c-3 0-5 2.2-5 4.5 0 2 1.5 3 3 3 0.9 0 1.4-0.4 2-0.4s1.1 0.4 2 0.4c1.5 0 3-1 3-3 0-2.3-2-4.5-5-4.5z"
			fill="currentColor"
		/>
	</svg>
);

const LockIcon = () => (
	<svg
		className="pp-toast__paw pp-toast__paw--signin"
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden
	>
		<path
			d="M8 11V8a4 4 0 1 1 8 0v3"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<rect
			x="6"
			y="11"
			width="12"
			height="9"
			rx="2"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
	</svg>
);

const ErrorPawIcon = () => (
	<svg
		className="pp-toast__paw pp-toast__paw--error"
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden
	>
		<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
		<path
			d="M9 9l6 6M15 9l-6 6"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</svg>
);

export interface PpToastProps {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
	onClose: (id: string) => void;
}

/**
 * Porcelain-surface toast with honey accent. Pauses on hover / when tab is hidden
 * (Sonner-style invisible correctness — user never notices, but a toast that keeps
 * counting down while backgrounded feels broken).
 */
export const PpToast = ({ id, message, type, duration = 2400, onClose }: PpToastProps) => {
	const [progress, setProgress] = useState(100);
	const [exiting, setExiting] = useState(false);
	const startedAt = useRef<number>(Date.now());
	const elapsedAtPause = useRef<number>(0);
	const rafId = useRef<number | null>(null);
	const pausedRef = useRef<boolean>(false);

	const beginExit = useCallback(() => {
		if (exiting) return;
		setExiting(true);
		window.setTimeout(() => onClose(id), 220);
	}, [exiting, id, onClose]);

	useEffect(() => {
		const tick = () => {
			if (pausedRef.current) {
				rafId.current = window.requestAnimationFrame(tick);
				return;
			}
			const elapsed = elapsedAtPause.current + (Date.now() - startedAt.current);
			const pct = Math.max(0, 100 - (elapsed / duration) * 100);
			setProgress(pct);
			if (elapsed >= duration) {
				beginExit();
				return;
			}
			rafId.current = window.requestAnimationFrame(tick);
		};

		const onVisibility = () => {
			if (document.hidden) pause();
			else resume();
		};

		const pause = () => {
			if (pausedRef.current) return;
			pausedRef.current = true;
			elapsedAtPause.current += Date.now() - startedAt.current;
		};

		const resume = () => {
			if (!pausedRef.current) return;
			pausedRef.current = false;
			startedAt.current = Date.now();
		};

		document.addEventListener('visibilitychange', onVisibility);
		rafId.current = window.requestAnimationFrame(tick);

		return () => {
			if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [duration, beginExit]);

	const handleMouseEnter = () => {
		if (pausedRef.current) return;
		pausedRef.current = true;
		elapsedAtPause.current += Date.now() - startedAt.current;
	};

	const handleMouseLeave = () => {
		if (!pausedRef.current) return;
		pausedRef.current = false;
		startedAt.current = Date.now();
	};

	return (
		<div
			className={`pp-toast pp-toast--${type}${exiting ? ' pp-toast--out' : ''}`}
			role="status"
			aria-live="polite"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={beginExit}
		>
			<span className="pp-toast__icon">
				{type === 'success' && <PpLottie src={pawCheck} loop={false} size={28} autoplay />}
				{type === 'error' && <ErrorPawIcon />}
				{type === 'info' && <InfoPawIcon />}
				{type === 'signin' && <LockIcon />}
			</span>
			<span className="pp-toast__msg">{message}</span>
			<span className="pp-toast__progress" style={{ width: `${progress}%` }} aria-hidden />
		</div>
	);
};

export default PpToast;
