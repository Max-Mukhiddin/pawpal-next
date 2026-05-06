import React from 'react';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { ListingInquiryFormValues } from '../../types/inquiry/listing-inquiry.form';
import type { ListingInquiryFieldErrors } from '../../utils/listingInquiryFormValidation';

const baseInputStyle: React.CSSProperties = {
	width: '100%',
	padding: '12px 14px',
	borderRadius: 8,
	border: '1px solid #ddd',
	fontSize: 14,
	boxSizing: 'border-box',
};

const textareaBaseStyle: React.CSSProperties = {
	...baseInputStyle,
	minHeight: 88,
	resize: 'vertical' as const,
};

function inputStyleWithError(hasError: boolean, base: React.CSSProperties): React.CSSProperties {
	if (!hasError) return base;
	return {
		...base,
		borderColor: '#d32f2f',
		borderWidth: 2,
		outline: 'none',
	};
}

const errorTextSx = {
	fontSize: 12,
	fontWeight: 500,
	color: 'error.main',
	mt: 0.25,
	lineHeight: 1.4,
} as const;

export interface ListingInquirySpecialistCardFieldsProps {
	values: ListingInquiryFormValues;
	errors: ListingInquiryFieldErrors;
	onFieldChange: (field: keyof ListingInquiryFormValues, value: string) => void;
	onSubmitClick: () => void | Promise<void>;
	messageLabel?: string;
	messagePlaceholder?: string;
	submitLabel?: string;
	submitDisabled?: boolean;
	submitting?: boolean;
	/** When true, all fields are non-interactive (e.g. specialist profile without a listing id). */
	fieldsDisabled?: boolean;
}

/** Specialist detail card layout; same field shape as sidebar inquiries. */
const ListingInquirySpecialistCardFields: React.FC<ListingInquirySpecialistCardFieldsProps> = ({
	values,
	errors,
	onFieldChange,
	onSubmitClick,
	messageLabel = 'Message',
	messagePlaceholder = 'Describe your pet, timing, and what you need help with.',
	submitLabel = 'Send booking inquiry',
	submitDisabled = false,
	submitting = false,
	fieldsDisabled = false,
}) => (
	<Stack spacing={1.75} component="div">
		<Stack spacing={0.5} component="div">
			<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Name</Typography>
			<input
				type="text"
				placeholder="e.g. Alex Kim"
				style={inputStyleWithError(Boolean(errors.name), baseInputStyle)}
				value={values.name}
				onChange={(e) => onFieldChange('name', e.target.value)}
				onBlur={(e) => onFieldChange('name', e.target.value.trim())}
				aria-invalid={Boolean(errors.name)}
				aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
				disabled={fieldsDisabled || submitting}
			/>
			{errors.name && (
				<Typography id="inquiry-name-error" sx={errorTextSx} role="alert">
					{errors.name}
				</Typography>
			)}
		</Stack>
		<Stack spacing={0.5} component="div">
			<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Phone</Typography>
			<input
				type="tel"
				placeholder="e.g. +82 10-1234-5678"
				style={inputStyleWithError(Boolean(errors.phone), baseInputStyle)}
				value={values.phone}
				onChange={(e) => onFieldChange('phone', e.target.value)}
				onBlur={(e) => onFieldChange('phone', e.target.value.trim())}
				aria-invalid={Boolean(errors.phone)}
				aria-describedby={errors.phone ? 'inquiry-phone-error' : undefined}
				disabled={fieldsDisabled || submitting}
			/>
			{errors.phone && (
				<Typography id="inquiry-phone-error" sx={errorTextSx} role="alert">
					{errors.phone}
				</Typography>
			)}
		</Stack>
		<Stack spacing={0.5} component="div">
			<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>Email</Typography>
			<input
				type="email"
				placeholder="you@email.com"
				autoComplete="email"
				style={inputStyleWithError(Boolean(errors.email), baseInputStyle)}
				value={values.email}
				onChange={(e) => onFieldChange('email', e.target.value)}
				onBlur={(e) => onFieldChange('email', e.target.value.trim())}
				aria-invalid={Boolean(errors.email)}
				aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
				disabled={fieldsDisabled || submitting}
			/>
			{errors.email && (
				<Typography id="inquiry-email-error" sx={errorTextSx} role="alert">
					{errors.email}
				</Typography>
			)}
		</Stack>
		<Stack spacing={0.5} component="div">
			<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#181a20' }}>{messageLabel}</Typography>
			<textarea
				placeholder={messagePlaceholder}
				style={inputStyleWithError(Boolean(errors.message), textareaBaseStyle)}
				value={values.message}
				onChange={(e) => onFieldChange('message', e.target.value)}
				onBlur={(e) => onFieldChange('message', e.target.value.trim())}
				aria-invalid={Boolean(errors.message)}
				aria-describedby={errors.message ? 'inquiry-message-error' : undefined}
				disabled={fieldsDisabled || submitting}
			/>
			{errors.message && (
				<Typography id="inquiry-message-error" sx={errorTextSx} role="alert">
					{errors.message}
				</Typography>
			)}
		</Stack>
		<Button
			type="button"
			variant="contained"
			onClick={() => void onSubmitClick()}
			disabled={submitDisabled || submitting}
			sx={{
				mt: 1,
				py: 1.25,
				borderRadius: '12px',
				textTransform: 'none',
				fontWeight: 600,
				background: '#eb6753',
				'&:hover': { background: '#d95a47' },
			}}
		>
			{submitting ? (
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
					<CircularProgress size={18} color="inherit" />
					<span>Sending...</span>
				</span>
			) : (
				submitLabel
			)}
		</Button>
	</Stack>
);

export default ListingInquirySpecialistCardFields;
