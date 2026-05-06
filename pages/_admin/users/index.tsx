import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, Button, InputAdornment, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/user/query';
import { T } from '../../../libs/types/common';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/user/mutation';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
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
		getAllMembersRefetch({ input: membersInquiry }).then();
	}, [membersInquiry]);

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
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setPendingSpecialistsOnly(false);
			const nextSearch = { ...membersInquiry.search };
			delete nextSearch.isPendingSpecialist;
			setMembersInquiry({
				...membersInquiry,
				search: {
					...nextSearch,
					text: searchText,
				},
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setPendingSpecialistsOnly(false);
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				const nextSearch = { ...membersInquiry.search };
				delete nextSearch.isPendingSpecialist;
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
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Member List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
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
							<Stack className={'search-area'} sx={{ m: '24px' }} direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{ width: '100%', flex: '1 1 280px' }}
									className={'search'}
									placeholder="Search user name"
									onKeyDown={(event) => {
										if (event.key == 'Enter') searchTextHandler();
									}}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer' }}
													onClick={async () => {
														setSearchText('');
														setPendingSpecialistsOnly(false);
														setMembersInquiry({
															...membersInquiry,
															search: {
																...membersInquiry.search,
																text: '',
															},
														});
														await getAllMembersRefetch({ input: membersInquiry });
													}}
												/>
											)}
											<InputAdornment position="end" onClick={() => searchTextHandler()}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
								<Select sx={{ width: '160px', ml: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All
									</MenuItem>
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
										User
									</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
										Agent
									</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
										Admin
									</MenuItem>
								</Select>
								<Button
									type="button"
									variant={pendingSpecialistsOnly ? 'contained' : 'outlined'}
									onClick={pendingSpecialistsToggleHandler}
									sx={{
										ml: { xs: 0, sm: '12px' },
										mt: { xs: '12px', sm: 0 },
										textTransform: 'none',
										fontWeight: 600,
										borderColor: '#E07B3A',
										color: pendingSpecialistsOnly ? '#fff' : '#E07B3A',
										bgcolor: pendingSpecialistsOnly ? '#E07B3A' : 'transparent',
										'&:hover': {
											borderColor: '#c96a32',
											bgcolor: pendingSpecialistsOnly ? '#c96a32' : 'rgba(224, 123, 58, 0.08)',
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

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={membersTotal}
							rowsPerPage={membersInquiry?.limit}
							page={membersInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
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
