import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { useAnimeSectionReveal } from '../../hooks/useAnimeSectionReveal';
import ArticleHoverCard from '../articles/ArticleHoverCard';
import {
	formatArticleCategory,
	formatArticleDate,
	makeArticleExcerpt,
	resolveArticleImage,
} from '../../utils/articleCardHelpers';

interface ArticleCard {
	id: string;
	category: string;
	title: string;
	excerpt: string;
	dateLabel: string;
	image: string;
	href: string;
}

const FALLBACK_ARTICLES: ArticleCard[] = [
	{
		id: 'fb-1',
		category: 'Grooming',
		title: 'How to prepare your pet for grooming',
		excerpt:
			'A calm, step-by-step routine to make grooming day safer, cleaner, and less stressful for your pet.',
		dateLabel: 'Mar 8, 2026',
		image: '/images/services/service-grooming.jpg',
		href: '/blog',
	},
	{
		id: 'fb-2',
		category: 'Activity',
		title: '5 signs your dog needs more daily activity',
		excerpt:
			'Learn the everyday behavior cues that suggest your dog needs more movement, play, and stimulation.',
		dateLabel: 'Feb 22, 2026',
		image: '/images/services/service-walking.jpg',
		href: '/blog',
	},
	{
		id: 'fb-3',
		category: 'Nutrition',
		title: 'Choosing the right food for indoor cats',
		excerpt:
			'A simple guide to balanced indoor nutrition, portion habits, and ingredient labels worth checking.',
		dateLabel: 'Feb 14, 2026',
		image: '/images/services/service-vet.jpg',
		href: '/blog',
	},
	{
		id: 'fb-4',
		category: 'Wellness',
		title: 'When to book your pet’s annual check-up',
		excerpt:
			'A practical timeline for vaccines, dental checks, and senior screenings so nothing gets missed.',
		dateLabel: 'Jan 30, 2026',
		image: '/images/services/service-vet.jpg',
		href: '/blog',
	},
];

const ARTICLE_IMAGE_FALLBACK = '/img/community/articleImg.png';

const ARTICLES_QUERY_VARS = {
	input: {
		page: 1,
		limit: 2,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default function PetTipsSection() {
	const { t } = useTranslation('common');
	const { data } = useQuery(GET_BOARD_ARTICLES, {
		variables: ARTICLES_QUERY_VARS,
		fetchPolicy: 'cache-and-network',
	});

	useAnimeSectionReveal({
		sectionSelector: '.pp-tips',
		deps: [data],
	});

	const articles: ArticleCard[] = useMemo(() => {
		const list = data?.getBoardArticles?.list;
		if (!list || list.length === 0) return FALLBACK_ARTICLES;

		const mapped: ArticleCard[] = list.slice(0, 2).map((a: any) => ({
			id: a._id,
			category: formatArticleCategory(a.articleCategory),
			title: a.articleTitle ?? 'Untitled article',
			excerpt: makeArticleExcerpt(a.articleContent),
			dateLabel:
				formatArticleDate(a.createdAt) ??
				formatArticleDate(a.updatedAt) ??
				'Recent',
			image: resolveArticleImage(a.articleImage, ARTICLE_IMAGE_FALLBACK),
			href: `/blog/detail?id=${a._id}`,
		}));

		if (mapped.length < 2) {
			const fillers = FALLBACK_ARTICLES.filter(
				(f) => !mapped.some((m) => m.id === f.id || m.title === f.title),
			);
			return [...mapped, ...fillers].slice(0, 2);
		}

		return mapped;
	}, [data]);

	return (
		<section className="pp-tips pp-section" aria-labelledby="pawpal-home-tips-title">
			<div className="pp-container pp-tips__content">
				<header className="pp-tips__header" data-section-reveal="header">
					<span className="pp-tips__eyebrow">{t('petTips.eyebrow')}</span>
					<div className="pp-tips__head-row">
						<div className="pp-tips__head-copy">
							<h2 id="pawpal-home-tips-title" className="pp-tips__heading">
								{t('petTips.heading')}
							</h2>
							<p className="pp-tips__subtext">{t('petTips.subtitle')}</p>
						</div>
						<Link
							href="/blog"
							className="pp-btn pp-btn--primary pp-tips__view-all"
							data-section-reveal="cta"
						>
							{t('petTips.viewAll')}
						</Link>
					</div>
				</header>

				<div className="pp-tips__grid pp-article-card-grid">
					{articles.map((article) => (
						<ArticleHoverCard
							key={article.id}
							href={article.href}
							category={article.category}
							dateLabel={article.dateLabel}
							title={article.title}
							excerpt={article.excerpt}
							image={article.image}
							imageFallback={ARTICLE_IMAGE_FALLBACK}
							scrollReveal
						/>
					))}
				</div>
			</div>
		</section>
	);
}
