import React from 'react';
import Link from 'next/link';
import {
	Button,
	Checkbox,
	Fade,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { Listing } from '../../../types/listing/listing';
import { ListingStatus, ListingType } from '../../../enums/listing.enum';
import { formatterKrw } from '../../../utils';
import { resolveListingImageUrl } from '../../../utils/mediaUrl';
import AdminMemberAvatar from '../AdminMemberAvatar';
import {
	getAdminListingStatusBadgeClass,
	getAdminListingTypeBadgeClass,
} from '../../../utils/adminDisplay';

function listingDetailHref(listing: Listing): string {
	const base = listing.listingType === ListingType.PRODUCT ? '/product/detail' : '/service/detail';
	return `${base}?id=${listing._id}`;
}

interface ListingListProps {
	listings: Listing[];
	selectedIds: string[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string, checked: boolean) => void;
	anchorEl: Record<string, HTMLElement | null>;
	statusAnchorEl: Record<string, HTMLElement | null>;
	onActionsOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
	onActionsClose: () => void;
	onStatusOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
	onStatusClose: () => void;
	onUpdateStatus: (listingId: string, status: ListingStatus) => void;
	onViewListing: (listing: Listing) => void;
}

export default function ListingList({
	listings,
	selectedIds,
	onSelectAll,
	onSelectOne,
	anchorEl,
	statusAnchorEl,
	onActionsOpen,
	onActionsClose,
	onStatusOpen,
	onStatusClose,
	onUpdateStatus,
	onViewListing,
}: ListingListProps) {
	const allSelected = listings.length > 0 && selectedIds.length === listings.length;
	const someSelected = selectedIds.length > 0 && selectedIds.length < listings.length;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 900 }} aria-label="Listings table" size="medium">
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									color="primary"
									indeterminate={someSelected}
									checked={allSelected}
									onChange={(e) => onSelectAll(e.target.checked)}
									inputProps={{ 'aria-label': 'Select all listings' }}
								/>
							</TableCell>
							<TableCell>Listing</TableCell>
							<TableCell align="center">Category</TableCell>
							<TableCell align="right">Price</TableCell>
							<TableCell>Specialist / Owner</TableCell>
							<TableCell align="center">Status</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{listings.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={7}>
									<span className="no-data">data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{listings.map((listing) => {
							const isSelected = selectedIds.includes(listing._id);
							const ownerName = listing.memberData?.memberNick ?? '—';
							const thumb = resolveListingImageUrl(listing.listingImages?.[0]);

							return (
								<TableRow
									hover
									key={listing._id}
									className="admin-table-row"
									selected={isSelected}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell padding="checkbox">
										<Checkbox
											color="primary"
											checked={isSelected}
											onChange={(e) => onSelectOne(listing._id, e.target.checked)}
											inputProps={{ 'aria-label': `Select ${listing.listingTitle}` }}
										/>
									</TableCell>

									<TableCell>
										<Stack direction="row" alignItems="center" spacing={1.5}>
											<img
												className="admin-listing-thumb"
												src={thumb}
												alt=""
												width={44}
												height={44}
											/>
											<Link href={listingDetailHref(listing)} className="admin-listing-title">
												{listing.listingTitle}
											</Link>
										</Stack>
									</TableCell>

									<TableCell align="center">
										<span className={getAdminListingTypeBadgeClass(listing.listingType)}>
											{listing.listingType}
										</span>
									</TableCell>

									<TableCell align="right">{formatterKrw(listing.listingPrice)}</TableCell>

									<TableCell>
										<Stack direction="row" alignItems="center" spacing={1}>
											{listing.memberData?._id ? (
												<Link href={`/member?memberId=${listing.memberData._id}`} className="admin-table-link">
													<AdminMemberAvatar
														imagePath={listing.memberData.memberImage}
														alt={ownerName}
													/>
												</Link>
											) : (
												<AdminMemberAvatar imagePath={null} alt={ownerName} />
											)}
											{listing.memberData?._id ? (
												<Link href={`/member?memberId=${listing.memberData._id}`} className="admin-table-link">
													{ownerName}
												</Link>
											) : (
												<span>{ownerName}</span>
											)}
										</Stack>
									</TableCell>

									<TableCell align="center">
										<Button
											onClick={(e) => onStatusOpen(e, listing._id)}
											className={getAdminListingStatusBadgeClass(listing.listingStatus)}
										>
											{listing.listingStatus}
										</Button>
										<Menu
											className="admin-menu-modal menu-modal"
											anchorEl={statusAnchorEl[listing._id]}
											open={Boolean(statusAnchorEl[listing._id])}
											onClose={onStatusClose}
											TransitionComponent={Fade}
										>
											{Object.values(ListingStatus)
												.filter((status) => status !== listing.listingStatus)
												.map((status) => (
													<MenuItem key={status} onClick={() => onUpdateStatus(listing._id, status)}>
														<Typography variant="subtitle1" component="span">
															{status}
														</Typography>
													</MenuItem>
												))}
										</Menu>
									</TableCell>

									<TableCell align="center">
										<IconButton
											size="small"
											aria-label="Listing actions"
											onClick={(e) => onActionsOpen(e, listing._id)}
										>
											<MoreHorizIcon />
										</IconButton>
										<Menu
											className="admin-menu-modal menu-modal"
											anchorEl={anchorEl[listing._id]}
											open={Boolean(anchorEl[listing._id])}
											onClose={onActionsClose}
											TransitionComponent={Fade}
										>
											<MenuItem onClick={() => onViewListing(listing)}>View on site</MenuItem>
											<MenuItem component={Link} href={listingDetailHref(listing)}>
												Open detail page
											</MenuItem>
										</Menu>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
}
