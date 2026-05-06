import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface LayoutBasicOptions {
	heroImage?: string;
	noHero?: boolean;
}

const withLayoutBasic = (Component: any, layoutOptions: LayoutBasicOptions = {}) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const heroImage = layoutOptions.heroImage ?? '/images/hero/pawpal-hero.jpg';
		const noHero = layoutOptions.noHero ?? false;

		const memoizedValues = useMemo(() => {
			const routeMap: Record<string, { title: string; breadcrumb: string }> = {
				'/mypage': { title: 'My Account', breadcrumb: 'My Account' },
				'/community': { title: 'Blog', breadcrumb: 'Blog' },
			'/blog': { title: 'Blog', breadcrumb: 'Blog' },
				'/specialist': { title: 'Our Specialists', breadcrumb: 'Specialists' },
				'/about': { title: 'About Us', breadcrumb: 'About Us' },
				'/cs': { title: 'Contact', breadcrumb: 'Contact' },
				'/member': { title: 'Members', breadcrumb: 'Members' },
				'/agent': { title: 'Our Specialists', breadcrumb: 'Specialists' },
				'/listings': { title: 'All Listings', breadcrumb: 'All Listings' },
				'/account/join': { title: 'Login/Signup', breadcrumb: 'Authentication' },
			};

			const matchedKey =
				Object.keys(routeMap).find((key) => router.pathname === key || router.pathname.startsWith(`${key}/`)) ?? '';
			const matched = routeMap[matchedKey] ?? { title: 'PawPal', breadcrumb: 'PawPal' };

			return { title: matched.title, breadcrumb: matched.breadcrumb };
		}, [router.pathname]);

		useEffect(() => {
			setAuthHeader(router.pathname === '/account/join');
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>pawpal</title>
						<meta name={'title'} content={`pawpal`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id="pawpal-header">
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>pawpal</title>
						<meta name={'title'} content={`pawpal`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id="pawpal-header">
							<Top />
						</Stack>

							{/* Hero lives inside #main so #pc-wrap > #main stays the 2nd child,
						    matching `#pc-wrap > #main:nth-child(2) { padding-top: 72px }` in top.scss.
						    This gives the same navbar clearance as LayoutFull (service/product pages). */}
						<Stack id={'main'}>
							{!noHero && router.pathname !== '/about' && (
								<div className={`header-basic${authHeader ? ' auth' : ''}`}>
									<div
										className="header-basic__bg"
										style={{ backgroundImage: `url('${heroImage}')` }}
										aria-hidden
									/>
									<div className="header-basic__content">
										<strong>{t(memoizedValues.title)}</strong>
										<span>
											<Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
												{t('Home')}
											</Link>
											{' / '}
											{t(memoizedValues.breadcrumb)}
										</span>
									</div>
								</div>
							)}
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
