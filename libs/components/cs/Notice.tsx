import React, { useMemo, useState } from 'react';
import { Stack, Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_NOTICES } from '../../../apollo/user/query';
import type { Notice as NoticeItem } from '../../types/cs/notice';
import type { NoticesInquiry } from '../../types/cs/notice.input';
import PpLoader from '../common/PpLoader';
import { formatDisplayDateTime } from '../../utils/formatDisplayDateTime';

const CATEGORY_CHIPS = ['ALL', 'PAYMENT', 'ACCOUNT', 'TECHNICAL', 'EVENT'] as const;

const categoryLabel = (cat: string) => {
	if (!cat || cat === 'ALL') return 'All';
	return cat.charAt(0) + cat.slice(1).toLowerCase();
};

const Notice = () => {
	const device = useDeviceDetect();
	const [activeCategory, setActiveCategory] = useState<string>('ALL');
	const [searchText, setSearchText] = useState('');
	const [queryText, setQueryText] = useState('');
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const inquiry: NoticesInquiry = useMemo(
		() => ({
			page: 1,
			limit: 20,
			search: {
				...(activeCategory !== 'ALL' ? { noticeCategory: activeCategory } : {}),
				...(queryText.trim() ? { text: queryText.trim() } : {}),
			},
		}),
		[activeCategory, queryText],
	);

	const { data, loading } = useQuery(GET_NOTICES, {
		variables: { input: inquiry },
		fetchPolicy: 'network-only',
	});

	const notices: NoticeItem[] = data?.getNotices?.list ?? [];

	const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') setQueryText(searchText);
	};

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	}

	return (
		<Stack className="notice-content">
			<span className="title">Notice</span>

			<div className="cs-filters">
				<input
					className="cs-filters__search"
					type="search"
					placeholder="Search notices..."
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={onSearchKeyDown}
				/>
				<div className="cs-filters__chips">
					{CATEGORY_CHIPS.map((cat) => (
						<button
							key={cat}
							type="button"
							className={`cs-filters__chip ${activeCategory === cat ? 'cs-filters__chip--active' : ''}`}
							onClick={() => setActiveCategory(cat)}
						>
							{categoryLabel(cat)}
						</button>
					))}
				</div>
			</div>

			<Stack className="main">
				<Box component="div" className="top">
					<span>number</span>
					<span>title</span>
					<span>date</span>
				</Box>
				<Stack className="bottom">
					{loading ? (
						<div className="cs-list-state">
							<PpLoader size={48} />
						</div>
					) : notices.length === 0 ? (
						<div className="cs-list-state cs-list-state--empty">
							<img src="/img/logo/pawpal-logo-mark.png" alt="" className="cs-list-state__icon" />
							<p>No notices yet</p>
						</div>
					) : (
						notices.map((notice, index) => {
							const isEvent = String(notice.noticeCategory).toUpperCase() === 'EVENT';
							const isOpen = expandedId === notice._id;
							return (
								<div key={notice._id}>
									<div
										className={`notice-card ${isEvent ? 'event' : ''} ${isOpen ? 'is-open' : ''}`}
										role="button"
										tabIndex={0}
										onClick={() => setExpandedId(isOpen ? null : notice._id)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												setExpandedId(isOpen ? null : notice._id);
											}
										}}
									>
										<div className="cs-notice__number">
											<span className="cs-notice__badge cs-notice__badge--letter">N</span>
											{isEvent ? <span className="cs-notice__badge">EVENT</span> : null}
										</div>
										<div className="notice-card__main">
											<span className="cs-notice__category-pill">
												{categoryLabel(String(notice.noticeCategory))}
											</span>
											<span className="notice-title">{notice.noticeTitle}</span>
										</div>
										<div className="notice-card__end">
											<span className="notice-date">
												{formatDisplayDateTime(notice.createdAt).split(',')[0]}
											</span>
											<KeyboardArrowDownRoundedIcon
												className={`notice-card__chevron ${isOpen ? 'is-open' : ''}`}
												fontSize="small"
											/>
										</div>
									</div>
									{isOpen && (
										<div
											className="notice-card__body"
											dangerouslySetInnerHTML={{ __html: notice.noticeContent }}
										/>
									)}
								</div>
							);
						})
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;
