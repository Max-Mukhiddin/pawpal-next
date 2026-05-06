import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	Divider,
	FormControlLabel,
	FormGroup,
	Stack,
} from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
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
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		console.warn(input);
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			const isSpecialistSignup = input.type === 'AGENT';
			const memberType = 'USER';
			const isPendingSpecialist = isSpecialistSignup;

			await signUp(input.nick, input.password, input.phone, memberType, {
				isPendingSpecialist,
			});

			if (isSpecialistSignup) {
				setApplicationDialogOpen(true);
			} else {
				await sweetMixinSuccessAlert('Signup successful! Welcome to PawPal.');
				await router.push(`${router.query.referrer ?? '/'}`);
			}
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	const handleApplicationDialogClose = () => {
		setApplicationDialogOpen(false);
		setLoginView(true);
	};

	console.log('+input: ', input);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'join-page'}>
					<Stack className={'container'}>
						<Stack className={'main'}>
							<Stack className={'left'}>
								{/* @ts-ignore */}
								<Box className={'logo'}>
									<span style={{ fontSize: '24px', fontWeight: 700, color: '#E07B3A' }}>PawPal</span>
								</Box>
								<Box className={'info'}>
									<span>{loginView ? 'login' : 'signup'}</span>
									<p>Welcome back! Sign in to book pet services.</p>
								</Box>
								<Box className={'input-wrap'}>
									<div className={'input-box'}>
										<span>Nickname</span>
										<input
											type="text"
											placeholder={'Enter Nickname'}
											onChange={(e) => handleInput('nick', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter' && loginView) doLogin();
												if (event.key == 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>
									<div className={'input-box'}>
										<span>Password</span>
										<input
											type="text"
											placeholder={'Enter Password'}
											onChange={(e) => handleInput('password', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter' && loginView) doLogin();
												if (event.key == 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>
									{!loginView && (
										<div className={'input-box'}>
											<span>Phone</span>
											<input
												type="text"
												placeholder={'Enter Phone'}
												onChange={(e) => handleInput('phone', e.target.value)}
												required={true}
												onKeyDown={(event) => {
													if (event.key == 'Enter') doSignUp();
												}}
											/>
										</div>
									)}
								</Box>
								{!loginView && (
									<Box
										className="join-member-type"
										sx={{
											mt: 2.5,
											width: '470px',
											maxWidth: '100%',
											display: 'flex',
											flexDirection: 'column',
											gap: 1.25,
											alignSelf: 'center',
										}}
									>
										<Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: '#181A20' }}>
											I am signing up as
										</Box>
										<Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
											<Button
												type="button"
												variant={input.type === 'USER' ? 'contained' : 'outlined'}
												onClick={() => handleInput('type', 'USER')}
												sx={{
													flex: 1,
													borderRadius: '999px',
													textTransform: 'none',
													fontWeight: 600,
													py: 1.25,
													borderColor: '#ddd',
													...(input.type === 'USER'
														? { bgcolor: '#E07B3A', color: '#fff', '&:hover': { bgcolor: '#c96a32' } }
														: { color: '#181A20' }),
												}}
											>
												Pet Owner
											</Button>
											<Button
												type="button"
												variant={input.type === 'AGENT' ? 'contained' : 'outlined'}
												onClick={() => handleInput('type', 'AGENT')}
												sx={{
													flex: 1,
													borderRadius: '999px',
													textTransform: 'none',
													fontWeight: 600,
													py: 1.25,
													borderColor: '#ddd',
													...(input.type === 'AGENT'
														? { bgcolor: '#E07B3A', color: '#fff', '&:hover': { bgcolor: '#c96a32' } }
														: { color: '#181A20' }),
												}}
											>
												Specialist / Provider
											</Button>
										</Stack>
									</Box>
								)}
								<Box className={'register'}>
									{loginView && (
										<div className={'remember-info'}>
											<FormGroup>
												<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
											</FormGroup>
											<a>Lost your password?</a>
										</div>
									)}

									{loginView ? (
										<Button
											variant="contained"
											endIcon={<img src="/img/icons/rightup.svg" alt="" />}
											disabled={input.nick == '' || input.password == ''}
											onClick={doLogin}
										>
											LOGIN
										</Button>
									) : (
										<Button
											variant="contained"
											disabled={input.nick == '' || input.password == '' || input.phone == ''}
											onClick={doSignUp}
											endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										>
											SIGNUP
										</Button>
									)}
								</Box>
								<Box className={'ask-info'}>
									{loginView ? (
										<p>
											Not registered yet?
											<b
												onClick={() => {
													viewChangeHandler(false);
												}}
											>
												SIGNUP
											</b>
										</p>
									) : (
										<p>
											Have account?
											<b onClick={() => viewChangeHandler(true)}> LOGIN</b>
										</p>
									)}
								</Box>
							</Stack>
							<Stack className={'right'}></Stack>
						</Stack>
					</Stack>
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
									background: '#FFF3EC',
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
									background: '#E07B3A',
									color: '#fff',
									borderRadius: '50px',
									padding: '12px 0',
									fontSize: '15px',
									fontWeight: 600,
									textTransform: 'none',
									'&:hover': { background: '#c96a32' },
								}}
							>
								Got it!
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	}
};

export default withLayoutBasic(Join);
