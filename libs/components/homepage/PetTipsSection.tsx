import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';

interface ArticleCard {
    id: string;
    category: string;
    title: string;
    excerpt: string;
    meta: string;
    image: string;
    href: string;
}

const FALLBACK_ARTICLES: ArticleCard[] = [
    {
        id: 'fb-1',
        category: 'Grooming',
        title: 'How to prepare your pet for grooming',
        excerpt: 'A calm, step-by-step routine to make grooming day safer, cleaner, and less stressful for your pet.',
        meta: '7 min read',
        image: '/images/services/service-grooming.jpg',
        href: '/community',
    },
    {
        id: 'fb-2',
        category: 'Activity',
        title: '5 signs your dog needs more daily activity',
        excerpt: 'Learn the everyday behavior cues that suggest your dog needs more movement, play, and stimulation.',
        meta: '5 min read',
        image: '/images/services/service-walking.jpg',
        href: '/community',
    },
    {
        id: 'fb-3',
        category: 'Nutrition',
        title: 'Choosing the right food for indoor cats',
        excerpt: 'A simple guide to balanced indoor nutrition, portion habits, and ingredient labels worth checking.',
        meta: '6 min read',
        image: '/images/services/service-vet.jpg',
        href: '/community',
    },
];

function formatCategory(category: string | undefined | null): string {
    if (!category) return 'Tips';
    const raw = String(category).toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function estimateReadTime(content: string | undefined | null): string {
    if (!content) return '5 min read';
    const plain = String(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plain) return '5 min read';
    const words = plain.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}

function makeExcerpt(content: string | undefined | null, max = 110): string {
    if (!content) return '';
    const plain = String(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plain) return '';
    if (plain.length <= max) return plain;
    return `${plain.slice(0, max).trimEnd()}…`;
}

function resolveArticleImage(imagePath: string | undefined | null, fallback: string): string {
    if (!imagePath?.trim()) return fallback;
    const clean = String(imagePath).replace(/^\/+/, '');
    if (clean.startsWith('http')) return clean;
    if (clean.startsWith('uploads/')) return `${REACT_APP_API_URL}/${clean}`;
    return `${REACT_APP_API_URL}/uploads/article/${clean}`;
}

const ARTICLES_QUERY_VARS = {
    input: {
        page: 1,
        limit: 3,
        sort: 'createdAt',
        direction: Direction.DESC,
        search: {},
    },
};

export default function PetTipsSection() {
    const { data } = useQuery(GET_BOARD_ARTICLES, {
        variables: ARTICLES_QUERY_VARS,
        fetchPolicy: 'cache-and-network',
    });

    const articles: ArticleCard[] = useMemo(() => {
        const list = data?.getBoardArticles?.list;
        if (!list || list.length === 0) return FALLBACK_ARTICLES;

        return list.slice(0, 3).map((a: any) => ({
            id: a._id,
            category: formatCategory(a.articleCategory),
            title: a.articleTitle ?? 'Untitled article',
            excerpt: makeExcerpt(a.articleContent),
            meta: estimateReadTime(a.articleContent),
            image: resolveArticleImage(a.articleImage, '/images/services/service-grooming.jpg'),
            href: `/community/detail?id=${a._id}`,
        }));
    }, [data]);

    return (
        <section className="section-pawpal pet-tips-pawpal" aria-labelledby="pawpal-home-tips-title">
            <div className="pet-tips-pawpal__bg-blob pet-tips-pawpal__bg-blob--1"></div>
            <div className="pet-tips-pawpal__bg-blob pet-tips-pawpal__bg-blob--2"></div>

            <div className="section-container pet-tips-pawpal__inner">
                <header className="section-header">
                    <div className="pet-tips-pawpal__intro">
                        <p className="section-label">LATEST ARTICLES</p>
                        <h2 id="pawpal-home-tips-title" className="section-title">
                            Tips &amp; Stories For Pet Parents
                        </h2>
                        <p className="section-subtitle">
                            Practical reads from grooming, activity, and nutrition experts to support better daily care.
                        </p>
                    </div>
                    <Link href="/community" className="section-action">
                        <span>View all articles</span>
                        <ArrowForwardOutlinedIcon className="pet-tips-pawpal__browse-icon" aria-hidden />
                    </Link>
                </header>

                <div className="pet-tips-pawpal__grid">
                    {articles.map((article) => (
                        <article key={article.id} className="pet-tips-pawpal__card">
                            <Link
                                href={article.href}
                                className="pet-tips-pawpal__card-inner"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="pet-tips-pawpal__media">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="pet-tips-pawpal__img"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/services/service-grooming.jpg';
                                        }}
                                    />
                                    <span className="pet-tips-pawpal__chip">{article.category}</span>
                                </div>
                                <div className="pet-tips-pawpal__body">
                                    <h3 className="pet-tips-pawpal__card-title">{article.title}</h3>
                                    <p className="pet-tips-pawpal__excerpt">{article.excerpt}</p>
                                    <div className="pet-tips-pawpal__meta-row">
                                        <span className="pet-tips-pawpal__meta">{article.meta}</span>
                                        <span className="pet-tips-pawpal__read">
                                            <span>Read article</span>
                                            <ArrowForwardOutlinedIcon className="pet-tips-pawpal__read-icon" aria-hidden />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}