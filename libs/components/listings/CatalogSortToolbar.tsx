import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

export interface CatalogSortToolbarProps {
	filterSortName: string;
	anchorEl: null | HTMLElement;
	sortingOpen: boolean;
	onSortingClick: (e: React.MouseEvent<HTMLElement>) => void;
	onSortingClose: () => void;
	onSortingSelect: (e: React.MouseEvent<HTMLLIElement>) => void;
}

const CatalogSortToolbar: React.FC<CatalogSortToolbarProps> = ({
	filterSortName,
	anchorEl,
	sortingOpen,
	onSortingClick,
	onSortingClose,
	onSortingSelect,
}) => (
	<div className="catalog-toolbar">
		<span className="catalog-toolbar__label">Sort by</span>
		<Button onClick={onSortingClick} endIcon={<KeyboardArrowDownRoundedIcon />}>
			{filterSortName}
		</Button>
		<Menu anchorEl={anchorEl} open={sortingOpen} onClose={onSortingClose} sx={{ paddingTop: '5px' }}>
			<MenuItem onClick={onSortingSelect} id="new" disableRipple>
				Newest
			</MenuItem>
			<MenuItem onClick={onSortingSelect} id="lowest" disableRipple>
				Lowest Price
			</MenuItem>
			<MenuItem onClick={onSortingSelect} id="highest" disableRipple>
				Highest Price
			</MenuItem>
		</Menu>
	</div>
);

export default CatalogSortToolbar;
