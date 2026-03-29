import React from 'react';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { ListingInquiryFormValues } from '../../types/inquiry/listing-inquiry.form';
import type { ListingInquiryFieldErrors } from '../../utils/listingInquiryFormValidation';

const errorTextSx = {
	fontSize: 12,
	fontWeight: 500,
	color: 'error.main',
	mt: 0.5,
	lineHeight: 1.4,
} as const;

function inputStyle(hasError: boolean): React.CSSProperties | undefined {
	if (!hasError) return undefined;
	return {
		borderColor: '#d32f2f',
		borderWidth: 2,
		outline: 'none',
	};
}

export interface ListingInquiryDetailSidebarFieldsProps {
	values: ListingInquiryFormValues;
	errors: ListingInquiryFieldErrors;
	onFieldChange: (field: keyof ListingInquiryFormValues, value: string) => void;
	onSubmitClick: () => void | Promise<void>;
	submitLabel: string;
	messagePlaceholder: string;
	/** Optional icon or extra content after the submit label (e.g. property detail arrow SVG). */
	submitEndAdornment?: React.ReactNode;
	submitDisabled?: boolean;
	submitting?: boolean;
}

/** Controlled name/phone/email/message block for `.right-config` / `.info-box` detail sidebars. */
const ListingInquiryDetailSidebarFields: React.FC<ListingInquiryDetailSidebarFieldsProps> = ({
	values,
	errors,
	onFieldChange,
	onSubmitClick,
	submitLabel,
	messagePlaceholder,
	submitEndAdornment,
	submitDisabled = false,
	submitting = false,
}) => (
	<>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Name</Typography>
			<input
				type={'text'}
				placeholder={'e.g. Alex Kim'}
				value={values.name}
				onChange={(e) => onFieldChange('name', e.target.value)}
				onBlur={(e) => onFieldChange('name', e.target.value.trim())}
				aria-invalid={Boolean(errors.name)}
				style={inputStyle(Boolean(errors.name))}
				disabled={submitting}
			/>
			{errors.name && (
				<Typography sx={errorTextSx} role="alert">
					{errors.name}
				</Typography>
			)}
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Phone</Typography>
			<input
				type={'tel'}
				placeholder={'e.g. +82 10-1234-5678'}
				value={values.phone}
				onChange={(e) => onFieldChange('phone', e.target.value)}
				onBlur={(e) => onFieldChange('phone', e.target.value.trim())}
				aria-invalid={Boolean(errors.phone)}
				style={inputStyle(Boolean(errors.phone))}
				disabled={submitting}
			/>
			{errors.phone && (
				<Typography sx={errorTextSx} role="alert">
					{errors.phone}
				</Typography>
			)}
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Email</Typography>
			<input
				type={'email'}
				placeholder={'you@email.com'}
				autoComplete="email"
				value={values.email}
				onChange={(e) => onFieldChange('email', e.target.value)}
				onBlur={(e) => onFieldChange('email', e.target.value.trim())}
				aria-invalid={Boolean(errors.email)}
				style={inputStyle(Boolean(errors.email))}
				disabled={submitting}
			/>
			{errors.email && (
				<Typography sx={errorTextSx} role="alert">
					{errors.email}
				</Typography>
			)}
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Message</Typography>
			<textarea
				placeholder={messagePlaceholder}
				value={values.message}
				onChange={(e) => onFieldChange('message', e.target.value)}
				onBlur={(e) => onFieldChange('message', e.target.value.trim())}
				aria-invalid={Boolean(errors.message)}
				style={inputStyle(Boolean(errors.message))}
				disabled={submitting}
			/>
			{errors.message && (
				<Typography sx={errorTextSx} role="alert">
					{errors.message}
				</Typography>
			)}
		</Stack>
		<Stack className={'info-box'}>
			<Button
				className={'send-message'}
				type={'button'}
				onClick={() => void onSubmitClick()}
				disabled={submitDisabled || submitting}
			>
				{submitting ? (
					<Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
						<CircularProgress size={18} sx={{ color: 'inherit' }} />
						<Typography className={'title'} component="span">
							Sending…
						</Typography>
					</Stack>
				) : (
					<>
						<Typography className={'title'}>{submitLabel}</Typography>
						{submitEndAdornment}
					</>
				)}
			</Button>
		</Stack>
	</>
);

export default ListingInquiryDetailSidebarFields;
