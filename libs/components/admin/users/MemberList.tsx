import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
	Chip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { Member } from '../../../types/member/member';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';

interface Data {
	id: string;
	nickname: string;
	fullname: string;
	phone: string;
	type: string;
	state: string;
	warning: string;
	block: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'MB ID',
	},
	{
		id: 'nickname',
		numeric: true,
		disablePadding: false,
		label: 'NICK NAME',
	},
	{
		id: 'fullname',
		numeric: false,
		disablePadding: false,
		label: 'FULL NAME',
	},
	{
		id: 'phone',
		numeric: true,
		disablePadding: false,
		label: 'PHONE NUM',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'MEMBER TYPE',
	},
	{
		id: 'warning',
		numeric: false,
		disablePadding: false,
		label: 'WARNING',
	},
	{
		id: 'block',
		numeric: false,
		disablePadding: false,
		label: 'BLOCK CRIMES',
	},
	{
		id: 'state',
		numeric: false,
		disablePadding: false,
		label: 'STATE',
	},
];

interface EnhancedTableProps {
	numSelected?: number;
	onRequestSort?: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order?: Order;
	orderBy?: string;
	rowCount?: number;
	pendingSpecialistReviewMode?: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { pendingSpecialistReviewMode } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
				{pendingSpecialistReviewMode ? (
					<TableCell align="center" padding="normal">
						APPLICATION
					</TableCell>
				) : null}
				{pendingSpecialistReviewMode ? (
					<TableCell align="center" padding="normal">
						ACTIONS
					</TableCell>
				) : null}
			</TableRow>
		</TableHead>
	);
}

interface MemberPanelListType {
	members: Member[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateMemberHandler: any;
	pendingSpecialistReviewMode?: boolean;
	onApproveSpecialist?: (memberId: string) => void;
	onRejectSpecialist?: (memberId: string) => void;
}

export const MemberPanelList = (props: MemberPanelListType) => {
	const {
		members,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateMemberHandler,
		pendingSpecialistReviewMode,
		onApproveSpecialist,
		onRejectSpecialist,
	} = props;

	const colSpan = headCells.length + (pendingSpecialistReviewMode ? 2 : 0);

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead pendingSpecialistReviewMode={pendingSpecialistReviewMode} />
					<TableBody>
						{members.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={colSpan}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{members.length !== 0 &&
							members.map((member: Member, index: number) => {
								const member_image = member.memberImage
									? `${REACT_APP_API_URL}/${member.memberImage}`
									: '/img/profile/defaultUser.svg';
								return (
									<TableRow hover key={member?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{member._id}</TableCell>

										<TableCell align="left" className={'name'}>
											<Stack direction={'row'}>
												<Link href={`/member?memberId=${member._id}`}>
													<div>
														<Avatar alt="Remy Sharp" src={member_image} sx={{ ml: '2px', mr: '10px' }} />
													</div>
												</Link>
												<Link href={`/member?memberId=${member._id}`}>
													<div>{member.memberNick}</div>
												</Link>
											</Stack>
										</TableCell>

										<TableCell align="center">{member.memberFullName ?? '-'}</TableCell>
										<TableCell align="left">{member.memberPhone}</TableCell>

										<TableCell align="center">
											<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
												{member.memberType}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[index]}
												open={Boolean(anchorEl[index])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ p: 1 }}
											>
												{Object.values(MemberType)
													.filter((ele) => ele !== member?.memberType)
													.map((type: string) => (
														<MenuItem
															onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}
															key={type}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																{type}
															</Typography>
														</MenuItem>
													))}
											</Menu>
										</TableCell>

										<TableCell align="center">{member.memberWarnings}</TableCell>
										<TableCell align="center">{member.memberBlocks}</TableCell>
										<TableCell align="center">
											<Button onClick={(e: any) => menuIconClickHandler(e, member._id)} className={'badge success'}>
												{member.memberStatus}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[member._id]}
												open={Boolean(anchorEl[member._id])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ p: 1 }}
											>
												{Object.values(MemberStatus)
													.filter((ele: string) => ele !== member?.memberStatus)
													.map((status: string) => (
														<MenuItem
															onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}
															key={status}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																{status}
															</Typography>
														</MenuItem>
													))}
											</Menu>
										</TableCell>
										{pendingSpecialistReviewMode ? (
											<TableCell align="center">
												{member.isPendingSpecialist ? (
													<Chip
														label="Pending Specialist"
														size="small"
														sx={{ fontWeight: 600, bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #E07B3A' }}
													/>
												) : (
													'—'
												)}
											</TableCell>
										) : null}
										{pendingSpecialistReviewMode && onApproveSpecialist && onRejectSpecialist ? (
											<TableCell align="center">
												<Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
													<Button
														variant="contained"
														color="success"
														size="small"
														onClick={() => onApproveSpecialist(member._id)}
														sx={{ textTransform: 'none', fontWeight: 600 }}
													>
														Approve
													</Button>
													<Button
														variant="outlined"
														color="error"
														size="small"
														onClick={() => onRejectSpecialist(member._id)}
														sx={{ textTransform: 'none', fontWeight: 600 }}
													>
														Reject
													</Button>
												</Stack>
											</TableCell>
										) : null}
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
