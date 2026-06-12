import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_GRAPHQL_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { MemberType } from '../../enums/member.enum';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	const isSpecialist = user?.memberType === MemberType.AGENT;

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user?.memberNick ?? '',
			memberPhone: user?.memberPhone ?? '',
			memberAddress: user?.memberAddress ?? '',
			memberImage: user?.memberImage ?? '',
			memberFullName: user?.memberFullName ?? '',
			memberDesc: user?.memberDesc ?? '',
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const image = e.target.files?.[0];
			if (!image) return;

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'member' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);

			const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader as string;
			const path = String(responseImage ?? '').replace(/^\/+/, '');
			setUpdateData((prev) => ({ ...prev, memberImage: path }));
		} catch (err) {
			console.error('Error, uploadImage:', err);
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const input: MemberUpdate = { ...updateData, _id: user._id };
			const result = await updateMember({ variables: { input } });
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			await sweetMixinSuccessAlert('Profile updated successfully! 🐾');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData, user?._id, updateMember]);

	// Only require the two schema-required fields
	const doDisabledCheck = () => {
		return !updateData.memberNick?.trim() || !updateData.memberPhone?.trim();
	};

	return (
		<div id="my-profile-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Profile</Typography>
					<Typography className="sub-title">
						Welcome back, {user?.memberNick || 'friend'}! 🐾
					</Typography>
				</Stack>
				<span className="mypage-profile-watermark" aria-hidden>
					🐾
				</span>
			</Stack>

			<Stack className="top-box">
				{/* ── PHOTO ── */}
				<Stack className="photo-box">
					<Typography className="title">Profile photo</Typography>
					<div className="photo-upload-row">
						<div className="photo-preview-box">
							<Stack className="image-box image-box--upload">
							<img
								src={resolveMemberImageUrl(updateData?.memberImage, '/img/profile/defaultUser.svg')}
								onError={(e) => {
									const img = e.currentTarget;
									if (img.src.includes('/img/profile/defaultUser.svg')) {
										img.src = '/images/hero/pawpal-hero.jpg';
										return;
									}
									img.src = '/img/profile/defaultUser.svg';
								}}
								alt="Profile"
							/>
							<label htmlFor="hidden-input" className="avatar-overlay" aria-label="Upload photo">
								<span className="avatar-overlay__icon" aria-hidden>📷</span>
								<span className="avatar-overlay__text">Upload photo</span>
							</label>
							</Stack>
						</div>
						<div className="photo-upload-actions">
						<input
							type="file"
							hidden
							id="hidden-input"
							onChange={uploadImage}
							accept="image/jpg,image/jpeg,image/png"
						/>
						<label htmlFor="hidden-input" className="labeler">
							<Typography>Choose Image</Typography>
						</label>
						<Typography className="upload-text">
							A photo must be in JPG, JPEG or PNG format!
						</Typography>
						</div>
					</div>
				</Stack>

				{/* ── USERNAME + PHONE ── */}
				<Stack className="small-input-box">
					<Stack className="input-box">
						<Typography className="title">Username</Typography>
						<input
							type="text"
							placeholder="Your username"
							value={updateData.memberNick ?? ''}
							onChange={({ target: { value } }) =>
								setUpdateData((prev) => ({ ...prev, memberNick: value }))
							}
						/>
					</Stack>
					<Stack className="input-box">
						<Typography className="title">Phone</Typography>
						<input
							type="text"
							placeholder="Your phone number"
							value={updateData.memberPhone ?? ''}
							onChange={({ target: { value } }) =>
								setUpdateData((prev) => ({ ...prev, memberPhone: value }))
							}
						/>
					</Stack>
				</Stack>

				{/* ── FULL NAME ── */}
				<Stack className="input-box full-width-input">
					<Typography className="title">Full Name</Typography>
					<input
						type="text"
						placeholder="Your full name (e.g. Kim Min-jun)"
						value={updateData.memberFullName ?? ''}
						onChange={({ target: { value } }) =>
							setUpdateData((prev) => ({ ...prev, memberFullName: value }))
						}
					/>
				</Stack>

				{/* ── ADDRESS ── */}
				<Stack className="address-box">
					<Typography className="title">Address</Typography>
					<input
						type="text"
						placeholder="District and city (e.g. Gangnam-gu, Seoul)"
						value={updateData.memberAddress ?? ''}
						onChange={({ target: { value } }) =>
							setUpdateData((prev) => ({ ...prev, memberAddress: value }))
						}
					/>
				</Stack>

				{/* ── BIO / DESC ── */}
				<Stack className="about-me-box">
					<Typography className="title">
						{isSpecialist ? 'About your services' : 'About me'}
					</Typography>
					<textarea
						className="about-me-textarea"
						placeholder={
							isSpecialist
								? 'Describe your expertise, experience, and the services you offer...'
								: 'Tell us a little about yourself and your pets...'
						}
						rows={5}
						value={updateData.memberDesc ?? ''}
						onChange={({ target: { value } }) =>
							setUpdateData((prev) => ({ ...prev, memberDesc: value }))
						}
					/>
				</Stack>

				{/* ── SUBMIT ── */}
				<Stack className="submit-box">
					<Button
						className="update-button"
						type="button"
						onClick={updateProfileHandler}
						disabled={doDisabledCheck()}
					>
						<Typography>Update Profile</Typography>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
							<g clipPath="url(#clip0_7065_6985)">
								<path
									d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
									fill="white"
								/>
							</g>
							<defs>
								<clipPath id="clip0_7065_6985">
									<rect width="13" height="13" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberFullName: '',
		memberDesc: '',
	},
};

export default MyProfile;