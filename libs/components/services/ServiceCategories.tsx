import React from 'react';

export interface CategoryPill {
	label: string;
	icon: string;
	keywords: string[];
}

export const SERVICE_CATEGORIES: CategoryPill[] = [
	{ label: 'All', icon: '🐾', keywords: [] },
	{ label: 'Grooming', icon: '✂️', keywords: ['groom', 'hair', 'styling', 'brush', 'bath'] },
	{ label: 'Walking', icon: '🦮', keywords: ['walk', 'outdoor', 'exercise'] },
	{ label: 'Boarding', icon: '🏠', keywords: ['board', 'stay', 'overnight', 'hotel'] },
	{ label: 'Daycare', icon: '☀️', keywords: ['daycare', 'day care', 'sitting'] },
	{ label: 'Vet & Health', icon: '🩺', keywords: ['vet', 'health', 'dental', 'flea', 'vaccine', 'check'] },
	{ label: 'Training', icon: '🎓', keywords: ['train', 'obedience', 'behavior', 'class'] },
];

interface ServiceCategoriesProps {
	activeCategory: string;
	onSelect: (label: string) => void;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ activeCategory, onSelect }) => (
	<div className="services-categories">
		{SERVICE_CATEGORIES.map(({ label, icon }) => (
			<button
				key={label}
				type="button"
				className={`services-categories__pill${activeCategory === label ? ' is-active' : ''}`}
				onClick={() => onSelect(label)}
			>
				<span className="services-categories__icon" aria-hidden>{icon}</span>
				<span className="services-categories__label">{label}</span>
			</button>
		))}
	</div>
);

export default ServiceCategories;