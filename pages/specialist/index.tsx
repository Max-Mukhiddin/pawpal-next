import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { SPECIALISTS_PAGE_MOCK } from '../../libs/data/specialists/specialistsPage.mock';
import type { SpecialistsHeroContent } from '../../libs/types/specialists/specialists.page';
import SpecialistsHero from '../../libs/components/specialists/SpecialistsHero';
import SpecialistsFilter from '../../libs/components/specialists/SpecialistsFilter';
import SpecialistListCard from '../../libs/components/specialists/SpecialistListCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SpecialistsListPage: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [directoryHero] = useState<SpecialistsHeroContent>(() => SPECIALISTS_PAGE_MOCK.hero);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Newest first');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [specialistDirectoryInquiry, setSpecialistDirectoryInquiry] = useState<AgentsInquiry>(() =>
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
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

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSpecialistDirectoryInquiry(inputObj);
		} else {
			router.replace(
				`/specialist?input=${JSON.stringify(specialistDirectoryInquiry)}`,
				`/specialist?input=${JSON.stringify(specialistDirectoryInquiry)}`,
			);
		}

		setCurrentPage(specialistDirectoryInquiry.page === undefined ? 1 : specialistDirectoryInquiry.page);
	}, [router]);

	/** HANDLERS **/
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
		specialistDirectoryInquiry.page = value;
		await router.push(
			`/specialist?input=${JSON.stringify(specialistDirectoryInquiry)}`,
			`/specialist?input=${JSON.stringify(specialistDirectoryInquiry)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: specialistDirectoryInquiry });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'pawpal-static-page pawpal-static-page--specialists'}>
			<Stack className={'container'} sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}>
				<SpecialistsHero data={directoryHero} />

				<Stack
					className={'specialist-list-page'}
					sx={{
						padding: device === 'mobile' ? '16px 0 40px' : '28px 0 75px',
						width: '100%',
						alignSelf: 'stretch',
					}}
				>
					<Stack className={'container'}>
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
						<Stack className={'card-wrap'}>
							{agents?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Specialists found!</p>
								</div>
							) : (
								agents.map((specialist: Member) => (
									<SpecialistListCard specialist={specialist} key={specialist._id} onLike={likeMemberHandler} />
								))
							)}
						</Stack>
						<Stack className={'pagination'}>
							<Stack className="pagination-box">
								{agents.length !== 0 && Math.ceil(total / specialistDirectoryInquiry.limit) > 1 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / specialistDirectoryInquiry.limit)}
											onChange={paginationChangeHandler}
											shape="circular"
											color="primary"
											size={device === 'mobile' ? 'small' : 'medium'}
										/>
									</Stack>
								)}
							</Stack>

							{agents.length !== 0 && (
								<Typography component="span" sx={{ mt: '20px', fontSize: 14, color: '#181a20' }}>
									Total {total} specialist{total !== 1 ? 's' : ''} available
								</Typography>
							)}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

SpecialistsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(SpecialistsListPage);
