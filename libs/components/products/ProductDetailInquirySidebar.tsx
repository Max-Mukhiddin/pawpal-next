import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';

export interface ProductDetailInquirySidebarProps {
	product: Property | null;
}

/** Presentation-only seller / product inquiry column; reuses `.right-config` / `.info-box` from property detail SCSS. */
const ProductDetailInquirySidebar: React.FC<ProductDetailInquirySidebarProps> = ({ product }) => (
	<Stack className={'right-config'}>
		<Stack className={'info-box'}>
			<Typography className={'main-title'}>Product inquiry & seller support</Typography>
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
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Your name</Typography>
			<input type={'text'} placeholder={'Your name'} />
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Phone</Typography>
			<input type={'text'} placeholder={'Your phone'} />
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Email</Typography>
			<input type={'text'} placeholder={'hello@pawpal.com'} />
		</Stack>
		<Stack className={'info-box'}>
			<Typography className={'sub-title'}>Message</Typography>
			<textarea placeholder={'Hello, I would like to confirm stock and shipping for this product.'}></textarea>
		</Stack>
		<Stack className={'info-box'}>
			<Button className={'send-message'}>
				<Typography className={'title'}>Send product inquiry</Typography>
			</Button>
		</Stack>
	</Stack>
);

export default ProductDetailInquirySidebar;
