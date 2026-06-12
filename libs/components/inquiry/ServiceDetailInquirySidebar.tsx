import React from 'react';
import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import type { Service } from '../../types/services/service';
import type { T } from '../../types/common';
import { useListingInquiryForm } from '../../hooks/useListingInquiryForm';
import ListingInquiryDetailSidebarFields from './ListingInquiryDetailSidebarFields';
import ServiceDetailBookingSection from '../services/ServiceDetailBookingSection';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface ServiceDetailInquirySidebarProps {
	service: Service | null;
	user: T;
	/** Defaults to desktop copy; mobile can pass sentence case. */
	mainTitle?: string;
	profileLinkLabel?: string;
	/** Set true when the booking section is rendered separately (e.g. in the left column on desktop). */
	hideBookingSection?: boolean;
}

/** Service detail right column: host card + listing inquiry form (`createInquiry`). */
const ServiceDetailInquirySidebar: React.FC<ServiceDetailInquirySidebarProps> = ({
	service,
	user,
	mainTitle = 'Get Service Consultation',
	profileLinkLabel = 'View Specialist Profile',
	hideBookingSection = false,
}) => {
	const listingId = service?._id;
	const { values, errors, setField, handleSubmitIntent, submitting } = useListingInquiryForm({
		listingId,
		user,
	});

	return (
		<Stack className={'right-config'}>
			<Stack className={'info-box'}>
				<Typography className={'main-title'}>{mainTitle}</Typography>
				<Stack className={'image-info'}>
					<img
						className={'member-image'}
						src={
							resolveMemberImageUrl(service?.memberData?.memberImage, '/img/profile/defaultUser.svg')
						}
						alt=""
					/>
					<Stack className={'name-phone-listings'}>
						<Link href={`/member?memberId=${service?.memberData?._id}`}>
							<Typography className={'name'}>{service?.memberData?.memberNick}</Typography>
						</Link>
						<Stack className={'phone-number'}>
							<Typography className={'number'}>{service?.memberData?.memberPhone}</Typography>
						</Stack>
						<Typography className={'listings'}>{profileLinkLabel}</Typography>
					</Stack>
				</Stack>
			</Stack>
			<ListingInquiryDetailSidebarFields
				values={values}
				errors={errors}
				onFieldChange={setField}
				onSubmitClick={handleSubmitIntent}
				submitLabel={'Send inquiry'}
				messagePlaceholder={
					'e.g. I’d like to book grooming for a medium dog next week, or ask about your consultation hours.'
				}
				submitDisabled={!listingId}
				submitting={submitting}
			/>
			{!hideBookingSection && <ServiceDetailBookingSection service={service} user={user} />}
		</Stack>
	);
};

export default ServiceDetailInquirySidebar;
