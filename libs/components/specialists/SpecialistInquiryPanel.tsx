import React from 'react';
import { Alert, Button, Divider, Stack, Typography } from '@mui/material';
import type { Listing } from '../../types/listing/listing';
import type { T } from '../../types/common';
import { ListingType } from '../../enums/listing.enum';
import { useListingInquiryForm } from '../../hooks/useListingInquiryForm';
import ListingInquirySpecialistCardFields from '../inquiry/ListingInquirySpecialistCardFields';
import ServiceDetailBookingSection from '../services/ServiceDetailBookingSection';

export interface SpecialistInquiryPanelProps {
	user: T;
	/** Listing chosen in the care offerings section; `createInquiry` uses its `_id`. */
	selectedListing?: Listing | null;
	onClearSelectedListing?: () => void;
}

function SpecialistInquiryPanelWired({ listingId, user }: { listingId: string; user: T }) {
	const { values, errors, setField, handleSubmitIntent, submitting } = useListingInquiryForm({
		listingId,
		user,
	});

	return (
		<ListingInquirySpecialistCardFields
			values={values}
			errors={errors}
			onFieldChange={setField}
			onSubmitClick={handleSubmitIntent}
			messageLabel="What do you need?"
			messagePlaceholder="e.g. Grooming for a nervous rescue, or a nutrition consult — include timing if you can."
			submitLabel="Send booking inquiry"
			submitDisabled={!listingId}
			submitting={submitting}
		/>
	);
}

/**
 * Consultation card on specialist profile. Inquiries are listing-scoped; user must select an offering below first.
 */
const SpecialistInquiryPanel: React.FC<SpecialistInquiryPanelProps> = ({
	user,
	selectedListing = null,
	onClearSelectedListing,
}) => {
	const listingId = selectedListing?._id ?? null;
	const hasListing = Boolean(listingId);
	const isServiceListing = selectedListing?.listingType === ListingType.SERVICE;

	return (
		<Stack
			sx={{
				width: '100%',
				maxWidth: 400,
				p: 3,
				borderRadius: '12px',
				background: '#fff',
				boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)',
				border: '1px solid rgba(24, 26, 32, 0.06)',
				alignSelf: { xs: 'stretch', md: 'flex-start' },
			}}
		>
			<Typography sx={{ fontSize: 17, fontWeight: 600, color: '#181a20', mb: 0.5 }}>Consultation & booking</Typography>
			<Typography sx={{ fontSize: 13, color: '#717171', lineHeight: 1.6, mb: 2 }}>
				Request a call or session with this specialist. Share your pet’s needs and preferred times—we’ll follow up from here.
			</Typography>
			{!hasListing && (
				<Alert severity="info" sx={{ alignItems: 'flex-start', mb: 2 }}>
					Choose a service or care listing first: use &quot;Select for inquiry&quot; on one of the cards below. Your message is
					sent for that specific listing (same as on the listing page).
				</Alert>
			)}
			{hasListing && selectedListing && (
				<Stack
					sx={{
						mb: 2,
						p: 1.5,
						borderRadius: 1,
						bgcolor: 'rgba(235, 103, 83, 0.06)',
						border: '1px solid rgba(235, 103, 83, 0.2)',
					}}
				>
					<Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
						<Stack minWidth={0}>
							<Typography sx={{ fontSize: 11, fontWeight: 600, color: '#717171', textTransform: 'uppercase', letterSpacing: 0.4 }}>
								Selected listing
							</Typography>
							<Typography sx={{ fontSize: 15, fontWeight: 600, color: '#181a20', mt: 0.25, wordBreak: 'break-word' }}>
								{selectedListing.listingTitle}
							</Typography>
						</Stack>
						{onClearSelectedListing && (
							<Button size="small" onClick={onClearSelectedListing} sx={{ textTransform: 'none', flexShrink: 0 }}>
								Change
							</Button>
						)}
					</Stack>
				</Stack>
			)}
			{hasListing ? (
				<SpecialistInquiryPanelWired listingId={listingId as string} user={user} />
			) : (
				<ListingInquirySpecialistCardFields
					values={{ name: '', phone: '', email: '', message: '' }}
					errors={{}}
					onFieldChange={() => {}}
					onSubmitClick={() => {}}
					messageLabel="What do you need?"
					messagePlaceholder="e.g. Grooming for a nervous rescue, or a nutrition consult — include timing if you can."
					submitLabel="Send booking inquiry"
					fieldsDisabled
					submitDisabled
					submitting={false}
				/>
			)}
			{hasListing && isServiceListing && selectedListing && (
				<>
					<Divider sx={{ my: 2.5 }} />
					<ServiceDetailBookingSection service={selectedListing} user={user} />
				</>
			)}
		</Stack>
	);
};

export default SpecialistInquiryPanel;
