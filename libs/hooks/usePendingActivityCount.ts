import { useMemo } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_AGENT_BOOKINGS, GET_AGENT_INQUIRIES, GET_MY_BOOKINGS, GET_MY_INQUIRIES } from '../../apollo/user/query';
import { Direction } from '../enums/common.enum';
import type { T } from '../types/common';
import { countPendingForBadge, type UnifiedActivity } from '../utils/activityHelpers';

const listInput = {
	page: 1,
	limit: 50,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

export const usePendingActivityCount = (): number => {
	const user = useReactiveVar(userVar);
	const isAgent = user?.memberType === 'AGENT' && !user?.isPendingSpecialist;

	const { data: bookingsData } = useQuery(isAgent ? GET_AGENT_BOOKINGS : GET_MY_BOOKINGS, {
		variables: { input: listInput },
		skip: !user?._id || user._id.length !== 24,
		fetchPolicy: 'cache-first',
	});

	const { data: inquiriesData } = useQuery(isAgent ? GET_AGENT_INQUIRIES : GET_MY_INQUIRIES, {
		variables: { input: listInput },
		skip: !user?._id || user._id.length !== 24,
		fetchPolicy: 'cache-first',
	});

	return useMemo(() => {
		const bookings = isAgent
			? bookingsData?.getAgentBookings?.list ?? []
			: bookingsData?.getMyBookings?.list ?? [];
		const inquiries = isAgent
			? inquiriesData?.getAgentInquiries?.list ?? []
			: inquiriesData?.getMyInquiries?.list ?? [];

		const activities: UnifiedActivity[] = [
			...bookings.map((x: T) => ({ ...x, _kind: 'BOOKING' as const, _timestamp: x.createdAt })),
			...inquiries.map((x: T) => ({ ...x, _kind: 'INQUIRY' as const, _timestamp: x.createdAt })),
		];

		return countPendingForBadge(activities, Boolean(isAgent));
	}, [bookingsData, inquiriesData, isAgent]);
};

export default usePendingActivityCount;
