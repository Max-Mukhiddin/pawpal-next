import React from 'react';
import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import type { Product } from '../../types/products/product';
import type { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';
import { useListingInquiryForm } from '../../hooks/useListingInquiryForm';
import ListingInquiryDetailSidebarFields from '../inquiry/ListingInquiryDetailSidebarFields';

export interface ProductDetailInquirySidebarProps {
	product: Product | null;
	user: T;
}

/** Seller / product inquiry column; submits `createInquiry` for the current product listing. */
const ProductDetailInquirySidebar: React.FC<ProductDetailInquirySidebarProps> = ({ product, user }) => {
	const listingId = product?._id;
	const { values, errors, setField, handleSubmitIntent, submitting } = useListingInquiryForm({
		listingId,
		user,
	});

	return (
		<Stack className={'right-config'}>
			<Stack className={'info-box'}>
				<Typography className={'main-title'}>Send an Inquiry</Typography>
				<Typography sx={{ fontSize: 13, color: '#717171', mb: 2 }}>
					Questions about fit, ingredients, or shipping? Message the seller before you check out.
				</Typography>
				<Stack className={'image-info'}>
					<img
						className={'member-image'}
						src={
							product?.memberData?.memberImage
								? `${REACT_APP_API_URL}/${product.memberData.memberImage}`
								: '/img/profile/defaultUser.svg'
						}
						alt=""
					/>
					<Stack className={'name-phone-listings'}>
						<Link href={`/member?memberId=${product?.memberData?._id}`}>
							<Typography className={'name'}>{product?.memberData?.memberNick}</Typography>
						</Link>
						<Stack className={'phone-number'}>
							<Typography className={'number'}>{product?.memberData?.memberPhone}</Typography>
						</Stack>
						<Typography className={'listings'}>Seller contact</Typography>
					</Stack>
				</Stack>
			</Stack>
			<ListingInquiryDetailSidebarFields
				values={values}
				errors={errors}
				onFieldChange={setField}
				onSubmitClick={handleSubmitIntent}
				submitLabel={'Send Inquiry'}
				messagePlaceholder={
					'e.g. Size or flavor in stock, ingredients, shipping time to my area, or returns.'
				}
				submitDisabled={!listingId}
				submitting={submitting}
			/>
		</Stack>
	);
};

export default ProductDetailInquirySidebar;
