import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { ListingLocation, ListingType } from '../../enums/listing.enum';
import type { ListingsInquiry } from '../../types/listing/listing.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const advancedFilterModalRootStyle: React.CSSProperties = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	backgroundColor: '#fff',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
};

interface HeaderFilterProps {
	initialInput: ListingsInquiry;
}

const CATALOG_TYPES = [ListingType.PRODUCT, ListingType.SERVICE];

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [listingInquiry, setListingInquiry] = useState<ListingsInquiry>(initialInput);
	const locationRef = useRef<HTMLDivElement>(null);
	const typeRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const locationEnumValues = Object.values(ListingLocation);

	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target as Node)) {
				setOpenLocation(false);
			}
			if (!typeRef?.current?.contains(event.target as Node)) {
				setOpenType(false);
			}
		};
		document.addEventListener('mousedown', clickHandler);
		return () => document.removeEventListener('mousedown', clickHandler);
	}, []);

	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
	};

	const listingLocationSelectHandler = useCallback(
		async (value: ListingLocation) => {
			setListingInquiry({
				...listingInquiry,
				search: { ...listingInquiry.search, text: value },
			});
			typeStateChangeHandler();
		},
		[listingInquiry],
	);

	const listingTypeSelectHandler = useCallback(
		async (value: ListingType) => {
			setListingInquiry({
				...listingInquiry,
				search: { ...listingInquiry.search, typeList: [value] },
			});
			setOpenType(false);
		},
		[listingInquiry],
	);

	const pushSearchHandler = async () => {
		try {
			if (listingInquiry?.search?.typeList?.length === 0) {
				delete listingInquiry.search.typeList;
			}
			await router.push(
				`/listings?input=${JSON.stringify(listingInquiry)}`,
				`/listings?input=${JSON.stringify(listingInquiry)}`,
			);
		} catch (err: unknown) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	const resetFilterHandler = () => {
		setListingInquiry(initialInput);
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	}

	return (
		<>
			<Stack className={'search-box'}>
				<Stack className={'select-box'}>
					<div className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
						<span>{listingInquiry?.search?.text || t('Location')} </span>
						<ExpandMoreIcon />
					</div>
					<div className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
						<span>
							{' '}
							{listingInquiry?.search?.typeList ? listingInquiry?.search?.typeList[0] : 'Product or service'}{' '}
						</span>
						<ExpandMoreIcon />
					</div>
				</Stack>
				<Stack className={'search-box-other'}>
					<div className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>{t('Advanced')}</span>
					</div>
					<div className={'search-btn'} onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="" />
					</div>
				</Stack>

				<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
					{locationEnumValues.map((location: string) => (
						<div onClick={() => listingLocationSelectHandler(location as ListingLocation)} key={location}>
							<img src={`img/banner/cities/${location}.webp`} alt="" />
							<span>{location}</span>
						</div>
					))}
				</div>

				<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
					{CATALOG_TYPES.map((type) => (
						<div
							style={{ backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp)` }}
							onClick={() => listingTypeSelectHandler(type)}
							key={type}
						>
							<span>{type}</span>
						</div>
					))}
				</div>
			</Stack>

			<Modal open={openAdvancedFilter} onClose={() => advancedFilterHandler(false)} aria-labelledby="modal-modal-title">
				<div style={advancedFilterModalRootStyle}>
					<div className={'advanced-filter-modal'}>
						<div className={'close'} onClick={() => advancedFilterHandler(false)}>
							<CloseIcon />
						</div>
						<div className={'top'}>
							<span>Search catalog</span>
							<div className={'search-input-box'}>
								<img src="/img/icons/search.svg" alt="" />
								<input
									value={listingInquiry?.search?.text ?? ''}
									type="text"
									placeholder={'What are you looking for?'}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setListingInquiry({
											...listingInquiry,
											search: { ...listingInquiry.search, text: e.target.value },
										});
									}}
								/>
							</div>
						</div>
						<Divider sx={{ mt: '30px', mb: '35px' }} />
						<div className={'middle'}>
							<div className={'row-box'}>
								<div className={'box'} style={{ width: '100%' }}>
									<span>Price range</span>
									<div className={'inside space-between align-center'} style={{ gap: 12, flexWrap: 'wrap' }}>
										<input
											type="number"
											className="description-input"
											placeholder="Min"
											value={listingInquiry.search.pricesRange?.start ?? ''}
											onChange={(e) => {
												const v = parseInt(e.target.value, 10);
												setListingInquiry({
													...listingInquiry,
													search: {
														...listingInquiry.search,
														pricesRange: {
															start: Number.isNaN(v) ? 0 : v,
															end: listingInquiry.search.pricesRange?.end ?? 2_000_000,
														},
													},
												});
											}}
										/>
										<span>—</span>
										<input
											type="number"
											className="description-input"
											placeholder="Max"
											value={listingInquiry.search.pricesRange?.end ?? ''}
											onChange={(e) => {
												const v = parseInt(e.target.value, 10);
												setListingInquiry({
													...listingInquiry,
													search: {
														...listingInquiry.search,
														pricesRange: {
															start: listingInquiry.search.pricesRange?.start ?? 0,
															end: Number.isNaN(v) ? 2_000_000 : v,
														},
													},
												});
											}}
										/>
									</div>
								</div>
							</div>
						</div>
						<Divider sx={{ mt: '60px', mb: '18px' }} />
						<div className={'bottom'}>
							<div onClick={resetFilterHandler}>
								<img src="/img/icons/reset.svg" alt="" />
								<span>Reset all filters</span>
							</div>
							<Button startIcon={<img src={'/img/icons/search.svg'} alt="" />} className={'search-btn'} onClick={pushSearchHandler}>
								Search
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
