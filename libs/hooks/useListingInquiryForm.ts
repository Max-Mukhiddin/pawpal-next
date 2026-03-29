import { useMutation } from '@apollo/client';
import { useCallback, useState } from 'react';
import { CREATE_INQUIRY } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';
import type { T } from '../types/common';
import type { ListingInquiryFormValues } from '../types/inquiry/listing-inquiry.form';
import { emptyListingInquiryForm } from '../types/inquiry/listing-inquiry.form';
import {
	trimListingInquiryValues,
	validateListingInquiryForm,
	type ListingInquiryFieldErrors,
} from '../utils/listingInquiryFormValidation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';

export interface UseListingInquiryFormOptions {
	/** Current listing document id; submit is a no-op when missing. */
	listingId: string | null | undefined;
	user: T;
}

export interface UseListingInquiryFormResult {
	values: ListingInquiryFormValues;
	errors: ListingInquiryFieldErrors;
	setField: (field: keyof ListingInquiryFormValues, value: string) => void;
	handleSubmitIntent: () => Promise<void>;
	reset: () => void;
	submitting: boolean;
}

export function useListingInquiryForm({ listingId, user }: UseListingInquiryFormOptions): UseListingInquiryFormResult {
	const [values, setValues] = useState<ListingInquiryFormValues>(() => emptyListingInquiryForm());
	const [errors, setErrors] = useState<ListingInquiryFieldErrors>({});
	const [createInquiry, { loading: submitting }] = useMutation(CREATE_INQUIRY);

	const setField = useCallback((field: keyof ListingInquiryFormValues, value: string) => {
		setValues((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}, []);

	const reset = useCallback(() => {
		setValues(emptyListingInquiryForm());
		setErrors({});
	}, []);

	const handleSubmitIntent = useCallback(async () => {
		if (!listingId) {
			await sweetMixinErrorAlert('Listing is not available. Please refresh and try again.');
			return;
		}
		if (!user?._id) {
			await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}

		const trimmed = trimListingInquiryValues(values);
		setValues(trimmed);
		const nextErrors = validateListingInquiryForm(trimmed);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		try {
			await createInquiry({
				variables: {
					input: {
						listingId,
						name: trimmed.name,
						phone: trimmed.phone,
						email: trimmed.email,
						message: trimmed.message,
					},
				},
			});
			await sweetTopSmallSuccessAlert('Inquiry sent successfully', 2000);
			reset();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	}, [listingId, user, values, createInquiry, reset]);

	return {
		values,
		errors,
		setField,
		handleSubmitIntent,
		reset,
		submitting,
	};
}
