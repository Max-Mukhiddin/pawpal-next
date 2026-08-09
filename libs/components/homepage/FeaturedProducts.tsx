import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { LIKE_TARGET_LISTING } from '../../../apollo/user/mutation';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { likeToastMessage, readWasLiked } from '../../utils/likeToastMessage';
import { handleLikeMutationAuthError, requireSignIn, handleSignInRequiredError } from '../../auth';
import { withActionGate } from '../../utils/actionGate';
import ProductCard from '../products/ProductCard';

const FALLBACK_PRODUCTS: Product[] = [
	{
		_id: 'fp-1',
		listingTitle: 'Pro Grooming Brush Set',
		listingPrice: 49000,
		listingImages: ['/img/listing/junho_groom_brush.jpg'],
		listingDesc: 'A complete grooming kit with a slicker brush, comb and de-shedding tool.',
	} as Product,
	{
		_id: 'fp-2',
		listingTitle: '10m Long Training Lead',
		listingPrice: 63000,
		listingImages: ['/img/listing/minjun_trainer_leash.jpg'],
		listingDesc: 'Durable 10-metre lead for recall and obedience training.',
	} as Product,
	{
		_id: 'fp-3',
		listingTitle: 'Dental Care Starter Kit',
		listingPrice: 56000,
		listingImages: ['/img/listing/haerin_vet_dental_kit.jpg'],
		listingDesc: 'Brush, paste and dental chews for fresh breath and clean teeth.',
	} as Product,
	{
		_id: 'fp-4',
		listingTitle: 'Interactive Puzzle Feeder',
		listingPrice: 32000,
		listingImages: ['/img/listing/jiwoo_catcare_puzzle.jpg'],
		listingDesc: 'Slow-feed puzzle bowl that keeps curious pets engaged.',
	} as Product,
	{
		_id: 'fp-5',
		listingTitle: 'Cozy Orthopedic Pet Bed',
		listingPrice: 78000,
		listingImages: ['/img/listing/jiwoo_catcare_scratcher.jpg'],
		listingDesc: 'Memory-foam bed that cushions joints for restful sleep.',
	} as Product,
];

const AUTO_SCROLL_SPEED = 1.2;
const DRAG_THRESHOLD = 8;

export default function FeaturedProducts() {
	const { t } = useTranslation('common');
	const router = useRouter();
	const variables = useMemo(
		() => ({
			input: {
				page: 1,
				limit: 8,
				sort: 'createdAt',
				direction: 'DESC',
				search: { typeList: [ListingType.PRODUCT] },
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
		sectionSelector: '.pp-products',
		deps: [data],
	});

	const listings: Listing[] = data?.getListings?.list ?? [];
	const products: Product[] = listings.length > 0 ? listings : FALLBACK_PRODUCTS;

	const likeProductHandler = async (user: T, id: string) => {
		await withActionGate(`like:listing:${id}`, async () => {
			try {
				if (!id) return;
				if (requireSignIn(router, user._id, 'like')) return;
				const wasLiked = readWasLiked(products.find((p) => p._id === id));
				await likeTargetListing({ variables: { input: id } });
				await refetch(variables);
				await sweetTopSmallSuccessAlert(likeToastMessage(wasLiked), 800);
			} catch (err: any) {
				if (handleSignInRequiredError(err, router, 'like')) return;
				if (await handleLikeMutationAuthError(err, router)) return;
				console.log('ERROR likeProductHandler:', err.message);
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
	}, [recalcBounds, products.length]);

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
		<section className="pp-products pp-section" aria-labelledby="our-products-title">
			<div className="pp-container pp-products__inner">
				<div className="pp-products__aside" data-section-reveal="header">
					<span className="pp-eyebrow">{t('featuredProducts.eyebrow')}</span>
					<h2 id="our-products-title" className="pp-heading pp-products__title">
						{t('featuredProducts.heading')}
					</h2>
					<p className="pp-subtitle">{t('featuredProducts.subtitle')}</p>
					<Link href="/product" className="pp-btn pp-btn--primary pp-products__browse" data-section-reveal="cta">
						{t('featuredProducts.browseAll')}
						<ArrowForwardOutlinedIcon aria-hidden />
					</Link>
				</div>

				<div
					ref={viewportRef}
					className="pp-products__viewport"
					onPointerDown={handlePointerDown}
					onClickCapture={handleClickCapture}
				>
					<div ref={trackRef} className="pp-products__track">
						{products.map((product) => (
							<ProductCard
								key={product._id}
								product={product}
								onLike={likeProductHandler}
								className="pp-product-card--rail"
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
