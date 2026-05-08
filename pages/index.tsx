import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { useScrollAnimation } from '../libs/hooks/useScrollAnimation';
import HeroSection from '../libs/components/homepage/HeroSection';
import OurServices from '../libs/components/homepage/OurServices';
import FeaturedProducts from '../libs/components/homepage/FeaturedProducts';
import TopPetSpecialists from '../libs/components/homepage/TopPetSpecialists';
import WhyPawPal from '../libs/components/homepage/WhyPawPal';
import PetTipsSection from '../libs/components/homepage/PetTipsSection';
import AppointmentCta from '../libs/components/homepage/AppointmentCta';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	useScrollAnimation();

	return (
		<Stack className={'home-page'}>
			<HeroSection />
			<OurServices />
			<FeaturedProducts />
			<WhyPawPal />
			<TopPetSpecialists />
			<PetTipsSection />
			<AppointmentCta />
		</Stack>
	);
};

export default withLayoutMain(Home);
