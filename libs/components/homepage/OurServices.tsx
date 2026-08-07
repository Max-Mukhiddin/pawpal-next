import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import type { Service } from '../../types/services/service';
import { T } from '../../types/common';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { likeToastMessage, readWasLiked } from '../../utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../auth';
import { withActionGate } from '../../utils/actionGate';
import ServiceCard from '../services/ServiceCard';

const FALLBACK_SERVICES: Service[] = [
	{ _id: 'fb-1', listingTitle: 'Wellness Check', listingPrice: 120000, listingImages: ['/images/services/service-vet.jpg'], listingDesc: 'A thorough wellness exam with a licensed veterinarian.', durationMinutes: 45 } as Service,
	{ _id: 'fb-2', listingTitle: 'Elite Grooming', listingPrice: 150000, listingImages: ['/images/services/service-grooming.jpg'], listingDesc: 'Full-service grooming with organic shampoos and styling.', durationMinutes: 60 } as Service,
	{ _id: 'fb-3', listingTitle: 'Spa Retreat', listingPrice: 250000, listingImages: ['/images/services/service-grooming.jpg'], listingDesc: 'Relaxing spa day with aromatherapy and coat conditioning.', durationMinutes: 90 } as Service,
	{ _id: 'fb-4', listingTitle: 'Luxury Boarding', listingPrice: 300000, listingImages: ['/images/services/service-boarding.jpg'], listingDesc: 'Premium overnight care in a calm, supervised environment.', durationMinutes: null } as Service,
	{ _id: 'fb-5', listingTitle: 'Daily Walks', listingPrice: 50000, listingImages: ['/images/services/service-walking.jpg'], listingDesc: 'Scheduled walks tailored to your pet energy level.', durationMinutes: 30 } as Service,
	{ _id: 'fb-6', listingTitle: 'Training Class', listingPrice: 85000, listingImages: ['/images/services/service-training.jpg'], listingDesc: 'Positive-reinforcement training for better behavior at home.', durationMinutes: 60 } as Service,
];

const AUTO_SCROLL_SPEED = 1.2;
const DRAG_THRESHOLD = 8;

export default function OurServices() {
	const router = useRouter();
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

	const { data, refetch } = useQuery(GET_LISTINGS, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const [likeTargetListing] = useMutation(LIKE_TARGET_LISTING);

	useAnimeSectionReveal({
		sectionSelector: '.pp-services',
		deps: [data],
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const services: Service[] = listings.length > 0 ? listings : FALLBACK_SERVICES;

	const likeServiceHandler = async (user: T, id: string) => {
		await withActionGate(`like:listing:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'like')) return;
				const wasLiked = readWasLiked(services.find((s) => s._id === id));
				await likeTargetListing({ variables: { input: id } });
				await refetch(variables);
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'like')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.log('ERROR likeServiceHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		});
	};

	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const offsetRef = useRef(0);
	const directionRef = useRef(-1);
	const isDraggingRef = useRef(false);
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

	useEffect(() => {
		const rafId = requestAnimationFrame(() => recalcBounds());
		window.addEventListener('resize', recalcBounds);
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', recalcBounds);
		};
	}, [recalcBounds, services.length]);

	useEffect(() => {
		let frameId: number;

		const tick = () => {
			if (!isDraggingRef.current) {
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

	const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
		if (didDragRef.current) {
			e.preventDefault();
			e.stopPropagation();
			setTimeout(() => {
				didDragRef.current = false;
			}, 0);
		}
	};

	return (
		<section className="pp-services pp-section" aria-labelledby="our-services-title">
			<div className="pp-container pp-services__inner">
				<div className="pp-services__aside" data-section-reveal="header">
					<span className="pp-eyebrow">Our services</span>
					<h2 id="our-services-title" className="pp-heading pp-services__title">
						Everything your pet needs, in one place
					</h2>
					<p className="pp-subtitle">
						Grooming, wellness, boarding and training — each booked through a vetted
						specialist who treats your pet like their own.
					</p>
					<Link
						href="/service"
						className="pp-btn pp-btn--primary pp-services__browse"
						data-section-reveal="cta"
					>
						Browse all services
						<ArrowForwardOutlinedIcon aria-hidden />
					</Link>
				</div>

				<div
					ref={viewportRef}
					className="pp-services__viewport"
					onPointerDown={handlePointerDown}
					onClickCapture={handleClickCapture}
				>
					<div ref={trackRef} className="pp-services__track">
						{services.map((service) => (
							<ServiceCard
								key={service._id}
								service={service}
								onLike={likeServiceHandler}
								className="services-list-card--rail"
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
