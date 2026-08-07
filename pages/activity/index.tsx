import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PpLoader from '../../libs/components/common/PpLoader';
import { userVar } from '../../apollo/store';
import {
	GET_AGENT_BOOKINGS,
	GET_AGENT_INQUIRIES,
	GET_MY_BOOKINGS,
	GET_MY_INQUIRIES,
} from '../../apollo/user/query';
import {
	CANCEL_MY_BOOKING,
	UPDATE_BOOKING_STATUS_BY_AGENT,
	UPDATE_INQUIRY_STATUS,
} from '../../apollo/user/mutation';
import { Direction } from '../../libs/enums/common.enum';
import { BookingStatus } from '../../libs/types/booking/booking-status.enum';
import { InquiryStatus } from '../../libs/types/inquiry/inquiry-status.enum';
import type { T } from '../../libs/types/common';
import { formatDisplayDateTime } from '../../libs/utils/formatDisplayDateTime';
import { getListingDetailHref } from '../../libs/utils/inboxListingContext';
import { inboxListingHeadline } from '../../libs/utils/inboxListingContext';
import {
	activityDateGroup,
	activityFilterStatus,
	activityStatsForAgent,
	activityStatusLabel,
	type ActivityFilterStatus,
	type UnifiedActivity,
} from '../../libs/utils/activityHelpers';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const LIST_INPUT = {
	page: 1,
	limit: 50,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

type TypeFilter = 'ALL' | 'BOOKING' | 'INQUIRY';

const STATUS_OPTIONS: ActivityFilterStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_LABELS: Record<ActivityFilterStatus, string> = {
	PENDING: 'Pending',
	CONFIRMED: 'Confirmed',
	COMPLETED: 'Completed',
	CANCELLED: 'Cancelled',
};

const ActivityPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isAgent = user?.memberType === 'AGENT' && !user?.isPendingSpecialist;

	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [statusFilters, setStatusFilters] = useState<ActivityFilterStatus[]>([]);
	const [search, setSearch] = useState('');
	const [busyId, setBusyId] = useState<string | null>(null);

	const [cancelMyBooking] = useMutation(CANCEL_MY_BOOKING);
	const [updateBookingStatusByAgent] = useMutation(UPDATE_BOOKING_STATUS_BY_AGENT);
	const [updateInquiryStatus] = useMutation(UPDATE_INQUIRY_STATUS);

	useEffect(() => {
		if (!user?._id) void router.push('/');
	}, [user?._id, router]);

	useEffect(() => {
		if (!router.isReady) return;
		const type = String(router.query.type ?? '').toUpperCase();
		if (type === 'BOOKING' || type === 'INQUIRY') setTypeFilter(type as TypeFilter);
	}, [router.isReady, router.query.type]);

	const { data: bookingsData, loading: bookingsLoading, refetch: refetchBookings } = useQuery(
		isAgent ? GET_AGENT_BOOKINGS : GET_MY_BOOKINGS,
		{
			variables: { input: LIST_INPUT },
			skip: !user?._id || user._id.length !== 24,
			fetchPolicy: 'network-only',
		},
	);

	const { data: inquiriesData, loading: inquiriesLoading, refetch: refetchInquiries } = useQuery(
		isAgent ? GET_AGENT_INQUIRIES : GET_MY_INQUIRIES,
		{
			variables: { input: LIST_INPUT },
			skip: !user?._id || user._id.length !== 24,
			fetchPolicy: 'network-only',
		},
	);

	const activities = useMemo<UnifiedActivity[]>(() => {
		const bookings = isAgent
			? bookingsData?.getAgentBookings?.list ?? []
			: bookingsData?.getMyBookings?.list ?? [];
		const inquiries = isAgent
			? inquiriesData?.getAgentInquiries?.list ?? []
			: inquiriesData?.getMyInquiries?.list ?? [];

		const b = bookings.map((x: T) => ({
			...x,
			_kind: 'BOOKING' as const,
			_timestamp: x.createdAt,
		}));
		const i = inquiries.map((x: T) => ({
			...x,
			_kind: 'INQUIRY' as const,
			_timestamp: x.createdAt,
		}));
		return [...b, ...i].sort(
			(a, b) => new Date(b._timestamp).getTime() - new Date(a._timestamp).getTime(),
		);
	}, [bookingsData, inquiriesData, isAgent]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return activities.filter((item) => {
			if (typeFilter !== 'ALL' && item._kind !== typeFilter) return false;
			const st = activityFilterStatus(item);
			if (statusFilters.length > 0 && !statusFilters.includes(st)) return false;
			if (!q) return true;
			const title = item.listingData?.listingTitle?.toLowerCase() ?? '';
			const agent = item.agentData?.memberNick?.toLowerCase() ?? '';
			const customer = item.customerData?.memberNick?.toLowerCase() ?? item.name?.toLowerCase() ?? '';
			const msg = (item.message ?? item.note ?? '').toLowerCase();
			return title.includes(q) || agent.includes(q) || customer.includes(q) || msg.includes(q);
		});
	}, [activities, typeFilter, statusFilters, search]);

	const grouped = useMemo(() => {
		const map = new Map<string, UnifiedActivity[]>();
		for (const item of filtered) {
			const key = activityDateGroup(item._timestamp);
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(item);
		}
		const order = ['Today', 'Yesterday', 'This week', 'Earlier'];
		return order.filter((k) => map.has(k)).map((k) => ({ label: k, items: map.get(k)! }));
	}, [filtered]);

	const stats = useMemo(() => activityStatsForAgent(activities), [activities]);
	const loading = bookingsLoading || inquiriesLoading;

	const toggleStatus = (st: ActivityFilterStatus) => {
		setStatusFilters((prev) => (prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]));
	};

	const refetchAll = async () => {
		await Promise.all([refetchBookings({ input: LIST_INPUT }), refetchInquiries({ input: LIST_INPUT })]);
	};

	const onCancelBooking = async (e: React.MouseEvent, bookingId: string) => {
		e.stopPropagation();
		try {
			setBusyId(bookingId);
			await cancelMyBooking({ variables: { bookingId } });
			await sweetTopSmallSuccessAlert('Booking cancelled', 1600);
			await refetchAll();
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	const onBookingStatus = async (e: React.MouseEvent, bookingId: string, bookingStatus: BookingStatus) => {
		e.stopPropagation();
		try {
			setBusyId(bookingId);
			await updateBookingStatusByAgent({
				variables: { input: { _id: bookingId, bookingStatus } },
			});
			await sweetTopSmallSuccessAlert('Status updated', 1200);
			await refetchAll();
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	const onInquiryStatus = async (e: React.MouseEvent, inquiryId: string, inquiryStatus: InquiryStatus) => {
		e.stopPropagation();
		try {
			setBusyId(inquiryId);
			await updateInquiryStatus({
				variables: { input: { _id: inquiryId, inquiryStatus } },
			});
			await sweetTopSmallSuccessAlert('Status updated', 1200);
			await refetchAll();
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setBusyId(null);
		}
	};

	const openDetail = (item: UnifiedActivity) => {
		const href = getListingDetailHref(item.listingId, item.listingData?.listingType);
		if (href) void router.push(href);
	};

	const renderActions = (item: UnifiedActivity) => {
		const st = activityFilterStatus(item);
		const busy = busyId === item._id;

		if (item._kind === 'BOOKING') {
			if (isAgent) {
				if (st === 'PENDING') {
					return (
						<>
							<button
								type="button"
								className="pp-btn pp-btn--ghost pp-btn--sm"
								disabled={busy}
								onClick={(e) => void onBookingStatus(e, item._id, BookingStatus.CANCELLED)}
							>
								Decline
							</button>
							<button
								type="button"
								className="pp-btn pp-btn--primary pp-btn--sm"
								disabled={busy}
								onClick={(e) => void onBookingStatus(e, item._id, BookingStatus.CONFIRMED)}
							>
								Accept
							</button>
						</>
					);
				}
				if (st === 'CONFIRMED') {
					return (
						<>
							<button type="button" className="pp-btn pp-btn--ghost pp-btn--sm" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
								Message
							</button>
							<button
								type="button"
								className="pp-btn pp-btn--primary pp-btn--sm"
								disabled={busy}
								onClick={(e) => void onBookingStatus(e, item._id, BookingStatus.DONE)}
							>
								Mark Complete
							</button>
						</>
					);
				}
				return (
					<button type="button" className="pp-btn pp-btn--ghost pp-btn--sm" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
						View
					</button>
				);
			}

			if (st === 'PENDING' || st === 'CONFIRMED') {
				return (
					<>
						{st === 'PENDING' && (
							<button
								type="button"
								className="pp-btn pp-btn--ghost pp-btn--sm"
								disabled={busy}
								onClick={(e) => void onCancelBooking(e, item._id)}
							>
								Cancel
							</button>
						)}
						<button type="button" className="pp-btn pp-btn--primary pp-btn--sm" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
							View
						</button>
					</>
				);
			}
			return (
				<button type="button" className="pp-btn pp-btn--primary pp-btn--sm" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
					View
				</button>
			);
		}

		// Inquiry
		if (isAgent && st === 'PENDING') {
			return (
				<>
					<button
						type="button"
						className="pp-btn pp-btn--ghost pp-btn--sm"
						disabled={busy}
						onClick={(e) => void onInquiryStatus(e, item._id, InquiryStatus.CLOSED)}
					>
						Decline
					</button>
					<button
						type="button"
						className="pp-btn pp-btn--primary pp-btn--sm"
						disabled={busy}
						onClick={(e) => void onInquiryStatus(e, item._id, InquiryStatus.RESPONDED)}
					>
						Accept
					</button>
				</>
			);
		}

		return (
			<button type="button" className="pp-btn pp-btn--primary pp-btn--sm" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
				View
			</button>
		);
	};

	const metaLine = (item: UnifiedActivity) => {
		const date = item._kind === 'BOOKING' && item.dateTime
			? formatDisplayDateTime(item.dateTime)
			: formatDisplayDateTime(item._timestamp);
		if (isAgent) {
			const from = item.customerData?.memberNick ?? item.name ?? 'Customer';
			return `from ${from} · ${date}`;
		}
		const withName = item.agentData?.memberNick ?? 'specialist';
		return `with ${withName} · ${date}`;
	};

	return (
		<div className="activity-page">
			<div className="activity-page__inner">
				<header className="activity-page__header">
					<h1 className="activity-page__title">Activity</h1>
					<p className="activity-page__subtitle">
						{isAgent
							? 'Manage incoming bookings and product inquiries in one place.'
							: 'Track your service bookings and product inquiries.'}
					</p>
				</header>

				{isAgent && (
					<div className="activity-page__stats">
						<div>
							<span className="activity-page__stat-label">Pending Actions</span>
							<span className="activity-page__stat-value">{stats.pending}</span>
						</div>
						<div>
							<span className="activity-page__stat-label">Active</span>
							<span className="activity-page__stat-value">{stats.active}</span>
						</div>
						<div>
							<span className="activity-page__stat-label">Completed this month</span>
							<span className="activity-page__stat-value">{stats.completedMonth}</span>
						</div>
					</div>
				)}

				<div className="activity-page__body">
					<aside className="activity-page__sidebar">
						<div className="activity-page__filter-group">
							<span className="activity-page__filter-label">Type</span>
							<div className="activity-page__type-chips">
								{(['ALL', 'BOOKING', 'INQUIRY'] as TypeFilter[]).map((t) => (
									<button
										key={t}
										type="button"
										className={`activity-page__chip ${typeFilter === t ? 'activity-page__chip--active' : ''}`}
										onClick={() => setTypeFilter(t)}
									>
										{t === 'ALL' ? 'All' : t === 'BOOKING' ? 'Bookings' : 'Inquiries'}
									</button>
								))}
							</div>
						</div>
						<div className="activity-page__filter-group">
							<span className="activity-page__filter-label">Status</span>
							<div className="activity-page__status-chips">
								{STATUS_OPTIONS.map((st) => (
									<button
										key={st}
										type="button"
										className={`activity-page__chip activity-page__chip--dot activity-page__chip--${st.toLowerCase()} ${
											statusFilters.includes(st) ? 'activity-page__chip--active' : ''
										}`}
										onClick={() => toggleStatus(st)}
									>
										{STATUS_LABELS[st]}
									</button>
								))}
							</div>
						</div>
					</aside>

					<main>
						<div className="activity-page__search-wrap">
							<input
								className="activity-page__search"
								type="search"
								placeholder="Search by service or specialist..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{loading && !activities.length ? (
							<div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
								<PpLoader size={56} />
							</div>
						) : filtered.length === 0 ? (
							<div className="activity-page__empty">
								<img
									className="activity-page__empty-icon"
									src="/img/logo/pawpal-logo-mark.png"
									alt=""
								/>
								<h2 className="activity-page__empty-title">Nothing here yet</h2>
								<p className="activity-page__empty-text">
									{isAgent
										? "Once customers book or inquire, this is where you'll manage them."
										: "When you book services or send inquiries, you'll see them here."}
								</p>
								{!isAgent && (
									<Link href="/service" className="pp-btn pp-btn--primary">
										Browse Services
									</Link>
								)}
							</div>
						) : (
							<div className="activity-page__timeline">
								{grouped.map((group) => (
									<section key={group.label}>
										<h3 className="activity-page__group-title">{group.label}</h3>
										<div className="activity-page__list">
											{group.items.map((item) => {
												const st = activityFilterStatus(item);
												const title = inboxListingHeadline(
													item.listingData?.listingTitle,
													item.listingId,
												);
												const initial = title.charAt(0).toUpperCase();
												const preview = item._kind === 'INQUIRY'
													? item.message
													: item.note;

												return (
													<article
														key={`${item._kind}-${item._id}`}
														className="activity-page__card"
														onClick={() => openDetail(item)}
														onKeyDown={(e) => e.key === 'Enter' && openDetail(item)}
														role="button"
														tabIndex={0}
													>
														<div className="activity-page__thumb">
															{initial}
															<span
																className={`activity-page__badge activity-page__badge--${
																	item._kind === 'BOOKING' ? 'booking' : 'inquiry'
																}`}
																aria-hidden
															>
																{item._kind === 'BOOKING' ? (
																	<CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} />
																) : (
																	<MailOutlineOutlinedIcon sx={{ fontSize: 13 }} />
																)}
															</span>
														</div>
														<div>
															<div className="activity-page__meta-row">
																<span className="activity-page__type-tag">{item._kind}</span>
																<span
																	className={`activity-page__status-pill activity-page__status-pill--${st.toLowerCase()}`}
																>
																	{activityStatusLabel(item)}
																</span>
															</div>
															<h4 className="activity-page__card-title">{title}</h4>
															<p className="activity-page__card-meta">{metaLine(item)}</p>
															{preview?.trim() ? (
																<p className="activity-page__card-preview">{preview}</p>
															) : null}
														</div>
														<div className="activity-page__actions">{renderActions(item)}</div>
													</article>
												);
											})}
										</div>
									</section>
								))}
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ActivityPage);
