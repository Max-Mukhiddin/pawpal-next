import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutFull from '../libs/components/layout/LayoutFull';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SPECIALISTS_PAGE_MOCK } from '../libs/data/specialists/specialistsPage.mock';
import type { SpecialistListItem, SpecialistsPageData } from '../libs/types/specialists/specialists.page';
import SpecialistsHero from '../libs/components/specialists/SpecialistsHero';
import SpecialistsList from '../libs/components/specialists/SpecialistsList';
import FeaturedSpecialist from '../libs/components/specialists/FeaturedSpecialist';
import SpecialistsCta from '../libs/components/specialists/SpecialistsCta';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SpecialistsPage: NextPage = () => {
	/** STATE **/
	/** Swap mock for `setPageData(mapSpecialistsPageQuery(data))` when Apollo is wired. */
	const [pageData] = useState<SpecialistsPageData>(() => SPECIALISTS_PAGE_MOCK);

	/** APOLLO REQUESTS **/
	// const { data, loading, error, refetch } = useQuery(GET_SPECIALISTS_PAGE, { fetchPolicy: 'network-only' });

	/** LIFECYCLES **/
	useEffect(() => {
		// Future: map query result into pageData when `data` changes.
	}, []);

	/** HANDLERS **/
	const handleSpecialistRowClick = useCallback((_member: SpecialistListItem) => {
		// Navigate to profile or open detail
	}, []);

	const handleConsultationRequest = useCallback(() => {
		// CTA / booking flow
	}, []);

	return (
		<Stack className="pawpal-static-page pawpal-static-page--specialists">
			<Stack className="container">
				<SpecialistsHero data={pageData.hero} />
				<SpecialistsList data={pageData.listing} />
				<FeaturedSpecialist data={pageData.featured} />
				<SpecialistsCta data={pageData.cta} />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(SpecialistsPage);
