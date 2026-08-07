import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminFloatingDock from '../admin/AdminFloatingDock';
import AdminTopBar from '../admin/AdminTopBar';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		const logoutHandler = () => {
			logOut();
			router.push('/').then();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="pc-wrap" className="admin">
				<div className="admin-shell">
					<div className="admin-dock-wrap">
						<AdminFloatingDock onLogout={logoutHandler} />
					</div>

					<div className="admin-content-shell">
						<AdminTopBar
							userNick={user?.memberNick}
							userFullName={user?.memberFullName}
							userPhone={user?.memberPhone}
							userImage={user?.memberImage}
							onLogout={logoutHandler}
						/>

						<div id="bunker" className="admin-main">
							{/*@ts-ignore*/}
							<Component {...props} />
						</div>
					</div>
				</div>
			</main>
		);
	};
};

export default withAdminLayout;
