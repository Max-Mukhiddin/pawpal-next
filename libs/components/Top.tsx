import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, Drawer, Divider } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import NotificationDropdown from './common/NotificationDropdown';
import ActivityDropdown from './common/ActivityDropdown';
import { resolveMemberImageUrl } from '../utils/mediaUrl';

const StyledLangMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 160,
		color: theme.palette.text.primary,
		boxShadow:
			theme.palette.mode === 'light'
				? '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)'
				: '0 12px 24px rgba(0,0,0,0.35)',
		'& .MuiMenu-list': { padding: '4px 0' },
		'& .MuiMenuItem-root': {
			'& .MuiSvgIcon-root': {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
			},
			'&:active': {
				backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
			},
		},
	},
}));

export default function Top() {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const pathname = router.pathname;
	const avatarSrc = resolveMemberImageUrl(user?.memberImage, '/img/profile/defaultUser.svg');

	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const langMenuOpen = Boolean(anchorEl2);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const allNav = useMemo(
		() => [
			{ href: '/', label: t('Home'), isActive: (p: string) => p === '/' },
			{ href: '/service', label: t('Services'), isActive: (p: string) => p.startsWith('/service') },
			{ href: '/product', label: t('Products'), isActive: (p: string) => p.startsWith('/product') },
			{ href: '/specialist', label: t('Specialists'), isActive: (p: string) => p.startsWith('/specialist') },
			{ href: '/about', label: t('About'), isActive: (p: string) => p.startsWith('/about') },
			{ href: '/blog', label: t('Blog'), isActive: (p: string) => p.startsWith('/blog') || p.startsWith('/community') },
			{ href: '/cs', label: t('Support'), isActive: (p: string) => p.startsWith('/cs') || p.startsWith('/support') },
		],
		[t],
	);

	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const handleRouteChange = () => setDrawerOpen(false);
		router.events.on('routeChangeStart', handleRouteChange);
		return () => router.events.off('routeChangeStart', handleRouteChange);
	}, [router.events]);

	const langClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl2(e.currentTarget);
	const langClose = () => setAnchorEl2(null);

	const selectLocale = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	const Brand = (): React.ReactElement => (
		<Link href="/" className="navbar-pawpal__brand" aria-label="PawPal home">
			<img
				src="/img/logo/pawpal-logo-mark.png"
				alt="PawPal"
				width={36}
				height={36}
				className="pp-brand-honey-hover"
				style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
			/>
			<span
				className="pp-brand-honey-hover"
				style={{
					fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
					fontWeight: 700,
					fontSize: 21,
					letterSpacing: '-0.5px',
					color: '#E8F4EE',
					lineHeight: 1,
					marginLeft: 8,
				}}
			>
				PawPal
			</span>
		</Link>
	);

	const DrawerContent = (): React.ReactElement => (
		<div className="navbar-pawpal__drawer">
			<div className="navbar-pawpal__drawer-head">
				<Brand />
				<IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="navbar-pawpal__drawer-close">
					<CloseIcon />
				</IconButton>
			</div>
			<Divider className="navbar-pawpal__drawer-divider" />
			<nav className="navbar-pawpal__drawer-nav" aria-label="Primary mobile">
				{allNav.map(({ href, label, isActive }) => (
					<Link
						key={href}
						href={href}
						className={`navbar-pawpal__drawer-link ${isActive(pathname) ? 'is-active' : ''}`}
						onClick={() => setDrawerOpen(false)}
					>
						{label}
					</Link>
				))}
			</nav>
			<Divider className="navbar-pawpal__drawer-divider" />
			<div className="navbar-pawpal__drawer-footer">
				{user?._id ? (
					<>
						<Link href="/mypage" className="navbar-pawpal__drawer-account" onClick={() => setDrawerOpen(false)}>
							<img src={avatarSrc} onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }} alt="" />
							<div>
								<span className="navbar-pawpal__drawer-account-name">{user?.memberNick ?? 'My Page'}</span>
								<span className="navbar-pawpal__drawer-account-meta">{t('View profile')}</span>
							</div>
						</Link>
						<button type="button" className="navbar-pawpal__drawer-logout" onClick={() => { logOut(); setDrawerOpen(false); }}>
							<Logout fontSize="small" />
							<span>{t('Logout')}</span>
						</button>
					</>
				) : (
					<Link href="/account/join" className="navbar-pawpal__drawer-login" onClick={() => setDrawerOpen(false)}>
						<AccountCircleOutlinedIcon />
						<span>{t('Login')}</span>
					</Link>
				)}
				<div className="navbar-pawpal__drawer-lang">
					<span className="navbar-pawpal__drawer-lang-label">{t('Language')}</span>
					<div className="navbar-pawpal__drawer-lang-options">
						{(['en', 'kr', 'ru'] as const).map((code) => (
							<button key={code} type="button" className={`navbar-pawpal__drawer-lang-btn ${lang === code ? 'is-active' : ''}`} onClick={() => selectLocale(code)}>
								<img src={`/img/flag/lang${code}.png`} alt="" />
								<span>{code.toUpperCase()}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);

	if (device === 'mobile') {
		return (
			<>
				<Stack component="header" className="navbar navbar-pawpal navbar-pawpal--mobile" role="banner">
					<Stack
						className="navbar-pawpal__bar-mobile"
						direction="row"
						alignItems="center"
						justifyContent="space-between"
					>
						<Brand />
						<Stack direction="row" alignItems="center" className="navbar-pawpal__mobile-actions">
							<IconButton size="small" className="navbar-pawpal__menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
								<MenuIcon />
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
				<Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} className="navbar-pawpal__drawer-root" PaperProps={{ className: 'navbar-pawpal__drawer-paper' }}>
					<DrawerContent />
				</Drawer>
			</>
		);
	}

	// DESKTOP — Logo left | Nav center | Actions right
	return (
		<>
			<Stack component="header" className="navbar navbar-pawpal" role="banner">
			{/* Full-bleed mask removed — frosted navbar stays consistent; no solid scrolled state */}
				<Stack className="navbar-pawpal__bar">
					<div className="navbar-pawpal__inner">

						{/* LEFT: Brand/Logo */}
						<Brand />

						{/* CENTER: All nav links */}
						<nav className="navbar-pawpal__nav navbar-pawpal__nav--center" aria-label="Primary">
							{allNav.map(({ href, label, isActive }) => (
								<Link key={href} href={href} className={`navbar-pawpal__link ${isActive(pathname) ? 'is-active' : ''}`}>
									{label}
								</Link>
							))}
						</nav>

						{/* RIGHT: Actions */}
						<div className="navbar-pawpal__actions">
							<IconButton
								size="small"
								className="navbar-pawpal__menu-btn navbar-pawpal__menu-btn--tablet"
								onClick={() => setDrawerOpen(true)}
								aria-label="Open menu"
							>
								<MenuIcon />
							</IconButton>
							{user?._id ? (
								<Link href="/mypage" className="navbar-pawpal__avatar" aria-label={t('My Page')}>
									<img src={avatarSrc} onError={(e) => { e.currentTarget.src = '/img/profile/defaultUser.svg'; }} alt="" />
								</Link>
							) : (
								<Link href="/account/join" className="navbar-pawpal__join">
									<AccountCircleOutlinedIcon />
									<span>{t('Login')}</span>
								</Link>
							)}

							<div className="navbar-pawpal__lan-box">
								{user?._id && <ActivityDropdown />}
								{user?._id && <NotificationDropdown />}
								<Button disableRipple className="navbar-pawpal__lang-btn" onClick={langClick} endIcon={<CaretDown size={14} weight="fill" />}>
									<Box component="span" className="navbar-pawpal__flag">
										{lang !== null ? <img src={`/img/flag/lang${lang}.png`} alt="" /> : <img src="/img/flag/langen.png" alt="" />}
									</Box>
								</Button>
								<StyledLangMenu anchorEl={anchorEl2} open={langMenuOpen} onClose={langClose}>
									<MenuItem disableRipple onClick={() => selectLocale('en')}>
										<img className="navbar-pawpal__img-flag" src="/img/flag/langen.png" alt="" /> {t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={() => selectLocale('kr')}>
										<img className="navbar-pawpal__img-flag" src="/img/flag/langkr.png" alt="" /> {t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={() => selectLocale('ru')}>
										<img className="navbar-pawpal__img-flag" src="/img/flag/langru.png" alt="" /> {t('Russian')}
									</MenuItem>
								</StyledLangMenu>
							</div>
						</div>

					</div>
				</Stack>
			</Stack>
			<Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} className="navbar-pawpal__drawer-root" PaperProps={{ className: 'navbar-pawpal__drawer-paper' }}>
				<DrawerContent />
			</Drawer>
		</>
	);
}