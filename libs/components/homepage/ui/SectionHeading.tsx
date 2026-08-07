import type { ReactNode } from 'react';

interface SectionHeadingProps {
	eyebrow: string;
	/** Plain-text title. Ignored when `titleNode` is provided. */
	title?: string;
	/** Rich title (e.g. with an italic accent). Takes precedence over `title`. */
	titleNode?: ReactNode;
	subtitle?: string;
	centered?: boolean;
	/** Extra class on the wrapper (e.g. a reveal modifier). */
	className?: string;
	id?: string;
}

export default function SectionHeading({
	eyebrow,
	title,
	titleNode,
	subtitle,
	centered = false,
	className = '',
	id,
}: SectionHeadingProps) {
	return (
		<div className={`pp-section-head ${centered ? 'centered' : ''} ${className}`.trim()}>
			<span className="pp-eyebrow">{eyebrow}</span>
			<h2 className="pp-heading" id={id}>
				{titleNode ?? title}
			</h2>
			{subtitle && <p className="pp-subtitle">{subtitle}</p>}
		</div>
	);
}
