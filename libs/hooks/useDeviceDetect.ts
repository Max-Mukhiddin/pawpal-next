import { useEffect, useLayoutEffect, useState } from 'react';

/** Avoid SSR warnings: useLayoutEffect only on client (matches existing repo pattern for client-only layout). */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	useIsomorphicLayoutEffect(() => {
		const detectDevice = () => {
			const userAgent = navigator.userAgent;
			const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
			const isMobileViewport = window.innerWidth <= 768;
			setDevice(isMobileUA || isMobileViewport ? 'mobile' : 'desktop');
		};

		detectDevice();
		window.addEventListener('resize', detectDevice);
		return () => window.removeEventListener('resize', detectDevice);
	}, []);

	return device;
};

export default useDeviceDetect;
