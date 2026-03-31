import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [category, setCategory] = useState<string>('listings');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	
	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const data: any = {
		listings: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are care listings on PawPal trustworthy?',
				content:
					'We focus on verified specialists and clear listing details. Always review photos, descriptions, and host credentials before you book or buy.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What kinds of listings can I find here?',
				content:
					'You can browse pet care services, products, and other listings from vetted providers — not generic real-estate inventory.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How do I search for the right listing?',
				content:
					'Use filters for category, location, price, and keywords. Read the full description and messaging expectations before you contact a host.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'I am new to booking pet care online. Any tips?',
				content:
					'Start with a short message about your pet’s needs, ask about availability, and confirm what is included (supplies, pickup, vaccines, etc.).',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What should I check before I book?',
				content:
					'Location, services offered, pricing, cancellation rules, and any requirements the host lists for health, temperament, or equipment.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: 'How long does it take to hear back from a host?',
				content:
					'Response times vary by provider. If you are planning travel or an urgent need, mention your timeline in the first message.',
			},
			{
				id: '00f5a45ed8897f8090116a29',
				subject: 'What if something goes wrong after I book?',
				content:
					'Contact support with your booking details. We will help you follow the right process based on the listing type and policies in place.',
			},
			{
				id: '00f5a45ed8897f8090116a28',
				subject: 'Can I find hosts in my area?',
				content:
					'Yes. Use location filters and map-friendly addresses where available to narrow results near you.',
			},
			{
				id: '00f5a45ed8897f8090116a27',
				subject: 'Can I publish my own care listing?',
				content:
					'Approved agent accounts can create and manage listings from My Page. Follow the onboarding steps for your account type.',
			},
			{
				id: '00f5a45ed8897f8090116b99',
				subject: 'Where can I get help with contracts or liability questions?',
				content:
					'We can share general guidance, but legal questions should be handled with a qualified professional who knows your jurisdiction.',
			},
		],
		payment: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'How can I make the payment?',
				content: 'you make the payment through an agent!',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Are there any additional fees for using your services?',
				content: 'No, our services are free for buyers. Sellers pay a commission upon successful sale.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'Is there an option for installment payments?',
				content: 'Yes, we offer installment payment plans for certain listings. Please inquire for more details.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'Is my payment information secure on your website?',
				content:
					'Yes, we use industry-standard encryption technology to ensure the security of your payment information.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I make payments online through your website?',
				content: "Yes, you can securely make payments online through our website's payment portal.",
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: "What happens if there's an issue with my payment?",
				content: 'If you encounter any issues with your payment, please contact our support team for assistance.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'Do you offer refunds for payments made?',
				content:
					'Refund policies vary depending on the circumstances. Please refer to our refund policy or contact us for more information.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'Are there any discounts or incentives for early payments?',
				content:
					'We occasionally offer discounts or incentives for early payments. Check our promotions or contact us for current offers.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'How long does it take for payments to be processed?',
				content:
					'Payment processing times vary depending on the payment method used. Typically, credit/debit card payments are processed instantly',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Are there penalties for late payments?',
				content:
					'Late payment penalties may apply depending on the terms of your agreement. Please refer to your contract or contact us for details.',
			},
		],
		buyers: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'What should pet parents check before booking?',
				content:
					'Confirm vaccines, temperament notes, pickup or drop-off, what supplies are included, and the host’s cancellation rules.',
			},
			{
				id: '00f5a45ed8897f8090116a85',
				subject: 'How do I stay within my budget?',
				content:
					'Compare similar listings, note any add-on fees, and ask upfront about packages or multi-day discounts when they apply.',
			},
			{
				id: '00f5a45ed8897f8090116a84',
				subject: 'What information should I share with a host?',
				content:
					'Share species, age, medical needs, behavior with other animals, feeding routine, and emergency contacts when asked.',
			},
			{
				id: '00f5a45ed8897f8090116a83',
				subject: 'How do I choose between similar listings?',
				content:
					'Look at reviews, response time, photos, location convenience, and how clearly the host explains their process.',
			},
			{
				id: '00f5a45ed8897f8090116a82',
				subject: 'Can I ask for a meet-and-greet first?',
				content:
					'Many hosts welcome a short introduction. Ask politely in your first message and respect their safety policies.',
			},
			{
				id: '00f5a45ed8897f8090116a81',
				subject: 'What are red flags in a listing or chat?',
				content:
					'Vague descriptions, pressure to pay off-platform, unwillingness to answer basic care questions, or missing health and safety details.',
			},
			{
				id: '00f5a45ed8897f8090116a80',
				subject: 'Do you help with disputes?',
				content:
					'Contact support with booking references. We route issues according to listing type and the policies shown on the platform.',
			},
			{
				id: '00f5a45ed8897f8090116a79',
				subject: 'How fast can I find availability?',
				content:
					'It depends on demand in your area. Messaging multiple qualified hosts with clear dates usually speeds things up.',
			},
			{
				id: '00f5a45ed8897f8090116a78',
				subject: 'Why use PawPal instead of informal referrals?',
				content:
					'Structured listings, messaging history, and clearer expectations help both pet parents and providers stay aligned.',
			},
			{
				id: '00f5a45ed8897f8090116a77',
				subject: 'What if my plans change after I reach out?',
				content:
					'Let the host know as soon as possible. Final rules depend on their stated cancellation and rescheduling policy.',
			},
		],

		agents: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'How do I become a listing host on PawPal?',
				content:
					'Review our terms, complete your agent profile, and contact admin if your account type needs an upgrade.',
			},
			{
				id: '00f5a45ed8897f8090116a62',
				subject: 'What should a strong listing include?',
				content:
					'Accurate photos, transparent pricing, clear boundaries (size, breed, medical needs), and realistic availability.',
			},
			{
				id: '00f5a45ed8897f8090116a63',
				subject: 'How can I attract my first bookings?',
				content:
					'Respond quickly, keep descriptions updated, ask happy clients for reviews, and highlight any certifications you hold.',
			},
			{
				id: '00f5a45ed8897f8090116a64',
				subject: 'What marketing channels work well?',
				content:
					'Social posts, local pet communities, partnerships with vets or trainers, and keeping your PawPal listing complete.',
			},
			{
				id: '00f5a45ed8897f8090116a65',
				subject: 'How should I handle pricing conversations?',
				content:
					'Explain what is included, note travel fees or holiday rates early, and document agreements in platform messages when possible.',
			},
			{
				id: '00f5a45ed8897f8090116a66',
				subject: 'How do I stay current with pet-care expectations?',
				content:
					'Follow reputable veterinary guidance, refresh first-aid knowledge, and note seasonal risks (heat, ticks, fireworks, etc.).',
			},
			{
				id: '00f5a45ed8897f8090116a67',
				subject: 'What if a booking becomes difficult?',
				content:
					'Stay calm, document facts, prioritize animal safety, and escalate to support if policies or safety are unclear.',
			},
			{
				id: '00f5a45ed8897f8090116a68',
				subject: 'Which tools help day to day?',
				content:
					'Calendars, templated replies for common questions, checklists for intake, and photo updates parents appreciate.',
			},
			{
				id: '00f5a45ed8897f8090116a69',
				subject: 'How do I stay compliant with local rules?',
				content:
					'Research business licensing, insurance, and animal ordinances for your city. Consult professionals when requirements are unclear.',
			},
			{
				id: '00f5a45ed8897f8090116a70',
				subject: 'How can I grow repeat clients?',
				content:
					'Deliver consistent care, send brief updates, remember pet preferences, and make rebooking easy with clear next steps.',
			},
		],
		membership: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'Do you have a membership service on your site?',
				content: 'membership service is not available on our site yet!',
			},
			{
				id: '00f5a45ed8897f8090116a60',
				subject: 'What are the benefits of becoming a member on your website?',
				content: 'We currently do not offer membership benefits, but stay tuned for updates on any future offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a59',
				subject: 'Is there a fee associated with becoming a member?',
				content: 'As membership services are not available, there are no associated fees at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a58',
				subject: 'Will membership provide access to exclusive content or features?',
				content: "We don't currently have membership-exclusive content or features.",
			},
			{
				id: '00f5a45ed8897f8090116a57',
				subject: 'How can I sign up for a membership on your site?',
				content: 'As of now, we do not have a sign-up process for memberships.',
			},
			{
				id: '00f5a45ed8897f8090116a56',
				subject: 'Do members receive discounts on listings or services?',
				content: 'Membership discounts are not part of our current offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a55',
				subject: 'Are there plans to introduce a membership program in the future?',
				content:
					"While we can't confirm any plans at this time, we're always exploring ways to enhance our services for users.",
			},
			{
				id: '00f5a45ed8897f8090116a54',
				subject: 'What kind of content or benefits can members expect if a membership program is introduced?',
				content: "We're evaluating potential benefits and features, but specifics are not available yet.",
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you offer a premium membership option on your platform?',
				content: 'Currently, we do not provide a premium membership option.',
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Will membership grant access to exclusive deals or discounts?',
				content: 'Membership perks, including deals or discounts, are not available at this time.',
			},
		],
		community: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'What should I do if there is abusive or criminal behavior in the community section?',
				content: 'If you encounter this situation, please report it immediately or contact the admin!',
			},
			{
				id: '00f5a45ed8897f8090116a44',
				subject: 'How can I participate in the community section of your website?',
				content: 'Create an account and engage in discussions.',
			},
			{
				id: '00f5a45ed8897f8090116a45',
				subject: 'Are there guidelines for posting?',
				content: 'Yes, follow our community guidelines.',
			},
			{
				id: '00f5a45ed8897f8090116a46',
				subject: 'What should I do if I encounter spam or irrelevant posts?',
				content: 'Report them to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a47',
				subject: 'Can I connect with other members outside of the community section?',
				content: 'Currently, no.',
			},
			{
				id: '00f5a45ed8897f8090116a48',
				subject: 'Can I share personal experiences or recommendations?',
				content: 'Yes, if relevant you can share personal experiences and recommendations.',
			},
			{
				id: '00f5a45ed8897f8090116a49',
				subject: 'How can I ensure privacy?',
				content: 'Avoid sharing sensitive information.',
			},
			{
				id: '00f5a45ed8897f8090116a50',
				subject: 'How can I contribute positively?',
				content: 'Respect others and engage constructively.',
			},
			{
				id: '00f5a45ed8897f8090116a51',
				subject: 'What if I notice misinformation?',
				content: 'Provide correct information or report to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a52',
				subject: 'Are there moderators?',
				content: 'Yes, we have moderators.',
			},
		],
		other: [
			{
				id: '00f5a45ed8897f8090116a40',
				subject: 'Who should I contact if I want to buy your site?',
				content: 'We have no plans to sell the site at this time!',
			},
			{
				id: '00f5a45ed8897f8090116a39',
				subject: 'Can I advertise my services on your website?',
				content: 'We currently do not offer advertising opportunities on our site.',
			},
			{
				id: '00f5a45ed8897f8090116a38',
				subject: 'Are there sponsorship opportunities available on your platform?',
				content: 'At this time, we do not have sponsorship opportunities.',
			},
			{
				id: '00f5a45ed8897f8090116a36',
				subject: 'Can I contribute guest posts or articles to your website?',
				content: "We're not accepting guest posts or articles at the moment.",
			},
			{
				id: '00f5a45ed8897f8090116a35',
				subject: 'Is there a referral program for recommending your website to others?',
				content: "We don't have a referral program in place currently.",
			},
			{
				id: '00f5a45ed8897f8090116a34',
				subject: 'Do you offer affiliate partnerships for promoting your services?',
				content: 'Affiliate partnerships are not available at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Can I purchase merchandise related to your website?',
				content: "We don't have merchandise available for purchase.",
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Are there any job openings or opportunities to work with your team?',
				content: 'Currently, we do not have any job openings or opportunities available.',
			},
			{
				id: '00f5a45ed8897f8090116a31',
				subject: 'Do you host events or webinars related to pet care?',
				content: "We're not hosting events or webinars at this time.",
			},
			{
				id: '00f5a45ed8897f8090116a30',
				subject: 'Can I request custom features or functionalities for your website?',
				content: "We're not accepting requests for custom features or functionalities.",
			},
		],
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'listings' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('listings');
						}}
					>
						Care listings
					</div>
					<div
						className={category === 'payment' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('payment');
						}}
					>
						Payment
					</div>
					<div
						className={category === 'buyers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('buyers');
						}}
					>
						For pet parents
					</div>
					<div
						className={category === 'agents' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('agents');
						}}
					>
						For hosts & specialists
					</div>
					<div
						className={category === 'membership' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('membership');
						}}
					>
						Membership
					</div>
					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
						Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						Other
					</div>
				</Box>
				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
