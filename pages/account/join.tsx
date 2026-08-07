import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import JoinPasswordInput from '../../libs/components/auth/JoinPasswordInput';
import SpecialistApplicationDialog from '../../libs/components/auth/SpecialistApplicationDialog';
import { Stack } from '@mui/material';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/**
 * ─────────────────────────────────────────────────────────────────────────
 * /account/join — redesign direction: "Full-bleed editorial gateway"
 * ─────────────────────────────────────────────────────────────────────────
 * The split-panel becomes a single full-bleed pet photo (the existing local
 * asset) with a floating porcelain-glass form card. A forest scrim (heavier
 * on the left/top for legibility) plus a fine CSS grain overlay give the
 * photo editorial depth without hurting readability.
 *
 * Composition:
 *   · top-left  — PawPal brand lockup over the photo
 *   · top-right — "Back to Home" glass pill → "/"
 *   · left      — floating testimonial (Seo-yeon P.) with a 5-star rating,
 *                 the page's single signature element (desktop only)
 *   · right     — floating form card: the action surface
 *
 * Constraints honored: Apollo/auth logic, inputs, validation, handlers and
 * the NICKNAME field (never email) are untouched — this is visual/structural
 * only. No fabricated statistics: social proof is one real qualitative review
 * plus a checkmark trust line. Accent stays on the honey token (#E8A04B).
 *
 * Motion (preserved & adapted, all reduced-motion guarded): warm `join-rise`
 * stagger on load, a honey focus-glow ring on inputs, and an arrow that
 * slides on the primary button hover. Responsive: the testimonial hides and
 * the card centres at ≤900px; the card fills comfortably at ≤767px.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Swap this file anytime: public/images/join_page.jpg */
const JOIN_PANEL_PHOTO = '/images/join_page.jpg';

