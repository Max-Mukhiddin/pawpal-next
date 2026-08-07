import React, { SyntheticEvent, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_FAQS } from '../../apollo/user/query';
import type { Faq as FaqItem } from '../../libs/types/cs/faq';
import type { FaqsInquiry } from '../../libs/types/cs/faq.input';
import type { SvgIconComponent } from '@mui/icons-material';
import PpLoader from '../../libs/components/common/PpLoader';
import { useFadeUpOnScroll } from '../../libs/hooks/useFadeUpOnScroll';
import { useAnimeSectionReveal } from '../../libs/hooks/useAnimeSectionReveal';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Accordion = styled((props: AccordionProps) => (
	<MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
	background: 'transparent',
	border: 'none',
	borderBottom: '1px solid rgba(30, 107, 79, 0.1)',
	'&:before': { display: 'none' },
	'&:last-of-type': { borderBottom: 'none' },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary
		expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.35rem', color: 'var(--pp-honey)' }} />}
		{...props}
	/>
))(() => ({
	backgroundColor: 'transparent',
	padding: '4px 8px',
	minHeight: 56,
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		margin: '12px 0',
	},
	'&.Mui-expanded .MuiAccordionSummary-content .support-page__faq-question': {
		color: '#1e6b4f',
	},
}));

const HOW_IT_WORKS_STEPS = [
	{
		num: '01',
		title: 'Browse Specialists',
		desc: "Find the right specialist for your pet's needs.",
		Icon: SearchOutlinedIcon,
	},
	{
		num: '02',
		title: 'Book a Consultation',
		desc: 'Choose a time and submit your request.',
		Icon: EventAvailableOutlinedIcon,
	},
	{
		num: '03',
		title: 'Care & Follow-up',
		desc: 'Your pet gets expert care with a clear follow-up summary.',
		Icon: FavoriteOutlinedIcon,
	},
];

const FALLBACK_FAQS: FaqItem[] = [
	{
		_id: 'fb-1',
		faqCategory: 'TECHNICAL',
		faqStatus: 'ACTIVE',
		faqQuestion: 'How do I book a specialist?',
		faqAnswer:
			'Browse specialists on PawPal, open a profile, and submit a booking or consultation request for a time that works for you.',
		faqOrder: 1,
		createdAt: '',
	},
	{
		_id: 'fb-2',
		faqCategory: 'PAYMENT',
		faqStatus: 'ACTIVE',
		faqQuestion: 'What payment methods do you accept?',
		faqAnswer:
			'Payment options depend on the specialist and service. Details are shown during booking, and our team can help if you need support.',
		faqOrder: 2,
		createdAt: '',
	},
	{
		_id: 'fb-3',
		faqCategory: 'TECHNICAL',
		faqStatus: 'ACTIVE',
		faqQuestion: 'Can I cancel or reschedule a booking?',
		faqAnswer:
			'Yes. Open your booking from My Page and follow the cancel or reschedule options. Policies may vary by specialist.',
		faqOrder: 3,
		createdAt: '',
	},
	{
		_id: 'fb-4',
		faqCategory: 'GENERAL',
		faqStatus: 'ACTIVE',
		faqQuestion: 'How are specialists vetted?',
		faqAnswer:
			'Every specialist is background-checked and reviewed for skill, safety, and a gentle approach to pet care.',
		faqOrder: 4,
		createdAt: '',
	},
	{
		_id: 'fb-5',
		faqCategory: 'GENERAL',
		faqStatus: 'ACTIVE',
		faqQuestion: "What if I'm not satisfied with the service?",
		faqAnswer:
			"Contact support and we'll help make it right. Your pet's wellbeing and your peace of mind come first.",
		faqOrder: 5,
		createdAt: '',
	},
];

const CONTACT_CARDS: {
	id: string;
	Icon: SvgIconComponent;
	title: string;
	desc: string;
	descSecondary?: string;
	action?: 'chat' | null;
	href?: string;
}[] = [
	{
		id: 'chat',
		Icon: ChatBubbleOutlineOutlinedIcon,
		title: 'Help / Chat',
		desc: 'Ask PawPal Assistant for instant answers about bookings and care.',
		action: 'chat',
	},
	{
		id: 'location',
		Icon: LocationOnOutlinedIcon,
		title: 'Location',
		desc: 'Seoul, South Korea — partner clinics across the city.',
	},
	{
		id: 'call',
		Icon: PhoneOutlinedIcon,
		title: 'Call',
		desc: '+1 (800) 555-1234',
		href: 'tel:+18005551234',
	},
	{
		id: 'email',
		Icon: MailOutlineIcon,
		title: 'Email',
		desc: 'hello@pawpal.app',
		descSecondary: 'We reply within one business day.',
		href: 'mailto:hello@pawpal.app',
	},
];

