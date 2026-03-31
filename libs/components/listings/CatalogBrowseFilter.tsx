import React, { useCallback, useState } from 'react';
import { Stack, Typography, Checkbox, Button, OutlinedInput, Tooltip, IconButton } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ListingLocation, ListingType } from '../../enums/listing.enum';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

const CATALOG_TYPES = [ListingType.PRODUCT, ListingType.SERVICE];

interface FilterType {
	listingInquiry: ListingsInquiry;
	setListingInquiry: React.Dispatch<React.SetStateAction<ListingsInquiry>>;
	initialInput: ListingsInquiry;
}

const CatalogBrowseFilter = (props: FilterType) => {
	const { listingInquiry, setListingInquiry, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const locationOptions = Object.values(ListingLocation);
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);

	const pushInquiry = useCallback(
		async (next: ListingsInquiry) => {
			await router.push(`/listings?input=${JSON.stringify(next)}`, `/listings?input=${JSON.stringify(next)}`, {
				scroll: false,
			});
		},
		[router],
	);

	const listingLocationSelectHandler = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value as ListingLocation;
			try {
				const next = {
					...listingInquiry,
					search: {
						...listingInquiry.search,
						text: listingInquiry?.search?.text === value ? '' : value,
					},
				};
				setListingInquiry(next);
				await pushInquiry(next);
			} catch (err: unknown) {
				console.log('ERROR, listingLocationSelectHandler:', err);
			}
		},
		[listingInquiry, setListingInquiry, pushInquiry],
	);

	const listingTypeSelectHandler = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value as ListingType;
			try {
				if (listingInquiry?.search?.typeList?.includes(value)) {
					const typeList = listingInquiry?.search?.typeList?.filter((item: ListingType) => item !== value);
					const next = { ...listingInquiry, search: { ...listingInquiry.search, typeList } };
					setListingInquiry(next);
					await pushInquiry(next);
				} else {
					const next = {
						...listingInquiry,
						search: {
							...listingInquiry.search,
							typeList: [...(listingInquiry?.search?.typeList || []), value],
						},
					};
					setListingInquiry(next);
					await pushInquiry(next);
				}
			} catch (err: unknown) {
				console.log('ERROR, listingTypeSelectHandler:', err);
			}
		},
		[listingInquiry, setListingInquiry, pushInquiry],
	);

	const listingPriceRangeHandler = useCallback(
		async (raw: string, kind: 'start' | 'end') => {
			const num = parseInt(raw, 10);
			const value = Number.isNaN(num) ? 0 : num;
			const start = kind === 'start' ? value : listingInquiry.search.pricesRange?.start ?? 0;
			const end = kind === 'end' ? value : listingInquiry.search.pricesRange?.end ?? 2_000_000;
			const next = {
				...listingInquiry,
				search: {
					...listingInquiry.search,
					pricesRange: { start, end },
				},
			};
			setListingInquiry(next);
			await pushInquiry(next);
		},
		[listingInquiry, setListingInquiry, pushInquiry],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/listings?input=${JSON.stringify(initialInput)}`,
				`/listings?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: unknown) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>CATALOG FILTER</div>;
	}

	return (
		<Stack className={'filter-main'}>
			<Stack className={'find-your-home'} mb={'40px'}>
				<Typography className={'title-main'}>Find products &amp; services</Typography>
				<Stack className={'input-box'}>
					<OutlinedInput
						value={searchText}
						type={'text'}
						className={'search-input'}
						placeholder={'What are you looking for?'}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
						onKeyDown={(event: React.KeyboardEvent) => {
							if (event.key === 'Enter') {
								const next = { ...listingInquiry, search: { ...listingInquiry.search, text: searchText } };
								setListingInquiry(next);
								void pushInquiry(next);
							}
						}}
						endAdornment={
							<CancelRoundedIcon
								onClick={() => {
									setSearchText('');
									const next = { ...listingInquiry, search: { ...listingInquiry.search, text: '' } };
									setListingInquiry(next);
									void pushInquiry(next);
								}}
							/>
						}
					/>
					<img src={'/img/icons/search_icon.png'} alt={''} />
					<Tooltip title="Reset">
						<IconButton onClick={refreshHandler}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>
			<Stack className={'find-your-home'} mb={'30px'}>
				<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
					Location
				</p>
				<Stack
					className={`listing-location`}
					style={{ height: showMore ? '253px' : '115px' }}
					onMouseEnter={() => setShowMore(true)}
					onMouseLeave={() => {
						if (!listingInquiry?.search?.text) {
							setShowMore(false);
						}
					}}
				>
					{locationOptions.map((location: string) => (
						<Stack className={'input-box'} key={location}>
							<Checkbox
								id={location}
								className="listing-checkbox"
								color="default"
								size="small"
								value={location}
								checked={listingInquiry?.search?.text === location}
								onChange={listingLocationSelectHandler}
							/>
							<label htmlFor={location} style={{ cursor: 'pointer' }}>
								<Typography className="listing-type">{location}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
			</Stack>
			<Stack className={'find-your-home'} mb={'30px'}>
				<Typography className={'title'}>Type</Typography>
				{CATALOG_TYPES.map((type) => (
					<Stack className={'input-box'} key={type}>
						<Checkbox
							id={type}
							className="listing-checkbox"
							color="default"
							size="small"
							value={type}
							onChange={listingTypeSelectHandler}
							checked={(listingInquiry?.search?.typeList || []).includes(type)}
						/>
						<label style={{ cursor: 'pointer' }}>
							<Typography className="listing-type">{type}</Typography>
						</label>
					</Stack>
				))}
			</Stack>
			<Stack className={'find-your-home'}>
				<Typography className={'title'}>Price range</Typography>
				<Stack className="square-year-input">
					<input
						type="number"
						placeholder="$ min"
						min={0}
						value={listingInquiry?.search?.pricesRange?.start ?? 0}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							if (e.target.value === '' || Number(e.target.value) >= 0) {
								void listingPriceRangeHandler(e.target.value, 'start');
							}
						}}
					/>
					<div className="central-divider"></div>
					<input
						type="number"
						placeholder="$ max"
						value={listingInquiry?.search?.pricesRange?.end ?? 0}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							if (e.target.value === '' || Number(e.target.value) >= 0) {
								void listingPriceRangeHandler(e.target.value, 'end');
							}
						}}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CatalogBrowseFilter;
