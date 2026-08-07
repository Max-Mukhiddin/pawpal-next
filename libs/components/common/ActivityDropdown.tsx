import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { ClipboardList } from 'lucide-react';
import { userVar } from '../../../apollo/store';
import {
	GET_AGENT_BOOKINGS,
	GET_AGENT_INQUIRIES,
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_MY_BOOKINGS,
	GET_MY_INQUIRIES,
} from '../../../apollo/user/query';
import { MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { BookingStatus } from '../../types/booking/booking-status.enum';
import { InquiryStatus } from '../../types/inquiry/inquiry-status.enum';
import type { BookingListItem } from '../../types/booking/booking.list';
import type { InquiryListItem } from '../../types/inquiry/inquiry.list';
import { countPendingForBadge } from '../../utils/activityHelpers';
import { formatBookingStatusLabel } from '../../utils/bookingInboxDisplay';
import { formatInquiryStatusLabel } from '../../utils/inquiryInboxDisplay';
import { inboxListingHeadline } from '../../utils/inboxListingContext';
import { timeAgo } from '../../utils/timeAgo';

const PREVIEW_INPUT = {
	page: 1,
	limit: 3,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const PENDING_SPECIALISTS_COUNT_INPUT = {
	page: 1,
	limit: 1,
	sort: 'createdAt',
	search: { isPendingSpecialist: true },
};

type ActivityRowProps = {
	title: string;
	meta: string;
	statusLabel: string;
	statusClass: string;
	timeLabel: string;
	onClick: () => void;
};

const ActivityRow = ({ title, meta, statusLabel, statusClass, timeLabel, onClick }: ActivityRowProps) => (
	<li>
		<button type="button" className="pp-activity__item" onClick={onClick}>
			<span className="pp-activity__item-body">
				<span className="pp-activity__item-top">
					<span className="pp-activity__item-title">{title}</span>
					<span className={`pp-activity__status ${statusClass}`}>{statusLabel}</span>
				</span>
				{meta ? <span className="pp-activity__item-meta">{meta}</span> : null}
				<span className="pp-activity__item-time">{timeLabel}</span>
			</span>
		</button>
	</li>
);

const bookingStatusClass = (st: string): string => {
	switch (st) {
		case BookingStatus.REQUESTED:
			return 'pp-activity__status--pending';
		case BookingStatus.CONFIRMED:
			return 'pp-activity__status--confirmed';
		case BookingStatus.CANCELLED:
			return 'pp-activity__status--cancelled';
		case BookingStatus.DONE:
			return 'pp-activity__status--completed';
		default:
			return 'pp-activity__status--neutral';
	}
};

const inquiryStatusClass = (st: string): string => {
	switch (st) {
		case InquiryStatus.NEW:
			return 'pp-activity__status--pending';
		case InquiryStatus.RESPONDED:
			return 'pp-activity__status--confirmed';
		case InquiryStatus.CLOSED:
			return 'pp-activity__status--completed';
		default:
			return 'pp-activity__status--neutral';
	}
};

const pendingSpecialistsLabel = (count: number): string => {
	if (count === 0) return 'No specialists awaiting approval';
	if (count === 1) return '1 specialist awaiting approval';
	return `${count} specialists awaiting approval`;
};

export default function ActivityDropdown() {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	const isAdmin = user?.memberType === MemberType.ADMIN;
	const isAgent = !isAdmin && user?.memberType === MemberType.AGENT && !user?.isPendingSpecialist;
	const skip = !user?._id || user._id.length !== 24;

	const { data: bookingsData, loading: bookingsLoading } = useQuery(
		isAgent ? GET_AGENT_BOOKINGS : GET_MY_BOOKINGS,
		{
			variables: { input: PREVIEW_INPUT },
			skip: skip || isAdmin,
			fetchPolicy: 'cache-and-network',
		},
	);

	const { data: inquiriesData, loading: inquiriesLoading } = useQuery(
		isAgent ? GET_AGENT_INQUIRIES : GET_MY_INQUIRIES,
		{
			variables: { input: PREVIEW_INPUT },
			skip: skip || isAdmin,
			fetchPolicy: 'cache-and-network',
		},
	);

	const { data: pendingSpecialistsData, loading: pendingSpecialistsLoading } = useQuery(
		GET_ALL_MEMBERS_BY_ADMIN,
		{
			variables: { input: PENDING_SPECIALISTS_COUNT_INPUT },
			skip: skip || !isAdmin,
			fetchPolicy: 'cache-and-network',
		},
	);

	const bookings = useMemo(() => {
		if (isAgent) return (bookingsData?.getAgentBookings?.list ?? []) as BookingListItem[];
		return (bookingsData?.getMyBookings?.list ?? []) as BookingListItem[];
	}, [bookingsData, isAgent]);

	const inquiries = useMemo(() => {
		if (isAgent) return (inquiriesData?.getAgentInquiries?.list ?? []) as InquiryListItem[];
		return (inquiriesData?.getMyInquiries?.list ?? []) as InquiryListItem[];
	}, [inquiriesData, isAgent]);

	const pendingSpecialistsCount =
		pendingSpecialistsData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;

	const activityPendingCount = useMemo(() => {
		const activities = [
			...bookings.map((x) => ({ ...x, _kind: 'BOOKING' as const, _timestamp: x.createdAt })),
			...inquiries.map((x) => ({ ...x, _kind: 'INQUIRY' as const, _timestamp: x.createdAt })),
		];
		return countPendingForBadge(activities, Boolean(isAgent));
	}, [bookings, inquiries, isAgent]);

	const badgeCount = isAdmin ? pendingSpecialistsCount : activityPendingCount;

	const closeDropdown = useCallback(() => setOpen(false), []);

	useEffect(() => {
		if (!open) return;

		const onPointerDown = (e: MouseEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) {
				closeDropdown();
			}
		};

		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [open, closeDropdown]);

	const goToActivity = (type: 'BOOKING' | 'INQUIRY') => {
		closeDropdown();
		void router.push(`/activity?type=${type}`);
	};

	const triggerLabel = isAdmin ? 'Admin shortcuts' : 'My Activity';
	const panelLabel = isAdmin ? 'Admin Shortcuts' : 'My Activity';

	return (
		<div className="pp-activity" ref={wrapRef}>
			<button
				type="button"
				className="pp-activity__trigger"
				aria-label={triggerLabel}
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<ClipboardList size={22} strokeWidth={1.75} aria-hidden />
				{badgeCount > 0 ? (
					<span className="pp-activity__badge" aria-label={`${badgeCount} pending`}>
						{badgeCount > 9 ? '9+' : badgeCount}
					</span>
				) : null}
			</button>

			{open ? (
				<div className="pp-activity__panel" role="dialog" aria-label={panelLabel}>
					<div className="pp-activity__head">
						<strong>{panelLabel}</strong>
					</div>

					{isAdmin ? (
						<>
							<section className="pp-activity__section pp-activity__section--admin">
								<Link
									href="/_admin/users?pendingSpecialists=1"
									className="pp-activity__admin-row"
									onClick={closeDropdown}
								>
									<span className="pp-activity__admin-row-label">Pending Specialists</span>
									<span className="pp-activity__admin-row-meta">
										{pendingSpecialistsLoading
											? 'Loading…'
											: pendingSpecialistsLabel(pendingSpecialistsCount)}
									</span>
								</Link>
							</section>

							<div className="pp-activity__admin-foot">
								<Link
									href="/_admin/dashboard"
									className="pp-activity__admin-cta"
									onClick={closeDropdown}
								>
									Go to Admin Panel
								</Link>
							</div>
						</>
					) : (
						<>
							<section className="pp-activity__section">
								<div className="pp-activity__section-head">
									<h3>Recent Bookings</h3>
									<Link href="/activity?type=BOOKING" className="pp-activity__view-all" onClick={closeDropdown}>
										View all →
									</Link>
								</div>

								{bookingsLoading && bookings.length === 0 ? (
									<div className="pp-activity__empty">
										<p>Loading…</p>
									</div>
								) : bookings.length === 0 ? (
									<div className="pp-activity__empty">
										<p>No bookings yet</p>
									</div>
								) : (
									<ul className="pp-activity__list">
										{bookings.map((b) => {
											const st = String(b.bookingStatus ?? BookingStatus.REQUESTED).toUpperCase();
											const title = inboxListingHeadline(b.listingData?.listingTitle, b.listingId);
											const meta = isAgent
												? `From ${b.customerData?.memberNick?.trim() || 'Customer'}`
												: `With ${b.agentData?.memberNick?.trim() || 'Specialist'}`;

											return (
												<ActivityRow
													key={b._id}
													title={title}
													meta={meta}
													statusLabel={formatBookingStatusLabel(st)}
													statusClass={bookingStatusClass(st)}
													timeLabel={timeAgo(b.createdAt)}
													onClick={() => goToActivity('BOOKING')}
												/>
											);
										})}
									</ul>
								)}
							</section>

							<section className="pp-activity__section">
								<div className="pp-activity__section-head">
									<h3>Recent Inquiries</h3>
									<Link href="/activity?type=INQUIRY" className="pp-activity__view-all" onClick={closeDropdown}>
										View all →
									</Link>
								</div>

								{inquiriesLoading && inquiries.length === 0 ? (
									<div className="pp-activity__empty">
										<p>Loading…</p>
									</div>
								) : inquiries.length === 0 ? (
									<div className="pp-activity__empty">
										<p>No inquiries yet</p>
									</div>
								) : (
									<ul className="pp-activity__list">
										{inquiries.map((inq) => {
											const st = String(inq.inquiryStatus ?? InquiryStatus.NEW).toUpperCase();
											const title = inboxListingHeadline(inq.listingData?.listingTitle, inq.listingId);
											const meta = isAgent
												? `From ${inq.customerData?.memberNick?.trim() || inq.name?.trim() || 'Customer'}`
												: inq.message?.trim() || `Inquiry for ${title}`;

											return (
												<ActivityRow
													key={inq._id}
													title={title}
													meta={meta}
													statusLabel={formatInquiryStatusLabel(st)}
													statusClass={inquiryStatusClass(st)}
													timeLabel={timeAgo(inq.createdAt)}
													onClick={() => goToActivity('INQUIRY')}
												/>
											);
										})}
									</ul>
								)}
							</section>
						</>
					)}
				</div>
			) : null}
		</div>
	);
}
