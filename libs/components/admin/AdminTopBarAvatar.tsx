import React, { useState } from 'react';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { hasRealMemberPhoto } from '../../utils/memberSpecialty';
import { getMemberInitials } from '../../utils/memberDisplay';

type AdminTopBarAvatarProps = {
	imagePath?: string | null;
	displayName?: string | null;
	size?: number;
};

export default function AdminTopBarAvatar({ imagePath, displayName, size = 38 }: AdminTopBarAvatarProps) {
	const [failed, setFailed] = useState(false);
	const hasPhoto = hasRealMemberPhoto(imagePath) && !failed;
	const initials = getMemberInitials(displayName);
	const label = displayName?.trim() || 'Admin';

	if (!hasPhoto) {
		return (
			<span
				className="admin-topbar-avatar admin-topbar-avatar--initials"
				style={{ width: size, height: size }}
				role="img"
				aria-label={label}
			>
				{initials}
			</span>
		);
	}

	return (
		<img
			className="admin-topbar-avatar admin-topbar-avatar--photo"
			src={resolveMemberImageUrl(imagePath)}
			alt={label}
			width={size}
			height={size}
			style={{ width: size, height: size }}
			onError={() => setFailed(true)}
		/>
	);
}
