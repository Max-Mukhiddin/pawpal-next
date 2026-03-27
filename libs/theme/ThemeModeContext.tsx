import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from 'react';
import type { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { buildPawpalTheme } from './pawpalTheme';
import { PAWPAL_THEME_MODE_KEY } from './constants';

declare global {
	interface Window {
		__PAWPAL_THEME_MODE__?: PaletteMode;
	}
}

const THEME_STORE_EVENT = 'pawpal-theme-store';

type ThemeModeContextValue = {
	mode: PaletteMode;
	setMode: (mode: PaletteMode) => void;
	toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function readStoredMode(): PaletteMode {
	if (typeof window === 'undefined') return 'light';
	try {
		const v = window.localStorage.getItem(PAWPAL_THEME_MODE_KEY);
		if (v === 'dark' || v === 'light') return v;
	} catch {
		/* ignore */
	}
	return 'light';
}

function getThemeSnapshot(): PaletteMode {
	if (typeof window === 'undefined') return 'light';
	const injected = window.__PAWPAL_THEME_MODE__;
	if (injected === 'dark' || injected === 'light') return injected;
	return readStoredMode();
}

function getServerThemeSnapshot(): PaletteMode {
	return 'light';
}

function subscribeTheme(onStoreChange: () => void) {
	if (typeof window === 'undefined') return () => {};
	const onStorage = (e: StorageEvent) => {
		if (e.key !== PAWPAL_THEME_MODE_KEY) return;
		const v = e.newValue;
		if (v === 'dark' || v === 'light') {
			window.__PAWPAL_THEME_MODE__ = v;
		}
		onStoreChange();
	};
	window.addEventListener(THEME_STORE_EVENT, onStoreChange);
	window.addEventListener('storage', onStorage);
	return () => {
		window.removeEventListener(THEME_STORE_EVENT, onStoreChange);
		window.removeEventListener('storage', onStorage);
	};
}

function applyDomTheme(mode: PaletteMode) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', mode);
	document.documentElement.style.colorScheme = mode;
}

function publishTheme(mode: PaletteMode) {
	if (typeof window === 'undefined') return;
	window.__PAWPAL_THEME_MODE__ = mode;
	try {
		window.localStorage.setItem(PAWPAL_THEME_MODE_KEY, mode);
	} catch {
		/* ignore */
	}
	try {
		document.cookie = `${PAWPAL_THEME_MODE_KEY}=${mode};path=/;max-age=31536000;SameSite=Lax`;
	} catch {
		/* ignore */
	}
	applyDomTheme(mode);
	window.dispatchEvent(new Event(THEME_STORE_EVENT));
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
	const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

	/* Keep DOM / cookie aligned after hydration when snapshot differs from server default. */
	useEffect(() => {
		applyDomTheme(mode);
		try {
			window.localStorage.setItem(PAWPAL_THEME_MODE_KEY, mode);
		} catch {
			/* ignore */
		}
		try {
			document.cookie = `${PAWPAL_THEME_MODE_KEY}=${mode};path=/;max-age=31536000;SameSite=Lax`;
		} catch {
			/* ignore */
		}
	}, [mode]);

	const setMode = useCallback((next: PaletteMode) => {
		publishTheme(next);
	}, []);

	const toggleMode = useCallback(() => {
		publishTheme(mode === 'light' ? 'dark' : 'light');
	}, [mode]);

	const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

	const theme = useMemo(() => buildPawpalTheme(mode), [mode]);

	return (
		<ThemeModeContext.Provider value={value}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeModeContext.Provider>
	);
}

export function useThemeMode(): ThemeModeContextValue {
	const ctx = useContext(ThemeModeContext);
	if (!ctx) {
		throw new Error('useThemeMode must be used within ThemeModeProvider');
	}
	return ctx;
}
