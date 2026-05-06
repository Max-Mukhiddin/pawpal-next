import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const accessToken = result?.data?.login?.accessToken ?? result?.data?.Login?.accessToken;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.error('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const signUp = async (
	nick: string,
	password: string,
	phone: string,
	memberType: string,
	options?: { memberDesc?: string; isPendingSpecialist?: boolean },
): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({
			nick,
			password,
			phone,
			memberType,
			memberDesc: options?.memberDesc,
			isPendingSpecialist: options?.isPendingSpecialist,
		});

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	memberType,
	memberDesc,
	isPendingSpecialist,
}: {
	nick: string;
	password: string;
	phone: string;
	memberType: string;
	memberDesc?: string;
	isPendingSpecialist?: boolean;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	const input: Record<string, string | boolean> = {
		memberNick: nick,
		memberPassword: password,
		memberPhone: phone,
		memberType,
	};
	if (memberDesc != null && memberDesc !== '') {
		input.memberDesc = memberDesc;
	}
	if (isPendingSpecialist !== undefined) {
		input.isPendingSpecialist = isPendingSpecialist;
	}

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input,
			},
			fetchPolicy: 'network-only',
		});

		const accessToken = result?.data?.signup?.accessToken ?? result?.data?.Signup?.accessToken;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.error('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	const c = claims as CustomJwtPayload & {
		memberFollowers?: number;
		memberFollowings?: number;
		memberComments?: number;
	};

	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		isPendingSpecialist: claims.isPendingSpecialist ?? false,
		memberListings: claims.memberListings ?? 0,
		memberFollowers: c.memberFollowers ?? 0,
		memberFollowings: c.memberFollowings ?? 0,
		memberComments: c.memberComments ?? 0,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	} as any);
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		isPendingSpecialist: false,
		memberListings: 0,
		memberFollowers: 0,
		memberFollowings: 0,
		memberComments: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	} as any);
};
