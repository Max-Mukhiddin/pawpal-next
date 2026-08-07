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
import type { Faq } from '../../../types/cs/faq';
import { formatDisplayDateTime } from '../../../utils/formatDisplayDateTime';
import {
	formatCsCategory,
	formatCsStatusLabel,
	getCsStatusBadgeClass,
} from '../../../utils/csDisplay';

type FaqListProps = {
	faqs: Faq[];
	actionsAnchorEl: Record<string, HTMLElement | null>;
	onActionsOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
	onActionsClose: () => void;
	onEdit: (faq: Faq) => void;
};

export function FaqArticlesPanelList({
	faqs,
	actionsAnchorEl,
	onActionsOpen,
	onActionsClose,
	onEdit,
}: FaqListProps) {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 900 }} aria-label="FAQ table" size="medium">
					<TableHead>
						<TableRow>
							<TableCell>Category</TableCell>
							<TableCell>Title / Question</TableCell>
							<TableCell>Writer</TableCell>
							<TableCell>Date</TableCell>
							<TableCell align="center">Status</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{faqs.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={6}>
									<span className="no-data">data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{faqs.map((faq) => (
							<TableRow hover key={faq._id} className="admin-table-row" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell align="left">
									<span className="admin-badge admin-badge--user">{formatCsCategory(faq.faqCategory)}</span>
								</TableCell>
								<TableCell align="left" className="admin-cs-title-cell">
									{faq.faqQuestion}
								</TableCell>
								<TableCell align="left">PawPal Staff</TableCell>
								<TableCell align="left">{formatDisplayDateTime(faq.createdAt)}</TableCell>
								<TableCell align="center">
									<span className={getCsStatusBadgeClass(faq.faqStatus)}>{formatCsStatusLabel(faq.faqStatus)}</span>
								</TableCell>
								<TableCell align="center">
									<IconButton size="small" aria-label="FAQ actions" onClick={(e) => onActionsOpen(e, faq._id)}>
										<MoreHorizIcon />
									</IconButton>
									<Menu
										className="admin-menu-modal menu-modal"
										anchorEl={actionsAnchorEl[faq._id]}
										open={Boolean(actionsAnchorEl[faq._id])}
										onClose={onActionsClose}
										TransitionComponent={Fade}
									>
										<MenuItem onClick={() => onEdit(faq)}>Edit FAQ</MenuItem>
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
