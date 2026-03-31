const { initReactI18next } = require('react-i18next');

module.exports = {
	use: [initReactI18next],
	serializeConfig: false,
	react: {
		useSuspense: false,
	},
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'ru'],
		localeDetection: false,
	},
	trailingSlash: true,
};