const HERO_IMAGE =
	'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?fm=jpg&q=80&w=2000&auto=format&fit=crop';

type FaqTabFilter = 'ALL' | 'BOOKING' | 'BILLING' | 'ACCOUNT' | 'GENERAL';

const FAQ_TAB_ORDER: FaqTabFilter[] = ['ALL', 'BOOKING', 'BILLING', 'ACCOUNT', 'GENERAL'];

const FAQ_TAB_LABELS: Record<FaqTabFilter, string> = {
	ALL: 'All',
	BOOKING: 'Booking',
	BILLING: 'Billing',
	ACCOUNT: 'Account',
	GENERAL: 'General',
};

const mapFaqCategoryToTab = (category: FaqItem['faqCategory']): FaqTabFilter => {
	switch (category) {
		case 'PAYMENT':
			return 'BILLING';
		case 'ACCOUNT':
			return 'ACCOUNT';
		case 'TECHNICAL':
			return 'BOOKING';
		case 'GENERAL':
		case 'EVENT':
		default:
			return 'GENERAL';
	}
};

const SupportPage: NextPage = () => {
	const [searchText, setSearchText] = useState('');
	const [queryText, setQueryText] = useState('');
	const [expanded, setExpanded] = useState<string | false>(false);
	const [activeFaqTab, setActiveFaqTab] = useState<FaqTabFilter>('ALL');

	const heroRef = useFadeUpOnScroll<HTMLElement>();
	const searchRef = useFadeUpOnScroll<HTMLElement>();
	const faqRef = useFadeUpOnScroll<HTMLElement>();

	useAnimeSectionReveal({
		sectionSelector: '.support-page__how',
		headerSelector: '.support-page__how-intro',
		cardSelector: '.support-page__step-card',
	});

	const faqInquiry: FaqsInquiry = useMemo(
		() => ({
			page: 1,
			limit: 50,
			search: {
				...(queryText.trim() ? { text: queryText.trim() } : {}),
			},
		}),
		[queryText],
	);

	const { data: faqData, loading: faqLoading } = useQuery(GET_FAQS, {
		variables: { input: faqInquiry },
		fetchPolicy: 'network-only',
	});

	const faqs: FaqItem[] = useMemo(() => {
		const list: FaqItem[] = faqData?.getFaqs?.list ?? [];
		if (list.length === 0 && !queryText.trim()) return FALLBACK_FAQS;
		return [...list].sort((a, b) => (a.faqOrder ?? 0) - (b.faqOrder ?? 0));
	}, [faqData, queryText]);

	const faqTabs = useMemo(() => {
		const tabs = new Set<FaqTabFilter>(['ALL']);
		faqs.forEach((faq) => tabs.add(mapFaqCategoryToTab(faq.faqCategory)));
		return FAQ_TAB_ORDER.filter((tab) => tabs.has(tab));
	}, [faqs]);

	const filteredFaqs = useMemo(() => {
		if (activeFaqTab === 'ALL') return faqs;
		return faqs.filter((faq) => mapFaqCategoryToTab(faq.faqCategory) === activeFaqTab);
	}, [faqs, activeFaqTab]);

	const onSearchSubmit = () => {
		setQueryText(searchText);
		document.getElementById('support-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const openChat = () => {
		document.querySelector<HTMLButtonElement>('.chat-button')?.click();
	};

	const handleAccordion = (panel: string) => (_e: SyntheticEvent, next: boolean) => {
		setExpanded(next ? panel : false);
	};

	const handleFaqTabChange = (tab: FaqTabFilter) => {
		setActiveFaqTab(tab);
		setExpanded(false);
	};

	return (
		<div className="support-page">
			{/* A. Hero */}
			<section ref={heroRef} className="support-page__hero">
				<div
					className="support-page__hero-bg"
					style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
					aria-hidden
				/>
				<div className="support-page__hero-overlay" aria-hidden />
				<div className="support-page__hero-content">
					<span className="support-page__eyebrow support-page__eyebrow--on-dark">Support</span>
					<h1>How Can We Help?</h1>
				</div>
			</section>

			{/* B. Search */}
			<section ref={searchRef} className="support-page__search-section">
				<div className="support-page__search">
					<input
						type="search"
						className="support-page__search-input"
						placeholder="Search for answers..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') onSearchSubmit();
						}}
						aria-label="Search for answers"
					/>
					<button type="button" className="support-page__search-btn" onClick={onSearchSubmit}>
						Search
					</button>
				</div>
			</section>

			{/* C. How it works */}
			<section className="support-page__how">
				<div className="support-page__how-inner">
					<div className="support-page__how-intro">
						<span className="support-page__eyebrow">How It Works</span>
						<h2>How to Book Our Services</h2>
						<p className="support-page__how-lead">
							From finding the right specialist to follow-up care, PawPal keeps every step clear and
							calm for you and your pet.
						</p>
					</div>

					<div className="support-page__steps">
						<ol className="support-page__steps-grid">
							{HOW_IT_WORKS_STEPS.map((step) => {
								const StepIcon = step.Icon;
								return (
									<li key={step.num} className="support-page__step-card">
										<div className="support-page__step-icon-wrap">
											<div className="support-page__step-icon">
												<StepIcon aria-hidden />
											</div>
										</div>
										<h3 className="support-page__step-title">{step.title}</h3>
										<p className="support-page__step-desc">{step.desc}</p>
									</li>
								);
							})}
						</ol>
					</div>
				</div>
			</section>

			{/* D. FAQ */}
			<section ref={faqRef} id="support-faq" className="support-page__faq">
				<div className="support-page__faq-inner">
					<span className="support-page__eyebrow">FAQ</span>
					<h2>Frequently Asked Questions</h2>

					{!faqLoading && faqs.length > 0 && faqTabs.length > 1 ? (
						<div className="support-page__faq-tabs" role="tablist" aria-label="FAQ categories">
							{faqTabs.map((tab) => (
								<button
									key={tab}
									type="button"
									role="tab"
									id={`faq-tab-${tab.toLowerCase()}`}
									aria-selected={activeFaqTab === tab}
									aria-controls="support-faq-panel"
									className={`support-page__faq-tab${activeFaqTab === tab ? ' is-active' : ''}`}
									onClick={() => handleFaqTabChange(tab)}
								>
									{FAQ_TAB_LABELS[tab]}
								</button>
							))}
						</div>
					) : null}

					<div id="support-faq-panel" className="support-page__faq-panel" role="tabpanel">
						{faqLoading ? (
							<div className="support-page__state">
								<PpLoader size={48} />
							</div>
						) : filteredFaqs.length === 0 ? (
							<div className="support-page__state support-page__state--empty">
								<p>
									{faqs.length === 0
										? 'No answers match your search. Try another phrase.'
										: 'No questions in this category yet. Try another tab.'}
								</p>
							</div>
						) : (
							filteredFaqs.map((faq) => (
								<Accordion
									key={faq._id}
									expanded={expanded === faq._id}
									onChange={handleAccordion(faq._id)}
									TransitionProps={{ timeout: 300 }}
								>
									<AccordionSummary
										id={`faq-${faq._id}`}
										aria-controls={`faq-body-${faq._id}`}
									>
										<span className="support-page__faq-question">{faq.faqQuestion}</span>
									</AccordionSummary>
									<AccordionDetails>
										<div
											className="support-page__faq-answer"
											dangerouslySetInnerHTML={{ __html: faq.faqAnswer }}
										/>
									</AccordionDetails>
								</Accordion>
							))
						)}
					</div>

					<div className="support-page__faq-cta">
						<h3 className="support-page__faq-cta-title">Still need help?</h3>
						<p className="support-page__faq-cta-lead">Our team is here to answer any question</p>
						<button type="button" className="pp-btn pp-btn--on-dark" onClick={openChat}>
							Chat with us
						</button>
					</div>
				</div>
			</section>

			{/* E. Contact */}
			<section id="support-contact" className="support-page__contact">
				<div className="support-page__contact-inner">
					<span className="support-page__eyebrow">Still Need Help?</span>
					<h2 className="support-page__contact-title">We&apos;re here for you</h2>

					<div className="support-page__contact-grid">
						{CONTACT_CARDS.map((card) => {
							const CardIcon = card.Icon;
							const body = (
								<>
									<div className="support-page__contact-icon-wrap">
										<div className="support-page__contact-icon">
											<CardIcon aria-hidden />
										</div>
									</div>
									<strong>{card.title}</strong>
									<p>{card.desc}</p>
									{card.descSecondary ? <p>{card.descSecondary}</p> : null}
								</>
							);

							if (card.action === 'chat') {
								return (
									<button
										key={card.id}
										type="button"
										className="support-page__contact-card"
										onClick={openChat}
									>
										{body}
									</button>
								);
							}

							if (card.href) {
								return (
									<a key={card.id} href={card.href} className="support-page__contact-card">
										{body}
									</a>
								);
							}

							return (
								<div key={card.id} className="support-page__contact-card support-page__contact-card--static">
									{body}
								</div>
							);
						})}
					</div>

					<p className="support-page__contact-alt">
						Prefer a specialist? <Link href="/specialist">Browse our network</Link>
					</p>
				</div>
			</section>
		</div>
	);
};

export default withLayoutBasic(SupportPage, { noHero: true });
