import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import { REACT_APP_API_URL } from '../../config';
import type { Listing } from '../../types/listing/listing';

const CARDS = [
	{
		slug: 'grooming',
		title: 'Grooming',
		description: 'Spa baths, trims, and coat care with a gentle touch.',
		image: '/images/services/service-grooming.jpg',
		href: '/service',
	},
	{
		slug: 'walking',
		title: 'Walking',
		description: 'Daily walks that match your pet’s energy and routine.',
		image: '/images/services/service-walking.jpg',
		href: '/service',
	},
	{
		slug: 'training',
		title: 'Training',
		description: 'Positive coaching for calmer habits at home.',
		image: '/images/services/service-training.jpg',
		href: '/service',
	},
	{
		slug: 'vet',
		title: 'Vet Care',
		description: 'Checkups and trusted support when they need it.',
		image: '/images/services/service-vet.jpg',
		href: '/service',
	},
	{
		slug: 'boarding',
		title: 'Boarding',
		description: 'Comfortable stays with routines they already know.',
		image: '/images/services/service-boarding.jpg',
		href: '/service',
	},
	{
		slug: 'shop',
		title: 'Pet Shop',
		description: 'Curated food, toys, and essentials in one place.',
		image: '/images/services/service-shop.jpg',
		href: '/service',
	},
] as const;

export default function OurServices() {
	const variables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: 'DESC',
				search: { typeList: [ListingType.SERVICE] },
			},
		}),
		[],
	);

	const { data } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const listings: Listing[] = data?.getListings?.list ?? [];

	const getBackendImage = (img?: string) => (img ? `${REACT_APP_API_URL}/${img}` : '');

	const cards =
		listings.length > 0
			? listings.map((listing) => {
					const raw = listing.listingImages?.[0];
					const imageUrl = raw ? getBackendImage(raw) : '';
					return {
						slug: listing._id,
						title: listing.listingTitle,
						description: `$${listing.listingPrice ?? 0}`,
						image: imageUrl,
						href: `/service/detail?id=${listing._id}`,
					};
				})
			: CARDS;

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
					<Link href="/service" className="our-services__browse">
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
								640: {
									slidesPerView: 2,
									spaceBetween: 24,
								},
								1024: {
									slidesPerView: 3,
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
							{cards.map((card) => {
								const hasImage = Boolean(card.image && String(card.image).trim() !== '');
								return (
									<SwiperSlide key={card.slug} className="our-services__slide">
										<Link href={card.href} className="our-services__card">
											<div
												className="our-services__card-media"
												style={{
													backgroundImage: hasImage
														? `url(${card.image})`
														: 'linear-gradient(135deg, #E07B3A 0%, #c9622a 100%)',
													backgroundSize: 'cover',
													backgroundPosition: 'center',
													backgroundRepeat: 'no-repeat',
												}}
											>
												<span className="our-services__card-action" aria-hidden>
													<NorthEastOutlinedIcon className="our-services__card-action-icon" />
												</span>
												<div
													className={
														hasImage
															? 'our-services__card-overlay'
															: 'our-services__card-overlay our-services__card-overlay--gradient'
													}
												>
													<h3
														className={
															hasImage
																? 'our-services__card-title'
																: 'our-services__card-title our-services__card-title--prominent'
														}
													>
														{card.title}
													</h3>
													<p
														className={
															hasImage
																? 'our-services__card-text'
																: 'our-services__card-text our-services__card-text--on-gradient'
														}
													>
														{card.description}
													</p>
												</div>
											</div>
										</Link>
									</SwiperSlide>
								);
							})}
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
