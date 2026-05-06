import React from 'react';
import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import type { Listing } from '../../types/listing/listing';
import type { T } from '../../types/common';
import { useListingInquiryForm } from '../../hooks/useListingInquiryForm';
import ListingInquiryDetailSidebarFields from './ListingInquiryDetailSidebarFields';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

export interface ListingDetailInquirySidebarProps {
	listing: Listing | null;
	user: T;
}

/** Care listing detail right column: host card + `createInquiry` for the current listing. */
const ListingDetailInquirySidebar: React.FC<ListingDetailInquirySidebarProps> = ({ listing, user }) => {
	const listingId = listing?._id;
	const { values, errors, setField, handleSubmitIntent, submitting } = useListingInquiryForm({
		listingId,
		user,
	});

	return (
		<Stack className={'right-config'}>
			<Stack className={'info-box'}>
				<Typography className={'main-title'}>Get More Information</Typography>
				<Stack className={'image-info'}>
					<img
						className={'member-image'}
						src={
							resolveMemberImageUrl(listing?.memberData?.memberImage, '/img/profile/defaultUser.svg')
						}
						alt=""
					/>
					<Stack className={'name-phone-listings'}>
						<Link href={`/member?memberId=${listing?.memberData?._id}`}>
							<Typography className={'name'}>{listing?.memberData?.memberNick}</Typography>
						</Link>
						<Stack className={'phone-number'}>
							<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
								<g clipPath="url(#clip0_listing_inquiry_phone)">
									<path
										d="M16.2858 10.11L14.8658 8.69C14.5607 8.39872 14.1551 8.23619 13.7333 8.23619C13.3115 8.23619 12.9059 8.39872 12.6008 8.69L12.1008 9.19C11.7616 9.528 11.3022 9.71778 10.8233 9.71778C10.3444 9.71778 9.88506 9.528 9.54582 9.19C9.16082 8.805 8.91582 8.545 8.67082 8.29C8.42582 8.035 8.17082 7.76 7.77082 7.365C7.43312 7.02661 7.24347 6.56807 7.24347 6.09C7.24347 5.61193 7.43312 5.15339 7.77082 4.815L8.27082 4.315C8.41992 4.16703 8.53822 3.99099 8.61889 3.79703C8.69956 3.60308 8.741 3.39506 8.74082 3.185C8.739 2.76115 8.57012 2.35512 8.27082 2.055L6.85082 0.625C6.44967 0.225577 5.9069 0.000919443 5.34082 0C5.06197 0.000410905 4.78595 0.0558271 4.52855 0.163075C4.27116 0.270322 4.03745 0.427294 3.84082 0.625L2.48582 1.97C1.50938 2.94779 0.960937 4.27315 0.960938 5.655C0.960937 7.03685 1.50938 8.36221 2.48582 9.34C3.26582 10.12 4.15582 11 5.04082 11.92C5.92582 12.84 6.79582 13.7 7.57082 14.5C8.5484 15.4749 9.87269 16.0224 11.2533 16.0224C12.6339 16.0224 13.9582 15.4749 14.9358 14.5L16.2858 13.15C16.6828 12.7513 16.9073 12.2126 16.9108 11.65C16.9157 11.3644 16.8629 11.0808 16.7555 10.8162C16.6481 10.5516 16.4884 10.3114 16.2858 10.11Z"
										fill="#181A20"
									/>
								</g>
								<defs>
									<clipPath id="clip0_listing_inquiry_phone">
										<rect width="16" height="16" fill="white" transform="translate(0.9375)" />
									</clipPath>
								</defs>
							</svg>
							<Typography className={'number'}>{listing?.memberData?.memberPhone}</Typography>
						</Stack>
						<Typography className={'listings'}>View Listings</Typography>
					</Stack>
				</Stack>
			</Stack>
			<ListingInquiryDetailSidebarFields
				values={values}
				errors={errors}
				onFieldChange={setField}
				onSubmitClick={handleSubmitIntent}
				submitLabel={'Send Message'}
				messagePlaceholder={
					'e.g. Questions about availability, what to bring, or how to prepare my pet for the stay.'
				}
				submitEndAdornment={
					<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
						<g clipPath="url(#clip0_listing_inquiry_send)">
							<path
								d="M16.0556 0.5H6.2778C6.03214 0.5 5.83334 0.698792 5.83334 0.944458C5.83334 1.19012 6.03214 1.38892 6.2778 1.38892H14.9827L0.630219 15.7413C0.456594 15.915 0.456594 16.1962 0.630219 16.3698C0.71701 16.4566 0.83076 16.5 0.944469 16.5C1.05818 16.5 1.17189 16.4566 1.25872 16.3698L15.6111 2.01737V10.7222C15.6111 10.9679 15.8099 11.1667 16.0556 11.1667C16.3013 11.1667 16.5001 10.9679 16.5001 10.7222V0.944458C16.5 0.698792 16.3012 0.5 16.0556 0.5Z"
								fill="white"
							/>
						</g>
						<defs>
							<clipPath id="clip0_listing_inquiry_send">
								<rect width="16" height="16" fill="white" transform="translate(0.5 0.5)" />
							</clipPath>
						</defs>
					</svg>
				}
				submitDisabled={!listingId}
				submitting={submitting}
			/>
		</Stack>
	);
};

export default ListingDetailInquirySidebar;
