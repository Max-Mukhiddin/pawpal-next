import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Member } from '../../types/member/member';
import { MemberType } from '../../enums/member.enum';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

type ArticleAuthorBioProps = {
	author?: Member;
};

export default function ArticleAuthorBio({ author }: ArticleAuthorBioProps) {
	const { t } = useTranslation('common');

	if (!author?._id) return null;

	const avatar = resolveMemberImageUrl(author.memberImage, '/img/profile/defaultUser.svg');
	const displayName = author.memberFullName?.trim() || author.memberNick || 'PawPal';
	const isSpecialist = author.memberType === MemberType.AGENT;
	const profileHref = isSpecialist
		? `/specialist/detail?id=${author._id}`
		: `/member?memberId=${author._id}`;
	const credentials =
		author.memberType === MemberType.AGENT
			? 'PawPal Verified Specialist'
			: 'PawPal Community Author';

	return (
		<section className="pp-adetail-author" aria-labelledby="pp-adetail-author-heading">
			<div className="pp-adetail-author__inner">
				<img src={avatar} alt={displayName} className="pp-adetail-author__photo" />
				<div className="pp-adetail-author__copy">
					<p className="pp-adetail-author__eyebrow">About the author</p>
					<h2 id="pp-adetail-author-heading" className="pp-adetail-author__name">
						{displayName}
					</h2>
					<p className="pp-adetail-author__credentials">{credentials}</p>
					{author.memberDesc ? (
						<p className="pp-adetail-author__bio">{author.memberDesc}</p>
					) : (
						<p className="pp-adetail-author__bio">
							Sharing thoughtful pet-care guidance with the PawPal community.
						</p>
					)}
					<Link href={profileHref} className="pp-adetail-author__link">
						{t('View Profile')} <span aria-hidden>→</span>
					</Link>
				</div>
			</div>
		</section>
	);
}
