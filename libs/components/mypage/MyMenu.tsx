import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, List, ListItem } from '@mui/material';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import MypageIdentityCard from './MypageIdentityCard';

type NavItemProps = {
	category: string;
	label: string;
	active: boolean;
};

const NavItem = ({ category, label, active }: NavItemProps) => (
	<ListItem className={active ? 'focus' : ''}>
		<Link href={{ pathname: '/mypage', query: { category } }} scroll={false}>
			<Typography className="sub-title" component="span">
				{label}
			</Typography>
		</Link>
	</ListItem>
);

const MyMenu = () => {
	const router = useRouter();
	const pathname = String(router.query.category ?? 'myProfile');
	const user = useReactiveVar(userVar);

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.error('ERROR, logoutHandler:', err.message);
		}
	};

	return (
		<Stack width="100%" sx={{ p: 0 }}>
			<MypageIdentityCard />
			{user?.isPendingSpecialist && (
				<div className="mypage-review-banner" role="status" aria-live="polite">
					<span className="mypage-review-banner__icon" aria-hidden>
						⏳
					</span>
					<div className="mypage-review-banner__copy">
						<strong>Application under review</strong>
						<p>We are reviewing your specialist profile and will notify you once approved.</p>
					</div>
				</div>
			)}
			<Stack className="sections">
				<Stack className="section">
					<Typography className="title" variant="h5">
						PRODUCTS &amp; SERVICES
					</Typography>
					<List className="sub-section">
						{user.memberType === 'AGENT' && !user.isPendingSpecialist && (
							<>
								<NavItem category="addListing" label="Add product or service" active={pathname === 'addListing'} />
								<NavItem category="myProducts" label="My products" active={pathname === 'myProducts'} />
								<NavItem
									category="myServices"
									label="My services"
									active={pathname === 'myServices' || pathname === 'myListings'}
								/>
								<NavItem
									category="specialistInquiries"
									label="Product inquiries"
									active={pathname === 'specialistInquiries' || pathname === 'agentInquiries'}
								/>
								<NavItem
									category="specialistBookings"
									label="Service bookings"
									active={pathname === 'specialistBookings' || pathname === 'agentBookings'}
								/>
							</>
						)}
						<NavItem category="myFavorites" label="My Favorites" active={pathname === 'myFavorites'} />
						<NavItem category="myInquiries" label="My inquiries" active={pathname === 'myInquiries'} />
						<NavItem category="myBookings" label="My bookings" active={pathname === 'myBookings'} />
						<NavItem category="recentlyVisited" label="Recently Visited" active={pathname === 'recentlyVisited'} />
						<NavItem category="followers" label="My Followers" active={pathname === 'followers'} />
						<NavItem category="followings" label="My Followings" active={pathname === 'followings'} />
					</List>
				</Stack>
				<Stack className="section">
					<Typography className="title" variant="h5">
						Community
					</Typography>
					<List className="sub-section">
						<NavItem category="myArticles" label="Articles" active={pathname === 'myArticles'} />
						<NavItem category="writeArticle" label="Write Article" active={pathname === 'writeArticle'} />
					</List>
				</Stack>
				<Stack className="section">
					<Typography className="title" variant="h5">
						MANAGE ACCOUNT
					</Typography>
					<List className="sub-section">
						<NavItem category="myProfile" label="My Profile" active={pathname === 'myProfile'} />
						<ListItem className="mypage-nav-logout" onClick={logoutHandler}>
							<Typography className="sub-title" component="span">
								Logout
							</Typography>
						</ListItem>
					</List>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MyMenu;
