import type { AppProps } from 'next/app';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { ThemeModeProvider } from '../libs/theme';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextI18NextConfig = require('../next-i18next.config');

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<ThemeModeProvider>
				<Component {...pageProps} />
			</ThemeModeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App, nextI18NextConfig);
