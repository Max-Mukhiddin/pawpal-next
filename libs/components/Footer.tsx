import Link from 'next/link';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PinterestIcon from '@mui/icons-material/Pinterest';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const contactStrip = [
    {
        icon: '/icons/footer-chat.svg',
        title: 'Help / Chat',
        desc: 'Questions about bookings, care, or your account — we are here to help.',
    },
    {
        icon: '/icons/footer-location.svg',
        title: 'Location',
        desc: 'Visit our care centre or find partner clinics near you.',
    },
    {
        icon: '/icons/footer-phone.svg',
        title: 'Call',
        desc: 'Speak with our team during business hours for urgent pet care needs.',
    },
    {
        icon: '/icons/footer-mail.svg',
        title: 'Email',
        desc: 'Send us a message anytime — we reply within one business day.',
    },
];

const categories = [
    { label: 'Services', href: '/service' },
    { label: 'Grooming', href: '/grooming' },
    { label: 'Walking', href: '/walking' },
    { label: 'Boarding', href: '/boarding' },
    { label: 'Daycare', href: '/daycare' },
];

const resources = [
    { label: 'FAQ', href: '/cs?tab=faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Articles', href: '/blog' },
    { label: 'Pet guides', href: '/about' },
    { label: 'Care tips', href: '/cs' },
];

const useful = [
    { label: 'Terms', href: '/cs' },
    { label: 'Contact', href: '/cs' },
    { label: 'Support', href: '/cs' },
    { label: 'Privacy', href: '/cs' },
    { label: 'Accessibility', href: '/about' },
];

const socialLinks = [
    { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
    { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookOutlinedIcon },
    { label: 'X', href: 'https://twitter.com', Icon: TwitterIcon },
    { label: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
    { label: 'Pinterest', href: 'https://pinterest.com', Icon: PinterestIcon },
];

const Footer = () => {
    const year = moment().year();

    return (
        <Stack component="footer" id="footer" className="footer-pawpal">
            {/* Flat line strip layout */}
            <Box component="section" className="footer-pawpal__strip footer-pawpal__strip--contact" aria-label="Contact highlights">
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

            {/* Champagne Gold Main Section */}
            <Box component="div" className="footer-pawpal__main">
                <div className="footer-pawpal__container footer-pawpal__grid">
                    <div className="footer-pawpal__col footer-pawpal__col--address">
                        <h3 className="footer-pawpal__heading">Our address</h3>
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
                        <h3 className="footer-pawpal__heading">Categories</h3>
                        <ul className="footer-pawpal__list">
                            {categories.map((c) => (
                                <li key={c.href}>
                                    <Link href={c.href}>{c.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-pawpal__col footer-pawpal__col--brand">
                        <Link href="/" className="footer-pawpal__logo-link">
                            <img
                                src="/img/logo/logo-white.svg"
                                alt="PawPal"
                                className="footer-pawpal__logo"
                                width={160}
                                height={48}
                            />
                        </Link>
                        <p className="footer-pawpal__tagline">
                            Thoughtful pet care, trusted specialists, and a calmer experience for you and your companions.
                        </p>
                    </div>

                    <div className="footer-pawpal__col">
                        <h3 className="footer-pawpal__heading">Resources</h3>
                        <ul className="footer-pawpal__list">
                            {resources.map((r) => (
                                <li key={r.label + r.href}>
                                    <Link href={r.href}>{r.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-pawpal__col">
                        <h3 className="footer-pawpal__heading">Useful links</h3>
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

            {/* Bronze Base Strip */}
            <Box component="div" className="footer-pawpal__strip footer-pawpal__strip--bottom">
                <div className="footer-pawpal__container footer-pawpal__bottom-row">
                    <p className="footer-pawpal__copyright">© {year} PawPal. All rights reserved.</p>
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
                        <span className="footer-pawpal__payment-pill">{'Apple Pay'}</span>
                        <span className="footer-pawpal__payment-pill">{'PayPal'}</span>
                    </div>
                </div>
            </Box>
        </Stack>
    );
};

export default Footer;