const Join: NextPage = () => {
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [memberDesc, setMemberDesc] = useState('');
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState(false);
	const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const isPendingSpecialist = input.type === 'AGENT';

	// Deep link: /account/join?specialist=true opens signup with the specialist fields visible
	useEffect(() => {
		if (!router.isReady) return;
		if (router.query.specialist === 'true') {
			setLoginView(false);
			setInput((prev) => ({ ...prev, type: 'AGENT' }));
		}
	}, [router.isReady, router.query.specialist]);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		const nick = input.nick;
		const password = input.password;

		setErrorMessage(null);
		setSuccessMessage(null);

		if (!nick.trim() || !password.trim()) {
			setErrorMessage('Please enter both nickname and password');
			return;
		}
		if (nick.length < 3 || nick.length > 16) {
			setErrorMessage('Nickname must be between 3 and 16 characters');
			return;
		}
		if (password.length < 5 || password.length > 12) {
			setErrorMessage('Password must be between 5 and 12 characters');
			return;
		}

		try {
			await logIn(nick, password);
			setSuccessMessage('Welcome back!');
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			const msg =
				err?.message || err?.graphQLErrors?.[0]?.message || 'Login failed. Please check your credentials.';
			setErrorMessage(msg);
		}
	}, [input.nick, input.password, router]);

	const doSignUp = useCallback(async () => {
		const nick = input.nick;
		const password = input.password;
		const phone = input.phone;

		setErrorMessage(null);
		setSuccessMessage(null);

		if (!nick.trim() || !password.trim() || !phone.trim()) {
			setErrorMessage('Please fill in all required fields');
			return;
		}
		if (nick.length < 3 || nick.length > 16) {
			setErrorMessage('Nickname must be between 3 and 16 characters');
			return;
		}
		if (password.length < 5 || password.length > 12) {
			setErrorMessage('Password must be between 5 and 12 characters');
			return;
		}
		if (phone.length < 7 || phone.length > 20) {
			setErrorMessage('Please enter a valid phone number');
			return;
		}
		if (isPendingSpecialist && (!memberDesc || memberDesc.length < 10)) {
			setErrorMessage('Please describe your experience (at least 10 characters)');
			return;
		}

		try {
			await signUp(nick, password, phone, 'USER', {
				isPendingSpecialist,
				memberDesc,
			});

			if (isPendingSpecialist) {
				setSuccessMessage('Application submitted! Waiting for admin approval.');
				setApplicationDialogOpen(true);
			} else {
				setSuccessMessage('Account created successfully!');
				await router.push(`${router.query.referrer ?? '/'}`);
			}
		} catch (err: any) {
			const msg = err?.message || err?.graphQLErrors?.[0]?.message || 'Signup failed. Please try again.';
			setErrorMessage(msg);
		}
	}, [input.nick, input.password, input.phone, memberDesc, isPendingSpecialist, router]);

	// Specialist signups return a real JWT (already stored by signUp) —
	// the user is an active, logged-in USER, so send them home.
	const handleApplicationDialogClose = () => {
		setApplicationDialogOpen(false);
		void router.push('/');
	};

	return (
		<>
			<Stack className="join-page">
				<div className="join-page__bg" aria-hidden>
					<img
						className="join-page__photo"
						src={JOIN_PANEL_PHOTO}
						alt=""
						width={1600}
						height={1200}
						decoding="async"
					/>
					<div className="join-page__bg-scrim" />
					<div className="join-page__bg-noise" />
				</div>

				<header className="join-page__topbar">
					<div className="join-page__brand join-page__brand--top">
						<img
							className="join-page__brand-mark"
							src="/img/logo/pawpal-logo-mark.png"
							alt=""
							width={30}
							height={30}
						/>
						<span className="join-page__logo">PawPal</span>
					</div>
					<Link href="/" className="join-page__back">
						<ArrowBackRoundedIcon className="join-page__back-icon" aria-hidden />
						<span>Back to Home</span>
					</Link>
				</header>

				<figure className="join-page__testimonial">
					<div className="join-page__stars" aria-hidden>
						<StarRoundedIcon />
						<StarRoundedIcon />
						<StarRoundedIcon />
						<StarRoundedIcon />
						<StarRoundedIcon />
					</div>
					<blockquote>
						Booking a groomer for my anxious rescue used to mean weeks of phone
						calls. On PawPal it took one afternoon.
					</blockquote>
					<figcaption>
						<span className="join-page__testimonial-name">Seo-yeon P.</span>
						<span className="join-page__testimonial-role">Dog parent · Seoul</span>
					</figcaption>
				</figure>

				<div className="join-page__card">
					<div className="join-page__card-inner">
								{loginView && (
									<div className="join-page__form">
										<h2 className="hover-zoom-text hover-zoom-text--headline">
											Welcome back
										</h2>
										<p className="join-page__subtitle hover-zoom-text">
											Your specialists, bookings, and pet care — right where you left off.
										</p>

										<div className="form-field">
											<label className="form-field__label hover-zoom-text" htmlFor="join-nick">
												Nickname
											</label>
											<div className="form-field__control">
												<input
													id="join-nick"
													type="text"
													placeholder="e.g. dogmom_seoyeon"
													maxLength={16}
													value={input.nick}
													onChange={(e) => handleInput('nick', e.target.value)}
													onKeyDown={(e) => e.key === 'Enter' && doLogin()}
												/>
											</div>
										</div>

										<div className="form-field form-field--password">
											<div className="form-field__meta">
												<label className="form-field__label hover-zoom-text" htmlFor="join-password">
													Password
												</label>
												<a href="#" className="join-page__forgot">
													<span className="hover-zoom-text">Forgot password?</span>
												</a>
											</div>
											<JoinPasswordInput
												id="join-password"
												value={input.password}
												visible={showPassword}
												onToggle={() => setShowPassword((prev) => !prev)}
												onChange={(e) => handleInput('password', e.target.value)}
												onKeyDown={(e) => e.key === 'Enter' && doLogin()}
											/>
										</div>

										{errorMessage && (
											<div className="join-page__alert join-page__alert--error" role="alert">
												<ErrorOutlineRoundedIcon className="join-page__alert-icon" aria-hidden />
												<span className="hover-zoom-text">{errorMessage}</span>
											</div>
										)}

										{successMessage && (
											<div className="join-page__alert join-page__alert--success" role="status" aria-live="polite">
												<CheckCircleRoundedIcon className="join-page__alert-icon" aria-hidden />
												<span className="hover-zoom-text">{successMessage}</span>
											</div>
										)}

										<button className="btn-primary" type="button" onClick={doLogin}>
											<span>Sign In</span>
											<ArrowForwardRoundedIcon className="btn-primary__arrow" aria-hidden />
										</button>

										<div className="join-page__divider">
											<span className="hover-zoom-text hover-zoom-text--center">or continue with</span>
										</div>

										<button className="btn-social" type="button">
											<img src="/img/icons/google.svg" alt="" width="20" height="20" />
											<span>Continue with Google</span>
										</button>

										<p className="join-page__trust">
											<VerifiedOutlinedIcon className="join-page__trust-icon" aria-hidden />
											<span>Trusted by pet parents and vetted care specialists</span>
										</p>

										<div className="join-page__switch">
											<span className="hover-zoom-text hover-zoom-text--center">New here? </span>
											<button type="button" onClick={() => viewChangeHandler(false)}>
												<span className="hover-zoom-text hover-zoom-text--center">Sign Up</span>
											</button>
										</div>
									</div>
								)}

								{!loginView && (
									<div className="join-page__form">
										<h2 className="hover-zoom-text hover-zoom-text--headline">
											Join PawPal&apos;s pet-care community
										</h2>
										<p className="join-page__subtitle hover-zoom-text">
											Create an account to book specialists and manage your pet&apos;s care.
										</p>

										<div className="form-field">
											<label className="form-field__label hover-zoom-text" htmlFor="join-username">
												Username
											</label>
											<div className="form-field__control">
												<input
													id="join-username"
													type="text"
													placeholder="Username"
													maxLength={16}
													value={input.nick}
													onChange={(e) => handleInput('nick', e.target.value)}
												/>
											</div>
										</div>

										<div className="form-field">
											<label className="form-field__label hover-zoom-text" htmlFor="join-phone">
												Phone number
											</label>
											<div className="form-field__control">
												<input
													id="join-phone"
													type="tel"
													placeholder="Phone number"
													maxLength={20}
													value={input.phone}
													onChange={(e) => handleInput('phone', e.target.value)}
													onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
												/>
											</div>
										</div>

										<div className="form-field form-field--password">
											<label className="form-field__label hover-zoom-text" htmlFor="join-signup-password">
												Password
											</label>
											<JoinPasswordInput
												id="join-signup-password"
												value={input.password}
												visible={showPassword}
												onToggle={() => setShowPassword((prev) => !prev)}
												onChange={(e) => handleInput('password', e.target.value)}
												onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
											/>
										</div>

										<label className="join-page__checkbox">
											<input
												type="checkbox"
												checked={input.type === 'AGENT'}
												onChange={(e) => handleInput('type', e.target.checked ? 'AGENT' : 'USER')}
											/>
											<span className="hover-zoom-text">I want to register as a specialist</span>
										</label>

										{input.type === 'AGENT' && (
											<div className="form-field">
												<label className="form-field__label hover-zoom-text" htmlFor="join-specialist-desc">
													Your experience
												</label>
												<div className="form-field__control">
													<textarea
														id="join-specialist-desc"
														placeholder="Tell us about your experience..."
														maxLength={1000}
														value={memberDesc}
														onChange={(e) => setMemberDesc(e.target.value)}
													/>
												</div>
											</div>
										)}

										{errorMessage && (
											<div className="join-page__alert join-page__alert--error" role="alert">
												<ErrorOutlineRoundedIcon className="join-page__alert-icon" aria-hidden />
												<span className="hover-zoom-text">{errorMessage}</span>
											</div>
										)}

										{successMessage && (
											<div className="join-page__alert join-page__alert--success" role="status" aria-live="polite">
												<CheckCircleRoundedIcon className="join-page__alert-icon" aria-hidden />
												<span className="hover-zoom-text">{successMessage}</span>
											</div>
										)}

										<button className="btn-primary" type="button" onClick={doSignUp}>
											<span>Create Account</span>
											<ArrowForwardRoundedIcon className="btn-primary__arrow" aria-hidden />
										</button>

										<div className="join-page__switch">
											<span className="hover-zoom-text hover-zoom-text--center">Already have an account? </span>
											<button type="button" onClick={() => viewChangeHandler(true)}>
												<span className="hover-zoom-text hover-zoom-text--center">Sign In</span>
											</button>
										</div>
									</div>
								)}
					</div>
				</div>
			</Stack>

			{/* Specialist application submitted dialog */}
			<SpecialistApplicationDialog
				open={applicationDialogOpen}
				onClose={handleApplicationDialogClose}
			/>
		</>
	);
};

export default withLayoutBasic(Join);
