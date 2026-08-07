import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, List, ListItem } from '@mui/material';
import Link from 'next/link';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import usePendingActivityCount from '../../hooks/usePendingActivityCount';
import MypageIdentityCard from './MypageIdentityCard';
import ChatPopup from '../messaging/ChatPopup';

type NavItemProps = {
	category: string;
	label: string;
	active: boolean;
	icon?: React.ReactNode;
};

/* .com-icon is hidden on desktop by the existing mypage.scss rule; shown only in #mobile-wrap */
const NavItem = ({ category, label, active, icon }: NavItemProps) => (
	<ListItem className={active ? 'focus' : ''}>
		<Link href={{ pathname: '/mypage', query: { category } }} scroll={false}>
			{icon ? (
				<span className="com-icon" aria-hidden>
					{icon}
				</span>
			) : null}
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
	const pendingActivity = usePendingActivityCount();
	const isActivityActive = router.pathname === '/activity';
	const [supportChatOpen, setSupportChatOpen] = useState(false);

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
						ACTIVITY
					</Typography>
					<List className="sub-section">
						<ListItem className={`mypage-nav-activity ${isActivityActive ? 'focus' : ''}`}>
							<Link href="/activity" scroll={false}>
								<DashboardOutlinedIcon
									className="mypage-nav-activity__pc-icon"
									sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }}
								/>
								<span className="com-icon" aria-hidden>
									<DashboardOutlinedIcon fontSize="inherit" />
								</span>
								<Typography className="sub-title" component="span">
									Activity
								</Typography>
								{pendingActivity > 0 ? (
									<span className="mypage-nav-activity__badge" aria-label={`${pendingActivity} pending`} />
								) : null}
							</Link>
						</ListItem>
					</List>
				</Stack>
				<Stack className="section">
					<Typography className="title" variant="h5">
						PRODUCTS &amp; SERVICES
					</Typography>
					<List className="sub-section">
						{user.memberType === 'AGENT' && !user.isPendingSpecialist && (
							<>
								<NavItem
									category="addListing"
									label="Add product or service"
									active={pathname === 'addListing'}
									icon={<AddCircleOutlineOutlinedIcon fontSize="inherit" />}
								/>
								<NavItem
									category="myProducts"
									label="My products"
									active={pathname === 'myProducts'}
									icon={<Inventory2OutlinedIcon fontSize="inherit" />}
								/>
								<NavItem
									category="myServices"
									label="My services"
									active={pathname === 'myServices' || pathname === 'myListings'}
									icon={<HomeRepairServiceOutlinedIcon fontSize="inherit" />}
								/>
								<NavItem
									category="specialistInquiries"
									label="Product inquiries"
									active={pathname === 'specialistInquiries' || pathname === 'agentInquiries'}
									icon={<MailOutlineIcon fontSize="inherit" />}
								/>
								<NavItem
									category="specialistBookings"
									label="Service bookings"
									active={pathname === 'specialistBookings' || pathname === 'agentBookings'}
									icon={<EventAvailableOutlinedIcon fontSize="inherit" />}
								/>
							</>
						)}
						<NavItem
							category="myFavorites"
							label="My Favorites"
							active={pathname === 'myFavorites'}
							icon={<FavoriteBorderIcon fontSize="inherit" />}
						/>
						<NavItem
							category="myInquiries"
							label="My inquiries"
							active={pathname === 'myInquiries'}
							icon={<MailOutlineIcon fontSize="inherit" />}
						/>
						<NavItem
							category="myBookings"
							label="My bookings"
							active={pathname === 'myBookings'}
							icon={<EventAvailableOutlinedIcon fontSize="inherit" />}
						/>
						<NavItem
							category="recentlyVisited"
							label="Recently Visited"
							active={pathname === 'recentlyVisited'}
							icon={<HistoryOutlinedIcon fontSize="inherit" />}
						/>
						<NavItem
							category="followers"
							label="My Followers"
							active={pathname === 'followers'}
							icon={<PeopleOutlineIcon fontSize="inherit" />}
						/>
						<NavItem
							category="followings"
							label="My Followings"
							active={pathname === 'followings'}
							icon={<PersonAddOutlinedIcon fontSize="inherit" />}
						/>
					</List>
				</Stack>
				<Stack className="section">
					<Typography className="title" variant="h5">
						Community
					</Typography>
					<List className="sub-section">
						<NavItem
							category="myArticles"
							label="Articles"
							active={pathname === 'myArticles'}
							icon={<ArticleOutlinedIcon fontSize="inherit" />}
						/>
						<NavItem
							category="writeArticle"
							label="Write Article"
							active={pathname === 'writeArticle'}
							icon={<EditOutlinedIcon fontSize="inherit" />}
						/>
					</List>
				</Stack>
				<Stack className="section">
					<Typography className="title" variant="h5">
						MANAGE ACCOUNT
					</Typography>
					<List className="sub-section">
						<NavItem
							category="myProfile"
							label="My Profile"
							active={pathname === 'myProfile'}
							icon={<PersonOutlineIcon fontSize="inherit" />}
						/>
						<ListItem className="mypage-nav-support" onClick={() => setSupportChatOpen(true)}>
							{/* Same .flex-box hit-area padding as NavItem links (see mypage.scss) */}
							<div className="flex-box">
								<span className="com-icon" aria-hidden>
									<SupportAgentOutlinedIcon fontSize="inherit" />
								</span>
								<Typography className="sub-title" component="span">
									Contact Support
								</Typography>
							</div>
						</ListItem>
						<ListItem className="mypage-nav-logout" onClick={logoutHandler}>
							<div className="flex-box">
								<span className="com-icon" aria-hidden>
									<LogoutOutlinedIcon fontSize="inherit" />
								</span>
								<Typography className="sub-title" component="span">
									Logout
								</Typography>
							</div>
						</ListItem>
					</List>
				</Stack>
			</Stack>

			<ChatPopup open={supportChatOpen} onClose={() => setSupportChatOpen(false)} isAdminSupport />
		</Stack>
	);
};

export default MyMenu;
