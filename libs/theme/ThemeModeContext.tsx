import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { buildPawpalTheme } from './pawpalTheme';

/** Light-only MUI theme — dark mode removed. */
export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
	const theme = useMemo(() => buildPawpalTheme(), []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}
