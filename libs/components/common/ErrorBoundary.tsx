import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import Link from 'next/link';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(_error: Error, _info: ErrorInfo) {
		/* surface friendly UI only */
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: '#EEF4F0' }}>
					<div style={{ maxWidth: 480, textAlign: 'center' }}>
						<h1 style={{ fontFamily: 'Fraunces, serif', color: '#15241E', marginBottom: 12 }}>Something went wrong</h1>
						<p style={{ color: '#50625A', marginBottom: 24 }}>We hit a snag loading this page. Try refreshing or head back home.</p>
						<Link href="/" className="pp-btn pp-btn--primary">Back to home</Link>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
