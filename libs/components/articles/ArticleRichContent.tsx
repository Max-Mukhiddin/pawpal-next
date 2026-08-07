import { useEffect, useMemo, useRef } from 'react';
import { fadeUp } from '../../hooks/useFadeUpOnScroll';
import {
	enrichArticleHtml,
	isArticleHtmlContent,
	resolveInlineImagesInHtml,
} from '../../utils/articleContentHelpers';

type ArticleRichContentProps = {
	content: string | undefined | null;
};

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ArticleRichContent({ content }: ArticleRichContentProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const isHtml = isArticleHtmlContent(content);

	const enrichedHtml = useMemo(() => {
		if (!isHtml || !content?.trim()) return '';
		const { html: withIds } = enrichArticleHtml(content);
		return resolveInlineImagesInHtml(withIds);
	}, [content, isHtml]);

	useEffect(() => {
		if (!isHtml) return;
		const root = rootRef.current;
		if (!root || prefersReducedMotion()) return;

		const targets = root.querySelectorAll<HTMLElement>('blockquote, img');

		targets.forEach((el) => {
			el.classList.add('pp-adetail-reveal');
		});

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const el = entry.target as HTMLElement;
					if (el.dataset.revealed === 'true') return;
					el.dataset.revealed = 'true';
					el.style.opacity = '0';
					fadeUp(el, { duration: 700 });
					io.unobserve(el);
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
		);

		targets.forEach((el) => io.observe(el));

		return () => io.disconnect();
	}, [enrichedHtml, isHtml]);

	if (!content?.trim()) {
		return <p className="pp-adetail-main__empty">No article content available.</p>;
	}

	if (!isHtml) {
		return (
			<div className="pp-adetail-main__content pp-adetail-main__content--plain">{content}</div>
		);
	}

	return (
		<div
			ref={rootRef}
			className="pp-adetail-main__content"
			dangerouslySetInnerHTML={{ __html: enrichedHtml }}
		/>
	);
}
