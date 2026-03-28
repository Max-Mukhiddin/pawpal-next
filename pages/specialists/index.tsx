import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { SPECIALISTS_PAGE_MOCK } from '../../libs/data/specialists/specialistsPage.mock';
import type { SpecialistsPageData } from '../../libs/types/specialists/specialists.page';
import SpecialistsHero from '../../libs/components/specialists/SpecialistsHero';
import SpecialistsFilter from '../../libs/components/specialists/SpecialistsFilter';
import SpecialistListCard from '../../libs/components/specialists/SpecialistListCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SpecialistsListPage: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [pageData] = useState<SpecialistsPageData>(() => SPECIALISTS_PAGE_MOCK);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Newest first');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else router.replace(`/specialists?input=${JSON.stringify(searchFilter)}`, `/specialists?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
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
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Newest first');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Earliest joined');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Most liked');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Most viewed');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/specialists?input=${JSON.stringify(searchFilter)}`, `/specialists?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
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

			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>SPECIALISTS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'pawpal-static-page pawpal-static-page--specialists'}>
				<Stack className={'container'}>
					<SpecialistsHero data={pageData.hero} />

					<Stack className={'agent-list-page'} sx={{ padding: '28px 0 75px', width: '100%', alignSelf: 'stretch' }}>
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
									{agents.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
										<Stack className="pagination-box">
											<Pagination
												page={currentPage}
												count={Math.ceil(total / searchFilter.limit)}
												onChange={paginationChangeHandler}
												shape="circular"
												color="primary"
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
	}
};

SpecialistsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(SpecialistsListPage);
