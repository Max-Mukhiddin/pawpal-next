import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Box, Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		const isMobileLayout = device === 'mobile';

		return (
			<>
				<Head>
					<title>pawpal</title>
					<meta name={'title'} content={`pawpal`} />
				</Head>
				<Stack id="pc-wrap" className={isMobileLayout ? 'layout-home--mobile' : undefined}>
					<Stack id="pawpal-header">
						<Top />
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<Box sx={{ display: isMobileLayout ? 'none' : 'block' }}>
						<Chat />
					</Box>

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;
