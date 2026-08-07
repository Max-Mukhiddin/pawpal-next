import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, Button, InputAdornment, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import AdminListPagination from '../../../libs/components/admin/AdminListPagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/user/query';
import { T } from '../../../libs/types/common';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/user/mutation';
import { useDebouncedValue } from '../../../libs/hooks/useDebouncedValue';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const debouncedSearchText = useDebouncedValue(searchText, 350);
	const [searchType, setSearchType] = useState('ALL');
	const [pendingSpecialistsOnly, setPendingSpecialistsOnly] = useState(false);

	/** APOLLO REQUESTS **/

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const {
		loading: getAllMembersByAdminLoading,
		data: getAllMembersByAdminData,
		error: getAllMembersByAdminError,
		refetch: getAllMembersRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const rawList: Member[] = data?.getAllMembersByAdmin?.list ?? [];
			const metaTotal = data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0;
			setMembers(rawList);
			setMembersTotal(metaTotal);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (router.query.pendingSpecialists !== '1') return;

		setPendingSpecialistsOnly(true);
		setValue('ALL');
		setSearchType('ALL');
		setSearchText('');
		setMembersInquiry({
			page: 1,
			limit: initialInquiry?.limit ?? 10,
			sort: 'createdAt',
			search: { isPendingSpecialist: true },
		});
	}, [router.isReady, router.query.pendingSpecialists, initialInquiry?.limit]);

	useEffect(() => {
		getAllMembersRefetch({ input: membersInquiry }).then();
	}, [membersInquiry]);

	useEffect(() => {
		const nextText = debouncedSearchText.trim();
		setMembersInquiry((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (nextText === prevText) return prev;

			const nextSearch = { ...prev.search };
			if (nextText) {
				nextSearch.text = nextText;
			} else {
				delete nextSearch.text;
			}

			return {
				...prev,
				page: 1,
				search: nextSearch,
			};
		});
	}, [debouncedSearchText]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		membersInquiry.page = newPage + 1;
		await getAllMembersRefetch({ input: membersInquiry });
		setMembersInquiry({ ...membersInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		membersInquiry.limit = parseInt(event.target.value, 10);
		membersInquiry.page = 1;
		await getAllMembersRefetch({ input: membersInquiry });
		setMembersInquiry({ ...membersInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setPendingSpecialistsOnly(false);
		setValue(newValue);
		setSearchText('');

		const base = {
			page: 1,
			limit: membersInquiry.limit,
			sort: 'createdAt',
		};

		switch (newValue) {
			case 'ACTIVE':
				setMembersInquiry({ ...base, search: { memberStatus: MemberStatus.ACTIVE } });
				break;
			case 'BLOCK':
				setMembersInquiry({ ...base, search: { memberStatus: MemberStatus.BLOCK } });
				break;
			case 'DELETE':
				setMembersInquiry({ ...base, search: { memberStatus: MemberStatus.DELETE } });
				break;
			default:
				setMembersInquiry({ ...base, search: {} });
				break;
		}
	};

	const approveSpecialistHandler = async (memberId: string) => {
		try {
			await updateMemberByAdmin({
				variables: {
					input: { _id: memberId, memberType: MemberType.AGENT, isPendingSpecialist: false },
				},
			});
			await getAllMembersRefetch({ input: membersInquiry });
			await sweetMixinSuccessAlert('Specialist approved successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const rejectSpecialistHandler = async (memberId: string) => {
		try {
			await updateMemberByAdmin({
				variables: {
					input: { _id: memberId, isPendingSpecialist: false },
				},
			});
			await getAllMembersRefetch({ input: membersInquiry });
			await sweetMixinSuccessAlert('Application rejected.', 2500);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		try {
			await updateMemberByAdmin({
				variables: {
					input: updateData,
				},
			});

			menuIconCloseHandler();
			await getAllMembersRefetch({ input: membersInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		setSearchText(value);
	}, []);

	const searchTypeHandler = async (newValue: string) => {
		try {
			setPendingSpecialistsOnly(false);
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				const nextSearch = { ...membersInquiry.search };
				delete nextSearch.isPendingSpecialist;
				const debouncedText = debouncedSearchText.trim();
				if (debouncedText) nextSearch.text = debouncedText;
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...nextSearch,
						memberType: newValue as MemberType,
					},
				});
			} else {
				const nextSearch = { ...membersInquiry.search };
				delete nextSearch.memberType;
				delete nextSearch.isPendingSpecialist;
				const debouncedText = debouncedSearchText.trim();
				if (debouncedText) nextSearch.text = debouncedText;
				else delete nextSearch.text;
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: nextSearch,
				});
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const pendingSpecialistsToggleHandler = () => {
		const next = !pendingSpecialistsOnly;
		setPendingSpecialistsOnly(next);
		if (next) {
			setValue('ALL');
			setSearchType('ALL');
			setSearchText('');
			setMembersInquiry({
				page: 1,
				limit: membersInquiry.limit,
				sort: 'createdAt',
				search: { isPendingSpecialist: true },
			});
		} else {
			setMembersInquiry({
				page: 1,
				limit: membersInquiry.limit,
				sort: 'createdAt',
				search: {},
			});
		}
	};

		return (
		<Box component={'div'} className={'content'}>
			<Typography variant="h2" className="admin-page-title">
				Member List
			</Typography>

			<div className="admin-stat-grid">
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Total members</span>
					<strong className="admin-stat-card__value">{membersTotal}</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">On this page</span>
					<strong className="admin-stat-card__value">{members.length}</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Pending specialists</span>
					<strong className="admin-stat-card__value">
						{members.filter((m) => m.isPendingSpecialist).length}
					</strong>
				</div>
				<div className="admin-stat-card">
					<span className="admin-stat-card__label">Active filter</span>
					<strong className="admin-stat-card__value">{value}</strong>
				</div>
			</div>

			<Box component="div" className="admin-table-card table-wrap">
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className="admin-filter-tabs tab-menu">
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'BLOCK')}
									value="BLOCK"
									className={value === 'BLOCK' ? 'li on' : 'li'}
								>
									Blocked
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Deleted
								</ListItem>
							</List>
							<Divider />
							<Stack className="admin-toolbar search-area" sx={{ m: '24px' }} direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{ width: '100%', flex: '1 1 280px' }}
									className="admin-search search"
									placeholder="Search user name"
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer' }}
													onClick={() => setSearchText('')}
													aria-label="Clear search"
												/>
											)}
											<InputAdornment position="end" className="admin-search__icon">
												<SearchOutlinedIcon aria-hidden />
											</InputAdornment>
										</>
									}
								/>
								<Select sx={{ minWidth: 160 }} value={searchType} className="admin-select">
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All
									</MenuItem>
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
										User
									</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
										Specialist
									</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
										Admin
									</MenuItem>
								</Select>
								<Button
									type="button"
									variant={pendingSpecialistsOnly ? 'contained' : 'outlined'}
									onClick={pendingSpecialistsToggleHandler}
									className="admin-btn admin-btn--pending"
									sx={{
										textTransform: 'none',
										fontWeight: 600,
										borderColor: 'var(--pp-primary)',
										color: pendingSpecialistsOnly ? '#fff' : 'var(--pp-primary)',
										bgcolor: pendingSpecialistsOnly ? 'var(--pp-primary)' : 'transparent',
										'&:hover': {
											borderColor: 'var(--pp-primary-hover)',
											bgcolor: pendingSpecialistsOnly ? 'var(--pp-primary-hover)' : 'rgba(30, 107, 79, 0.08)',
										},
									}}
								>
									Pending Specialists
								</Button>
							</Stack>
							<Divider />
						</Box>
						<MemberPanelList
							members={members}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateMemberHandler={updateMemberHandler}
							pendingSpecialistReviewMode={pendingSpecialistsOnly}
							onApproveSpecialist={approveSpecialistHandler}
							onRejectSpecialist={rejectSpecialistHandler}
						/>

						<AdminListPagination
							count={membersTotal}
							rowsPerPage={membersInquiry?.limit}
							page={membersInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							rowsPerPageOptions={[5, 10, 20, 40, 60]}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		search: {},
	},
};

export default withAdminLayout(AdminUsers);
