import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import HeroBreadcrumb from '../common/HeroBreadcrumb';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
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
		const { t } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const noHero = layoutOptions.noHero ?? false;
		const isAuthPage = router.pathname === '/account/join';

		const memoizedValues = useMemo(() => {
			const routeMap: Record<string, { title: string; breadcrumb: string; bgImage?: string }> = {
				'/mypage': {
					title: 'My Profile',
					breadcrumb: 'My Profile',
					bgImage: '/images/hero/pawpal-hero.jpg',
				},
				'/community': {
					title: 'Community',
					breadcrumb: 'Community',
					bgImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80',
				},
				'/blog': {
					title: 'Pet Care Tips & Stories',
					breadcrumb: 'Pet Care Tips & Stories',
					bgImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80',
				},
				'/service': {
					title: 'Find The Right Care For Your Pet',
					breadcrumb: 'Find The Right Care For Your Pet',
					bgImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1600&q=80',
				},
				'/product': {
					title: 'Everyday Essentials For Your Pet',
					breadcrumb: 'Everyday Essentials For Your Pet',
					bgImage: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1600&q=80',
				},
				'/specialist': {
					title: 'Our Specialists',
					breadcrumb: 'Specialists',
					bgImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&q=80',
				},
				'/specialist/detail': {
					title: 'Specialist Profile',
					breadcrumb: 'Specialists',
					bgImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&q=80',
				},
				'/about': {
					title: 'About Us',
					breadcrumb: 'About Us',
					bgImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80',
				},
				'/cs': {
					title: 'Customer Support',
					breadcrumb: 'Customer Support',
					bgImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1600&q=80',
				},
				'/member': {
					title: 'Members',
					breadcrumb: 'Members',
					bgImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80',
				},
				'/agent': {
					title: 'Our Specialists',
					breadcrumb: 'Specialists',
					bgImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&q=80',
				},
				'/listings': {
					title: 'All Listings',
					breadcrumb: 'All Listings',
					bgImage: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1600&q=80',
				},
				'/account/join': {
					title: 'Welcome',
					breadcrumb: 'Welcome',
					bgImage: '/images/hero/pawpal-hero.jpg',
				},
			};

			const matchedKey = Object.keys(routeMap).find(
				(key) => router.pathname === key || router.pathname.startsWith(`${key}/`)
			) ?? '';
			const matched = routeMap[matchedKey] ?? { title: 'PawPal', breadcrumb: 'PawPal' };
			const baseHeroImage = layoutOptions.heroImage ?? matched.bgImage ?? '/images/hero/pawpal-hero.jpg';

			// On /mypage: use the logged-in user's avatar as hero bg if available
			const isMyPage = router.pathname === '/mypage' || router.pathname.startsWith('/mypage/');
			const userAvatar = user?.memberImage ? resolveMemberImageUrl(user.memberImage) : null;
			const heroImageFinal = isMyPage && userAvatar ? userAvatar : baseHeroImage;
			const isPersonalHero = isMyPage && !!userAvatar;

			return {
				title: matched.title,
				breadcrumb: matched.breadcrumb,
				heroImage: heroImageFinal,
				isPersonalHero,
			};
		}, [layoutOptions.heroImage, router.pathname, user?.memberImage]);

		useEffect(() => {
			setAuthHeader(router.pathname === '/account/join');
		}, [router.pathname]);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>pawpal</title>
						<meta name={'title'} content={`pawpal`} />
					</Head>
					<Stack id="mobile-wrap">
						{!isAuthPage && (
							<Stack id="pawpal-header">
								<Top />
							</Stack>
						)}
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						{!isAuthPage && (
							<Stack id={'footer'}>
								<Footer />
							</Stack>
						)}
					</Stack>
				</>
			);
		}

		return (
			<>
				<Head>
					<title>pawpal</title>
					<meta name={'title'} content={`pawpal`} />
				</Head>
				<Stack
					id="pc-wrap"
					className={!noHero && !isAuthPage ? 'layout-basic-hero' : undefined}
				>
					{!isAuthPage && (
						<Stack id="pawpal-header">
							<Top />
						</Stack>
					)}

					<Stack id={'main'}>
						{!noHero && !isAuthPage && (
							<div className={`header-basic${authHeader ? ' auth' : ''}${memoizedValues.isPersonalHero ? ' header-basic--personal' : ''}`}>
								<div
									className="header-basic__bg"
									style={{ backgroundImage: `url('${memoizedValues.heroImage}')` }}
									aria-hidden
								/>
								<div className="header-basic__content">
									<strong>{t(memoizedValues.title)}</strong>
									<HeroBreadcrumb
										homeLabel={t('Home')}
										current={t(memoizedValues.breadcrumb)}
									/>
								</div>
							</div>
						)}
						<Component {...props} />
					</Stack>

					{!isAuthPage && <Chat />}

					{!isAuthPage && (
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					)}
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;