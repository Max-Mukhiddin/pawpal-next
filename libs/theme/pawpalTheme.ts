import { createTheme } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { light } from '../../scss/MaterialTheme';

/** PawPal Evergreen & Honey — light mode only. */
export function buildPawpalTheme(): Theme {
	const bg = '#eef4f0';

	return createTheme(
		deepmerge(light as ThemeOptions, {
			palette: {
				mode: 'light',
				background: {
					default: bg,
					paper: '#ffffff',
				},
				primary: {
					main: '#1e6b4f',
					contrastText: '#ffffff',
				},
				secondary: {
					main: '#e8a04b',
				},
				text: {
					primary: '#15241e',
					secondary: '#50625a',
				},
				divider: 'rgba(30, 107, 79, 0.1)',
			},
			components: {
				MuiCssBaseline: {
					styleOverrides: {
						body: {
							backgroundColor: bg,
							background: bg,
						},
					},
				},
				MuiCircularProgress: {
					defaultProps: {
						thickness: 4,
					},
					styleOverrides: {
						root: {
							color: '#1E6B4F',
						},
					},
				},
			},
		} as ThemeOptions),
	);
}
