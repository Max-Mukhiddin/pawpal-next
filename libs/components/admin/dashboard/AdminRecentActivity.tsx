import React from 'react';
import Link from 'next/link';
import AdminMemberAvatar from '../AdminMemberAvatar';
import { formatterKrw } from '../../../utils';
import type { Member } from '../../../types/member/member';
import type { Listing } from '../../../types/listing/listing';

type Props = {
	members: Member[];
	listings: Listing[];
};

function formatAdminDate(value?: Date | string | null): string {
	if (!value) return '—';
	return new Date(value).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatListingCategory(listingType?: string | null): string {
	if (!listingType) return '—';
	return listingType.charAt(0) + listingType.slice(1).toLowerCase();
}

export default function AdminRecentActivity({ members, listings }: Props) {
	return (
		<section className="admin-dashboard-section admin-recent-activity">
			<h3 className="admin-dashboard-section__title">Recent Activity</h3>
			<div className="admin-recent-activity__grid">
				<div className="admin-recent-panel">
					<div className="admin-recent-panel__header">
						<h4 className="admin-recent-panel__title">Recent Members</h4>
						<Link href="/_admin/users" className="admin-recent-panel__link">
							View all →
						</Link>
					</div>
					<ul className="admin-recent-panel__list">
						{members.length === 0 ? (
							<li className="admin-recent-panel__empty">No members yet.</li>
						) : (
							members.map((member) => (
								<li key={member._id} className="admin-recent-panel__item">
									<AdminMemberAvatar
										imagePath={member.memberImage}
										alt={member.memberNick}
										size={32}
									/>
									<div className="admin-recent-panel__meta">
										<span className="admin-recent-panel__primary">{member.memberNick}</span>
										<span className="admin-recent-panel__secondary">
											{formatAdminDate(member.createdAt)}
										</span>
									</div>
								</li>
							))
						)}
					</ul>
				</div>

				<div className="admin-recent-panel">
					<div className="admin-recent-panel__header">
						<h4 className="admin-recent-panel__title">Recent Listings</h4>
						<Link href="/_admin/listings" className="admin-recent-panel__link">
							View all →
						</Link>
					</div>
					<ul className="admin-recent-panel__list">
						{listings.length === 0 ? (
							<li className="admin-recent-panel__empty">No listings yet.</li>
						) : (
							listings.map((listing) => (
								<li key={listing._id} className="admin-recent-panel__item">
									<div className="admin-recent-panel__meta admin-recent-panel__meta--wide">
										<span className="admin-recent-panel__primary">{listing.listingTitle}</span>
										<span className="admin-recent-panel__secondary">
											{formatListingCategory(listing.listingType)} ·{' '}
											{formatterKrw(listing.listingPrice)}
										</span>
									</div>
								</li>
							))
						)}
					</ul>
				</div>
			</div>
		</section>
	);
}
