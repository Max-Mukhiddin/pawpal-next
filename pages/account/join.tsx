import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Dialog, DialogContent, Divider, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const infoRows = [
	{ icon: '⏱', text: 'Review takes up to 24 hours' },
	{ icon: '📧', text: "We'll notify you once approved" },
	{ icon: '✅', text: 'You can login and track your status' },
];

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

	const handleApplicationDialogClose = () => {
		setApplicationDialogOpen(false);
		setLoginView(true);
	};

	return (
		<>
			<Stack className="join-page">
				<div className="join-page__visual">
					<div className="join-page__visual-overlay" />
					<div className="join-page__brand">
						<img src="/images/footer/pawpal-logo-light.svg" alt="PawPal" style={{ height: '36px', width: 'auto' }} />
					</div>
					<div className="join-page__welcome">
						<h1>Hello!</h1>
						<p>Welcome to PawPal. Your pet care journey starts here.</p>
					</div>
				</div>

				<div className="join-page__form-wrapper">
					<div className="join-page__form-container">
						<div className="join-page__tabs">
							<button
								type="button"
								className={`join-page__tab ${loginView ? 'active' : ''}`}
								onClick={() => {
									setLoginView(true);
									setErrorMessage(null);
									setSuccessMessage(null);
								}}
							>
								Sign In
							</button>
							<button
								type="button"
								className={`join-page__tab ${!loginView ? 'active' : ''}`}
								onClick={() => {
									setLoginView(false);
									setErrorMessage(null);
									setSuccessMessage(null);
								}}
							>
								Sign Up
							</button>
						</div>

						{loginView && (
							<div className="join-page__form">
								<h2>Welcome back</h2>
								<p className="join-page__subtitle">Sign in to manage your bookings and pet profiles</p>

								<div className="form-field">
									<span className="form-field__icon">👤</span>
									<input
										type="text"
										placeholder="Nickname"
										maxLength={16}
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && doLogin()}
									/>
								</div>

								<div className="form-field">
									<span className="form-field__icon">🔒</span>
									<input
										type={showPassword ? 'text' : 'password'}
										placeholder="Password"
										maxLength={12}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && doLogin()}
									/>
									<button
										type="button"
										className="form-field__toggle"
										onClick={() => setShowPassword((prev) => !prev)}
									>
										{showPassword ? '🙈' : '👁'}
									</button>
								</div>

								<div className="join-page__forgot">
									<a href="#">Forgot password?</a>
								</div>

								{errorMessage && (
									<div className="join-page__alert join-page__alert--error">
										<span className="join-page__alert-icon">⚠️</span>
										<span>{errorMessage}</span>
									</div>
								)}

								{successMessage && (
									<div className="join-page__alert join-page__alert--success">
										<span className="join-page__alert-icon">✓</span>
										<span>{successMessage}</span>
									</div>
								)}

								<button className="btn-primary" type="button" onClick={doLogin}>
									Sign In
								</button>

								<div className="join-page__divider">
									<span>or continue with</span>
								</div>

								<button className="btn-social" type="button">
									<img src="/img/icons/google.svg" alt="" width="20" height="20" />
									<span>Continue with Google</span>
								</button>

								<div className="join-page__switch">
									Don&apos;t have an account?{' '}
									<button type="button" onClick={() => viewChangeHandler(false)}>
										Sign Up
									</button>
								</div>
							</div>
						)}

						{!loginView && (
							<div className="join-page__form">
								<h2>Create Account</h2>
								<p className="join-page__subtitle">Join our community of pet lovers</p>

								<div className="form-field">
									<input
										type="text"
										placeholder="Username"
										maxLength={16}
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
									/>
								</div>

								<div className="form-field">
									<input
										type="tel"
										placeholder="Phone number"
										maxLength={20}
										value={input.phone}
										onChange={(e) => handleInput('phone', e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
									/>
								</div>

								<div className="form-field">
									<input
										type={showPassword ? 'text' : 'password'}
										placeholder="Password"
										maxLength={12}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
									/>
									<button
										type="button"
										className="form-field__toggle"
										onClick={() => setShowPassword((prev) => !prev)}
									>
										{showPassword ? '🙈' : '👁'}
									</button>
								</div>

								<label className="join-page__checkbox">
									<input
										type="checkbox"
										checked={input.type === 'AGENT'}
										onChange={(e) => handleInput('type', e.target.checked ? 'AGENT' : 'USER')}
									/>
									<span>I want to register as a specialist</span>
								</label>

								{input.type === 'AGENT' && (
									<div className="form-field">
										<textarea
											placeholder="Tell us about your experience..."
											maxLength={1000}
											value={memberDesc}
											onChange={(e) => setMemberDesc(e.target.value)}
										/>
									</div>
								)}

								{errorMessage && (
									<div className="join-page__alert join-page__alert--error">
										<span className="join-page__alert-icon">⚠️</span>
										<span>{errorMessage}</span>
									</div>
								)}

								{successMessage && (
									<div className="join-page__alert join-page__alert--success">
										<span className="join-page__alert-icon">✓</span>
										<span>{successMessage}</span>
									</div>
								)}

								<button className="btn-primary" type="button" onClick={doSignUp}>
									Create Account
								</button>

								<div className="join-page__switch">
									Already have an account?{' '}
									<button type="button" onClick={() => viewChangeHandler(true)}>
										Sign In
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</Stack>

			{/* Specialist application submitted dialog */}
			<Dialog
				open={applicationDialogOpen}
				onClose={handleApplicationDialogClose}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogContent>
					<div style={{ padding: '40px', textAlign: 'center' }}>
						{/* Paw icon */}
						<div
							style={{
								width: 80,
								height: 80,
								background: 'var(--pp-primary-soft)',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '40px',
								margin: '0 auto',
							}}
						>
							🐾
						</div>

							{/* Title */}
							<p
								style={{
									fontSize: '24px',
									fontWeight: 700,
									marginTop: '16px',
									marginBottom: 0,
									color: '#181A20',
								}}
							>
								Application Submitted!
							</p>

							{/* Subtitle */}
							<p style={{ color: '#666', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
								We&apos;re reviewing your specialist profile
							</p>

							<Divider sx={{ my: '24px' }} />

							{/* Info rows */}
							<div style={{ textAlign: 'left', marginBottom: '28px' }}>
								{infoRows.map((row) => (
									<div
										key={row.text}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											padding: '8px 0',
										}}
									>
										<span style={{ fontSize: '20px', lineHeight: 1 }}>{row.icon}</span>
										<span style={{ fontSize: '14px', color: '#333' }}>{row.text}</span>
									</div>
								))}
							</div>

							{/* CTA button */}
							<Button
								fullWidth
								onClick={handleApplicationDialogClose}
								sx={{
									background: 'var(--pp-primary)',
									color: '#fff',
									borderRadius: '50px',
									padding: '12px 0',
									fontSize: '15px',
									fontWeight: 600,
									textTransform: 'none',
									'&:hover': { background: 'var(--pp-primary-hover)' },
								}}
							>
								Got it!
							</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default withLayoutBasic(Join);
