import React from 'react';
import {
	Fade,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { Notice } from '../../../types/cs/notice';
import { formatDisplayDateTime } from '../../../utils/formatDisplayDateTime';
import {
	formatCsCategory,
	formatCsStatusLabel,
	getCsStatusBadgeClass,
} from '../../../utils/csDisplay';

type NoticeListProps = {
	notices: Notice[];
	actionsAnchorEl: Record<string, HTMLElement | null>;
	onActionsOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
	onActionsClose: () => void;
	onEdit: (notice: Notice) => void;
};

export function NoticeList({
	notices,
	actionsAnchorEl,
	onActionsOpen,
	onActionsClose,
	onEdit,
}: NoticeListProps) {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 900 }} aria-label="Notice table" size="medium">
					<TableHead>
						<TableRow>
							<TableCell>Category</TableCell>
							<TableCell>Title</TableCell>
							<TableCell>Writer</TableCell>
							<TableCell>Date</TableCell>
							<TableCell align="right">Views</TableCell>
							<TableCell align="center">Status</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{notices.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={7}>
									<span className="no-data">data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{notices.map((notice) => (
							<TableRow
								hover
								key={notice._id}
								className="admin-table-row"
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell align="left">
									<span className="admin-badge admin-badge--user">{formatCsCategory(notice.noticeCategory)}</span>
								</TableCell>
								<TableCell align="left" className="admin-cs-title-cell">
									{notice.noticeTitle}
								</TableCell>
								<TableCell align="left">PawPal Staff</TableCell>
								<TableCell align="left">{formatDisplayDateTime(notice.createdAt)}</TableCell>
								<TableCell align="right">{notice.noticeViews ?? 0}</TableCell>
								<TableCell align="center">
									<span className={getCsStatusBadgeClass(notice.noticeStatus)}>
										{formatCsStatusLabel(notice.noticeStatus)}
									</span>
								</TableCell>
								<TableCell align="center">
									<IconButton
										size="small"
										aria-label="Notice actions"
										onClick={(e) => onActionsOpen(e, notice._id)}
									>
										<MoreHorizIcon />
									</IconButton>
									<Menu
										className="admin-menu-modal menu-modal"
										anchorEl={actionsAnchorEl[notice._id]}
										open={Boolean(actionsAnchorEl[notice._id])}
										onClose={onActionsClose}
										TransitionComponent={Fade}
									>
										<MenuItem onClick={() => onEdit(notice)}>Edit Notice</MenuItem>
									</Menu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
}
