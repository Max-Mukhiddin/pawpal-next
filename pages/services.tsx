import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutFull from '../libs/components/layout/LayoutFull';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SERVICES_PAGE_MOCK } from '../libs/data/services/servicesPage.mock';
import type { ServicesPageData } from '../libs/types/services/services.page';
import ServicesHero from '../libs/components/services/ServicesHero';
import ServiceCategories from '../libs/components/services/ServiceCategories';
import FeaturedServices from '../libs/components/services/FeaturedServices';
import ServicePackages from '../libs/components/services/ServicePackages';
import ServiceFaq from '../libs/components/services/ServiceFaq';
import ServiceBenefits from '../libs/components/services/ServiceBenefits';
import ServicesCta from '../libs/components/services/ServicesCta';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ServicesPage: NextPage = () => {
	/** STATE **/
	/** Swap mock for `setPageData(mapServicesPageQuery(data))` when Apollo is wired. */
	const [pageData] = useState<ServicesPageData>(() => SERVICES_PAGE_MOCK);

	/** APOLLO REQUESTS **/
	// const { data, loading, error, refetch } = useQuery(GET_SERVICES_PAGE, { fetchPolicy: 'network-only' });

	/** LIFECYCLES **/
	useEffect(() => {
		// Future: map query result into pageData when `data` changes.
	}, []);

	/** HANDLERS **/
	// Future: hero CTAs, featured card actions, package CTAs, bottom CTA — router.push, modals, or mutations.

	return (
		<Stack className="pawpal-static-page pawpal-static-page--services">
			<Stack className="container">
				<ServicesHero data={pageData.hero} />
				<ServiceCategories block={pageData.categories.block} items={pageData.categories.items} />
				<FeaturedServices block={pageData.featured.block} items={pageData.featured.items} />
				<ServicePackages block={pageData.packages.block} items={pageData.packages.items} />
				<ServiceFaq data={pageData.faq} />
				<ServiceBenefits block={pageData.benefits.block} items={pageData.benefits.items} />
				<ServicesCta data={pageData.cta} />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(ServicesPage);
