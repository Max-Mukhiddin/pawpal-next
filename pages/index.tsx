import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { useScrollAnimation } from '../libs/hooks/useScrollAnimation';
import HeroSection from '../libs/components/homepage/HeroSection';
import TrustMarquee from '../libs/components/homepage/TrustMarquee';
import FeaturedServices from '../libs/components/homepage/FeaturedServices';
import BrandShowcase from '../libs/components/homepage/BrandShowcase';
import WhyPawPal from '../libs/components/homepage/WhyPawPal';
import OurServices from '../libs/components/homepage/OurServices';
import FeaturedProducts from '../libs/components/homepage/FeaturedProducts';
import TopPetSpecialists from '../libs/components/homepage/TopPetSpecialists';
import PetTipsSection from '../libs/components/homepage/PetTipsSection';
import ClosingCTA from '../libs/components/homepage/ui/ClosingCTA';
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
			<div className="pp-hero-stage">
				<HeroSection />
				<TrustMarquee />
			</div>
			<FeaturedServices />
			<BrandShowcase />
			<OurServices />
			<WhyPawPal />
			<FeaturedProducts />
			<TopPetSpecialists />
			<PetTipsSection />
			<ClosingCTA />
		</Stack>
	);
};

export default withLayoutMain(Home);
