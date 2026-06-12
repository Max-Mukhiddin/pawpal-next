import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../../../apollo/user/query';
import { ListingType } from '../../enums/listing.enum';
import type { Listing } from '../../types/listing/listing';
import { resolveListingImageUrl } from '../../utils/mediaUrl';

interface ProductCard {
    _id: string;
    title: string;
    price: number;
    image: string;
    href: string;
}

const FALLBACK_PRODUCTS: ProductCard[] = [
    { _id: 'fp-1', title: 'Pro Grooming Brush Set', price: 49, image: '/images/products/product-brush.jpg', href: '/product' },
    { _id: 'fp-2', title: '10m Long Training Lead', price: 63, image: '/images/products/product-lead.jpg', href: '/product' },
    { _id: 'fp-3', title: 'Dental Care Starter Kit', price: 56, image: '/images/products/product-dental.jpg', href: '/product' },
    { _id: 'fp-4', title: 'Interactive Puzzle Feeder', price: 32, image: '/images/products/product-feeder.jpg', href: '/product' },
];

const formatPrice = (price: number): string =>
    `₩${Number(price).toLocaleString('ko-KR')}`;

export default function FeaturedProducts() {
    const variables = useMemo(
        () => ({
            input: {
                page: 1,
                limit: 4,
                sort: 'listingViews',
                direction: 'DESC',
                search: { typeList: [ListingType.PRODUCT] },
            },
        }),
        [],
    );

    const { data } = useQuery(GET_LISTINGS, {
        variables,
        fetchPolicy: 'cache-and-network',
    });

    const listings: Listing[] = data?.getListings?.list ?? [];

    const cards: ProductCard[] = listings.length >= 4
        ? listings.slice(0, 4).map((l) => ({
                _id: l._id,
                title: l.listingTitle,
                price: (l as any).listingPrice ?? 0,
                image: l.listingImages?.[0] ?? '',
                href: `/product/detail?id=${l._id}`,
            }))
        : FALLBACK_PRODUCTS;

    return (
        <section className="featured-products animate-on-scroll" aria-labelledby="featured-products-title">
            <div className="featured-products__shapes" aria-hidden>
                <span className="featured-products__shape featured-products__shape--1" />
                <span className="featured-products__shape featured-products__shape--2" />
                <span className="featured-products__shape featured-products__shape--3" />
            </div>
            <div className="featured-products__container">
                <header className="featured-products__header">
                    <p className="featured-products__label">OUR PRODUCTS</p>
                    <h2 id="featured-products-title" className="featured-products__title">
                        Everything your pet needs
                    </h2>
                    <p className="featured-products__subtitle">
                        From nutrition to comfort, discover quality picks trusted by PawPal families.
                    </p>
                </header>

                <div className="featured-products__grid">
                    {cards.map((card, index) => {
                        const imageUrl = resolveListingImageUrl(card.image, '/img/listing/default-listing.webp');
                        return (
                            <Link
                                href={card.href}
                                className={`featured-products__card featured-products__card--${index + 1}`}
                                key={card._id}
                            >
                                <span className="featured-products__rotated-title">{card.title}</span>
                                <div className="featured-products__media">
                                    <img
                                        src={imageUrl}
                                        alt={card.title}
                                        className="featured-products__img"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = '/img/listing/default-listing.webp';
                                        }}
                                    />
                                </div>
                                <p className="featured-products__price">{formatPrice(card.price)}</p>
                                <span className="featured-products__cta">View Product</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Centered Footer Button matching image_adeae5.jpg layout */}
                <div className="featured-products__footer">
                    <Link href="/product" className="featured-products__browse-btn">
                        <span>Browse all products</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}