import dynamic from 'next/dynamic';
import type { PpLottieProps } from './PpLottie';
import pawLoader from '../../../public/lottie/paw-loader.json';

const PpLottie = dynamic<PpLottieProps>(
	() => import('./PpLottie').then((mod) => mod.PpLottie),
	{ ssr: false },
);

interface PpLoaderProps {
	size?: number;
	className?: string;
}

/** Branded paw-themed loader — replaces MUI CircularProgress in page shells. */
export const PpLoader = ({ size = 64, className }: PpLoaderProps) => (
	<PpLottie src={pawLoader} loop size={size} className={className} />
);

export default PpLoader;
