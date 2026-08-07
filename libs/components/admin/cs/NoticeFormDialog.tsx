import React, { useEffect, useState } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
} from '@mui/material';
import type { Notice } from '../../../types/cs/notice';
import { NOTICE_CATEGORIES } from '../../../utils/csDisplay';
import AdminStackedMultilineField from '../AdminStackedMultilineField';

export type NoticeFormValues = {
	noticeCategory: Notice['noticeCategory'];
	noticeTitle: string;
	noticeContent: string;
	noticeStatus: Notice['noticeStatus'];
};

type Props = {
	open: boolean;
	mode: 'create' | 'edit';
	initialNotice?: Notice | null;
	onClose: () => void;
	onSubmit: (values: NoticeFormValues) => Promise<void>;
};

const emptyValues: NoticeFormValues = {
	noticeCategory: 'GENERAL',
	noticeTitle: '',
	noticeContent: '',
	noticeStatus: 'ACTIVE',
};

export default function NoticeFormDialog({ open, mode, initialNotice, onClose, onSubmit }: Props) {
	const [values, setValues] = useState<NoticeFormValues>(emptyValues);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		if (mode === 'edit' && initialNotice) {
			setValues({
				noticeCategory: initialNotice.noticeCategory,
				noticeTitle: initialNotice.noticeTitle,
				noticeContent: initialNotice.noticeContent,
				noticeStatus: initialNotice.noticeStatus,
			});
			return;
		}
		setValues(emptyValues);
	}, [open, mode, initialNotice]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!values.noticeTitle.trim() || !values.noticeContent.trim()) return;
		setSaving(true);
		try {
			await onSubmit(values);
			onClose();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="admin-cs-form-dialog">
			<form onSubmit={handleSubmit}>
				<DialogTitle>{mode === 'create' ? 'Add Notice' : 'Edit Notice'}</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel id="notice-category-label">Category</InputLabel>
							<Select
								labelId="notice-category-label"
								label="Category"
								value={values.noticeCategory}
								onChange={(e) =>
									setValues((prev) => ({
										...prev,
										noticeCategory: e.target.value as Notice['noticeCategory'],
									}))
								}
							>
								{NOTICE_CATEGORIES.map((cat) => (
									<MenuItem key={cat} value={cat}>
										{cat.charAt(0) + cat.slice(1).toLowerCase()}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							label="Title"
							value={values.noticeTitle}
							onChange={(e) => setValues((prev) => ({ ...prev, noticeTitle: e.target.value }))}
							required
							fullWidth
						/>

						<AdminStackedMultilineField
							id="notice-content"
							label="Content"
							value={values.noticeContent}
							onChange={(noticeContent) => setValues((prev) => ({ ...prev, noticeContent }))}
							minRows={5}
							required
						/>

						<FormControl fullWidth>
							<InputLabel id="notice-status-label">Status</InputLabel>
							<Select
								labelId="notice-status-label"
								label="Status"
								value={values.noticeStatus}
								onChange={(e) =>
									setValues((prev) => ({
										...prev,
										noticeStatus: e.target.value as Notice['noticeStatus'],
									}))
								}
							>
								<MenuItem value="ACTIVE">Active</MenuItem>
								<MenuItem value="HOLD">On Hold</MenuItem>
								<MenuItem value="DELETE">Deleted</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={onClose} type="button">
						Cancel
					</Button>
					<Button type="submit" variant="contained" className="btn_add" disabled={saving}>
						{mode === 'create' ? 'Create Notice' : 'Save changes'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
