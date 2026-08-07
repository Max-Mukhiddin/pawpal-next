import React from 'react';
import Link from 'next/link';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

type ActionItem = {
	label: string;
	href?: string;
	onClick?: () => void;
	icon: React.ReactNode;
	accent: 'honey' | 'forest';
};

type Props = {
	onAddFaq: () => void;
};

export default function AdminQuickActions({ onAddFaq }: Props) {
	const actions: ActionItem[] = [
		{
			label: 'Review Pending Specialists',
			href: '/_admin/users?pendingSpecialists=1',
			icon: <PersonSearchOutlinedIcon />,
			accent: 'honey',
		},
		{
			label: 'Add FAQ',
			onClick: onAddFaq,
			icon: <AddCircleOutlineOutlinedIcon />,
			accent: 'forest',
		},
		{
			label: 'View Listings',
			href: '/_admin/listings',
			icon: <Inventory2OutlinedIcon />,
			accent: 'forest',
		},
		{
			label: 'Manage Community',
			href: '/_admin/community',
			icon: <ArticleOutlinedIcon />,
			accent: 'honey',
		},
	];

	return (
		<section className="admin-dashboard-section">
			<h3 className="admin-dashboard-section__title">Quick Actions</h3>
			<div className="admin-quick-actions">
				{actions.map((action) => {
					const card = (
						<article className={`admin-quick-action admin-quick-action--${action.accent}`}>
							<div className="admin-quick-action__icon-wrap">{action.icon}</div>
							<span className="admin-quick-action__label">{action.label}</span>
						</article>
					);

					if (action.href) {
						return (
							<Link key={action.label} href={action.href} className="admin-quick-action__link">
								{card}
							</Link>
						);
					}

					return (
						<button
							key={action.label}
							type="button"
							className="admin-quick-action__link"
							onClick={action.onClick}
						>
							{card}
						</button>
					);
				})}
			</div>
		</section>
	);
}
