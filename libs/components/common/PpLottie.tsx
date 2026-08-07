import Lottie from 'lottie-react';

export interface PpLottieProps {
	src: object;
	loop?: boolean;
	size?: number;
	autoplay?: boolean;
	className?: string;
}

export const PpLottie = ({
	src,
	loop = true,
	size = 80,
	autoplay = true,
	className,
}: PpLottieProps) => (
	<div className={className} style={{ width: size, height: size, lineHeight: 0 }} aria-hidden>
		<Lottie animationData={src} loop={loop} autoplay={autoplay} style={{ width: '100%', height: '100%' }} />
	</div>
);

export default PpLottie;
