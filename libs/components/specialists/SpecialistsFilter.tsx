import React from 'react';
import { Box, Button, Menu, MenuItem, Stack } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

/** Directory filter bar; uses `.filter` / `.left` / `.right` under `.agent-list-page` for existing agent listing SCSS. */
export interface SpecialistsFilterProps {
	searchText: string;
	onSearchTextChange: (value: string) => void;
	onSearchEnter: () => void;
	filterSortName: string;
	anchorEl: null | HTMLElement;
	sortingOpen: boolean;
	onSortingClick: (e: React.MouseEvent<HTMLElement>) => void;
	onSortingClose: () => void;
	onSortingSelect: (e: React.MouseEvent<HTMLLIElement>) => void;
}

const SpecialistsFilter: React.FC<SpecialistsFilterProps> = ({
	searchText,
	onSearchTextChange,
	onSearchEnter,
	filterSortName,
	anchorEl,
	sortingOpen,
	onSortingClick,
	onSortingClose,
	onSortingSelect,
}) => (
	<Stack className={'filter'}>
		<Box component={'div'} className={'left'}>
			<input
				type="text"
				placeholder={'Search for a specialist'}
				value={searchText}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchTextChange(e.target.value)}
				onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
					if (event.key === 'Enter') onSearchEnter();
				}}
			/>
		</Box>
		<Box component={'div'} className={'right'}>
			<span>Sort specialists by</span>
			<div>
				<Button onClick={onSortingClick} endIcon={<KeyboardArrowDownRoundedIcon />}>
					{filterSortName}
				</Button>
				<Menu anchorEl={anchorEl} open={sortingOpen} onClose={onSortingClose} sx={{ paddingTop: '5px' }}>
					<MenuItem onClick={onSortingSelect} id={'recent'} disableRipple>
						Newest first
					</MenuItem>
					<MenuItem onClick={onSortingSelect} id={'old'} disableRipple>
						Earliest joined
					</MenuItem>
					<MenuItem onClick={onSortingSelect} id={'likes'} disableRipple>
						Most liked
					</MenuItem>
					<MenuItem onClick={onSortingSelect} id={'views'} disableRipple>
						Most viewed
					</MenuItem>
				</Menu>
			</div>
		</Box>
	</Stack>
);

export default SpecialistsFilter;
