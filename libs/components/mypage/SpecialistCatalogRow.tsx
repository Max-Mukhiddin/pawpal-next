import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Listing } from '../../types/listing/listing';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ListingStatus, ListingType } from '../../enums/listing.enum';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface SpecialistCatalogRowProps {
	listing: Listing;
	deleteListingHandler?: (id: string) => void;
	memberPage?: boolean;
	updateListingHandler?: (status: string, id: string) => void;
}

function statusBadgeClass(status: string): string {
	if (status === ListingStatus.ACTIVE) return 'mypage-catalog__status-badge--active';
	if (status === ListingStatus.SOLD) return 'mypage-catalog__status-badge--sold';
	return 'mypage-catalog__status-badge--delete';
}

export const SpecialistCatalogRow = (props: SpecialistCatalogRowProps) => {
	const { listing, deleteListingHandler, memberPage, updateListingHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const pushEditListing = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addListing', listingId: id },
		});
	};

	const pushListingDetail = async (listing: Listing) => {
		const pathname =
			listing.listingType === ListingType.SERVICE
				? '/service/detail'
				: '/product/detail';
		await router.push({ pathname, query: { id: listing._id } });
	};

	const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
		if (memberPage || listing.listingStatus === ListingStatus.SOLD) return;
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <div>MOBILE CATALOG ROW</div>;
	}

	return (
		<div className={`mypage-catalog__row${memberPage ? ' mypage-catalog__row--member' : ''}`}>
			<div
				className="mypage-catalog__thumb"
				onClick={() => pushListingDetail(listing)}
				style={{ cursor: 'pointer' }}
			>
				<img
					src={resolveListingImageUrl(listing?.listingImages?.[0])}
					alt={listing.listingTitle || ''}
				/>
			</div>

			<div
				className="mypage-catalog__info"
				onClick={() => pushListingDetail(listing)}
				style={{ cursor: 'pointer' }}
			>
				<p className="mypage-catalog__info__title">{listing.listingTitle}</p>
				<p className="mypage-catalog__info__meta">{listing.listingAddress || '—'}</p>
			</div>

			<div className="mypage-catalog__date">
				<Moment format="DD MMMM, YYYY">{listing.createdAt}</Moment>
			</div>

			<div>
				<span
					className={`mypage-catalog__status-badge ${statusBadgeClass(listing.listingStatus)}`}
					onClick={handleStatusClick}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleStatusClick(e as unknown as React.MouseEvent<HTMLElement>);
					}}
				>
					{listing.listingStatus}
				</span>
				{!memberPage && listing.listingStatus !== ListingStatus.SOLD && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '70px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
						}}
					>
						{listing.listingStatus === ListingStatus.ACTIVE && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateListingHandler?.(ListingStatus.SOLD, listing?._id);
								}}
							>
								Sold
							</MenuItem>
						)}
					</Menu>
				)}
			</div>

			<div className="mypage-catalog__views">
				{listing.listingViews.toLocaleString()}
			</div>

			{!memberPage && listing.listingStatus === ListingStatus.ACTIVE ? (
				<div className="mypage-catalog__actions">
					<IconButton
						className="icon-button"
						aria-label="Edit listing"
						onClick={() => pushEditListing(listing._id)}
					>
						<ModeIcon fontSize="small" />
					</IconButton>
					<IconButton
						className="icon-button"
						aria-label="Delete listing"
						onClick={() => deleteListingHandler?.(listing._id)}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				</div>
			) : (
				<div className="mypage-catalog__actions" aria-hidden />
			)}
		</div>
	);
};