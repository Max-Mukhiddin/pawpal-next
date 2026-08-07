import Link from 'next/link';
import type { ArticleTocItem } from '../../utils/articleContentHelpers';
import { Member } from '../../types/member/member';
import { MemberType } from '../../enums/member.enum';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { formatterStr } from '../../utils';

export type ArticleSpecialistBookingMeta = {
	categoryLabel: string;
	startingPrice?: number | null;
};

type ArticleDetailSidebarProps = {
	headings: ArticleTocItem[];
	activeId: string | null;
	onTocClick: (id: string) => void;
	author?: Member;
	articleTitle?: string;
	specialistBooking?: ArticleSpecialistBookingMeta;
};

export default function ArticleDetailSidebar({
	headings,
	activeId,
	onTocClick,
	author,
	articleTitle,
	specialistBooking,
}: ArticleDetailSidebarProps) {
	const isSpecialist = author?.memberType === MemberType.AGENT;
	const avatar = resolveMemberImageUrl(author?.memberImage, '/img/profile/defaultUser.svg');
	const displayName = author?.memberFullName?.trim() || author?.memberNick || 'PawPal';
	const rating =
		typeof author?.specialistScore === 'number' && author.specialistScore > 0
			? author.specialistScore.toFixed(1)
			: null;
	const reviewCount =
		typeof author?.memberComments === 'number' && author.memberComments > 0
			? author.memberComments
			: null;
	const firstName = displayName.split(/\s+/)[0] || displayName;

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			await sweetTopSmallSuccessAlert('Link copied to clipboard', 900);
		} catch {
			/* clipboard unavailable */
		}
	};

	const handleNativeShare = async () => {
		const url = window.location.href;
		const title = articleTitle || 'PawPal Article';
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({ title, url });
			} catch {
				/* user cancelled */
			}
			return;
		}
		await handleCopyLink();
	};

	return (
		<aside className="pp-adetail-sidebar">
			<div className="pp-adetail-sidebar__block">
				<h3 className="pp-adetail-sidebar__label">Share</h3>
				<div className="pp-adetail-sidebar__share">
					<button
						type="button"
						className="pp-adetail-sidebar__share-btn"
						onClick={handleCopyLink}
						aria-label="Copy article link"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
						</svg>
					</button>
					<button
						type="button"
						className="pp-adetail-sidebar__share-btn"
						onClick={handleNativeShare}
						aria-label="Share article"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
						</svg>
					</button>
				</div>
			</div>

			{headings.length > 0 && (
				<nav className="pp-adetail-sidebar__block pp-adetail-sidebar__toc" aria-label="Table of contents">
					<h3 className="pp-adetail-sidebar__label">On this page</h3>
					<ul className="pp-adetail-toc">
						{headings.map((item) => (
							<li
								key={item.id}
								className={`pp-adetail-toc__item pp-adetail-toc__item--h${item.level}${
									activeId === item.id ? ' is-active' : ''
								}`}
							>
								<button
									type="button"
									className="pp-adetail-toc__link"
									onClick={() => onTocClick(item.id)}
								>
									{item.text}
								</button>
							</li>
						))}
					</ul>
				</nav>
			)}

			{isSpecialist && author?._id && (
				<div className="pp-adetail-specialist">
					<p className="pp-adetail-specialist__eyebrow">Book this specialist</p>
					<div className="pp-adetail-specialist__head">
						<img
							src={avatar}
							alt={displayName}
							className="pp-adetail-specialist__photo"
						/>
						<div>
							<p className="pp-adetail-specialist__name">{displayName}</p>
						</div>
					</div>
					<div className="pp-adetail-specialist__meta">
						{specialistBooking?.categoryLabel ? (
							<span className="pp-adetail-specialist__tag">{specialistBooking.categoryLabel}</span>
						) : null}
						{specialistBooking?.startingPrice ? (
							<p className="pp-adetail-specialist__price">
								From ₩{formatterStr(specialistBooking.startingPrice)}
							</p>
						) : null}
						{rating ? (
							<p className="pp-adetail-specialist__rating">
								<strong>★ {rating}</strong>
								{reviewCount ? <span>({reviewCount} reviews)</span> : null}
							</p>
						) : null}
					</div>
					<Link href={`/specialist/detail?id=${author._id}`} className="pp-adetail-specialist__cta">
						Book with {firstName}
					</Link>
				</div>
			)}
		</aside>
	);
}
