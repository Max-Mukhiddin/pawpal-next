import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Pagination, Typography } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import SpecialistsFilter from '../../libs/components/specialists/SpecialistsFilter';
import SpecialistListCard from '../../libs/components/specialists/SpecialistListCard';
import SpecialistsCta from '../../libs/components/specialists/SpecialistsCta';
import { useRouter } from 'next/router';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ctaData = {
	title: 'Join Our Network of Pet Care Specialists',
	lead: 'Are you a vet, groomer, trainer or pet care professional? Register on PawPal and connect with pet owners who need your expertise.',
	primaryCta: 'Register as Specialist',
};

const SpecialistsListPage: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Newest first');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [specialistDirectoryInquiry, setSpecialistDirectoryInquiry] = useState<AgentsInquiry>(initialInput);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: specialistDirectoryInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSpecialistDirectoryInquiry({ ...specialistDirectoryInquiry, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('Newest first');
				break;
			case 'old':
				setSpecialistDirectoryInquiry({ ...specialistDirectoryInquiry, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('Earliest joined');
				break;
			case 'likes':
				setSpecialistDirectoryInquiry({ ...specialistDirectoryInquiry, sort: 'memberLikes', direction: Direction.DESC });
				setFilterSortName('Most liked');
				break;
			case 'views':
				setSpecialistDirectoryInquiry({ ...specialistDirectoryInquiry, sort: 'memberViews', direction: Direction.DESC });
				setFilterSortName('Most viewed');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setSpecialistDirectoryInquiry({
			...specialistDirectoryInquiry,
			search: { ...specialistDirectoryInquiry.search, text: searchText },
		});
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setSpecialistDirectoryInquiry((prev) => ({ ...prev, page: value }));
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await getAgentsRefetch({ input: specialistDirectoryInquiry });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className="pawpal-static-page pawpal-static-page--specialists">
			<Stack
				className="container"
				sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}
			>
				<Stack className="specialist-list-page">
					<div className="container">
						<SpecialistsFilter
							searchText={searchText}
							onSearchTextChange={setSearchText}
							onSearchEnter={handleSearchEnter}
							filterSortName={filterSortName}
							anchorEl={anchorEl}
							sortingOpen={sortingOpen}
							onSortingClick={sortingClickHandler}
							onSortingClose={sortingCloseHandler}
							onSortingSelect={sortingHandler}
						/>

						<div className="card-wrap">
							{agents?.length === 0 ? (
								<div className="no-data">
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Specialists found!</p>
								</div>
							) : (
								agents.map((specialist: Member) => (
									<SpecialistListCard
										specialist={specialist}
										key={specialist._id}
										onLike={likeMemberHandler}
									/>
								))
							)}
						</div>

						<Stack className="pagination">
							<Stack className="pagination-box">
								{agents.length !== 0 && Math.ceil(total / specialistDirectoryInquiry.limit) > 1 && (
									<Pagination
										page={currentPage}
										count={Math.ceil(total / specialistDirectoryInquiry.limit)}
										onChange={paginationChangeHandler}
										shape="circular"
										color="primary"
										size={device === 'mobile' ? 'small' : 'medium'}
									/>
								)}
							</Stack>
							{agents.length !== 0 && (
								<Typography component="span" sx={{ mt: '20px', fontSize: 14, color: '#181a20' }}>
									Total {total} specialist{total !== 1 ? 's' : ''} available
								</Typography>
							)}
						</Stack>
					</div>
				</Stack>

				<SpecialistsCta
					data={ctaData}
					onPrimaryClick={() => {
						if (user?._id) {
							router.push('/mypage');
						} else {
							router.push('/account/join');
						}
					}}
				/>
			</Stack>
		</Stack>
	);
};

SpecialistsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(SpecialistsListPage);
