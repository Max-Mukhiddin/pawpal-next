import Link from 'next/link';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

const CARDS = [
	{
		slug: 'grooming',
		title: 'Grooming',
		description: 'Spa baths, trims, and coat care with a gentle touch.',
		image: '/images/services/service-grooming.jpg',
		href: '/services',
	},
	{
		slug: 'walking',
		title: 'Walking',
		description: 'Daily walks that match your pet’s energy and routine.',
		image: '/images/services/service-walking.jpg',
		href: '/services',
	},
	{
		slug: 'training',
		title: 'Training',
		description: 'Positive coaching for calmer habits at home.',
		image: '/images/services/service-training.jpg',
		href: '/services',
	},
	{
		slug: 'vet',
		title: 'Vet Care',
		description: 'Checkups and trusted support when they need it.',
		image: '/images/services/service-vet.jpg',
		href: '/services',
	},
	{
		slug: 'boarding',
		title: 'Boarding',
		description: 'Comfortable stays with routines they already know.',
		image: '/images/services/service-boarding.jpg',
		href: '/services',
	},
	{
		slug: 'shop',
		title: 'Pet Shop',
		description: 'Curated food, toys, and essentials in one place.',
		image: '/images/services/service-shop.jpg',
		href: '/services',
	},
] as const;

export default function OurServices() {
	return (
		<section
			className="pawpal-home-section our-services"
			aria-labelledby="our-services-title"
		>
			<div className="pawpal-home-section__inner our-services__inner">
				<header className="our-services__head">
					<div className="our-services__intro">
						<p className="our-services__eyebrow">Our services</p>
						<h2 id="our-services-title" className="our-services__title">
							Care your pet will love
						</h2>
						<p className="our-services__support">
							Thoughtfully designed care for every stage of your pet’s life.
						</p>
					</div>
					<Link href="/services" className="our-services__browse">
						<span>Browse all services</span>
						<ArrowForwardOutlinedIcon className="our-services__browse-icon" aria-hidden />
					</Link>
				</header>

				<div className="our-services__surface">
					<div className="our-services__slider">
						<Swiper
							className="our-services-swiper"
							modules={[Navigation, Pagination]}
							speed={480}
							spaceBetween={24}
							slidesPerView={1}
							centeredSlides={false}
							grabCursor
							watchOverflow
							breakpoints={{
								540: {
									slidesPerView: 2,
									spaceBetween: 24,
								},
								900: {
									slidesPerView: 3,
									spaceBetween: 24,
								},
								1200: {
									slidesPerView: 4,
									spaceBetween: 24,
								},
							}}
							navigation={{
								prevEl: '.our-services-swiper-prev',
								nextEl: '.our-services-swiper-next',
							}}
							pagination={{
								el: '.our-services-swiper-pagination',
								clickable: true,
							}}
						>
							{CARDS.map((card) => (
								<SwiperSlide key={card.slug} className="our-services__slide">
									<Link href={card.href} className="our-services__card">
										<div className="our-services__card-media">
											<img
												className="our-services__card-img"
												src={card.image}
												alt=""
											/>
											<span className="our-services__card-action" aria-hidden>
												<NorthEastOutlinedIcon className="our-services__card-action-icon" />
											</span>
											<div className="our-services__card-overlay">
												<h3 className="our-services__card-title">{card.title}</h3>
												<p className="our-services__card-text">{card.description}</p>
											</div>
										</div>
									</Link>
								</SwiperSlide>
							))}
						</Swiper>
					</div>

					<div className="our-services__controls" aria-label="Service carousel controls">
						<button
							type="button"
							className="our-services__nav-btn our-services-swiper-prev"
							aria-label="Previous services"
						>
							<WestIcon className="our-services__nav-icon" aria-hidden />
						</button>
						<div className="our-services-swiper-pagination" />
						<button
							type="button"
							className="our-services__nav-btn our-services-swiper-next"
							aria-label="Next services"
						>
							<EastIcon className="our-services__nav-icon" aria-hidden />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
