import React from 'react';
import { TextField } from '@mui/material';

type Props = {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	minRows?: number;
	required?: boolean;
};

/**
 * Multiline admin form field with a static label above the textarea.
 * MUI's floating InputLabel overlaps multiline content — do not use label="" on multiline TextField.
 */
export default function AdminStackedMultilineField({ id, label, value, onChange, minRows = 4, required }: Props) {
	return (
		<div className="admin-form-field admin-form-field--stacked">
			<label htmlFor={id} className="admin-form-field__label">
				{label}
				{required ? <span className="admin-form-field__required" aria-hidden>{' '}*</span> : null}
			</label>
			<TextField
				id={id}
				hiddenLabel
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				fullWidth
				multiline
				minRows={minRows}
			/>
		</div>
	);
}
