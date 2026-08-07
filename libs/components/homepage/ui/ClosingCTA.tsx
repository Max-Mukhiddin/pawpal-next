import Link from 'next/link';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { useTranslation } from 'next-i18next';
import { useAnimeSectionReveal } from '../../../hooks/useAnimeSectionReveal';

export default function ClosingCTA() {
	const { t } = useTranslation('common');
	useAnimeSectionReveal({ sectionSelector: '.pp-closing' });

	return (
		<section className="pp-closing" aria-labelledby="pp-closing-title">
			<div className="pp-closing__inner" data-section-reveal="header">
				<svg className="pp-closing__decor" viewBox="0 0 120 120" aria-hidden>
					<ellipse cx="40" cy="70" rx="28" ry="22" fill="#E8A04B" />
					<circle cx="18" cy="48" r="10" fill="#E8A04B" />
					<circle cx="34" cy="32" r="11" fill="#E8A04B" />
					<circle cx="52" cy="32" r="11" fill="#E8A04B" />
					<circle cx="68" cy="48" r="10" fill="#E8A04B" />
				</svg>
				<span className="pp-eyebrow pp-closing__eyebrow">START TODAY</span>
				<h2 id="pp-closing-title" className="pp-closing__title">
					Ready to give your pet world-class care?
				</h2>
				<p className="pp-closing__sub">
					Book a vetted specialist in minutes — grooming, wellness, training and more, all in
					one trusted place.
				</p>
				<div className="pp-closing__actions">
					<Link href="/service" className="pp-btn pp-btn--honey">
						{t('Book a specialist')}
						<ArrowForwardOutlinedIcon aria-hidden />
					</Link>
					<Link href="/about" className="pp-btn pp-btn--ghost-dark">
						{t('How PawPal works')}
					</Link>
				</div>
			</div>
		</section>
	);
}
