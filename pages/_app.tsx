import type { AppProps } from 'next/app';
import React from 'react';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { ThemeModeProvider } from '../libs/theme';
import ErrorBoundary from '../libs/components/common/ErrorBoundary';
import BottomVignette from '../libs/components/common/BottomVignette';
import PpToastProvider from '../libs/components/common/PpToastProvider';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextI18NextConfig = require('../next-i18next.config');

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
			</Head>
			<ThemeModeProvider>
				<PpToastProvider>
					<ErrorBoundary>
						<Component {...pageProps} />
					</ErrorBoundary>
					<BottomVignette />
				</PpToastProvider>
			</ThemeModeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App, nextI18NextConfig);
