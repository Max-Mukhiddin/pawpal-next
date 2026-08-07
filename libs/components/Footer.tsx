import Link from 'next/link';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PinterestIcon from '@mui/icons-material/Pinterest';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'next-i18next';

const socialLinks = [
	{ label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
	{ label: 'Facebook', href: 'https://facebook.com', Icon: FacebookOutlinedIcon },
	{ label: 'X', href: 'https://twitter.com', Icon: TwitterIcon },
	{ label: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
	{ label: 'Pinterest', href: 'https://pinterest.com', Icon: PinterestIcon },
];

const Footer = () => {
	const { t } = useTranslation('common');
	const year = moment().year();

	const contactStrip = [
		{
			icon: '/icons/footer-chat.svg',
			title: t('footer.helpChat'),
			desc: t('footer.helpChatDesc'),
		},
		{
			icon: '/icons/footer-location.svg',
			title: t('footer.location'),
			desc: t('footer.locationDesc'),
		},
		{
			icon: '/icons/footer-phone.svg',
			title: t('footer.call'),
			desc: t('footer.callDesc'),
		},
		{
			icon: '/icons/footer-mail.svg',
			title: t('footer.email'),
			desc: t('footer.emailDesc'),
		},
	];

	const categories = [
		{ label: t('Services'), href: '/service' },
		{ label: t('footer.grooming'), href: '/service' },
		{ label: t('footer.walking'), href: '/service' },
		{ label: t('footer.boarding'), href: '/service' },
		{ label: t('footer.daycare'), href: '/service' },
	];

	const resources = [
		{ label: t('footer.faq'), href: '/cs#support-faq' },
		{ label: t('Blog'), href: '/blog' },
		{ label: t('footer.articles'), href: '/blog' },
		{ label: t('footer.petGuides'), href: '/blog' },
		{ label: t('footer.careTips'), href: '/blog' },
	];

	const useful = [
		{ label: t('footer.terms'), href: '/about' },
		{ label: t('footer.contact'), href: '/cs#support-contact' },
		{ label: t('Support'), href: '/cs' },
		{ label: t('footer.privacy'), href: '/about' },
		{ label: t('footer.accessibility'), href: '/about' },
	];

	return (
		<Stack component="footer" id="footer" className="footer-pawpal">
			<Box
				component="section"
				className="footer-pawpal__strip footer-pawpal__strip--contact"
				aria-label={t('footer.contactHighlights')}
			>
				<div className="footer-pawpal__container footer-pawpal__contact-row">
					{contactStrip.map((item) => (
						<div key={item.title} className="footer-pawpal__contact-item">
							<div className="footer-pawpal__contact-icon" aria-hidden>
								<img src={item.icon} alt="" />
							</div>
							<div className="footer-pawpal__contact-copy">
								<strong className="footer-pawpal__contact-title">{item.title}</strong>
								<p className="footer-pawpal__contact-desc">{item.desc}</p>
							</div>
						</div>
					))}
				</div>
			</Box>

			<Box component="div" className="footer-pawpal__main">
				<div className="footer-pawpal__container footer-pawpal__grid">
					<div className="footer-pawpal__col footer-pawpal__col--address">
						<h3 className="footer-pawpal__heading">{t('footer.ourAddress')}</h3>
						<ul className="footer-pawpal__list footer-pawpal__list--icon">
							<li>
								<span className="footer-pawpal__list-icon" aria-hidden>
									<img src="/icons/footer-location.svg" alt="" />
								</span>
								<span>123 PawPal Street, Pet Care District</span>
							</li>
							<li>
								<span className="footer-pawpal__list-icon" aria-hidden>
									<img src="/icons/footer-phone.svg" alt="" />
								</span>
								<a href="tel:+18005551234">+1 (800) 555-1234</a>
							</li>
							<li>
								<span className="footer-pawpal__list-icon" aria-hidden>
									<img src="/icons/footer-mail.svg" alt="" />
								</span>
								<a href="mailto:hello@pawpal.app">hello@pawpal.app</a>
							</li>
						</ul>
					</div>

					<div className="footer-pawpal__col">
						<h3 className="footer-pawpal__heading">{t('footer.categories')}</h3>
						<ul className="footer-pawpal__list">
							{categories.map((c) => (
								<li key={c.href + c.label}>
									<Link href={c.href}>{c.label}</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="footer-pawpal__col footer-pawpal__col--brand">
						<Link href="/" className="footer-pawpal__logo-link" aria-label="PawPal home">
							<img
								src="/img/logo/pawpal-logo-footer-plaque.png"
								alt="PawPal"
								className="footer-pawpal__logo"
								style={{ width: 220, height: 'auto' }}
							/>
						</Link>
						<p className="footer-pawpal__tagline">{t('footer.tagline')}</p>
					</div>

					<div className="footer-pawpal__col">
						<h3 className="footer-pawpal__heading">{t('footer.resources')}</h3>
						<ul className="footer-pawpal__list">
							{resources.map((r) => (
								<li key={r.label + r.href}>
									<Link href={r.href}>{r.label}</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="footer-pawpal__col">
						<h3 className="footer-pawpal__heading">{t('footer.usefulLinks')}</h3>
						<ul className="footer-pawpal__list">
							{useful.map((u) => (
								<li key={u.label + u.href}>
									<Link href={u.href}>{u.label}</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Box>

			<Box component="div" className="footer-pawpal__strip footer-pawpal__strip--bottom">
				<div className="footer-pawpal__container footer-pawpal__bottom-row">
					<p className="footer-pawpal__copyright">{t('footer.copyright', { year })}</p>
					<div className="footer-pawpal__social" role="list">
						{socialLinks.map(({ label, href, Icon }) => (
							<a
								key={label}
								href={href}
								className="footer-pawpal__social-btn"
								aria-label={label}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Icon className="footer-pawpal__social-icon" />
							</a>
						))}
					</div>
					<div className="footer-pawpal__payments" aria-hidden>
						<span className="footer-pawpal__payment-pill">Visa</span>
						<span className="footer-pawpal__payment-pill">Mastercard</span>
						<span className="footer-pawpal__payment-pill">Amex</span>
						<span className="footer-pawpal__payment-pill">Apple Pay</span>
						<span className="footer-pawpal__payment-pill">PayPal</span>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default Footer;
