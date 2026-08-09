import { Html, Head, Main, NextScript } from 'next/document';

/** Light porcelain body bg before Emotion hydrates. */
const LIGHT_BODY_BOOTSTRAP = `(function(){try{document.documentElement.style.colorScheme='light';var st=document.createElement('style');st.id='pawpal-theme-critical';st.textContent='html body{background-color:#EEF4F0!important;background:#EEF4F0!important;}';document.head.appendChild(st);}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: LIGHT_BODY_BOOTSTRAP }} />
				<meta name="robots" content="index,follow" />
				<link rel="icon" href="/favicon.ico" type="image/x-icon" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap"
					rel="stylesheet"
				/>
				<meta name="keyword" content={'pawpal, pawpal.uz, pet care, pet services'} />
				<meta
					name="description"
					content="PawPal connects pet parents with vetted specialists for grooming, wellness, training, and trusted pet products."
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
