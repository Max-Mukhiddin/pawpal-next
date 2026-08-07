import Moment from 'react-moment';
import { Member } from '../../types/member/member';
import { getArticleCategoryLabel } from '../../utils/articleCategoryMap';
import { resolveArticleImage } from '../../utils/articleCardHelpers';
import { estimateReadTimeMinutes } from '../../utils/articleContentHelpers';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import ArticleRichContent from './ArticleRichContent';

type ArticleEditorPreviewAuthor = Pick<Member, 'memberNick' | 'memberFullName' | 'memberImage'> | null;

type ArticleEditorPreviewProps = {
	title: string;
	category: string;
	contentHtml: string;
	coverImagePath?: string;
	author?: ArticleEditorPreviewAuthor;
};

export default function ArticleEditorPreview({
	title,
	category,
	contentHtml,
	coverImagePath,
	author,
}: ArticleEditorPreviewProps) {
	const coverSrc = coverImagePath?.trim() ? resolveArticleImage(coverImagePath) : '';
	const displayCategory = getArticleCategoryLabel(category);
	const authorName = author?.memberFullName?.trim() || author?.memberNick || 'You';
	const authorAvatar = resolveMemberImageUrl(author?.memberImage, '/img/profile/defaultUser.svg');
	const readMinutes = estimateReadTimeMinutes(contentHtml);

	return (
		<div className="article-editor-preview">
			<p className="article-editor-preview__note">
				Preview — this is how your article will appear on the published detail page.
			</p>
			<div className="pp-adetail pp-adetail--editor-preview">
				<section className="pp-adetail-hero">
					{coverSrc ? (
						<img src={coverSrc} alt="" className="pp-adetail-hero__img" />
					) : (
						<div className="pp-adetail-hero__img pp-adetail-hero__img--fallback" aria-hidden />
					)}
					<div className="pp-adetail-hero__scrim" aria-hidden />
					<div className="pp-adetail-hero__content">
						{displayCategory ? (
							<span className="pp-adetail-hero__cat">{displayCategory}</span>
						) : null}
						<h1 className="pp-adetail-hero__title">{title.trim() || 'Untitled Article'}</h1>
						<div className="pp-adetail-hero__byline">
							<span className="pp-adetail-hero__author">
								<img src={authorAvatar} alt="" className="pp-adetail-hero__avatar" />
								<span>{authorName}</span>
							</span>
							<span className="pp-adetail-hero__dot" aria-hidden />
							<time className="pp-adetail-hero__date">
								<Moment format="MMM DD, YYYY">{new Date()}</Moment>
							</time>
							<span className="pp-adetail-hero__dot" aria-hidden />
							<span className="pp-adetail-hero__read">{readMinutes} min read</span>
						</div>
					</div>
				</section>

				<div className="pp-adetail-layout">
					<div className="pp-adetail-layout__grid pp-adetail-layout__grid--preview">
						<article className="pp-adetail-main">
							<ArticleRichContent content={contentHtml} />
						</article>
					</div>
				</div>
			</div>
		</div>
	);
}
