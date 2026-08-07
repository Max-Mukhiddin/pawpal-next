import React, { useEffect, useState } from 'react';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ChatsCircle, Headset, Package, User } from 'phosphor-react';
import cookies from 'js-cookie';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AdminMenuList = (props: any) => {
	const device = useDeviceDetect();
	const [openMenu] = useState(typeof window === 'object' ? cookies.get('admin_menu') === 'true' : false);
	const [clickMenu, setClickMenu] = useState<any>([]);
	const [clickSubMenu, setClickSubMenu] = useState('');

	const {
		router: { pathname },
	} = props;

	const pathnames = pathname.split('/').filter((x: any) => x);

	useEffect(() => {
		if (device === 'mobile') {
			/* mobile layout hook retained for future use */
		}

		switch (pathnames[1]) {
			case 'listings':
			case 'properties':
				setClickMenu(['Listings']);
				break;
			case 'community':
				setClickMenu(['Community']);
				break;
			case 'cs':
				setClickMenu(['Cs']);
				break;
			default:
				setClickMenu(['Users']);
				break;
		}

		switch (pathnames[2]) {
			case 'faq':
				setClickSubMenu('FAQ');
				break;
			case 'notice':
				setClickSubMenu('Notice');
				break;
			case 'inquiry':
				setClickSubMenu('1:1 Inquiry');
				break;
			default:
				setClickSubMenu('List');
				break;
		}
	}, [pathname, device]);

	const subMenuChangeHandler = (target: string) => {
		if (clickMenu.find((item: string) => item === target)) {
			setClickMenu(clickMenu.filter((menu: string) => target !== menu));
		} else {
			setClickMenu([...clickMenu, target]);
		}
	};

	const menu_set = [
		{
			title: 'Users',
			icon: User,
			on_click: () => subMenuChangeHandler('Users'),
		},
		{
			title: 'Listings',
			icon: Package,
			on_click: () => subMenuChangeHandler('Listings'),
		},
		{
			title: 'Community',
			icon: ChatsCircle,
			on_click: () => subMenuChangeHandler('Community'),
		},
		{
			title: 'Cs',
			icon: Headset,
			on_click: () => subMenuChangeHandler('Cs'),
		},
	];

	const sub_menu_set: Record<string, Array<{ title: string; url: string }>> = {
		Users: [{ title: 'List', url: '/_admin/users' }],
		Listings: [{ title: 'List', url: '/_admin/listings' }],
		Community: [{ title: 'List', url: '/_admin/community' }],
		Cs: [
			{ title: 'FAQ', url: '/_admin/cs/faq' },
			{ title: 'Notice', url: '/_admin/cs/notice' },
		],
	};

	const isSectionOpen = (title: string) => clickMenu.find((menu: string) => menu === title);
	const isSectionActive = (title: string) => clickMenu[0] === title;

	return (
		<nav className="admin-nav" aria-label="Admin navigation">
			{menu_set.map((item, index) => {
				const Icon = item.icon;
				const open = !!isSectionOpen(item.title);
				const active = isSectionActive(item.title);

				return (
					<List className="admin-nav__section" key={index} disablePadding>
						<ListItemButton
							onClick={item.on_click}
							component="li"
							className={active ? 'admin-nav__item admin-nav__item--active' : 'admin-nav__item'}
						>
							<ListItemIcon className="admin-nav__icon">
								<Icon size={20} weight="fill" />
							</ListItemIcon>
							<ListItemText primary={item.title} className="admin-nav__label" />
							<span className={`admin-nav__chevron ${open ? 'is-open' : ''}`}>
								{open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
							</span>
						</ListItemButton>
						<Collapse in={open} className="admin-nav__collapse" timeout={200} component="li" unmountOnExit>
							<List className="admin-nav__sublist" disablePadding>
								{sub_menu_set[item.title]?.map((sub, i) => {
									const subActive = active && clickSubMenu === sub.title;
									return (
										<Link href={sub.url} shallow replace key={i} className="admin-nav__sub-link">
											<ListItemButton
												component="span"
												className={
													subActive ? 'admin-nav__sub-item admin-nav__sub-item--active' : 'admin-nav__sub-item'
												}
											>
												<Typography component="span">{sub.title}</Typography>
											</ListItemButton>
										</Link>
									);
								})}
							</List>
						</Collapse>
					</List>
				);
			})}
		</nav>
	);
};

export default withRouter(AdminMenuList);
