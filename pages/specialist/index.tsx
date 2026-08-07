import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useDebouncedValue } from '../../libs/hooks/useDebouncedValue';
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
import { likeToastMessage, readWasLiked } from '../../libs/utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../libs/auth';
import { withActionGate } from '../../libs/utils/actionGate';
import SpecialistsFilter from '../../libs/components/specialists/SpecialistsFilter';
import SpecialistListCard from '../../libs/components/specialists/SpecialistListCard';
import SpecialistsCta from '../../libs/components/specialists/SpecialistsCta';
import { PpCardSkeletonGrid } from '../../libs/components/common/PpSkeleton';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import emptyBowl from '../../public/lottie/empty-bowl.json';
import type { PpLottieProps } from '../../libs/components/common/PpLottie';

const PpLottie = dynamic<PpLottieProps>(
	() => import('../../libs/components/common/PpLottie').then((mod) => mod.PpLottie),
	{ ssr: false },
);

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
	const [searchText, setSearchText] = useState<string>('');
	const debouncedSearchText = useDebouncedValue(searchText, 300);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading: agentsLoading, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: specialistDirectoryInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total ?? 0);
		},
	});

	const pageCount = Math.max(1, Math.ceil(total / specialistDirectoryInquiry.limit));
	const searchBusy =
		searchText !== debouncedSearchText || (agentsLoading && agents.length > 0);

	useEffect(() => {
		const nextText = debouncedSearchText.trim();
		setSpecialistDirectoryInquiry((prev) => {
			const prevText = (prev.search?.text ?? '').trim();
			if (nextText === prevText) return prev;
			return {
				...prev,
				page: 1,
				search: { ...prev.search, text: nextText },
			};
		});
	}, [debouncedSearchText]);

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const sortId = e.currentTarget.id;
		setSpecialistDirectoryInquiry((prev) => {
			const next = { ...prev, page: 1 };
			switch (sortId) {
				case 'recent':
					next.sort = 'createdAt';
					next.direction = Direction.DESC;
					setFilterSortName('Newest first');
					break;
				case 'old':
					next.sort = 'createdAt';
					next.direction = Direction.ASC;
					setFilterSortName('Earliest joined');
					break;
				case 'likes':
					next.sort = 'memberLikes';
					next.direction = Direction.DESC;
					setFilterSortName('Most liked');
					break;
				case 'views':
					next.sort = 'memberViews';
					next.direction = Direction.DESC;
					setFilterSortName('Most viewed');
					break;
				default:
					return prev;
			}
			return next;
		});
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const handleSearchEnter = () => {
		const nextText = searchText.trim();
		setSpecialistDirectoryInquiry((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, text: nextText },
		}));
	};

	const paginationChangeHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		setSpecialistDirectoryInquiry((prev) => ({ ...prev, page: value }));
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const likeMemberHandler = async (likeUser: T, id: string) => {
		await withActionGate(`like:member:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, likeUser._id, 'favorite')) return;
				const wasLiked = readWasLiked(agents.find((a) => a._id === id));
				await likeTargetMember({ variables: { input: id } });
				await getAgentsRefetch({ input: specialistDirectoryInquiry });
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'favorite')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.log('ERROR, likeMemberHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	return (
		<Stack className="pawpal-static-page pawpal-static-page--specialists">
			<Stack
				className="container"
				sx={device === 'mobile' ? { px: { xs: 1.5, sm: 2 } } : undefined}
			>
				<Stack className="specialist-list-page">
					<div className="container">
						<header className="specialists-page-header">
							<p className="specialists-page-header__eyebrow">OUR SPECIALISTS</p>
							<h1 className="specialists-page-header__title">Meet our pet care specialists</h1>
						</header>

						<div className="specialist-directory specialist-directory--full">
							<div className="specialist-directory__search">
								<input
									className="specialist-directory__search-input"
									type="search"
									placeholder="Search for a specialist"
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSearchEnter();
									}}
									aria-label="Search for a specialist"
									aria-busy={searchBusy}
								/>
								{searchBusy ? (
									<span className="specialist-directory__search-spinner" aria-hidden />
								) : null}
							</div>

							<div className="specialist-directory__toolbar">
								<h2 className="specialist-directory__count">
									{total} specialist{total !== 1 ? 's' : ''}
								</h2>
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
									hideSearch
								/>
							</div>

							<div
								className={`card-wrap card-wrap--editorial${searchBusy ? ' is-filter-loading' : ''}`}
							>
								{agentsLoading && agents.length === 0 ? (
									<PpCardSkeletonGrid variant="specialist" count={6} bare />
								) : agents.length === 0 ? (
									<div className="no-data">
										<PpLottie src={emptyBowl} loop size={96} />
										<p>No Specialists found!</p>
									</div>
								) : (
									agents.map((specialist: Member, cardIndex: number) => (
										<SpecialistListCard
											specialist={specialist}
											key={specialist._id}
											onLike={likeMemberHandler}
											variant="editorial"
											index={
												cardIndex +
												1 +
												(specialistDirectoryInquiry.page - 1) *
													specialistDirectoryInquiry.limit
											}
										/>
									))
								)}
							</div>

							<Stack className="pagination">
								<Stack className="pagination-box">
									{total > 0 && pageCount > 1 && (
										<Pagination
											className="pp-pagination"
											page={specialistDirectoryInquiry.page}
											count={pageCount}
											onChange={paginationChangeHandler}
											shape="circular"
											color="primary"
											size={device === 'mobile' ? 'small' : 'medium'}
										/>
									)}
								</Stack>
								{total > 0 && (
									<Typography component="span" className="specialist-list-page__total">
										Total {total} specialist{total !== 1 ? 's' : ''} available
									</Typography>
								)}
							</Stack>
						</div>
					</div>
				</Stack>

				<SpecialistsCta data={ctaData} />
			</Stack>
		</Stack>
	);
};

SpecialistsListPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(SpecialistsListPage);
