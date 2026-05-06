import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from '../theme';
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
		'& .MuiMenu-list': {
			padding: '4px 0',
		},
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
	const { mode, toggleMode } = useThemeMode();
	const { t } = useTranslation('common');
	const router = useRouter();
	const pathname = router.pathname;
	const avatarSrc = resolveMemberImageUrl(user?.memberImage, '/img/profile/defaultUser.svg');

	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const langMenuOpen = Boolean(anchorEl2);
	const [isScrolled, setIsScrolled] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);

	const primaryNav = useMemo(
		() => [
			{ href: '/', label: t('Home'), isActive: (p: string) => p === '/' },
			{ href: '/service', label: t('Services'), isActive: (p: string) => p.startsWith('/service') },
			{ href: '/product', label: t('Products'), isActive: (p: string) => p.startsWith('/product') },
			{ href: '/specialist', label: t('Specialists'), isActive: (p: string) => p.startsWith('/specialist') },
			{ href: '/about', label: t('About'), isActive: (p: string) => p.startsWith('/about') },
		{
			href: '/blog',
			label: t('Community'),
			isActive: (p: string) => p.startsWith('/blog') || p.startsWith('/community'),
		},
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
		const onScroll = () => setIsScrolled(window.scrollY >= 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const langClick = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const selectLocale = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	if (device === 'mobile') {
		return (
			<Stack component="header" className="navbar navbar-pawpal navbar-pawpal--mobile" role="banner">
				<Stack className="navbar-pawpal__mobile-top" direction="row" alignItems="center" justifyContent="space-between">
					<Link href="/" className="navbar-pawpal__brand">
						<span className="navbar-pawpal__brand-icon" aria-hidden>
							<svg width="28" height="28" viewBox="0 0 100 100">
								<ellipse cx="50" cy="70" rx="22" ry="18" fill="#E07B3A" />
								<ellipse cx="28" cy="45" rx="10" ry="13" fill="#E07B3A" />
								<ellipse cx="72" cy="45" rx="10" ry="13" fill="#E07B3A" />
								<ellipse cx="38" cy="35" rx="9" ry="12" fill="#E07B3A" />
								<ellipse cx="62" cy="35" rx="9" ry="12" fill="#E07B3A" />
							</svg>
						</span>
						<span className="navbar-pawpal__brand-paw">Paw</span>
						<span className="navbar-pawpal__brand-pal">Pal</span>
					</Link>
					<Stack direction="row" alignItems="center" className="navbar-pawpal__mobile-actions">
						<IconButton
							size="small"
							className="navbar-pawpal__icon-btn"
							onClick={() => undefined}
							aria-label={t('Cart')}
						>
							<ShoppingBagOutlinedIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							className="navbar-pawpal__icon-btn"
							onClick={toggleMode}
							aria-label={mode === 'dark' ? 'Activate light mode' : 'Activate dark mode'}
						>
							{mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
						</IconButton>
					</Stack>
				</Stack>
				<nav className="navbar-pawpal__mobile-nav" aria-label="Primary">
					{primaryNav.map(({ href, label, isActive }) => (
						<Link
							key={href}
							href={href}
							className={`navbar-pawpal__link ${isActive(pathname) ? 'is-active' : ''}`}
						>
							{label}
						</Link>
					))}
				</nav>
				<Stack direction="row" alignItems="center" justifyContent="space-between" className="navbar-pawpal__mobile-meta">
					{user?._id ? (
						<>
							<button
								type="button"
								className="navbar-pawpal__avatar"
								onClick={(event) => setLogoutAnchor(event.currentTarget)}
							>
								<img
									src={avatarSrc}
									onError={(e) => {
										const img = e.currentTarget;
										if (img.src.includes('/img/profile/defaultUser.svg')) {
											img.src = '/images/hero/pawpal-hero.jpg';
											return;
										}
										img.src = '/img/profile/defaultUser.svg';
									}}
									alt=""
								/>
							</button>
							<Menu
								anchorEl={logoutAnchor}
								open={logoutOpen}
								onClose={() => setLogoutAnchor(null)}
								className="navbar-pawpal__account-menu"
							>
								<MenuItem
									onClick={() => {
										setLogoutAnchor(null);
										router.push('/mypage');
									}}
								>
									{t('My Page')}
								</MenuItem>
								<MenuItem
									onClick={() => {
										logOut();
										setLogoutAnchor(null);
									}}
								>
									<Logout fontSize="small" className="navbar-pawpal__menu-icon" />
									{t('Logout')}
								</MenuItem>
							</Menu>
							<NotificationsOutlinedIcon className="navbar-pawpal__notify" aria-hidden />
						</>
					) : (
						<Link href="/account/join" className="navbar-pawpal__join">
							<AccountCircleOutlinedIcon />
							<span>
								{t('Login')} / {t('Register')}
							</span>
						</Link>
					)}
					<div className="navbar-pawpal__lan-box">
						<Button disableRipple className="navbar-pawpal__lang-btn" onClick={langClick} endIcon={<CaretDown size={14} weight="fill" />}>
							<Box component="span" className="navbar-pawpal__flag">
								{lang !== null ? (
									<img src={`/img/flag/lang${lang}.png`} alt="" />
								) : (
									<img src="/img/flag/langen.png" alt="" />
								)}
							</Box>
						</Button>
						<StyledLangMenu anchorEl={anchorEl2} open={langMenuOpen} onClose={langClose}>
							<MenuItem disableRipple onClick={() => selectLocale('en')}>
								<img className="navbar-pawpal__img-flag" src="/img/flag/langen.png" alt="" />
								{t('English')}
							</MenuItem>
							<MenuItem disableRipple onClick={() => selectLocale('kr')}>
								<img className="navbar-pawpal__img-flag" src="/img/flag/langkr.png" alt="" />
								{t('Korean')}
							</MenuItem>
							<MenuItem disableRipple onClick={() => selectLocale('ru')}>
								<img className="navbar-pawpal__img-flag" src="/img/flag/langru.png" alt="" />
								{t('Russian')}
							</MenuItem>
						</StyledLangMenu>
					</div>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack component="header" className="navbar navbar-pawpal" role="banner">
			<Stack className={`navbar-pawpal__bar ${isScrolled ? 'is-scrolled' : ''}`}>
				<Stack
					className="container navbar-pawpal__inner"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					sx={{ display: 'flex' }}
				>
					<Link href="/" className="navbar-pawpal__brand">
						<span className="navbar-pawpal__brand-icon" aria-hidden>
							<svg width="28" height="28" viewBox="0 0 100 100">
								<ellipse cx="50" cy="70" rx="22" ry="18" fill="#E07B3A" />
								<ellipse cx="28" cy="45" rx="10" ry="13" fill="#E07B3A" />
								<ellipse cx="72" cy="45" rx="10" ry="13" fill="#E07B3A" />
								<ellipse cx="38" cy="35" rx="9" ry="12" fill="#E07B3A" />
								<ellipse cx="62" cy="35" rx="9" ry="12" fill="#E07B3A" />
							</svg>
						</span>
						<span className="navbar-pawpal__brand-paw">Paw</span>
						<span className="navbar-pawpal__brand-pal">Pal</span>
					</Link>
					<nav className="navbar-pawpal__nav" aria-label="Primary">
						{primaryNav.map(({ href, label, isActive }) => (
							<Link
								key={href}
								href={href}
								className={`navbar-pawpal__link ${isActive(pathname) ? 'is-active' : ''}`}
							>
								{label}
							</Link>
						))}
					</nav>
					<Box
						component="div"
						className="navbar-pawpal__actions"
						sx={{ paddingRight: '16px', gap: '8px', alignItems: 'center', display: 'flex', flexDirection: 'row' }}
					>
						<IconButton
							size="medium"
							className="navbar-pawpal__icon-btn"
							onClick={() => undefined}
							aria-label={t('Cart')}
						>
							<ShoppingBagOutlinedIcon />
						</IconButton>
						<IconButton
							size="medium"
							className="navbar-pawpal__icon-btn"
							onClick={toggleMode}
							aria-label={mode === 'dark' ? 'Activate light mode' : 'Activate dark mode'}
						>
							{mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
						</IconButton>
						<Link href="/service" className="navbar-pawpal__book-btn">
							Book Now
						</Link>
						{user?._id ? (
							<>
								<button
									type="button"
									className="navbar-pawpal__avatar"
									onClick={(event) => setLogoutAnchor(event.currentTarget)}
								>
									<img
										src={avatarSrc}
										onError={(e) => {
											const img = e.currentTarget;
											if (img.src.includes('/img/profile/defaultUser.svg')) {
												img.src = '/images/hero/pawpal-hero.jpg';
												return;
											}
											img.src = '/img/profile/defaultUser.svg';
										}}
										alt=""
									/>
								</button>
								<Menu
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => setLogoutAnchor(null)}
									className="navbar-pawpal__account-menu"
								>
									<MenuItem
										onClick={() => {
											setLogoutAnchor(null);
											router.push('/mypage');
										}}
									>
										{t('My Page')}
									</MenuItem>
									<MenuItem
										onClick={() => {
											logOut();
											setLogoutAnchor(null);
										}}
									>
										<Logout fontSize="small" className="navbar-pawpal__menu-icon" />
										{t('Logout')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href="/account/join" className="navbar-pawpal__join">
								<AccountCircleOutlinedIcon />
								<span>
									{t('Login')} / {t('Register')}
								</span>
							</Link>
						)}
						<div className="navbar-pawpal__lan-box">
							{user?._id && <NotificationsOutlinedIcon className="navbar-pawpal__notify" aria-hidden />}
							<Button
								disableRipple
								className="navbar-pawpal__lang-btn"
								onClick={langClick}
								endIcon={<CaretDown size={14} weight="fill" />}
							>
								<Box component="span" className="navbar-pawpal__flag">
									{lang !== null ? (
										<img src={`/img/flag/lang${lang}.png`} alt="" />
									) : (
										<img src="/img/flag/langen.png" alt="" />
									)}
								</Box>
							</Button>
							<StyledLangMenu anchorEl={anchorEl2} open={langMenuOpen} onClose={langClose}>
								<MenuItem disableRipple onClick={() => selectLocale('en')}>
									<img className="navbar-pawpal__img-flag" src="/img/flag/langen.png" alt="" />
									{t('English')}
								</MenuItem>
								<MenuItem disableRipple onClick={() => selectLocale('kr')}>
									<img className="navbar-pawpal__img-flag" src="/img/flag/langkr.png" alt="" />
									{t('Korean')}
								</MenuItem>
								<MenuItem disableRipple onClick={() => selectLocale('ru')}>
									<img className="navbar-pawpal__img-flag" src="/img/flag/langru.png" alt="" />
									{t('Russian')}
								</MenuItem>
							</StyledLangMenu>
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
}
