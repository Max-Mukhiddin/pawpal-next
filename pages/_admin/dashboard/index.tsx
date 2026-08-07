import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import AdminStatCard from '../../../libs/components/admin/AdminStatCard';
import AdminQuickActions from '../../../libs/components/admin/dashboard/AdminQuickActions';
import AdminRecentActivity from '../../../libs/components/admin/dashboard/AdminRecentActivity';
import FaqFormDialog, { FaqFormValues } from '../../../libs/components/admin/cs/FaqFormDialog';
import { GET_ALL_MEMBERS_BY_ADMIN, GET_LISTINGS } from '../../../apollo/user/query';
import { MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import type { Member } from '../../../libs/types/member/member';
import type { Listing } from '../../../libs/types/listing/listing';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const AdminDashboard: NextPage = () => {
	const [faqFormOpen, setFaqFormOpen] = useState(false);

	const membersCountInput = useMemo(
		() => ({ page: 1, limit: 1, sort: 'createdAt', search: {} }),
		[],
	);
	const specialistsCountInput = useMemo(
		() => ({ page: 1, limit: 1, sort: 'createdAt', search: { memberType: MemberType.AGENT } }),
		[],
	);
	const pendingSpecialistsCountInput = useMemo(
		() => ({ page: 1, limit: 1, sort: 'createdAt', search: { isPendingSpecialist: true } }),
		[],
	);
	const recentMembersInput = useMemo(
		() => ({
			page: 1,
			limit: 5,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		}),
		[],
	);
	const listingsCountInput = useMemo(
		() => ({
			page: 1,
			limit: 1,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		}),
		[],
	);
	const recentListingsInput = useMemo(
		() => ({
			page: 1,
			limit: 5,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		}),
		[],
	);

	const { data: membersCountData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersCountInput },
	});

	const { data: specialistsCountData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: specialistsCountInput },
	});

	const { data: pendingSpecialistsCountData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: pendingSpecialistsCountInput },
	});

	const { data: recentMembersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: recentMembersInput },
	});

	const { data: listingsCountData } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: listingsCountInput },
	});

	const { data: recentListingsData } = useQuery(GET_LISTINGS, {
		fetchPolicy: 'network-only',
		variables: { input: recentListingsInput },
	});

	const totalMembers = membersCountData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalSpecialists = specialistsCountData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pendingSpecialists =
		pendingSpecialistsCountData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalListings = listingsCountData?.getListings?.metaCounter?.[0]?.total ?? 0;

	const recentMembers: Member[] = recentMembersData?.getAllMembersByAdmin?.list ?? [];
	const recentListings: Listing[] = recentListingsData?.getListings?.list ?? [];

	const faqFormSubmitHandler = async (values: FaqFormValues) => {
		try {
			void values;
			setFaqFormOpen(false);
		} catch (err: unknown) {
			await sweetErrorHandling(err);
			throw err;
		}
	};

	return (
		<Box component="div" className="content admin-dashboard">
			<Typography variant="h2" className="admin-page-title">
				Dashboard
			</Typography>

			<div className="admin-stat-grid">
				<AdminStatCard
					label="Total Members"
					value={totalMembers}
					icon={<GroupsOutlinedIcon />}
					accent="forest"
				/>
				<AdminStatCard
					label="Total Listings"
					value={totalListings}
					icon={<Inventory2OutlinedIcon />}
					accent="honey"
				/>
				<AdminStatCard
					label="Total Specialists"
					value={totalSpecialists}
					icon={<MedicalServicesOutlinedIcon />}
					accent="sage"
				/>
				<AdminStatCard
					label="Pending Specialists"
					value={pendingSpecialists}
					icon={<HourglassTopOutlinedIcon />}
					accent="honey"
				/>
			</div>

			<AdminQuickActions onAddFaq={() => setFaqFormOpen(true)} />

			<AdminRecentActivity members={recentMembers} listings={recentListings} />

			<FaqFormDialog
				open={faqFormOpen}
				mode="create"
				onClose={() => setFaqFormOpen(false)}
				onSubmit={faqFormSubmitHandler}
			/>
		</Box>
	);
};

export default withAdminLayout(AdminDashboard);
