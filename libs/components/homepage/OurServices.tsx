import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface ServiceCard {
	_id: string;
	title: string;
	price: number;
	image: string;
	href: string;
}

const FALLBACK_CARDS: ServiceCard[] = [
	{ _id: 'fb-1', title: 'Wellness Check', price: 120000, image: '/images/services/service-vet.jpg', href: '/service' },
	{ _id: 'fb-2', title: 'Elite Grooming', price: 150000, image: '/images/services/service-grooming.jpg', href: '/service' },
	{ _id: 'fb-3', title: 'Spa Retreat', price: 250000, image: '/images/services/service-spa.jpg', href: '/service' },
	{ _id: 'fb-4', title: 'Luxury Boarding', price: 300000, image: '/images/services/service-boarding.jpg', href: '/service' },
	{ _id: 'fb-5', title: 'Daily Walks', price: 50000, image: '/images/services/service-walking.jpg', href: '/service' },
	{ _id: 'fb-6', title: 'Training Class', price: 85000, image: '/images/services/service-training.jpg', href: '/service' },
];

const formatPrice = (price: number): string => `₩${price.toLocaleString('en-US')}`;
const AUTO_SCROLL_SPEED = 1.2; // pixels per frame at 60fps (~72px/sec)
const DRAG_THRESHOLD = 8; // pixels before we treat it as a drag (not click)

export default function OurServices() {
	const variables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 8,
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

	const cards: ServiceCard[] = listings.length > 0
		? listings.map((listing) => ({
				_id: listing._id,
				title: listing.listingTitle,
				price: listing.listingPrice ?? 0,
				image: listing.listingImages?.[0] ?? '',
				href: `/service/detail?id=${listing._id}`,
			}))
		: FALLBACK_CARDS;

	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const offsetRef = useRef(0);
	const directionRef = useRef(-1); // -1 = moving left, +1 = moving right
	const isDraggingRef = useRef(false);
	const isPausedRef = useRef(false);
	const didDragRef = useRef(false);
	const dragStartXRef = useRef(0);
	const dragStartOffsetRef = useRef(0);
	const boundsRef = useRef({ min: 0, max: 0 });

	const recalcBounds = useCallback(() => {
		if (!trackRef.current || !viewportRef.current) {
			boundsRef.current = { min: 0, max: 0 };
			return;
		}
		const trackWidth = trackRef.current.scrollWidth;
		const viewportWidth = viewportRef.current.clientWidth;
		const min = -Math.max(0, trackWidth - viewportWidth);
		boundsRef.current = { min, max: 0 };
	}, []);

	const applyOffset = useCallback((next: number) => {
		offsetRef.current = next;
		if (trackRef.current) {
			trackRef.current.style.transform = `translate3d(${next}px, 0, 0)`;
		}
	}, []);

	// Recalculate bounds on mount, when cards change, and on resize.
	useEffect(() => {
		// Defer one frame so layout has settled.
		const rafId = requestAnimationFrame(() => recalcBounds());
		window.addEventListener('resize', recalcBounds);
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', recalcBounds);
		};
	}, [recalcBounds, cards.length]);

	// Continuous auto-scroll loop with ping-pong direction reversal.
	useEffect(() => {
		let frameId: number;

		const tick = () => {
			if (!isDraggingRef.current && !isPausedRef.current) {
				const { min, max } = boundsRef.current;
				if (min < 0) {
					let next = offsetRef.current + directionRef.current * AUTO_SCROLL_SPEED;
					if (next <= min) {
						next = min;
						directionRef.current = 1;
					} else if (next >= max) {
						next = max;
						directionRef.current = -1;
					}
					applyOffset(next);
				}
			}
			frameId = requestAnimationFrame(tick);
		};

		frameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameId);
	}, [applyOffset]);

	// Drag uses window-level listeners so it never gets stuck if the
	// cursor leaves the viewport mid-drag.
	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;

		isDraggingRef.current = true;
		didDragRef.current = false;
		dragStartXRef.current = e.clientX;
		dragStartOffsetRef.current = offsetRef.current;

		const onMove = (ev: PointerEvent) => {
			if (!isDraggingRef.current) return;
			const delta = ev.clientX - dragStartXRef.current;
			if (Math.abs(delta) >= DRAG_THRESHOLD) {
				didDragRef.current = true;
				const { min, max } = boundsRef.current;
				const next = Math.max(min, Math.min(max, dragStartOffsetRef.current + delta));
				applyOffset(next);
			}
		};

		const onUp = () => {
			isDraggingRef.current = false;
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
	};

	// Block the click ONLY if a real drag happened. Pure clicks navigate.
	const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
		if (didDragRef.current) {
			e.preventDefault();
			e.stopPropagation();
			// Reset after this event so the next click works.
			setTimeout(() => {
				didDragRef.current = false;
			}, 0);
		}
	};

	return (
		<section className="our-services animate-on-scroll" aria-labelledby="our-services-title">
			<div className="our-services__shapes" aria-hidden>
				<div className="our-services__shape our-services__shape--1" />
				<div className="our-services__shape our-services__shape--2" />
				<div className="our-services__shape our-services__shape--3" />
			</div>

			<div className="our-services__container">
				<header className="our-services__header">
					<p className="our-services__label">OUR SERVICES</p>
					<h2 id="our-services-title" className="our-services__title">
						Experience the Pinnacle of Pet Care
					</h2>
				</header>

				<div
					ref={viewportRef}
					className="our-services__viewport"
					onPointerDown={handlePointerDown}
					onClickCapture={handleClickCapture}
					onMouseEnter={() => {
						isPausedRef.current = true;
					}}
					onMouseLeave={() => {
						isPausedRef.current = false;
					}}
				>
					<div ref={trackRef} className="our-services__track">
						{cards.map((card) => {
							const imageUrl = resolveListingImageUrl(card.image, '/img/listing/default-listing.webp');
							return (
								<div className="our-services__slide" key={card._id}>
									<Link href={card.href} className="our-services__card" draggable={false}>
										<img
											src={imageUrl}
											alt={card.title}
											className="our-services__card-img"
											loading="lazy"
											draggable={false}
											onError={(e) => {
												e.currentTarget.src = '/img/listing/default-listing.webp';
											}}
										/>
										<div className="our-services__card-content">
											<h3 className="our-services__card-title">{card.title}</h3>
											<p className="our-services__card-price">{formatPrice(card.price)}</p>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				</div>

				<div className="our-services__cta">
					<Link href="/service" className="our-services__browse-btn">
						<span>Browse all services</span>
						<ArrowForwardOutlinedIcon className="our-services__browse-icon" aria-hidden />
					</Link>
				</div>
			</div>
		</section>
	);
}
