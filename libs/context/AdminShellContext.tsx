import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AdminShellContextValue = {
	globalSearch: string;
	setGlobalSearch: (value: string) => void;
	submitGlobalSearch: () => void;
	registerSearchHandler: (handler: (() => void) | null) => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: React.ReactNode }) {
	const [globalSearch, setGlobalSearch] = useState('');
	const [searchHandler, setSearchHandler] = useState<(() => void) | null>(null);

	const registerSearchHandler = useCallback((handler: (() => void) | null) => {
		setSearchHandler(() => handler);
	}, []);

	const submitGlobalSearch = useCallback(() => {
		searchHandler?.();
	}, [searchHandler]);

	const value = useMemo(
		() => ({
			globalSearch,
			setGlobalSearch,
			submitGlobalSearch,
			registerSearchHandler,
		}),
		[globalSearch, submitGlobalSearch, registerSearchHandler],
	);

	return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
	const ctx = useContext(AdminShellContext);
	if (!ctx) throw new Error('useAdminShell must be used within AdminShellProvider');
	return ctx;
}
