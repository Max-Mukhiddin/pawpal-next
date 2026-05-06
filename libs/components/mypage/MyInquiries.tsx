import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Chip, Pagination, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_INQUIRIES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import type { T } from '../../types/common';
import type { InquiriesInquiry } from '../../types/inquiry/inquiry.query.input';
import type { InquiryListItem } from '../../types/inquiry/inquiry.list';
import { InquiryStatus } from '../../types/inquiry/inquiry-status.enum';
import { formatDisplayDateTime } from '../../utils/formatDisplayDateTime';
import { formatInquiryStatusLabel, inquiryStatusChipSx } from '../../utils/inquiryInboxDisplay';
import { inboxListingHeadline, inquiryHostRoleLabel } from '../../utils/inboxListingContext';
import { inboxEmptyHintSx, inboxListCardSx } from '../../utils/mypageInboxUi';
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

const MyInquiries: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [rows, setRows] = useState<InquiryListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [input, setInput] = useState<InquiriesInquiry>(defaultInquiry);

	const { loading } = useQuery(GET_MY_INQUIRIES, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !user?._id || user._id.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			const payload = data?.getMyInquiries;
			setRows(payload?.list ?? []);
			setTotal(payload?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const onPageChange = (_: T, value: number) => {
		setInput((prev) => ({ ...prev, page: value }));
	};

	const normalizeInquiryStatus = (s: string | null | undefined) => {
		if (s == null || s === '') return InquiryStatus.NEW;
		return String(s).toUpperCase() as InquiryStatus;
	};

	return (
		<div id="my-inquiries-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My inquiries</Typography>
					<Typography className="sub-title">Inquiries you&apos;ve sent about listings</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				{loading && !rows.length ? (
					<Typography sx={{ py: 2 }}>Loading…</Typography>
				) : rows.length ? (
					rows.map((inq) => {
						const st = normalizeInquiryStatus(inq.inquiryStatus);
						const headline = inboxListingHeadline(inq.listingData?.listingTitle, inq.listingId);
						const hostLabel = inquiryHostRoleLabel(inq.listingData?.listingType);
						const hasTitle = Boolean(inq.listingData?.listingTitle?.trim());

						return (
							<Stack key={inq._id} sx={inboxListCardSx}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
									<Stack flex={1} minWidth={0} spacing={0}>
										<Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, color: '#181a20', pr: 1 }}>
											{headline}
										</Typography>
										{hasTitle && inq.listingId ? (
											<Typography sx={{ ...metaLineSx, mt: 0.35 }}>Listing ID: {inq.listingId}</Typography>
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

								<Typography sx={fieldLabelSx}>Sent</Typography>
								<Typography sx={{ fontSize: 14, lineHeight: 1.45 }}>{formatDisplayDateTime(inq.createdAt)}</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>{hostLabel}</Typography>
								{inq.agentData?.memberNick ? (
									<Typography sx={{ fontSize: 14, color: '#181a20' }}>
										<strong>{inq.agentData.memberNick}</strong>
										{inq.agentData.memberPhone ? ` · ${inq.agentData.memberPhone}` : ''}
									</Typography>
								) : (
									<Typography sx={{ ...metaLineSx, mt: 0 }}>—</Typography>
								)}

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Your contact</Typography>
								<Typography sx={{ fontSize: 14, color: '#181a20', lineHeight: 1.5 }}>
									{inq.name} · {inq.email} · {inq.phone}
								</Typography>

								<Typography sx={{ ...fieldLabelSx, mt: 1.5 }}>Message</Typography>
								<Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{inq.message}</Typography>
							</Stack>
						);
					})
				) : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>You haven&apos;t sent any inquiries yet.</p>
						<Typography sx={inboxEmptyHintSx} component="p">
							Use the inquiry form on a product, service, or care listing to reach a seller or specialist.
						</Typography>
						<InboxEmptyCta variant="myInquiries" />
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
							Total {total} {total === 1 ? 'inquiry' : 'inquiries'}
						</Typography>
					</Stack>
				</Stack>
			) : null}
		</div>
	);
};

export default MyInquiries;
