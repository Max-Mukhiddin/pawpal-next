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
import type { Faq } from '../../../types/cs/faq';
import { FAQ_CATEGORIES } from '../../../utils/csDisplay';
import AdminStackedMultilineField from '../AdminStackedMultilineField';

export type FaqFormValues = {
	faqCategory: Faq['faqCategory'];
	faqQuestion: string;
	faqAnswer: string;
	faqOrder: number;
	faqStatus: Faq['faqStatus'];
};

type Props = {
	open: boolean;
	mode: 'create' | 'edit';
	initialFaq?: Faq | null;
	onClose: () => void;
	onSubmit: (values: FaqFormValues) => Promise<void>;
};

const emptyValues: FaqFormValues = {
	faqCategory: 'GENERAL',
	faqQuestion: '',
	faqAnswer: '',
	faqOrder: 1,
	faqStatus: 'ACTIVE',
};

export default function FaqFormDialog({ open, mode, initialFaq, onClose, onSubmit }: Props) {
	const [values, setValues] = useState<FaqFormValues>(emptyValues);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		if (mode === 'edit' && initialFaq) {
			setValues({
				faqCategory: initialFaq.faqCategory,
				faqQuestion: initialFaq.faqQuestion,
				faqAnswer: initialFaq.faqAnswer,
				faqOrder: initialFaq.faqOrder ?? 1,
				faqStatus: initialFaq.faqStatus,
			});
			return;
		}
		setValues(emptyValues);
	}, [open, mode, initialFaq]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!values.faqQuestion.trim() || !values.faqAnswer.trim()) return;
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
				<DialogTitle>{mode === 'create' ? 'Add FAQ' : 'Edit FAQ'}</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel id="faq-category-label">Category</InputLabel>
							<Select
								labelId="faq-category-label"
								label="Category"
								value={values.faqCategory}
								onChange={(e) =>
									setValues((prev) => ({
										...prev,
										faqCategory: e.target.value as Faq['faqCategory'],
									}))
								}
							>
								{FAQ_CATEGORIES.map((cat) => (
									<MenuItem key={cat} value={cat}>
										{cat.charAt(0) + cat.slice(1).toLowerCase()}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							label="Question"
							value={values.faqQuestion}
							onChange={(e) => setValues((prev) => ({ ...prev, faqQuestion: e.target.value }))}
							required
							fullWidth
						/>

						<AdminStackedMultilineField
							id="faq-answer"
							label="Answer"
							value={values.faqAnswer}
							onChange={(faqAnswer) => setValues((prev) => ({ ...prev, faqAnswer }))}
							minRows={4}
							required
						/>

						<TextField
							label="Display order"
							type="number"
							value={values.faqOrder}
							onChange={(e) =>
								setValues((prev) => ({ ...prev, faqOrder: parseInt(e.target.value, 10) || 1 }))
							}
							fullWidth
							inputProps={{ min: 1 }}
						/>

						<FormControl fullWidth>
							<InputLabel id="faq-status-label">Status</InputLabel>
							<Select
								labelId="faq-status-label"
								label="Status"
								value={values.faqStatus}
								onChange={(e) =>
									setValues((prev) => ({
										...prev,
										faqStatus: e.target.value as Faq['faqStatus'],
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
						{mode === 'create' ? 'Create FAQ' : 'Save changes'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
