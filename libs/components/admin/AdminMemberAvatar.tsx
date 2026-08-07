import React, { useState } from 'react';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { hasRealMemberPhoto } from '../../utils/memberSpecialty';

type AdminMemberAvatarProps = {
	imagePath?: string | null;
	alt?: string;
	size?: number;
};

export default function AdminMemberAvatar({ imagePath, alt = '', size = 36 }: AdminMemberAvatarProps) {
	const [failed, setFailed] = useState(false);
	const hasPhoto = hasRealMemberPhoto(imagePath) && !failed;

	if (!hasPhoto) {
		return (
			<span
				className="pp-member-avatar-fallback admin-member-avatar"
				style={{ width: size, height: size }}
				role="img"
				aria-label={alt || 'Member'}
			>
				<img src="/img/profile/defaultUser.svg" alt="" aria-hidden />
			</span>
		);
	}

	return (
		<img
			className="pp-member-avatar admin-member-avatar"
			src={resolveMemberImageUrl(imagePath)}
			alt={alt}
			width={size}
			height={size}
			style={{ width: size, height: size }}
			onError={() => setFailed(true)}
		/>
	);
}
