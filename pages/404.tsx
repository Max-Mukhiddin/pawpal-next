import Link from 'next/link';
import Head from 'next/head';

export default function NotFound() {
	return (
		<>
			<Head>
				<title>Page not found | PawPal</title>
				<meta name="description" content="This paw print led nowhere. Head back to PawPal for pet care services and products." />
			</Head>
			<div
				style={{
					minHeight: '70vh',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '48px 24px',
					background: 'var(--pp-bg-page, #EEF4F0)',
					textAlign: 'center',
				}}
			>
				<p style={{ fontSize: '4rem', margin: '0 0 16px' }} aria-hidden>
					🐾
				</p>
				<h1
					style={{
						fontFamily: 'Fraunces, Playfair Display, Georgia, serif',
						fontSize: 'clamp(2rem, 5vw, 3rem)',
						fontWeight: 800,
						color: '#15241E',
						margin: '0 0 12px',
					}}
				>
					Oops! This paw print led nowhere.
				</h1>
				<p style={{ color: '#50625A', maxWidth: 420, marginBottom: 32, lineHeight: 1.6 }}>
					The page you are looking for may have moved or does not exist.
				</p>
				<Link href="/" className="pp-btn pp-btn--honey">
					Back to PawPal home
				</Link>
			</div>
		</>
	);
}
