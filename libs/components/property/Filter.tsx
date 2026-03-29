import React, { useCallback, useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ListingLocation, ListingType } from '../../enums/listing.enum';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { listingSquareOptions, listingBarter, listingRent } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	listingInquiry: ListingsInquiry;
	setListingInquiry: any;
	initialInput: ListingsInquiry;
}

const Filter = (props: FilterType) => {
	const { listingInquiry, setListingInquiry, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const locationOptions = Object.values(ListingLocation);
	const listingTypeOptions = Object.values(ListingType);
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		if (listingInquiry?.search?.locationList?.length == 0) {
			delete listingInquiry.search.locationList;
			setShowMore(false);
			router.push(`/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, `/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, { scroll: false }).then();
		}

		if (listingInquiry?.search?.typeList?.length == 0) {
			delete listingInquiry.search.typeList;
			router.push(`/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, `/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, { scroll: false }).then();
		}

		if (listingInquiry?.search?.roomsList?.length == 0) {
			delete listingInquiry.search.roomsList;
			router.push(`/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, `/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, { scroll: false }).then();
		}

		if (listingInquiry?.search?.options?.length == 0) {
			delete listingInquiry.search.options;
			router.push(`/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, `/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, { scroll: false }).then();
		}

		if (listingInquiry?.search?.bedsList?.length == 0) {
			delete listingInquiry.search.bedsList;
			router.push(`/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, `/property?input=${JSON.stringify({
			...listingInquiry,
			search: {
				...listingInquiry.search,
			},
		})}`, { scroll: false }).then();
		}

		if (listingInquiry?.search?.locationList) setShowMore(true);
	}, [listingInquiry]);

	/** HANDLERS **/
	const listingLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, locationList: [...(listingInquiry?.search?.locationList || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, locationList: [...(listingInquiry?.search?.locationList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (listingInquiry?.search?.locationList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								locationList: listingInquiry?.search?.locationList?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								locationList: listingInquiry?.search?.locationList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (listingInquiry?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('listingLocationSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, listingLocationSelectHandler:', err);
			}
		},
		[listingInquiry],
	);

	const listingTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, typeList: [...(listingInquiry?.search?.typeList || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, typeList: [...(listingInquiry?.search?.typeList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (listingInquiry?.search?.typeList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								typeList: listingInquiry?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								typeList: listingInquiry?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (listingInquiry?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('listingTypeSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, listingTypeSelectHandler:', err);
			}
		},
		[listingInquiry],
	);

	const listingRoomSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (listingInquiry?.search?.roomsList?.includes(number)) {
						await router.push(
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: {
									...listingInquiry.search,
									roomsList: listingInquiry?.search?.roomsList?.filter((item: Number) => item !== number),
								},
							})}`,
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: {
									...listingInquiry.search,
									roomsList: listingInquiry?.search?.roomsList?.filter((item: Number) => item !== number),
								},
							})}`,
							{ scroll: false },
						);
					} else {
						await router.push(
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: { ...listingInquiry.search, roomsList: [...(listingInquiry?.search?.roomsList || []), number] },
							})}`,
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: { ...listingInquiry.search, roomsList: [...(listingInquiry?.search?.roomsList || []), number] },
							})}`,
							{ scroll: false },
						);
					}
				} else {
					delete listingInquiry?.search.roomsList;
					setListingInquiry({ ...listingInquiry });
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
							},
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('listingRoomSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, listingRoomSelectHandler:', err);
			}
		},
		[listingInquiry],
	);

	const listingOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, options: [...(listingInquiry?.search?.options || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: { ...listingInquiry.search, options: [...(listingInquiry?.search?.options || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (listingInquiry?.search?.options?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								options: listingInquiry?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
								options: listingInquiry?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('listingOptionSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, listingOptionSelectHandler:', err);
			}
		},
		[listingInquiry],
	);

	const listingBedSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (listingInquiry?.search?.bedsList?.includes(number)) {
						await router.push(
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: {
									...listingInquiry.search,
									bedsList: listingInquiry?.search?.bedsList?.filter((item: Number) => item !== number),
								},
							})}`,
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: {
									...listingInquiry.search,
									bedsList: listingInquiry?.search?.bedsList?.filter((item: Number) => item !== number),
								},
							})}`,
							{ scroll: false },
						);
					} else {
						await router.push(
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: { ...listingInquiry.search, bedsList: [...(listingInquiry?.search?.bedsList || []), number] },
							})}`,
							`/property?input=${JSON.stringify({
								...listingInquiry,
								search: { ...listingInquiry.search, bedsList: [...(listingInquiry?.search?.bedsList || []), number] },
							})}`,
							{ scroll: false },
						);
					}
				} else {
					delete listingInquiry?.search.bedsList;
					setListingInquiry({ ...listingInquiry });
					await router.push(
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
							},
						})}`,
						`/property?input=${JSON.stringify({
							...listingInquiry,
							search: {
								...listingInquiry.search,
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('listingBedSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, listingBedSelectHandler:', err);
			}
		},
		[listingInquiry],
	);

	const listingSquareRangeHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;

			if (type == 'start') {
				await router.push(
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							squaresRange: { ...listingInquiry.search.squaresRange, start: value },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							squaresRange: { ...listingInquiry.search.squaresRange, start: value },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							squaresRange: { ...listingInquiry.search.squaresRange, end: value },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							squaresRange: { ...listingInquiry.search.squaresRange, end: value },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[listingInquiry],
	);

	const listingPriceRangeHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							pricesRange: { ...listingInquiry.search.pricesRange, start: value * 1 },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							pricesRange: { ...listingInquiry.search.pricesRange, start: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							pricesRange: { ...listingInquiry.search.pricesRange, end: value * 1 },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...listingInquiry,
						search: {
							...listingInquiry.search,
							pricesRange: { ...listingInquiry.search.pricesRange, end: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[listingInquiry],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/property?input=${JSON.stringify(initialInput)}`,
				`/property?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Home</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									setListingInquiry({
										...listingInquiry,
										search: { ...listingInquiry.search, text: searchText },
									});
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											setListingInquiry({
												...listingInquiry,
												search: { ...listingInquiry.search, text: '' },
											});
										}}
									/>
								</>
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
						className={`property-location`}
						style={{ height: showMore ? '253px' : '115px' }}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!listingInquiry?.search?.locationList) {
								setShowMore(false);
							}
						}}
					>
						{locationOptions.map((location: string) => {
							return (
								<Stack className={'input-box'} key={location}>
									<Checkbox
										id={location}
										className="property-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(listingInquiry?.search?.locationList || []).includes(location as ListingLocation)}
										onChange={listingLocationSelectHandler}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="property-type">{location}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Property Type</Typography>
					{listingTypeOptions.map((type: string) => (
						<Stack className={'input-box'} key={type}>
							<Checkbox
								id={type}
								className="property-checkbox"
								color="default"
								size="small"
								value={type}
								onChange={listingTypeSelectHandler}
								checked={(listingInquiry?.search?.typeList || []).includes(type as ListingType)}
							/>
							<label style={{ cursor: 'pointer' }}>
								<Typography className="property_type">{type}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Rooms</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !listingInquiry?.search?.roomsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => listingRoomSelectHandler(0)}
						>
							Any
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.roomsList?.includes(1) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.roomsList?.includes(1) ? undefined : 'none',
							}}
							onClick={() => listingRoomSelectHandler(1)}
						>
							1
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.roomsList?.includes(2) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.roomsList?.includes(2) ? undefined : 'none',
							}}
							onClick={() => listingRoomSelectHandler(2)}
						>
							2
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.roomsList?.includes(3) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.roomsList?.includes(3) ? undefined : 'none',
							}}
							onClick={() => listingRoomSelectHandler(3)}
						>
							3
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.roomsList?.includes(4) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.roomsList?.includes(4) ? undefined : 'none',
								borderRight: listingInquiry?.search?.roomsList?.includes(4) ? undefined : 'none',
							}}
							onClick={() => listingRoomSelectHandler(4)}
						>
							4
						</Button>
						<Button
							sx={{
								borderRadius: '0 12px 12px 0',
								border: listingInquiry?.search?.roomsList?.includes(5) ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => listingRoomSelectHandler(5)}
						>
							5+
						</Button>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Bedrooms</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !listingInquiry?.search?.bedsList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => listingBedSelectHandler(0)}
						>
							Any
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.bedsList?.includes(1) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.bedsList?.includes(1) ? undefined : 'none',
							}}
							onClick={() => listingBedSelectHandler(1)}
						>
							1
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.bedsList?.includes(2) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.bedsList?.includes(2) ? undefined : 'none',
							}}
							onClick={() => listingBedSelectHandler(2)}
						>
							2
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.bedsList?.includes(3) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.bedsList?.includes(3) ? undefined : 'none',
							}}
							onClick={() => listingBedSelectHandler(3)}
						>
							3
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: listingInquiry?.search?.bedsList?.includes(4) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.bedsList?.includes(4) ? undefined : 'none',
								// borderRight: false ? undefined : 'none',
							}}
							onClick={() => listingBedSelectHandler(4)}
						>
							4
						</Button>
						<Button
							sx={{
								borderRadius: '0 12px 12px 0',
								border: listingInquiry?.search?.bedsList?.includes(5) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: listingInquiry?.search?.bedsList?.includes(5) ? undefined : 'none',
							}}
							onClick={() => listingBedSelectHandler(5)}
						>
							5+
						</Button>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Options</Typography>
					<Stack className={'input-box'}>
						<Checkbox
							id={'Barter'}
							className="property-checkbox"
							color="default"
							size="small"
							value={listingBarter}
							checked={(listingInquiry?.search?.options || []).includes(listingBarter)}
							onChange={listingOptionSelectHandler}
						/>
						<label htmlFor={'Barter'} style={{ cursor: 'pointer' }}>
							<Typography className="propert-type">Barter</Typography>
						</label>
					</Stack>
					<Stack className={'input-box'}>
						<Checkbox
							id={'Rent'}
							className="property-checkbox"
							color="default"
							size="small"
							value={listingRent}
							checked={(listingInquiry?.search?.options || []).includes(listingRent)}
							onChange={listingOptionSelectHandler}
						/>
						<label htmlFor={'Rent'} style={{ cursor: 'pointer' }}>
							<Typography className="propert-type">Rent</Typography>
						</label>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Square meter</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="demo-simple-select-label">Min</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={listingInquiry?.search?.squaresRange?.start ?? 0}
								label="Min"
								onChange={(e: any) => listingSquareRangeHandler(e, 'start')}
								MenuProps={MenuProps}
							>
								{listingSquareOptions.map((square: number) => (
									<MenuItem
										value={square}
										disabled={(listingInquiry?.search?.squaresRange?.end || 0) < square}
										key={square}
									>
										{square}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<div className="central-divider"></div>
						<FormControl>
							<InputLabel id="demo-simple-select-label">Max</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={listingInquiry?.search?.squaresRange?.end ?? 500}
								label="Max"
								onChange={(e: any) => listingSquareRangeHandler(e, 'end')}
								MenuProps={MenuProps}
							>
								{listingSquareOptions.map((square: number) => (
									<MenuItem
										value={square}
										disabled={(listingInquiry?.search?.squaresRange?.start || 0) > square}
										key={square}
									>
										{square}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price Range</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="$ min"
							min={0}
							value={listingInquiry?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									listingPriceRangeHandler(e.target.value, 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="$ max"
							value={listingInquiry?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									listingPriceRangeHandler(e.target.value, 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
