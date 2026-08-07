import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { Box, Divider, InputAdornment, MenuItem, Select, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import ListingList from '../../../libs/components/admin/listings/ListingList';
import AdminListPagination from '../../../libs/components/admin/AdminListPagination';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { UPDATE_LISTING } from '../../../apollo/user/mutation';
import { ListingsInquiry } from '../../../libs/types/listing/listing.input';
import type { Listing } from '../../../libs/types/listing/listing';
import { ListingStatus, ListingType } from '../../../libs/enums/listing.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { T } from '../../../libs/types/common';
import { useDebouncedValue } from '../../../libs/hooks/useDebouncedValue';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';

type TypeFilter = 'ALL' | ListingType;

const AdminListings: NextPage = ({ initialInquiry }: { initialInquiry?: ListingsInquiry }) => {
	const router = useRouter();
	const [listingsInquiry, setListingsInquiry] = useState<ListingsInquiry>(
		initialInquiry ?? {
			page: 1,
			limit: 10,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		},
	);
	const [listings, setListings] = useState<Listing[]>([]);
	const [listingsTotal, setListingsTotal] = useState(0);
	const [searchText, setSearchText] = useState('');
	const debouncedSearchText = useDebouncedValue(searchText, 350);
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [actionsAnchor, setActionsAnchor] = useState<Record<string, HTMLElement | null>>({});
	const [statusAnchor, setStatusAnchor] = useState<Record<string, HTMLElement | null>>({});

	const [updateListing] = useMutation(UPDATE_LISTING);

	const { refetch: getListingsRefetch } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: listingsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setListings(data?.getListings?.list ?? []);
			setListingsTotal(data?.getListings?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		void getListingsRefetch({ input: listingsInquiry });
	}, [listingsInquiry, getListingsRefetch]);

	useEffect(() => {
		const nextText = debouncedSearchText.trim();
		setListingsInquiry((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (nextText === prevText) return prev;

			const nextSearch = { ...prev.search };
			if (nextText) nextSearch.text = nextText;
			else delete nextSearch.text;

			return { ...prev, page: 1, search: nextSearch };
		});
	}, [debouncedSearchText]);

	useEffect(() => {
		setSelectedIds((prev) => prev.filter((id) => listings.some((listing) => listing._id === id)));
	}, [listings]);

	const changePageHandler = async (_event: unknown, newPage: number) => {
		const next = { ...listingsInquiry, page: newPage + 1 };
		setListingsInquiry(next);
		await getListingsRefetch({ input: next });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = {
			...listingsInquiry,
			limit: parseInt(event.target.value, 10),
			page: 1,
		};
		setListingsInquiry(next);
		await getListingsRefetch({ input: next });
	};

	const typeFilterHandler = (value: TypeFilter) => {
		setTypeFilter(value);
		setListingsInquiry((prev) => {
			const nextSearch = { ...prev.search };
			if (value === 'ALL') delete nextSearch.typeList;
			else nextSearch.typeList = [value];
			return { ...prev, page: 1, search: nextSearch };
		});
	};

	const textHandler = useCallback((value: string) => {
		setSearchText(value);
	}, []);

	const handleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? listings.map((listing) => listing._id) : []);
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
	};

	const closeMenus = () => {
		setActionsAnchor({});
		setStatusAnchor({});
	};

	const actionsOpenHandler = (event: React.MouseEvent<HTMLElement>, id: string) => {
		setActionsAnchor({ [id]: event.currentTarget });
	};

	const statusOpenHandler = (event: React.MouseEvent<HTMLElement>, id: string) => {
		setStatusAnchor({ [id]: event.currentTarget });
	};

	const updateStatusHandler = async (listingId: string, status: ListingStatus) => {
		try {
			closeMenus();
			if (!(await sweetConfirmAlert(`Change listing status to ${status}?`))) return;

			await updateListing({
				variables: { input: { _id: listingId, listingStatus: status } },
			});
			await getListingsRefetch({ input: listingsInquiry });
			await sweetMixinSuccessAlert('Listing status updated.');
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	const viewListingHandler = (listing: Listing) => {
		closeMenus();
		const href =
			listing.listingType === ListingType.PRODUCT
				? `/product/detail?id=${listing._id}`
				: `/service/detail?id=${listing._id}`;
		void router.push(href);
	};

	return (
		<Box component="div" className="content">
			<Typography variant="h2" className="admin-page-title">
				Listing List
			</Typography>

			<div className="admin-stat-grid">
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Total listings</span>
					<strong className="admin-stat-card__value">{listingsTotal}</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">On this page</span>
					<strong className="admin-stat-card__value">{listings.length}</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Selected</span>
					<strong className="admin-stat-card__value">{selectedIds.length}</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Type filter</span>
					<strong className="admin-stat-card__value">{typeFilter}</strong>
				</div>
			</div>

			<Box component="div" className="admin-table-card table-wrap">
				<Stack className="admin-toolbar search-area" direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
					<OutlinedInput
						value={searchText}
						onChange={(e) => textHandler(e.target.value)}
						sx={{ width: '100%', flex: '1 1 280px' }}
						className="admin-search search"
						placeholder="Search listing title"
						endAdornment={
							<>
								{searchText ? (
									<CancelRoundedIcon
										style={{ cursor: 'pointer' }}
										onClick={() => setSearchText('')}
										aria-label="Clear search"
									/>
								) : null}
								<InputAdornment position="end" className="admin-search__icon">
									<SearchOutlinedIcon aria-hidden />
								</InputAdornment>
							</>
						}
					/>

					<Select
						value={typeFilter}
						onChange={(e) => typeFilterHandler(e.target.value as TypeFilter)}
						className="admin-select"
						sx={{ minWidth: 160 }}
					>
						<MenuItem value="ALL">All types</MenuItem>
						<MenuItem value={ListingType.SERVICE}>Services</MenuItem>
						<MenuItem value={ListingType.PRODUCT}>Products</MenuItem>
					</Select>
				</Stack>

				<Divider />

				<ListingList
					listings={listings}
					selectedIds={selectedIds}
					onSelectAll={handleSelectAll}
					onSelectOne={handleSelectOne}
					anchorEl={actionsAnchor}
					statusAnchorEl={statusAnchor}
					onActionsOpen={actionsOpenHandler}
					onActionsClose={closeMenus}
					onStatusOpen={statusOpenHandler}
					onStatusClose={closeMenus}
					onUpdateStatus={updateStatusHandler}
					onViewListing={viewListingHandler}
				/>

				<AdminListPagination
					count={listingsTotal}
					rowsPerPage={listingsInquiry.limit}
					page={listingsInquiry.page - 1}
					onPageChange={changePageHandler}
					onRowsPerPageChange={changeRowsPerPageHandler}
					rowsPerPageOptions={[5, 10, 20, 40, 60]}
				/>
			</Box>
		</Box>
	);
};

AdminListings.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withAdminLayout(AdminListings);
