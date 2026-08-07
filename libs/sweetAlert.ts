import Swal from 'sweetalert2';
import 'animate.css';
import { Messages } from './config';
import { pushToast } from './toast/toastStore';
import {
	handleSignInRequiredError,
	type SignInAction,
	type SignInRouterLike,
} from './auth/signInPrompt';

/**
 * Branded confirmations — Evergreen & Honey.
 * Toasts use PpToast (pill + Lottie) via toastStore; SweetAlert2 only for confirms.
 */
export const successToast = (msg: string = 'Done!') => pushToast(msg, 'success', 2400);

export const errorToast = (msg: string = 'Something went wrong') => pushToast(msg, 'error', 2800);

export const pawpalConfirm = Swal.mixin({
	background: '#FFFFFF',
	color: '#15241E',
	confirmButtonColor: '#1E6B4F',
	cancelButtonColor: '#6B9E85',
	iconColor: '#E8A04B',
	customClass: {
		popup: 'pp-confirm',
		title: 'pp-confirm__title',
		confirmButton: 'pp-btn pp-btn--primary',
		cancelButton: 'pp-btn pp-btn--ghost',
	},
});

export const sweetErrorHandling = async (
	err: any,
	options?: { router?: SignInRouterLike; action?: SignInAction },
) => {
	if (options?.router && handleSignInRequiredError(err, options.router, options.action ?? 'general')) {
		return;
	}
	await errorToast(err.message || Messages.error1);
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	pushToast(msg.replace('Definer: ', ''), 'success', duration);
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await pawpalConfirm
		.fire({
			title: msg,
			showClass: {
				popup: 'animate__bounceIn',
			},
			showConfirmButton: false,
			timer: duration,
		})
		.then();
};

export const sweetConfirmAlert = (msg: string, options?: { zIndex?: number }) => {
	return new Promise(async (resolve) => {
		await pawpalConfirm
			.fire({
				icon: 'question',
				text: msg,
				showClass: {
					popup: 'animate__bounceIn',
				},
				showCancelButton: true,
				showConfirmButton: true,
				// SweetAlert2's container defaults to z-index 1060, below MUI's modal (1300).
				// Callers rendering inside a MUI Dialog pass a higher zIndex so the confirm stacks on top.
				willOpen: () => {
					if (options?.zIndex != null) {
						const container = Swal.getContainer();
						if (container) container.style.zIndex = String(options.zIndex);
					}
				},
			})
			.then((response) => {
				if (response?.isConfirmed) resolve(true);
				else resolve(false);
			});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await pawpalConfirm
			.fire({
				text: msg,
				showCancelButton: true,
				showConfirmButton: true,
				confirmButtonText: 'Sign in',
			})
			.then((response) => {
				if (response?.isConfirmed) resolve(true);
				else resolve(false);
			});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await errorToast(msg);
};

export const sweetMixinErrorAlert = async (
	msg: string,
	duration: number = 3000,
	options?: { router?: SignInRouterLike; action?: SignInAction },
) => {
	if (options?.router && handleSignInRequiredError({ message: msg }, options.router, options.action ?? 'general')) {
		return;
	}
	await errorToast(msg);
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await successToast(msg);
};

export const sweetBasicAlert = async (text: string) => {
	pawpalConfirm.fire(text);
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	const errorMessage = err.message ?? Messages.error1;
	await errorToast(errorMessage);
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	pushToast(msg, 'success', duration, enable_forward ? () => window.location.reload() : undefined);
};

/** @deprecated Use successToast — kept for legacy imports */
export const pawpalToast = {
	fire: (opts: { icon?: string; title?: string; timer?: number }) => {
		const type = opts.icon === 'error' ? 'error' : 'success';
		pushToast(opts.title ?? '', type, opts.timer ?? 2400);
	},
};
