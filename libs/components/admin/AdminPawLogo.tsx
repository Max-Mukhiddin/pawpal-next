import React, { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import AdminPawLogoFallback from './AdminPawLogoFallback';

const AdminPawLogo3DCanvas = dynamic(() => import('./AdminPawLogo3DCanvas'), {
	ssr: false,
	loading: () => <AdminPawLogoFallback />,
});

class PawLogoErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
	state = { hasError: false };

	static getDerivedStateFromError(): { hasError: boolean } {
		return { hasError: true };
	}

	componentDidCatch(_error: Error, _info: ErrorInfo) {
		this.props.onError();
	}

	render() {
		if (this.state.hasError) return <AdminPawLogoFallback />;
		return this.props.children;
	}
}

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sidebar logo mark — lazy 3D with static SVG fallback */
export default function AdminPawLogo() {
	const [use3d, setUse3d] = useState(false);
	const [fallbackOnly, setFallbackOnly] = useState(false);
	const failTimerRef = useRef<number>();

	useEffect(() => {
		if (prefersReducedMotion()) {
			setFallbackOnly(true);
			return;
		}

		const mountTimer = window.setTimeout(() => setUse3d(true), 0);
		failTimerRef.current = window.setTimeout(() => setFallbackOnly(true), 1000);

		return () => {
			window.clearTimeout(mountTimer);
			if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
		};
	}, []);

	const handleReady = () => {
		if (failTimerRef.current) {
			window.clearTimeout(failTimerRef.current);
			failTimerRef.current = undefined;
		}
	};

	if (fallbackOnly) return <AdminPawLogoFallback />;

	return (
		<div className="admin-paw-logo">
			<AdminPawLogoFallback className="admin-paw-logo__fallback--base" />
			{use3d ? (
				<PawLogoErrorBoundary onError={() => setFallbackOnly(true)}>
					<AdminPawLogo3DCanvas onReady={handleReady} onFail={() => setFallbackOnly(true)} />
				</PawLogoErrorBoundary>
			) : null}
		</div>
	);
}
