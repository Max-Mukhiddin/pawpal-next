import { Html, Head, Main, NextScript } from 'next/document';
import { PAWPAL_THEME_MODE_KEY } from '../libs/theme/constants';

/** Sets data-theme, MUI bootstrap global, optional critical body bg (avoids light flash before Emotion hydrates), mirrors theme to cookie for future SSR. */
const THEME_BOOTSTRAP = `(function(){try{var k=${JSON.stringify(PAWPAL_THEME_MODE_KEY)};var m=localStorage.getItem(k)||'light';if(m!=='dark'&&m!=='light')m='light';var r=document.documentElement;r.setAttribute('data-theme',m);r.style.colorScheme=m;window.__PAWPAL_THEME_MODE__=m;document.cookie=k+'='+m+';path=/;max-age=31536000;SameSite=Lax';if(m==='dark'){var st=document.createElement('style');st.id='pawpal-theme-critical';st.textContent='html[data-theme=dark] body{background-color:#121218!important;background:#121218!important;}';document.head.appendChild(st);}}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en" suppressHydrationWarning>
			<Head>
				<script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/logo-icon.svg" />
				<link
					href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap"
					rel="stylesheet"
				/>

				{/* SEO */}
				<meta name="keyword" content={'pawpal, pawpal.uz, devex mern, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={
						'Buy and sell properties anywhere anytime in South Korea. Best Properties at Best prices on pawpal.uz | ' +
						'Покупайте и продавайте недвижимость в любой точке Южной Кореи в любое время. Лучшая недвижимость по лучшим ценам на pawpal.uz | ' +
						'대한민국 언제 어디서나 부동산을 사고팔 수 있습니다. pawpal.uz에서 최적의 가격으로 최고의 부동산을 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
