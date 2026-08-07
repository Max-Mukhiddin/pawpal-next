import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Chip, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { GET_AGENT_BOOKINGS } from '../../../apollo/user/query';
import { UPDATE_BOOKING_STATUS_BY_AGENT } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { ListingType } from '../../enums/listing.enum';
import { BookingStatus } from '../../types/booking/booking-status.enum';
import type { T } from '../../types/common';
import type { BookingsInquiry } from '../../types/booking/booking.query.input';
import type { BookingListItem } from '../../types/booking/booking.list';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { bookingStatusChipSx, formatBookingStatusLabel } from '../../utils/bookingInboxDisplay';
import { formatDisplayDateTime } from '../../utils/formatDisplayDateTime';
import { inboxListingHeadline } from '../../utils/inboxListingContext';
import { inboxActionsBlockSx, inboxEmptyHintSx, inboxListCardSx, inboxSectionLabelSx } from '../../utils/mypageInboxUi';
import InboxEmptyCta from './InboxEmptyCta';
import InboxOpenListingLink from './InboxOpenListingLink';

const defaultInput: BookingsInquiry = {
	page: 1,
	limit: 8,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const metaLineSx = { fontSize: 12, color: '#717171', lineHeight: 1.5 };

const fieldLabelSx = {
	fontSize: 13,
	fontWeight: 600,
	color: '#181a20',
	mt: 1.5,
	mb: 0.35,
};

const SpecialistBookings: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [rows, setRows] = useState<BookingListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [input, setInput] = useState<BookingsInquiry>(defaultInput);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const [updateBookingStatusByAgent] = useMutation(UPDATE_BOOKING_STATUS_BY_AGENT);

	const { loading, refetch } = useQuery(GET_AGENT_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !user?._id || user._id.length !== 24 || user?.memberType !== 'AGENT',
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			const payload = data?.getAgentBookings;
			setRows(payload?.list ?? []);
			setTotal(payload?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const onPageChange = (_: T, value: number) => {
		setInput((prev) => ({ ...prev, page: value }));
	};

	const normalizeStatus = (s: string | null | undefined) =>
		(s ? String(s).toUpperCase() : BookingStatus.REQUESTED) as BookingStatus;

	const setStatus = async (bookingId: string, bookingStatus: BookingStatus) => {
		try {
			setUpdatingId(bookingId);
			await updateBookingStatusByAgent({
				variables: {
					input: {
						_id: bookingId,
						bookingStatus,
					},
				},
			});
			await sweetTopSmallSuccessAlert('Booking updated', 1200);
			await refetch({ input });
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setUpdatingId(null);
		}
	};

	if (device === 'mobile') {
		return <div>pawpal BOOKINGS MOBILE</div>;
	}

	if (user?.memberType !== 'AGENT') {
		return (
			<div id="specialist-bookings-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Service bookings</Typography>
						<Typography className="sub-title">Only specialist accounts can manage bookings for their services.</Typography>
					</Stack>
				</Stack>
			</div>
		);
	}

	return (
		<div id="specialist-bookings-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Service bookings</Typography>
					<Typography className="sub-title">Booking requests for your services</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				{loading && !rows.length ? (
					<Typography sx={{ py: 2 }}>Loading…</Typography>
				) : rows.length ? (
					rows.map((b) => {
						const st = normalizeStatus(b.bookingStatus);
						const busy = updatingId === b._id;
						const headline = inboxListingHeadline(b.listingData?.listingTitle, b.listingId);
						const customerName = b.customerData?.memberNick?.trim();
						const customerPhone = b.customerData?.memberPhone?.trim();
						const customerIdStr = b.customerData?._id ?? b.customerId ?? '';
						const initial =
							(customerName || customerIdStr).length > 0
								? (customerName || customerIdStr).charAt(0).toUpperCase()
								: '?';

						return (
							<Stack key={b._id} sx={inboxListCardSx}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
									<Stack flex={1} minWidth={0} spacing={0}>
										<Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, color: '#181a20', pr: 1 }}>
											{headline}
										</Typography>
										{b.listingId ? (
											<InboxOpenListingLink
												listingId={b.listingId}
												listingType={b.listingData?.listingType ?? ListingType.SERVICE}
											/>
										) : null}
									</Stack>
									<Chip
										size="small"
										label={formatBookingStatusLabel(st)}
										sx={bookingStatusChipSx(st)}
									/>
								</Stack>

								<Typography sx={fieldLabelSx}>Scheduled time</Typography>
								<Typography sx={{ fontSize: 15, lineHeight: 1.45 }}>{formatDisplayDateTime(b.dateTime)}</Typography>

								<Typography sx={fieldLabelSx}>Requested</Typography>
								<Typography sx={{ fontSize: 14, lineHeight: 1.45 }}>{formatDisplayDateTime(b.createdAt)}</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Customer</Typography>
								<Stack direction="row" alignItems="center" spacing={1.5}>
									<Stack
										sx={{
											width: 40,
											height: 40,
											borderRadius: '50%',
											bgcolor: '#ececec',
											alignItems: 'center',
											justifyContent: 'center',
											fontWeight: 700,
											fontSize: 15,
											color: '#181a20',
											flexShrink: 0,
										}}
									>
										{initial}
									</Stack>
									<Stack spacing={0.25} minWidth={0}>
										<Typography sx={{ fontSize: 14, color: '#181a20', fontWeight: 600 }}>
											{customerName || 'Unknown customer'}
										</Typography>
										<Typography sx={{ ...metaLineSx, mt: 0 }}>{customerPhone || 'Phone unavailable'}</Typography>
									</Stack>
								</Stack>
								<Typography sx={{ ...metaLineSx, mt: 0.5 }}>Customer ID: {customerIdStr || '—'}</Typography>

								<Typography sx={{ ...metaLineSx, mt: 1 }}>Booking ID: {b._id}</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Customer note</Typography>
								{b.note?.trim() ? (
									<Stack sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 1 }}>
										<Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{b.note}</Typography>
									</Stack>
								) : (
									<Typography sx={{ ...metaLineSx, mt: 0 }}>—</Typography>
								)}

								{st !== BookingStatus.DONE && st !== BookingStatus.CANCELLED && (
									<Stack sx={inboxActionsBlockSx}>
										<Typography sx={inboxSectionLabelSx}>Actions</Typography>
										<Stack direction="row" flexWrap="wrap" gap={1}>
											{st === BookingStatus.REQUESTED && (
												<>
													<Button
														size="small"
														variant="contained"
														disabled={busy}
														onClick={() => void setStatus(b._id, BookingStatus.CONFIRMED)}
														sx={{
															textTransform: 'none',
															background: 'var(--pp-primary)',
															color: 'var(--pp-honey)',
															'&:hover': { background: 'var(--pp-primary-hover)' },
														}}
													>
														Confirm booking
													</Button>
													<Button
														size="small"
														variant="outlined"
														disabled={busy}
														onClick={() => void setStatus(b._id, BookingStatus.CANCELLED)}
														sx={{ textTransform: 'none' }}
													>
														Decline
													</Button>
												</>
											)}
											{st === BookingStatus.CONFIRMED && (
												<>
													<Button
														size="small"
														variant="contained"
														disabled={busy}
														onClick={() => void setStatus(b._id, BookingStatus.DONE)}
														sx={{
															textTransform: 'none',
															background: 'var(--pp-primary)',
															color: 'var(--pp-honey)',
															'&:hover': { background: 'var(--pp-primary-hover)' },
														}}
													>
														Mark completed
													</Button>
													<Button
														size="small"
														variant="outlined"
														disabled={busy}
														onClick={() => void setStatus(b._id, BookingStatus.CANCELLED)}
														sx={{ textTransform: 'none' }}
													>
														Cancel booking
													</Button>
												</>
											)}
										</Stack>
									</Stack>
								)}
							</Stack>
						);
					})
				) : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No customer booking requests yet.</p>
						<Typography sx={inboxEmptyHintSx} component="p">
							When someone books a time on one of your services, it will appear here.
						</Typography>
						<InboxEmptyCta variant="specialistBookings" />
					</div>
				)}
			</Stack>
			{rows.length > 0 ? (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
							className="pp-pagination"
							count={Math.max(1, Math.ceil(total / input.limit))}
							page={input.page}
							shape="circular"
							color="primary"
							onChange={onPageChange}
						/>
					</Stack>
					<Stack className="total-result">
						<Typography>
							Total {total} {total === 1 ? 'booking' : 'bookings'}
						</Typography>
					</Stack>
				</Stack>
			) : null}
		</div>
	);
};

export default SpecialistBookings;
