import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Typography,
	Tooltip,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AdminTopBarAvatar from './AdminTopBarAvatar';

type Props = {
	userNick?: string;
	userFullName?: string;
	userPhone?: string;
	userImage?: string | null;
	onLogout: () => void;
};

const BREADCRUMB_MAP: Record<string, string> = {
	'/_admin/dashboard': 'Dashboard',
	'/_admin/users': 'Users',
	'/_admin/listings': 'Listings',
	'/_admin/community': 'Community',
	'/_admin/cs/faq': 'Support',
	'/_admin/cs/notice': 'Support',
	'/_admin/cs/inquiry': 'Support',
};

export default function AdminTopBar({ userNick, userFullName, userPhone, userImage, onLogout }: Props) {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const section = BREADCRUMB_MAP[router.pathname] ?? 'Admin';
	const displayName = userFullName?.trim() || userNick?.trim() || 'Admin';

	const closeMenu = () => setAnchorEl(null);

	const handleLogout = () => {
		closeMenu();
		onLogout();
	};

	return (
		<header className="admin-topbar">
			<div className="admin-topbar__inner">
				<nav className="admin-breadcrumb" aria-label="Breadcrumb">
					<span className="admin-breadcrumb__root">PawPal Admin</span>
					<span className="admin-breadcrumb__sep" aria-hidden>
						/
					</span>
					<span className="admin-breadcrumb__current">{section}</span>
				</nav>

				<div className="admin-topbar__actions">
					<Tooltip title="Account menu">
						<IconButton onClick={(e) => setAnchorEl(e.currentTarget)} className="admin-topbar__avatar-btn" sx={{ p: 0 }}>
							<AdminTopBarAvatar imagePath={userImage} displayName={displayName} size={38} />
						</IconButton>
					</Tooltip>
					<Menu
						className="admin-user-menu"
						anchorEl={anchorEl}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
						open={Boolean(anchorEl)}
						onClose={closeMenu}
						PaperProps={{ className: 'admin-user-menu__paper' }}
					>
						<div className="admin-user-menu__header">
							<Typography className="admin-user-menu__name">{displayName}</Typography>
							{userPhone ? <Typography className="admin-user-menu__phone">{userPhone}</Typography> : null}
						</div>

						<Divider className="admin-user-menu__divider" />

						<MenuItem
							component={Link}
							href="/"
							className="admin-user-menu__item admin-user-menu__item--home"
							onClick={closeMenu}
						>
							<ListItemIcon className="admin-user-menu__icon">
								<HomeOutlinedIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText primary="Back to PawPal" />
						</MenuItem>

						<Divider className="admin-user-menu__divider" />

						<MenuItem className="admin-user-menu__item admin-user-menu__item--logout" onClick={handleLogout}>
							<ListItemIcon className="admin-user-menu__icon admin-user-menu__icon--logout">
								<LogoutOutlinedIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText primary="Logout" />
						</MenuItem>
					</Menu>
				</div>
			</div>
		</header>
	);
}
