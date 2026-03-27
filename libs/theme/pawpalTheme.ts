import type { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { light } from '../../scss/MaterialTheme';

/**
 * PawPal palette direction: warm cream / beige light; elegant neutral dark (no neon).
 * Merged onto existing MaterialTheme (typography, component defaults, etc.).
 */
function pawpalPalette(mode: PaletteMode): ThemeOptions['palette'] {
	if (mode === 'light') {
		return {
			mode: 'light',
			background: {
				default: '#f5f0e8',
				paper: '#faf7f2',
			},
			primary: {
				main: '#b85c38',
				contrastText: '#ffffff',
			},
			secondary: {
				main: '#5c5340',
			},
			text: {
				primary: '#2a241e',
				secondary: '#6b5d52',
			},
			divider: 'rgba(42, 36, 30, 0.12)',
		};
	}
	return {
		mode: 'dark',
		background: {
			default: '#121218',
			paper: '#1a1a22',
		},
		primary: {
			main: '#c49a6c',
			contrastText: '#121218',
		},
		secondary: {
			main: '#9a9285',
		},
		text: {
			primary: '#ebe7e0',
			secondary: '#9b948f',
		},
		divider: 'rgba(235, 231, 224, 0.12)',
	};
}

export function buildPawpalTheme(mode: PaletteMode): Theme {
	const palette = pawpalPalette(mode);
	const bg = palette?.background?.default ?? (mode === 'light' ? '#f5f0e8' : '#121218');

	return createTheme(
		deepmerge(light as ThemeOptions, {
			palette,
			components: {
				MuiCssBaseline: {
					styleOverrides: {
						body: {
							backgroundColor: bg,
							background: bg,
						},
					},
				},
			},
		} as ThemeOptions),
	);
}
