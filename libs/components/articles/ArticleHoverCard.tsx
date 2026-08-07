import Link from 'next/link';

export type ArticleHoverCardProps = {
	href: string;
	category: string;
	dateLabel: string;
	title: string;
	excerpt: string;
	image: string;
	imageFallback?: string;
	className?: string;
	scrollReveal?: boolean;
};

const DEFAULT_FALLBACK = '/images/services/service-grooming.jpg';

/**
 * Hover-reveal article card — fixed dimensions, image fades in on hover.
 * One DOM element per text field; colors transition via CSS custom properties.
 */
export default function ArticleHoverCard({
	href,
	category,
	dateLabel,
	title,
	excerpt,
	image,
	imageFallback = DEFAULT_FALLBACK,
	className = '',
	scrollReveal = false,
}: ArticleHoverCardProps) {
	return (
		<Link
			href={href}
			className={`pp-article-card ${className}`.trim()}
			{...(scrollReveal ? { 'data-section-reveal': 'card' } : {})}
		>
			<div className="pp-article-card__media" aria-hidden>
				<img
					className="pp-article-card__img"
					src={image || imageFallback}
					alt=""
					loading="lazy"
					decoding="async"
					onError={(e) => {
						const img = e.currentTarget;
						if (img.dataset.fallbackApplied === '1') return;
						img.dataset.fallbackApplied = '1';
						img.src = imageFallback;
					}}
				/>
			</div>
			<div className="pp-article-card__scrim" aria-hidden />

			<div className="pp-article-card__body">
				<div className="pp-article-card__top">
					<span className="pp-article-card__cat">{category}</span>
					<time className="pp-article-card__date" dateTime={dateLabel}>
						{dateLabel}
					</time>
				</div>
				<h3 className="pp-article-card__title">{title}</h3>
				{excerpt ? <p className="pp-article-card__excerpt">{excerpt}</p> : null}
				<span className="pp-article-card__read">Read More →</span>
			</div>
		</Link>
	);
}
