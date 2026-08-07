import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	ChartPie,
	ChatsCircle,
	Headset,
	Package,
	SignOut,
	Users,
} from 'phosphor-react';

type DockItem = {
	id: string;
	label: string;
	href: string;
	icon: React.ReactNode;
	match: (path: string) => boolean;
};

type Props = {
	onLogout: () => void;
};

const NAV_ITEMS: DockItem[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		href: '/_admin/dashboard',
		icon: <ChartPie size={22} weight="fill" />,
		match: (path) => path === '/_admin/dashboard' || path === '/_admin',
	},
	{
		id: 'users',
		label: 'Users',
		href: '/_admin/users',
		icon: <Users size={22} weight="fill" />,
		match: (path) => path.startsWith('/_admin/users'),
	},
	{
		id: 'listings',
		label: 'Listings',
		href: '/_admin/listings',
		icon: <Package size={22} weight="fill" />,
		match: (path) => path.startsWith('/_admin/listings') || path.startsWith('/_admin/properties'),
	},
	{
		id: 'community',
		label: 'Community',
		href: '/_admin/community',
		icon: <ChatsCircle size={22} weight="fill" />,
		match: (path) => path.startsWith('/_admin/community'),
	},
	{
		id: 'support',
		label: 'Support',
		href: '/_admin/cs/faq',
		icon: <Headset size={22} weight="fill" />,
		match: (path) => path.startsWith('/_admin/cs'),
	},
];

function DockHomeLink() {
	return (
		<div className="admin-dock__item-wrap">
			<Link href="/" className="admin-dock__logo" aria-label="Back to PawPal">
				<span className="admin-dock__logo-icon" aria-hidden>
					<img
						src="/img/logo/pawpal-logo-mark.png"
						alt="Back to PawPal"
						style={{ width: 24, height: 24, objectFit: 'contain' }}
					/>
				</span>
			</Link>
			<span className="admin-dock__tooltip" role="tooltip">
				Back to PawPal
			</span>
		</div>
	);
}

function DockNavItem({ item, active }: { item: DockItem; active: boolean }) {
	return (
		<div className="admin-dock__item-wrap">
			<Link
				href={item.href}
				className={`admin-dock__item${active ? ' admin-dock__item--active' : ''}`}
				aria-label={item.label}
				aria-current={active ? 'page' : undefined}
			>
				<span className="admin-dock__icon">{item.icon}</span>
			</Link>
			<span className="admin-dock__tooltip" role="tooltip">
				{item.label}
			</span>
		</div>
	);
}

function DockActionItem({
	label,
	onClick,
	icon,
	className = '',
}: {
	label: string;
	onClick: () => void;
	icon: React.ReactNode;
	className?: string;
}) {
	return (
		<div className="admin-dock__item-wrap">
			<button type="button" className={`admin-dock__item admin-dock__item--action ${className}`.trim()} onClick={onClick} aria-label={label}>
				<span className="admin-dock__icon">{icon}</span>
			</button>
			<span className="admin-dock__tooltip" role="tooltip">
				{label}
			</span>
		</div>
	);
}

export default function AdminFloatingDock({ onLogout }: Props) {
	const router = useRouter();
	const path = router.pathname;

	return (
		<nav className="admin-dock" aria-label="PawPal admin navigation">
			<DockHomeLink />

			<div className="admin-dock__divider" aria-hidden />

			<div className="admin-dock__nav">
				{NAV_ITEMS.map((item) => (
					<DockNavItem key={item.id} item={item} active={item.match(path)} />
				))}
			</div>

			<div className="admin-dock__divider" aria-hidden />

			<div className="admin-dock__footer">
				<DockActionItem
					label="Log Out"
					onClick={onLogout}
					icon={<SignOut size={20} weight="fill" />}
					className="admin-dock__item--logout"
				/>
			</div>
		</nav>
	);
}
