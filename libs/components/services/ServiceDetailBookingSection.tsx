import React, { useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useMutation } from '@apollo/client';
import type { Service } from '../../types/services/service';
import type { T } from '../../types/common';
import { CREATE_BOOKING } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { getUserReadableErrorMessage } from '../../utils/graphqlErrorMessage';

export interface ServiceDetailBookingSectionProps {
	service: Service | null;
	user: T;
}

function toDateTimeLocalString(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Service-only booking request: date/time + optional note (`createBooking`). */
const ServiceDetailBookingSection: React.FC<ServiceDetailBookingSectionProps> = ({ service, user }) => {
	const listingId = service?._id;
	const [dateTimeLocal, setDateTimeLocal] = useState('');
	const [note, setNote] = useState('');
	const [createBooking, { loading }] = useMutation(CREATE_BOOKING);

	const minDateTimeLocal = (() => {
		const d = new Date();
		d.setSeconds(0, 0);
		return toDateTimeLocalString(d);
	})();

	const isSelectedTimeInPast = useCallback((localValue: string) => {
		if (!localValue?.trim()) return true;
		const picked = new Date(localValue);
		return picked.getTime() < Date.now() - 60_000;
	}, []);

	const onSubmit = async () => {
		if (!user?._id) {
			await sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		if (!listingId) {
			await sweetMixinErrorAlert('This service is unavailable. Refresh the page and try again.');
			return;
		}
		if (!dateTimeLocal?.trim()) {
			await sweetMixinErrorAlert('Select a date and time for your booking first.');
			return;
		}
		if (isSelectedTimeInPast(dateTimeLocal)) {
			await sweetMixinErrorAlert('That time is in the past. Choose a future date and time.');
			return;
		}

		const dateTime = new Date(dateTimeLocal).toISOString();
		const trimmedNote = note.trim();

		try {
			await createBooking({
				variables: {
					input: {
						listingId,
						dateTime,
						...(trimmedNote ? { note: trimmedNote } : {}),
					},
				},
			});
			await sweetTopSmallSuccessAlert('Your booking request was sent. You will see it under My bookings.', 2800);
			setDateTimeLocal('');
			setNote('');
		} catch (err: unknown) {
			const msg = getUserReadableErrorMessage(
				err,
				'We could not submit your booking. Check your connection and try again.',
			);
			await sweetMixinErrorAlert(msg, 4500);
		}
	};

	const canSubmit =
		Boolean(listingId) && Boolean(dateTimeLocal?.trim()) && !loading && !isSelectedTimeInPast(dateTimeLocal);

	return (
		<>
			<Stack className={'info-box'}>
				<Typography className={'main-title'}>Request a booking</Typography>
				<Typography sx={{ fontSize: 13, color: '#717171', mb: 1.5, lineHeight: 1.5 }}>
					Pick a preferred date and time. The specialist will confirm or suggest another slot.
				</Typography>
				<Typography className={'sub-title'} component="label" htmlFor="service-booking-datetime">
					Select date &amp; time
				</Typography>
				<input
					id="service-booking-datetime"
					type={'datetime-local'}
					min={minDateTimeLocal}
					step={60}
					value={dateTimeLocal}
					onChange={(e) => setDateTimeLocal(e.target.value)}
					disabled={loading}
					aria-label="Select date and time for booking"
				/>
				<Typography className={'sub-title'} sx={{ mt: 1.5 }}>
					Note (optional)
				</Typography>
				<textarea
					placeholder={'Pet name, session goals, or accessibility needs'}
					value={note}
					onChange={(e) => setNote(e.target.value)}
					disabled={loading}
				/>
			</Stack>
			<Stack className={'info-box'}>
				<Button
					className={'send-message'}
					type={'button'}
					onClick={() => void onSubmit()}
					disabled={!canSubmit}
				>
					{loading ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
							<CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.9)' }} />
							<Typography className={'title'} component="span">
								Sending…
							</Typography>
						</Box>
					) : (
						<Typography className={'title'}>Submit booking request</Typography>
					)}
				</Button>
			</Stack>
		</>
	);
};

export default ServiceDetailBookingSection;
