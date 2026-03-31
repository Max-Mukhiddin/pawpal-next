import React, { useEffect, useMemo, useState } from 'react';
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

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			const routeMap: Record<string, { title: string; breadcrumb: string }> = {
				'/mypage': { title: 'My Account', breadcrumb: 'My Account' },
				'/community': { title: 'Community', breadcrumb: 'Community' },
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

			return { title: matched.title, desc: `Home / ${matched.breadcrumb}` };
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

						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								background: '#1A1A1A',
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
							</Stack>
						</Stack>

						<Stack id={'main'}>
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
