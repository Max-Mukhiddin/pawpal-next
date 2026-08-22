import React, { useId, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';

export interface CatalogCategoryOption {
	label: string;
	icon?: string;
}

export interface CatalogLocationOption {
	label: string;
	value: string;
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
	locationGroupLabel?: string;
	locationOptions?: CatalogLocationOption[];
	selectedLocations?: string[];
	onLocationToggle?: (value: string) => void;
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
	locationGroupLabel,
	locationOptions = [],
	selectedLocations = [],
	onLocationToggle,
	onReset,
}) => {
	/**
	 * Mobile only: the search + category panel collapses behind a "Filter" button so the
	 * listing grid is reachable without scrolling past the whole filter stack. Desktop is
	 * unaffected — the panel is `display: contents` above the breakpoint, so the DOM order
	 * and grid layout stay exactly as before.
	 */
	const [filtersOpen, setFiltersOpen] = useState(false);
	const panelId = useId();
	const activeCount =
		(activeCategory && activeCategory !== 'All' ? 1 : 0) +
		(searchText.trim() ? 1 : 0) +
		selectedLocations.length;

	return (
	<aside className="catalog-sidebar">
		<div className="catalog-sidebar__head">
			<h2 className="catalog-sidebar__title">Filter</h2>
			<button
				type="button"
				className={`catalog-sidebar__toggle${filtersOpen ? ' is-open' : ''}`}
				onClick={() => setFiltersOpen((v) => !v)}
				aria-expanded={filtersOpen}
				aria-controls={panelId}
			>
				<TuneIcon className="catalog-sidebar__toggle-icon" aria-hidden />
				<span>Filter</span>
				{activeCount > 0 ? (
					<span className="catalog-sidebar__toggle-count">{activeCount}</span>
				) : null}
				<ExpandMoreIcon className="catalog-sidebar__toggle-chevron" aria-hidden />
			</button>
			<button type="button" className="catalog-sidebar__reset" onClick={onReset}>
				Reset
			</button>
		</div>

		<div
			id={panelId}
			className={`catalog-sidebar__panel${filtersOpen ? ' is-open' : ''}`}
		>
		<div className="catalog-sidebar__panel-inner">
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

		{locationGroupLabel && locationOptions.length > 0 ? (
			<div className="catalog-sidebar__group">
				<h3 className="catalog-sidebar__group-label">{locationGroupLabel}</h3>
				{locationOptions.map(({ label, value }) => {
					const checked = selectedLocations.includes(value);
					return (
						<label key={value} className="catalog-sidebar__row">
							<input
								type="checkbox"
								checked={checked}
								onChange={() => onLocationToggle?.(value)}
							/>
							<span className={checked ? 'is-checked' : ''}>{label}</span>
						</label>
					);
				})}
			</div>
		) : null}
		</div>
		</div>
	</aside>
	);
};

export default CatalogSidebarFilter;
