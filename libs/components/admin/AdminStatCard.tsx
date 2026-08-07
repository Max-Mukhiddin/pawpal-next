import React from 'react';

type AdminStatCardProps = {
	label: string;
	value: string | number;
	note?: string;
	icon: React.ReactNode;
	accent?: 'forest' | 'honey' | 'sage';
};

export default function AdminStatCard({ label, value, note, icon, accent = 'forest' }: AdminStatCardProps) {
	return (
		<article className={`admin-stat-card admin-stat-card--${accent}`}>
			<div className="admin-stat-card__icon-wrap">{icon}</div>
			<p className="admin-stat-card__label">{label}</p>
			<p className="admin-stat-card__value">{value}</p>
			{note ? <p className="admin-stat-card__note">{note}</p> : null}
		</article>
	);
}
