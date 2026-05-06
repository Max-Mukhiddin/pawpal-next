import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Chip, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_BOOKINGS } from '../../../apollo/user/query';
import { CANCEL_MY_BOOKING } from '../../../apollo/user/mutation';
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
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

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

const MyBookings: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [rows, setRows] = useState<BookingListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [input, setInput] = useState<BookingsInquiry>(defaultInput);
	const [busyId, setBusyId] = useState<string | null>(null);

	const [cancelMyBooking] = useMutation(CANCEL_MY_BOOKING);

	const { loading, refetch } = useQuery(GET_MY_BOOKINGS, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !user?._id || user._id.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			const payload = data?.getMyBookings;
			setRows(payload?.list ?? []);
			setTotal(payload?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const onPageChange = (_: T, value: number) => {
		setInput((prev) => ({ ...prev, page: value }));
	};

	const normalizeStatus = (s: string | null | undefined) =>
		(s ? String(s).toUpperCase() : '') as BookingStatus | string;

	const canCancel = (st: string) => st === BookingStatus.REQUESTED || st === BookingStatus.CONFIRMED;

	const onCancel = async (bookingId: string) => {
		try {
			setBusyId(bookingId);
			await cancelMyBooking({ variables: { bookingId } });
			await sweetTopSmallSuccessAlert('Booking cancelled', 1600);
			await refetch({ input });
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div id="my-bookings-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My bookings</Typography>
					<Typography className="sub-title">Service sessions you&apos;ve requested</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				{loading && !rows.length ? (
					<Typography sx={{ py: 2 }}>Loading…</Typography>
				) : rows.length ? (
					rows.map((b) => {
						const st = normalizeStatus(b.bookingStatus);
						const headline = inboxListingHeadline(b.listingData?.listingTitle, b.listingId);
						const agentName = b.agentData?.memberNick?.trim();
						const agentPhone = b.agentData?.memberPhone?.trim();
						const agentImage = b.agentData?.memberImage?.trim();
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

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Specialist</Typography>
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
											overflow: 'hidden',
										}}
									>
										{agentImage ? (
											<img
												src={resolveMemberImageUrl(agentImage, '/img/profile/defaultUser.svg')}
												alt="specialist avatar"
												style={{ width: '100%', height: '100%', objectFit: 'cover' }}
											/>
										) : (
											(agentName?.charAt(0) || 'S').toUpperCase()
										)}
									</Stack>
									<Stack spacing={0.25} minWidth={0}>
										<Typography sx={{ fontSize: 14, color: '#181a20', fontWeight: 600 }}>
											{agentName || 'Unknown specialist'}
										</Typography>
										<Typography sx={{ ...metaLineSx, mt: 0 }}>{agentPhone || 'Phone unavailable'}</Typography>
									</Stack>
								</Stack>
								<Typography sx={{ ...metaLineSx, mt: 0.5 }}>Specialist ID: {b.agentId ?? b.agentData?._id ?? '—'}</Typography>
								<Typography sx={{ ...metaLineSx, mt: 0.5 }}>Booking ID: {b._id}</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Your note</Typography>
								{b.note?.trim() ? (
									<Stack sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 1 }}>
										<Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{b.note}</Typography>
									</Stack>
								) : (
									<Typography sx={{ ...metaLineSx, mt: 0 }}>—</Typography>
								)}

								{canCancel(st) && (
									<Stack sx={inboxActionsBlockSx}>
										<Typography sx={inboxSectionLabelSx}>Actions</Typography>
										<Button
											size="small"
											variant="outlined"
											disabled={busyId === b._id}
											onClick={() => void onCancel(b._id)}
											sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
										>
											Cancel booking
										</Button>
									</Stack>
								)}
							</Stack>
						);
					})
				) : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>You haven&apos;t made any bookings yet.</p>
						<Typography sx={inboxEmptyHintSx} component="p">
							Request a booking from a service listing — it will show up here once submitted.
						</Typography>
						<InboxEmptyCta variant="myBookings" />
					</div>
				)}
			</Stack>
			{rows.length > 0 ? (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
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

export default MyBookings;
