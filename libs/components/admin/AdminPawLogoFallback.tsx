import React from 'react';

type Props = {
	className?: string;
};

/** Static 2D paw mark — always available when 3D is skipped or fails */
export default function AdminPawLogoFallback({ className = '' }: Props) {
	return (
		<div className={`admin-paw-logo__fallback ${className}`.trim()} aria-hidden>
			<img src="/img/logo/paw-favicon.svg" alt="" width={26} height={26} />
		</div>
	);
}
