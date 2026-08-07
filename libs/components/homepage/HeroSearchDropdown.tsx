import Link from 'next/link';
import type { HeroSearchGroup } from '../../hooks/useHeroSearchAutocomplete';

export interface HeroSearchDropdownProps {
	query: string;
	groups: HeroSearchGroup[];
	loading: boolean;
	activeIndex: number;
	hasMore: boolean;
	seeAllHref: string;
	onSelect: () => void;
	listboxId: string;
}

export default function HeroSearchDropdown({
	query,
	groups,
	loading,
	activeIndex,
	hasMore,
	seeAllHref,
	onSelect,
	listboxId,
}: HeroSearchDropdownProps) {
	const hasResults = groups.length > 0;
	let rowIndex = -1;

	return (
		<div className="pp-hero__search-dropdown" role="presentation">
			{loading && !hasResults ? (
				<div className="pp-hero__search-dropdown-loading" aria-live="polite">
					<span className="pp-hero__search-dropdown-spinner" aria-hidden />
					<span>Searching…</span>
				</div>
			) : null}

			{!loading && !hasResults ? (
				<p className="pp-hero__search-dropdown-empty">
					No results found for &lsquo;{query}&rsquo;
				</p>
			) : null}

			{hasResults ? (
				<ul className="pp-hero__search-dropdown-list" id={listboxId} role="listbox">
					{groups.map((group) => (
						<li key={group.type} className="pp-hero__search-dropdown-group" role="presentation">
							<p className="pp-hero__search-dropdown-label">{group.label}</p>
							<ul className="pp-hero__search-dropdown-rows" role="presentation">
								{group.items.map((item) => {
									rowIndex += 1;
									const isActive = rowIndex === activeIndex;
									return (
										<li key={`${item.type}-${item.id}`} role="presentation">
											<Link
												href={item.href}
												className={`pp-hero__search-dropdown-row${
													isActive ? ' is-active' : ''
												}`}
												role="option"
												aria-selected={isActive}
												onClick={() => onSelect()}
											>
												<img
													className="pp-hero__search-dropdown-thumb"
													src={item.image}
													alt=""
													onError={(e) => {
														const img = e.currentTarget;
														if (item.type === 'specialist') {
															img.src = '/img/profile/defaultUser.svg';
														} else if (item.type === 'article') {
															img.src = '/images/services/service-grooming.jpg';
														} else {
															img.src = '/img/listing/default-listing.webp';
														}
													}}
												/>
												<span className="pp-hero__search-dropdown-copy">
													<span className="pp-hero__search-dropdown-title">{item.title}</span>
													<span className="pp-hero__search-dropdown-meta">
														{item.subtitle ?? ''}
													</span>
												</span>
											</Link>
										</li>
									);
								})}
							</ul>
						</li>
					))}
				</ul>
			) : null}

			{loading && hasResults ? (
				<div className="pp-hero__search-dropdown-loading pp-hero__search-dropdown-loading--inline">
					<span className="pp-hero__search-dropdown-spinner" aria-hidden />
				</div>
			) : null}

			{hasMore && hasResults ? (
				<Link href={seeAllHref} className="pp-hero__search-dropdown-more" onClick={() => onSelect()}>
					See all results for &lsquo;{query}&rsquo; →
				</Link>
			) : null}
		</div>
	);
}
