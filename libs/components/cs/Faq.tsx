import React, { SyntheticEvent, useMemo, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { useQuery } from '@apollo/client';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_FAQS } from '../../../apollo/user/query';
import type { Faq as FaqItem } from '../../types/cs/faq';
import type { FaqsInquiry } from '../../types/cs/faq.input';
import PpLoader from '../common/PpLoader';

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

const CATEGORY_CHIPS = ['ALL', 'PAYMENT', 'ACCOUNT', 'TECHNICAL', 'EVENT'] as const;

const categoryLabel = (cat: string) => {
	if (!cat || cat === 'ALL') return 'All';
	return cat.charAt(0) + cat.slice(1).toLowerCase();
};

const Faq = () => {
	const device = useDeviceDetect();
	const [activeCategory, setActiveCategory] = useState<string>('ALL');
	const [searchText, setSearchText] = useState('');
	const [queryText, setQueryText] = useState('');
	const [expanded, setExpanded] = useState<string | false>(false);

	const inquiry: FaqsInquiry = useMemo(
		() => ({
			page: 1,
			limit: 50,
			search: {
				...(activeCategory !== 'ALL' ? { faqCategory: activeCategory } : {}),
				...(queryText.trim() ? { text: queryText.trim() } : {}),
			},
		}),
		[activeCategory, queryText],
	);

	const { data, loading } = useQuery(GET_FAQS, {
		variables: { input: inquiry },
		fetchPolicy: 'network-only',
	});

	const faqs: FaqItem[] = useMemo(() => {
		const list: FaqItem[] = data?.getFaqs?.list ?? [];
		return [...list].sort((a, b) => (a.faqOrder ?? 0) - (b.faqOrder ?? 0));
	}, [data]);

	const handleChange = (panel: string) => (_event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') setQueryText(searchText);
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	}

	return (
		<Stack className="faq-content">
			<div className="cs-filters">
				<input
					className="cs-filters__search"
					type="search"
					placeholder="Search FAQs..."
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={onSearchKeyDown}
				/>
				<div className="cs-filters__chips">
					{CATEGORY_CHIPS.map((cat) => (
						<button
							key={cat}
							type="button"
							className={`cs-filters__chip ${activeCategory === cat ? 'cs-filters__chip--active' : ''}`}
							onClick={() => setActiveCategory(cat)}
						>
							{categoryLabel(cat)}
						</button>
					))}
				</div>
			</div>

			<Box className="wrap" component="div">
				{loading ? (
					<div className="cs-list-state">
						<PpLoader size={48} />
					</div>
				) : faqs.length === 0 ? (
					<div className="cs-list-state cs-list-state--empty">
						<img src="/img/logo/pawpal-logo-mark.png" alt="" className="cs-list-state__icon" />
						<p>No FAQs yet</p>
					</div>
				) : (
					faqs.map((faq) => (
						<Accordion
							expanded={expanded === faq._id}
							onChange={handleChange(faq._id)}
							key={faq._id}
						>
							<AccordionSummary id={`faq-${faq._id}`} className="question" aria-controls={`faq-body-${faq._id}`}>
								<Typography className="badge" variant="h4">
									Q
								</Typography>
								<Typography>{faq.faqQuestion}</Typography>
							</AccordionSummary>
							<AccordionDetails id={`faq-body-${faq._id}`}>
								<Stack className="answer flex-box">
									<div
										className="faq-answer-html"
										dangerouslySetInnerHTML={{ __html: faq.faqAnswer }}
									/>
								</Stack>
							</AccordionDetails>
						</Accordion>
					))
				)}
			</Box>
		</Stack>
	);
};

export default Faq;
