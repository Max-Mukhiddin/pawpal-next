import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { Box, Button, Divider, InputAdornment, List, ListItem, MenuItem, Select, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { TabContext } from '@mui/lab';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';
import FaqFormDialog, { FaqFormValues } from '../../../libs/components/admin/cs/FaqFormDialog';
import AdminListPagination from '../../../libs/components/admin/AdminListPagination';
import { GET_FAQS } from '../../../apollo/user/query';
import type { Faq } from '../../../libs/types/cs/faq';
import type { FaqsInquiry } from '../../../libs/types/cs/faq.input';
import { T } from '../../../libs/types/common';
import { useDebouncedValue } from '../../../libs/hooks/useDebouncedValue';
import {
	CS_STATUS_TABS,
	FAQ_CATEGORIES,
	type CsStatusTab,
	formatCsStatusLabel,
} from '../../../libs/utils/csDisplay';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

type CategoryFilter = 'ALL' | (typeof FAQ_CATEGORIES)[number];

const FaqArticles: NextPage = ({ initialInquiry }: { initialInquiry?: FaqsInquiry }) => {
	const [faqsInquiry, setFaqsInquiry] = useState<FaqsInquiry>(
		initialInquiry ?? {
			page: 1,
			limit: 10,
			search: {},
		},
	);
	const [faqs, setFaqs] = useState<Faq[]>([]);
	const [faqsTotal, setFaqsTotal] = useState(0);
	const [statusTab, setStatusTab] = useState<CsStatusTab>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
	const [searchText, setSearchText] = useState('');
	const debouncedSearchText = useDebouncedValue(searchText, 350);
	const [actionsAnchor, setActionsAnchor] = useState<Record<string, HTMLElement | null>>({});
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
	const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

	const { refetch: getFaqsRefetch } = useQuery(GET_FAQS, {
		fetchPolicy: 'network-only',
		variables: { input: faqsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFaqs(data?.getFaqs?.list ?? []);
			setFaqsTotal(data?.getFaqs?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const countInquiry = useMemo<FaqsInquiry>(
		() => ({
			page: 1,
			limit: 500,
			search: {
				...(categoryFilter !== 'ALL' ? { faqCategory: categoryFilter } : {}),
				...(debouncedSearchText.trim() ? { text: debouncedSearchText.trim() } : {}),
			},
		}),
		[categoryFilter, debouncedSearchText],
	);

	const { data: countData, refetch: refetchCounts } = useQuery(GET_FAQS, {
		fetchPolicy: 'network-only',
		variables: { input: countInquiry },
	});

	const statusCounts = useMemo(() => {
		const list: Faq[] = countData?.getFaqs?.list ?? [];
		return {
			ALL: list.length,
			ACTIVE: list.filter((faq) => faq.faqStatus === 'ACTIVE').length,
			HOLD: list.filter((faq) => faq.faqStatus === 'HOLD').length,
			DELETE: list.filter((faq) => faq.faqStatus === 'DELETE').length,
		};
	}, [countData]);

	useEffect(() => {
		void getFaqsRefetch({ input: faqsInquiry });
	}, [faqsInquiry, getFaqsRefetch]);

	useEffect(() => {
		void refetchCounts({ input: countInquiry });
	}, [countInquiry, refetchCounts]);

	useEffect(() => {
		const nextText = debouncedSearchText.trim();
		setFaqsInquiry((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (nextText === prevText) return prev;

			const nextSearch = { ...prev.search };
			if (nextText) nextSearch.text = nextText;
			else delete nextSearch.text;

			return { ...prev, page: 1, search: nextSearch };
		});
	}, [debouncedSearchText]);

	const changePageHandler = async (_event: unknown, newPage: number) => {
		const next = { ...faqsInquiry, page: newPage + 1 };
		setFaqsInquiry(next);
		await getFaqsRefetch({ input: next });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = {
			...faqsInquiry,
			limit: parseInt(event.target.value, 10),
			page: 1,
		};
		setFaqsInquiry(next);
		await getFaqsRefetch({ input: next });
	};

	const statusTabHandler = (tab: CsStatusTab) => {
		setStatusTab(tab);
		setFaqsInquiry((prev) => {
			const nextSearch = { ...prev.search };
			if (tab === 'ALL') delete nextSearch.faqStatus;
			else nextSearch.faqStatus = tab;
			return { ...prev, page: 1, search: nextSearch };
		});
	};

	const categoryFilterHandler = (value: CategoryFilter) => {
		setCategoryFilter(value);
		setFaqsInquiry((prev) => {
			const nextSearch = { ...prev.search };
			if (value === 'ALL') delete nextSearch.faqCategory;
			else nextSearch.faqCategory = value;
			return { ...prev, page: 1, search: nextSearch };
		});
	};

	const textHandler = useCallback((value: string) => {
		setSearchText(value);
	}, []);

	const closeMenus = () => {
		setActionsAnchor({});
	};

	const openCreateForm = () => {
		setFormMode('create');
		setEditingFaq(null);
		setFormOpen(true);
	};

	const openEditForm = (faq: Faq) => {
		closeMenus();
		setFormMode('edit');
		setEditingFaq(faq);
		setFormOpen(true);
	};

	const formSubmitHandler = async (values: FaqFormValues) => {
		try {
			void values;
			await getFaqsRefetch({ input: faqsInquiry });
			await refetchCounts({ input: countInquiry });
		} catch (err: unknown) {
			await sweetErrorHandling(err);
			throw err;
		}
	};

	return (
		<Box component="div" className="content">
			<Box component="div" className="title flex_space">
				<Typography variant="h2" className="admin-page-title">
					FAQ Management
				</Typography>
				<Button className="btn_add" variant="contained" size="medium" onClick={openCreateForm}>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>

			<Box component="div" className="admin-table-card table-wrap">
				<Box component="div" sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={statusTab}>
						<Box component="div">
							<List className="admin-filter-tabs tab-menu">
								{CS_STATUS_TABS.map((tab) => (
									<ListItem
										key={tab}
										onClick={() => statusTabHandler(tab)}
										value={tab}
										className={statusTab === tab ? 'li on' : 'li'}
									>
										{tab === 'ALL' ? 'All' : formatCsStatusLabel(tab)} ({statusCounts[tab]})
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className="admin-toolbar search-area" sx={{ m: '24px' }} direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
								<Select
									displayEmpty
									value={categoryFilter}
									onChange={(e) => categoryFilterHandler(e.target.value as CategoryFilter)}
									className="admin-select"
									sx={{ minWidth: 180 }}
									renderValue={(selected) =>
										selected === 'ALL' ? 'All Categories' : selected.charAt(0) + selected.slice(1).toLowerCase()
									}
								>
									<MenuItem value="ALL">All Categories</MenuItem>
									{FAQ_CATEGORIES.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat.charAt(0) + cat.slice(1).toLowerCase()}
										</MenuItem>
									))}
								</Select>

								<OutlinedInput
									value={searchText}
									onChange={(e) => textHandler(e.target.value)}
									sx={{ width: '100%', flex: '1 1 280px' }}
									className="admin-search search"
									placeholder="Search FAQs..."
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
							</Stack>
							<Divider />
						</Box>

						<FaqArticlesPanelList
							faqs={faqs}
							actionsAnchorEl={actionsAnchor}
							onActionsOpen={(e, id) => setActionsAnchor({ [id]: e.currentTarget })}
							onActionsClose={closeMenus}
							onEdit={openEditForm}
						/>

						<AdminListPagination
							count={faqsTotal}
							rowsPerPage={faqsInquiry.limit}
							page={faqsInquiry.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							rowsPerPageOptions={[5, 10, 20, 40, 60]}
						/>
					</TabContext>
				</Box>
			</Box>

			<FaqFormDialog
				open={formOpen}
				mode={formMode}
				initialFaq={editingFaq}
				onClose={() => setFormOpen(false)}
				onSubmit={formSubmitHandler}
			/>
		</Box>
	);
};

FaqArticles.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		search: {},
	},
};

export default withAdminLayout(FaqArticles);
