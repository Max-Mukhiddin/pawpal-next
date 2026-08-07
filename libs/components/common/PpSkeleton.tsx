import React from 'react';

interface PpSkeletonProps {
	width?: number | string;
	height?: number | string;
	radius?: number | string;
	className?: string;
	style?: React.CSSProperties;
}

/**
 * Shimmering placeholder block. Composed together to build content-shaped
 * skeleton cards (image bar + title bar + text bar + meta bar).
 *
 * Uses a background-image linear-gradient sweeping across a mist-tinted base
 * — GPU-friendly, deterministic, and matches the palette so the loading state
 * doesn't feel like it belongs to a different site.
 */
export const PpSkeleton = ({
	width = '100%',
	height = 14,
	radius = 6,
	className = '',
	style,
}: PpSkeletonProps) => {
	return (
		<span
			className={`pp-skeleton ${className}`.trim()}
			style={{ width, height, borderRadius: radius, ...style }}
			aria-hidden
		/>
	);
};

interface PpCardSkeletonProps {
	variant?: 'specialist' | 'article' | 'listing';
	count?: number;
	/** If true, render bare cards without an outer grid — for use inside a parent grid. */
	bare?: boolean;
}

/** Single card-shaped skeleton — image bar + title + secondary line. */
export const PpCardSkeleton = ({ variant = 'specialist' }: { variant?: PpCardSkeletonProps['variant'] }) => (
	<div className={`pp-skeleton-card pp-skeleton-card--${variant}`}>
		<div className="pp-skeleton-card__media">
			<PpSkeleton width="100%" height="100%" radius={0} />
		</div>
		<div className="pp-skeleton-card__body">
			<PpSkeleton width="65%" height={18} />
			<PpSkeleton width="45%" height={12} />
			{variant === 'article' && <PpSkeleton width="90%" height={12} />}
		</div>
	</div>
);

/** Grid of skeleton cards, shaped like the real cards that will replace them.
 *  Set `bare` when the parent is already a grid, so the skeleton cards slot in
 *  as direct grid children (via a React fragment). */
export const PpCardSkeletonGrid = ({ variant = 'specialist', count = 6, bare = false }: PpCardSkeletonProps) => {
	if (bare) {
		return (
			<>
				{Array.from({ length: count }).map((_, i) => (
					<PpCardSkeleton key={i} variant={variant} />
				))}
			</>
		);
	}
	return (
		<div
			className={`pp-skeleton-grid pp-skeleton-grid--${variant}`}
			aria-busy="true"
			aria-live="polite"
		>
			{Array.from({ length: count }).map((_, i) => (
				<PpCardSkeleton key={i} variant={variant} />
			))}
		</div>
	);
};

export default PpSkeleton;
