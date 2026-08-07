import React from 'react';

export interface CatalogCategoryOption {
	label: string;
	icon?: string;
}

export interface CatalogSidebarFilterProps {
	searchPlaceholder: string;
	searchText: string;
	onSearchTextChange: (value: string) => void;
	onSearchEnter: () => void;
	searchLoading?: boolean;
	categoryGroupLabel: string;
	categories: CatalogCategoryOption[];
	activeCategory: string;
	onCategorySelect: (label: string) => void;
	onReset: () => void;
}

const CatalogSidebarFilter: React.FC<CatalogSidebarFilterProps> = ({
	searchPlaceholder,
	searchText,
	onSearchTextChange,
	onSearchEnter,
	searchLoading = false,
	categoryGroupLabel,
	categories,
	activeCategory,
	onCategorySelect,
	onReset,
}) => (
	<aside className="catalog-sidebar">
		<div className="catalog-sidebar__head">
			<h2 className="catalog-sidebar__title">Filter</h2>
			<button type="button" className="catalog-sidebar__reset" onClick={onReset}>
				Reset
			</button>
		</div>

		<div className="catalog-sidebar__search-wrap">
			<input
				className="catalog-sidebar__search"
				type="search"
				placeholder={searchPlaceholder}
				value={searchText}
				onChange={(e) => onSearchTextChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') onSearchEnter();
				}}
				aria-busy={searchLoading}
			/>
			{searchLoading ? (
				<span className="catalog-sidebar__search-spinner" aria-hidden />
			) : null}
		</div>

		<div className="catalog-sidebar__group">
			<h3 className="catalog-sidebar__group-label">{categoryGroupLabel}</h3>
			{categories.map(({ label, icon }) => {
				const checked = activeCategory === label;
				return (
					<label key={label} className="catalog-sidebar__row">
						<input
							type="checkbox"
							checked={checked}
							onChange={() => onCategorySelect(label)}
						/>
						<span className={checked ? 'is-checked' : ''}>
							{icon ? `${icon} ` : ''}
							{label}
						</span>
					</label>
				);
			})}
		</div>
	</aside>
);

export default CatalogSidebarFilter;
