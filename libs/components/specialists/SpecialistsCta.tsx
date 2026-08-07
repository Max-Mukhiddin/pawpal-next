import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Button, Dialog, DialogContent } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { userVar } from '../../../apollo/store';
import { APPLY_AS_SPECIALIST } from '../../../apollo/user/mutation';
import { updateStorage, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import SpecialistApplicationDialog from '../auth/SpecialistApplicationDialog';

interface CtaData {
	title: string;
	lead: string;
	primaryCta: string;
}

interface SpecialistsCtaProps {
	data: CtaData;
}

const SpecialistsCta: React.FC<SpecialistsCtaProps> = ({ data }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [applyModalOpen, setApplyModalOpen] = useState(false);
	const [submittedDialogOpen, setSubmittedDialogOpen] = useState(false);
	const [memberDesc, setMemberDesc] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [applyAsSpecialist, { loading: applying }] = useMutation(APPLY_AS_SPECIALIST);

	const isLoggedIn = Boolean(user?._id);
	const isPending = Boolean(user?.isPendingSpecialist);
	const isSpecialist = user?.memberType === MemberType.AGENT && !isPending;

	const buttonLabel = isSpecialist
		? "You're already a specialist"
		: isPending
			? 'Application Pending'
			: data.primaryCta;

	const handlePrimaryClick = () => {
		if (!isLoggedIn) {
			void router.push('/account/join?specialist=true');
			return;
		}
		setErrorMessage(null);
		setMemberDesc('');
		setApplyModalOpen(true);
	};

	const handleSubmit = async () => {
		setErrorMessage(null);
		if (!memberDesc.trim() || memberDesc.trim().length < 10) {
			setErrorMessage('Please describe your experience (at least 10 characters)');
			return;
		}

		try {
			const result = await applyAsSpecialist({ variables: { memberDesc: memberDesc.trim() } });
			const freshToken = result?.data?.applyAsSpecialist?.accessToken;
			if (freshToken) {
				// Persist the pending state across reloads via the refreshed JWT
				updateStorage({ jwtToken: freshToken });
				updateUserInfo(freshToken);
			} else {
				// Reflect the pending state immediately so the button flips without a re-login
				userVar({ ...userVar(), isPendingSpecialist: true });
			}
			setApplyModalOpen(false);
			setSubmittedDialogOpen(true);
		} catch (err: any) {
			const msg =
				err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Application failed. Please try again.';
			setErrorMessage(msg);
		}
	};

	return (
		<>
			<section className="pawpal-static-page__cta">
				<h2>{data.title}</h2>
				<p>{data.lead}</p>
				<div className="pawpal-static-page__cta-actions">
					<button
						type="button"
						onClick={handlePrimaryClick}
						disabled={isSpecialist || isPending}
					>
						{buttonLabel}
					</button>
				</div>
			</section>

			{/* Experience form — logged-in USER applying as specialist */}
			<Dialog
				open={applyModalOpen}
				onClose={() => !applying && setApplyModalOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogContent>
					<div style={{ padding: '32px 24px', textAlign: 'center' }}>
						<div
							style={{
								width: 64,
								height: 64,
								background: 'var(--pp-primary-soft)',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '32px',
								margin: '0 auto',
							}}
						>
							🐾
						</div>

						<p
							style={{
								fontSize: '22px',
								fontWeight: 700,
								marginTop: '16px',
								marginBottom: 0,
								color: '#181A20',
							}}
						>
							Apply as a Specialist
						</p>

						<p style={{ color: '#666', fontSize: '14px', marginTop: '8px', marginBottom: '24px' }}>
							Tell us about your pet care experience — our team reviews every application.
						</p>

						<div style={{ textAlign: 'left' }}>
							<label
								htmlFor="cta-specialist-desc"
								style={{
									display: 'block',
									fontSize: '13px',
									fontWeight: 600,
									color: '#333',
									marginBottom: '8px',
								}}
							>
								Your experience
							</label>
							<textarea
								id="cta-specialist-desc"
								placeholder="Tell us about your experience..."
								maxLength={1000}
								rows={5}
								value={memberDesc}
								onChange={(e) => setMemberDesc(e.target.value)}
								style={{
									width: '100%',
									boxSizing: 'border-box',
									padding: '13px 16px',
									background: 'rgba(226, 237, 229, 0.5)',
									border: '1.5px solid rgba(23, 62, 50, 0.12)',
									borderRadius: '12px',
									fontFamily: "'Poppins', sans-serif",
									fontSize: '0.95rem',
									color: '#15241e',
									lineHeight: 1.5,
									resize: 'vertical',
									outline: 'none',
								}}
							/>
						</div>

						{errorMessage && (
							<div
								role="alert"
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									marginTop: '14px',
									color: '#c62828',
									fontSize: '13px',
									textAlign: 'left',
								}}
							>
								<ErrorOutlineRoundedIcon sx={{ fontSize: 18 }} aria-hidden />
								<span>{errorMessage}</span>
							</div>
						)}

						<Button
							fullWidth
							onClick={handleSubmit}
							disabled={applying}
							sx={{
								mt: '24px',
								background: 'var(--pp-primary)',
								color: 'var(--pp-honey)',
								borderRadius: '50px',
								padding: '12px 0',
								fontSize: '15px',
								fontWeight: 600,
								textTransform: 'none',
								'&:hover': { background: 'var(--pp-primary-hover)' },
								'&.Mui-disabled': { background: 'var(--pp-primary)', color: 'var(--pp-honey)', opacity: 0.5 },
							}}
						>
							{applying ? 'Submitting…' : 'Submit Application'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Already logged in and on the site — closing simply dismisses */}
			<SpecialistApplicationDialog
				open={submittedDialogOpen}
				onClose={() => setSubmittedDialogOpen(false)}
			/>
		</>
	);
};

export default SpecialistsCta;
