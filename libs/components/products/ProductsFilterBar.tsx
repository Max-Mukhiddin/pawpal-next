import React from 'react';
import { Box, Button, Menu, MenuItem, Stack } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

/** Catalog search + sort; keeps `products-filter` BEM for existing SCSS. */
export interface ProductsFilterBarProps {
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

const ProductsFilterBar: React.FC<ProductsFilterBarProps> = ({
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
	<Stack className={'products-filter'}>
		<Box component={'div'} className={'products-filter__left'}>
			<input
				type="text"
				placeholder={'Search products'}
				value={searchText}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchTextChange(e.target.value)}
				onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
					if (event.key === 'Enter') onSearchEnter();
				}}
			/>
		</Box>
		<Box component={'div'} className={'products-filter__right'}>
			<span>Sort products by</span>
			<div>
				<Button onClick={onSortingClick} endIcon={<KeyboardArrowDownRoundedIcon />}>
					{filterSortName}
				</Button>
				<Menu anchorEl={anchorEl} open={sortingOpen} onClose={onSortingClose} sx={{ paddingTop: '5px' }}>
					<MenuItem onClick={onSortingSelect} id={'new'} disableRipple>
						Newest
					</MenuItem>
					<MenuItem onClick={onSortingSelect} id={'lowest'} disableRipple>
						Lowest Price
					</MenuItem>
					<MenuItem onClick={onSortingSelect} id={'highest'} disableRipple>
						Highest Price
					</MenuItem>
				</Menu>
			</div>
		</Box>
	</Stack>
);

export default ProductsFilterBar;
