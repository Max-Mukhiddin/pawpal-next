import React from 'react';
import {
	DEFAULT_SIDEBAR_FILTERS,
	type SidebarFilterState,
} from '../../utils/specialistSidebarFilters';

const SPECIALTY_OPTIONS = ['Veterinarian', 'Groomer', 'Trainer', 'Sitter', 'Walker'];
const LOCATION_OPTIONS = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Jeju'];
const EXPERIENCE_OPTIONS = ['1-3 years', '3-5', '5-10', '10+'];
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Evenings'];

export interface SpecialistSidebarFilterProps {
	searchText: string;
	onSearchTextChange: (value: string) => void;
	onSearchEnter: () => void;
	filters: SidebarFilterState;
	onFiltersChange: (next: SidebarFilterState) => void;
}

const toggleInList = (list: string[], value: string) =>
	list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const FilterGroup = ({
	label,
	options,
	selected,
	onToggle,
}: {
	label: string;
	options: string[];
	selected: string[];
	onToggle: (value: string) => void;
}) => (
	<div className="specialist-sidebar__group">
		<h3 className="specialist-sidebar__group-label">{label}</h3>
		{options.map((opt) => {
			const checked = selected.includes(opt);
			return (
				<label key={opt} className="specialist-sidebar__row">
					<input
						type="checkbox"
						checked={checked}
						onChange={() => onToggle(opt)}
					/>
					<span className={checked ? 'is-checked' : ''}>{opt}</span>
				</label>
			);
		})}
	</div>
);

const SpecialistSidebarFilter: React.FC<SpecialistSidebarFilterProps> = ({
	searchText,
	onSearchTextChange,
	onSearchEnter,
	filters,
	onFiltersChange,
}) => {
	const setGroup = (key: keyof SidebarFilterState, value: string) => {
		onFiltersChange({
			...filters,
			[key]: toggleInList(filters[key], value),
		});
	};

	return (
		<aside className="specialist-sidebar">
			<div className="specialist-sidebar__head">
				<h2 className="specialist-sidebar__title">Filter</h2>
				<button
					type="button"
					className="specialist-sidebar__reset"
					onClick={() => onFiltersChange(DEFAULT_SIDEBAR_FILTERS)}
				>
					Reset
				</button>
			</div>

			<input
				className="specialist-sidebar__search"
				type="search"
				placeholder="Search for a specialist"
				value={searchText}
				onChange={(e) => onSearchTextChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') onSearchEnter();
				}}
			/>

			<FilterGroup
				label="Specialty"
				options={SPECIALTY_OPTIONS}
				selected={filters.specialty}
				onToggle={(v) => setGroup('specialty', v)}
			/>
			<div className="specialist-sidebar__divider" />
			<FilterGroup
				label="Location"
				options={LOCATION_OPTIONS}
				selected={filters.location}
				onToggle={(v) => setGroup('location', v)}
			/>
			<div className="specialist-sidebar__divider" />
			<FilterGroup
				label="Experience"
				options={EXPERIENCE_OPTIONS}
				selected={filters.experience}
				onToggle={(v) => setGroup('experience', v)}
			/>
			<div className="specialist-sidebar__divider" />
			<FilterGroup
				label="Availability"
				options={AVAILABILITY_OPTIONS}
				selected={filters.availability}
				onToggle={(v) => setGroup('availability', v)}
			/>
		</aside>
	);
};

export default SpecialistSidebarFilter;
