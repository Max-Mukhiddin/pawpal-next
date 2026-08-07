import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import PetsIcon from '@mui/icons-material/Pets';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATIONS } from '../../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/mutation';
import type { Notification } from '../../types/notification/notification';
import { errorToast, successToast } from '../../sweetAlert';
import { timeAgo } from '../../utils/timeAgo';
import { useTranslation } from 'next-i18next';
import ChatPopup from '../messaging/ChatPopup';

const NOTIFICATIONS_INPUT = { page: 1, limit: 20 };

export const notificationTypeIcon = (type: string) => {
	switch (type) {
		case 'LIKE':
			return <FavoriteIcon fontSize="small" className="pp-notify__icon pp-notify__icon--like" />;
		case 'COMMENT':
			return <ChatBubbleOutlineIcon fontSize="small" className="pp-notify__icon pp-notify__icon--comment" />;
		case 'INQUIRY':
			return <MailOutlineIcon fontSize="small" className="pp-notify__icon pp-notify__icon--inquiry" />;
		case 'BOOKING':
			return <EventAvailableOutlinedIcon fontSize="small" className="pp-notify__icon pp-notify__icon--booking" />;
		case 'FOLLOW':
			return <PetsIcon fontSize="small" className="pp-notify__icon pp-notify__icon--follow" />;
		case 'MESSAGE':
			return <SmsOutlinedIcon fontSize="small" className="pp-notify__icon pp-notify__icon--message" />;
		default:
			return <PetsIcon fontSize="small" className="pp-notify__icon pp-notify__icon--follow" />;
	}
};

export default function NotificationDropdown() {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const [chatOpen, setChatOpen] = useState(false);
	const [chatConversationId, setChatConversationId] = useState<string | undefined>();
	const wrapRef = useRef<HTMLDivElement>(null);

	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		variables: { input: NOTIFICATIONS_INPUT },
		fetchPolicy: 'network-only',
		pollInterval: 60000,
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	const notifications = (data?.getNotifications?.list ?? []) as Notification[];
	const unreadCount = data?.getNotifications?.unreadCount ?? 0;

	const closeDropdown = useCallback(() => setOpen(false), []);

	useEffect(() => {
		if (!open) return;

		const onPointerDown = (e: MouseEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) {
				closeDropdown();
			}
		};

		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [open, closeDropdown]);

	const navigateForNotification = (n: Notification) => {
		if (n.notificationGroup === 'ARTICLE' && n.notificationRefId) {
			router.push(`/blog/detail?id=${n.notificationRefId}`);
		} else if (n.notificationGroup === 'LISTING' && n.notificationRefId) {
			router.push(`/service/detail?id=${n.notificationRefId}`);
		} else if (n.notificationGroup === 'MEMBER' && n.notificationRefId) {
			router.push(`/specialist/detail?id=${n.notificationRefId}`);
		} else if (n.notificationGroup === 'COMMENT' && n.notificationRefId) {
			router.push(`/blog/detail?id=${n.notificationRefId}`);
		}
	};

	const handleClick = async (n: Notification) => {
		if (n.notificationStatus === 'WAIT') {
			try {
				await markRead({ variables: { notificationId: n._id } });
				await refetch();
			} catch {
				/* silent */
			}
		}

		// MESSAGE notifications store conversationId in notificationRefId (backend messaging.service)
		if ((n.notificationType as string) === 'MESSAGE' && n.notificationRefId) {
			setChatConversationId(n.notificationRefId);
			setChatOpen(true);
			closeDropdown();
			return;
		}

		navigateForNotification(n);
		closeDropdown();
	};

	const closeChat = useCallback(() => {
		setChatOpen(false);
		setChatConversationId(undefined);
	}, []);

	const handleMarkAllRead = async () => {
		if (unreadCount === 0) return;
		try {
			await markAllRead();
			await refetch();
			successToast(t('toast.allCaughtUp'));
		} catch {
			errorToast(t('toast.couldNotUpdate'));
		}
	};

	return (
		<>
		<div className="pp-notify notification-bell" ref={wrapRef}>
			<button
				type="button"
				className="pp-notify__bell"
				aria-label="Notifications"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<NotificationsOutlinedIcon />
				{unreadCount > 0 && (
					<span className="pp-notify__badge notification-badge" aria-label={`${unreadCount} unread`}>
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="pp-notify__panel" role="dialog" aria-label="Notifications">
					<div className="pp-notify__head">
						<strong>Notifications</strong>
						{unreadCount > 0 && <span className="pp-notify__unread-label">{unreadCount} new</span>}
					</div>

					{loading && notifications.length === 0 ? (
						<div className="pp-notify__empty">
							<p>Loading…</p>
						</div>
					) : notifications.length === 0 ? (
						<div className="pp-notify__empty">
							<PetsIcon aria-hidden />
							<p>No notifications yet</p>
						</div>
					) : (
						<ul className="pp-notify__list">
							{notifications.map((n) => (
								<li key={n._id}>
									<button
										type="button"
										className={`pp-notify__item${n.notificationStatus === 'WAIT' ? ' pp-notify__item--unread' : ''}`}
										onClick={() => handleClick(n)}
									>
										<span className="pp-notify__item-icon" aria-hidden>
											{notificationTypeIcon(n.notificationType)}
										</span>
										<span className="pp-notify__item-body">
											<span className="pp-notify__item-title">{n.notificationTitle}</span>
											{n.notificationDesc && (
												<span className="pp-notify__item-desc">{n.notificationDesc}</span>
											)}
											<span className="pp-notify__item-time">{timeAgo(n.createdAt)}</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					)}

					<div className="pp-notify__foot">
						<button
							type="button"
							className="pp-notify__mark-all"
							disabled={unreadCount === 0 || markingAll}
							onClick={handleMarkAllRead}
						>
							Mark all as read
						</button>
					</div>
				</div>
			)}
		</div>

		<ChatPopup open={chatOpen} onClose={closeChat} conversationId={chatConversationId} />
		</>
	);
}
