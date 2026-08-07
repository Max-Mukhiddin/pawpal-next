import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PpToast from './PpToast';
import {
	pushToast,
	removeToast,
	subscribeToasts,
	type ToastItem,
	type ToastType,
} from '../../toast/toastStore';

type ToastContextValue = {
	showToast: (message: string, type?: ToastType, duration?: number) => void;
	successToast: (message?: string, duration?: number) => void;
	errorToast: (message?: string, duration?: number) => void;
	infoToast: (message?: string, duration?: number) => void;
};

const PpToastContext = createContext<ToastContextValue | null>(null);

export const PpToastProvider = ({ children }: { children: React.ReactNode }) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	useEffect(() => subscribeToasts(setToasts), []);

	const handleClose = useCallback((id: string) => {
		removeToast(id);
	}, []);

	const value = useMemo<ToastContextValue>(
		() => ({
			showToast: (message, type = 'success', duration = 2400) => pushToast(message, type, duration),
			successToast: (message = 'Done!', duration = 2400) => pushToast(message, 'success', duration),
			errorToast: (message = 'Something went wrong', duration = 2800) =>
				pushToast(message, 'error', duration),
			infoToast: (message = 'Note', duration = 2400) => pushToast(message, 'info', duration),
		}),
		[],
	);

	return (
		<PpToastContext.Provider value={value}>
			{children}
			<div className="pp-toast-container" aria-label="Notifications">
				{toasts.map((toast) => (
					<PpToast
						key={toast.id}
						id={toast.id}
						message={toast.message}
						type={toast.type}
						duration={toast.duration}
						onClose={handleClose}
					/>
				))}
			</div>
		</PpToastContext.Provider>
	);
};

export const usePpToastContext = () => {
	const ctx = useContext(PpToastContext);
	if (!ctx) throw new Error('useToast must be used within PpToastProvider');
	return ctx;
};

export default PpToastProvider;
