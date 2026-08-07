import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Button, Chip, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { GET_AGENT_INQUIRIES } from '../../../apollo/user/query';
import { UPDATE_INQUIRY_STATUS } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';
import { InquiryStatus } from '../../types/inquiry/inquiry-status.enum';
import type { T } from '../../types/common';
import type { InquiriesInquiry } from '../../types/inquiry/inquiry.query.input';
import type { InquiryListItem } from '../../types/inquiry/inquiry.list';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { formatDisplayDateTime } from '../../utils/formatDisplayDateTime';
import { formatInquiryStatusLabel, inquiryStatusChipSx } from '../../utils/inquiryInboxDisplay';
import { inboxListingHeadline } from '../../utils/inboxListingContext';
import { inboxActionsBlockSx, inboxEmptyHintSx, inboxListCardSx, inboxSectionLabelSx } from '../../utils/mypageInboxUi';
import InboxEmptyCta from './InboxEmptyCta';
import InboxOpenListingLink from './InboxOpenListingLink';

const defaultInquiry: InquiriesInquiry = {
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

const SpecialistInquiries: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [rows, setRows] = useState<InquiryListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [input, setInput] = useState<InquiriesInquiry>(defaultInquiry);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const [updateInquiryStatus] = useMutation(UPDATE_INQUIRY_STATUS);

	const { loading, refetch } = useQuery(GET_AGENT_INQUIRIES, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !user?._id || user._id.length !== 24 || user?.memberType !== 'AGENT',
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			const payload = data?.getAgentInquiries;
			setRows(payload?.list ?? []);
			setTotal(payload?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const onPageChange = (_: T, value: number) => {
		setInput((prev) => ({ ...prev, page: value }));
	};

	const setStatus = async (inquiryId: string, inquiryStatus: InquiryStatus) => {
		try {
			setUpdatingId(inquiryId);
			await updateInquiryStatus({
				variables: {
					input: {
						_id: inquiryId,
						inquiryStatus,
					},
				},
			});
			await sweetTopSmallSuccessAlert('Status updated', 1200);
			await refetch({ input });
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setUpdatingId(null);
		}
	};

	if (device === 'mobile') {
		return <div>pawpal INQUIRIES MOBILE</div>;
	}

	if (user?.memberType !== 'AGENT') {
		return (
			<div id="specialist-inquiries-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Service inquiries</Typography>
						<Typography className="sub-title">Only specialist accounts can view inquiries on their services.</Typography>
					</Stack>
				</Stack>
			</div>
		);
	}

	const normalizeStatus = (s: string | null | undefined) => {
		if (s == null || s === '') return InquiryStatus.NEW;
		return String(s).toUpperCase() as InquiryStatus;
	};

	return (
		<div id="specialist-inquiries-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Service inquiries</Typography>
					<Typography className="sub-title">Questions from customers about your products and services</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				{loading && !rows.length ? (
					<Typography sx={{ py: 2 }}>Loading…</Typography>
				) : rows.length ? (
					rows.map((inq) => {
						const st = normalizeStatus(inq.inquiryStatus);
						const busy = updatingId === inq._id;
						const headline = inboxListingHeadline(inq.listingData?.listingTitle, inq.listingId);
						const hasTitle = Boolean(inq.listingData?.listingTitle?.trim());

						return (
							<Stack key={inq._id} sx={inboxListCardSx}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
									<Stack flex={1} minWidth={0} spacing={0}>
										<Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, color: '#181a20', pr: 1 }}>
											{headline}
										</Typography>
										{hasTitle && inq.listingId ? (
											<Typography sx={{ ...metaLineSx, mt: 0.35 }}>Reference: {inq.listingId}</Typography>
										) : null}
										{inq.listingData?.listingLocation ? (
											<Typography sx={{ fontSize: 13, color: '#717171', mt: 0.5 }}>
												{inq.listingData.listingLocation}
											</Typography>
										) : null}
										{inq.listingId ? (
											<InboxOpenListingLink
												listingId={inq.listingId}
												listingType={inq.listingData?.listingType}
											/>
										) : null}
									</Stack>
									<Stack alignItems="flex-end" spacing={0.75}>
										<Chip
											size="small"
											label={formatInquiryStatusLabel(st)}
											sx={inquiryStatusChipSx(st)}
										/>
									</Stack>
								</Stack>

								<Typography sx={fieldLabelSx}>Received</Typography>
								<Typography sx={{ fontSize: 14, lineHeight: 1.45 }}>{formatDisplayDateTime(inq.createdAt)}</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Customer</Typography>
								<Typography sx={{ fontSize: 14, color: '#181a20', lineHeight: 1.5 }}>
									<strong>{inq.name}</strong> · {inq.email} · {inq.phone}
								</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Message</Typography>
								<Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{inq.message}</Typography>

								{st !== InquiryStatus.CLOSED && (
									<Stack sx={inboxActionsBlockSx}>
										<Typography sx={inboxSectionLabelSx}>Actions</Typography>
										<Stack direction="row" flexWrap="wrap" gap={1}>
											{st === InquiryStatus.NEW && (
												<Button
													size="small"
													variant="contained"
													disabled={busy}
													onClick={() => void setStatus(inq._id, InquiryStatus.RESPONDED)}
													sx={{
														textTransform: 'none',
														background: 'var(--pp-primary)',
														color: 'var(--pp-honey)',
														'&:hover': { background: 'var(--pp-primary-hover)' },
													}}
												>
													Mark responded
												</Button>
											)}
											{(st === InquiryStatus.NEW || st === InquiryStatus.RESPONDED) && (
												<Button
													size="small"
													variant="outlined"
													disabled={busy}
													onClick={() => void setStatus(inq._id, InquiryStatus.CLOSED)}
													sx={{ textTransform: 'none' }}
												>
													Close
												</Button>
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
						<p>No inquiries received yet.</p>
						<Typography sx={inboxEmptyHintSx} component="p">
							When customers message you from your product or service pages, their inquiries will show up here.
						</Typography>
						<InboxEmptyCta variant="specialistInquiries" />
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
							Total {total} {total === 1 ? 'inquiry' : 'inquiries'}
						</Typography>
					</Stack>
				</Stack>
			) : null}
		</div>
	);
};

export default SpecialistInquiries;
