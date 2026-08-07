import React from 'react';

export type PawPalLogoVariant = 'default' | 'inverted' | 'mark-only';

type Props = {
	variant?: PawPalLogoVariant;
	/** Height in px — default 36 matches the navbar */
	size?: number;
	className?: string;
};

const PAW_FILL = '#E8A04B';
const TEXT_DEFAULT = '#173E32';
const TEXT_INVERTED = '#E8F4EE';

const VIEWBOX_FULL = '0 0 118 36';
const VIEWBOX_MARK = '0 0 32 36';
const ASPECT_FULL = 118 / 36;
const ASPECT_MARK = 32 / 36;

/** Canonical PawPal mark — same paths as the legacy inline navbar SVG. */
export default function PawPalLogo({ variant = 'default', size = 36, className }: Props) {
	const markOnly = variant === 'mark-only';
	const textFill = variant === 'inverted' ? TEXT_INVERTED : TEXT_DEFAULT;
	const aspect = markOnly ? ASPECT_MARK : ASPECT_FULL;
	const width = Math.round(size * aspect);
	const viewBox = markOnly ? VIEWBOX_MARK : VIEWBOX_FULL;

	return (
		<svg
			className={className}
			width={width}
			height={size}
			viewBox={viewBox}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ display: 'block', flexShrink: 0 }}
			aria-hidden="true"
		>
			<ellipse cx="15" cy="23.5" rx="8.5" ry="7" fill={PAW_FILL} />
			<circle cx="6" cy="16" r="3" fill={PAW_FILL} />
			<circle cx="11" cy="12.5" r="3.5" fill={PAW_FILL} />
			<circle cx="18.5" cy="12.5" r="3.5" fill={PAW_FILL} />
			<circle cx="24" cy="16" r="3" fill={PAW_FILL} />
			{!markOnly ? (
				<text
					x="34"
					y="27"
					fill={textFill}
					fontFamily="'Fraunces', 'Playfair Display', Georgia, serif"
					fontWeight="700"
					fontSize="21"
					letterSpacing="-0.5"
				>
					PawPal
				</text>
			) : null}
		</svg>
	);
}
