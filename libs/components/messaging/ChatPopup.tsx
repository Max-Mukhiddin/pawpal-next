import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Dialog, DialogContent, IconButton, Menu, MenuItem } from '@mui/material';
import { gql, useApolloClient, useReactiveVar } from '@apollo/client';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { userVar } from '../../../apollo/store';
import { sweetConfirmAlert } from '../../sweetAlert';
import { resolveMemberImageUrl } from '../../utils/mediaUrl';
import { getMemberInitials } from '../../utils/memberDisplay';
import { hasRealMemberPhoto } from '../../utils/memberSpecialty';
import { timeAgo } from '../../utils/timeAgo';

/* ── GraphQL (colocated — wiring into apollo/user/* comes later) ── */

const START_OR_GET_CONVERSATION = gql`
	mutation StartOrGetConversation($targetMemberId: String!) {
		startOrGetConversation(targetMemberId: $targetMemberId) {
			_id
			type
			otherParticipant {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
		}
	}
`;

const GET_OR_CREATE_ADMIN_SUPPORT = gql`
	mutation GetOrCreateAdminSupportConversation {
		getOrCreateAdminSupportConversation {
			_id
			type
			otherParticipant {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
		}
	}
`;

const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations {
		getMyConversations {
			list {
				_id
				type
				otherParticipant {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
		}
	}
`;

const GET_CONVERSATION_MESSAGES = gql`
	query GetConversationMessages($conversationId: String!, $input: ConversationMessagesInquiry!) {
		getConversationMessages(conversationId: $conversationId, input: $input) {
			list {
				_id
				conversationId
				senderId
				content
				isEdited
				isDeleted
				editedAt
				deletedAt
				createdAt
				updatedAt
				senderData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

const SEND_MESSAGE = gql`
	mutation SendMessage($conversationId: String!, $content: String!) {
		sendMessage(conversationId: $conversationId, content: $content) {
			_id
			conversationId
			senderId
			content
			isEdited
			isDeleted
			editedAt
			deletedAt
			createdAt
			updatedAt
			senderData {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
		}
	}
`;

const EDIT_MESSAGE = gql`
	mutation EditMessage($messageId: String!, $newContent: String!) {
		editMessage(messageId: $messageId, newContent: $newContent) {
			_id
			conversationId
			senderId
			content
			isEdited
			isDeleted
			editedAt
			deletedAt
			createdAt
			updatedAt
			senderData {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
		}
	}
`;

const DELETE_MESSAGE = gql`
	mutation DeleteMessage($messageId: String!) {
		deleteMessage(messageId: $messageId) {
			_id
			conversationId
			senderId
			content
			isEdited
			isDeleted
			editedAt
			deletedAt
			createdAt
			updatedAt
			senderData {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
		}
	}
`;

const MARK_CONVERSATION_READ = gql`
	mutation MarkConversationRead($conversationId: String!) {
		markConversationRead(conversationId: $conversationId)
	}
`;

const MESSAGES_INPUT = { page: 1, limit: 50 };
const POLL_MS = 5000;

type ConversationType = 'DIRECT' | 'ADMIN_SUPPORT';

interface ParticipantPreview {
	_id: string;
	memberNick?: string;
	memberFullName?: string;
	memberImage?: string;
	memberType?: string;
}

interface ChatMessageItem {
	_id: string;
	conversationId: string;
	senderId: string;
	content: string;
	isEdited: boolean;
	isDeleted: boolean;
	editedAt?: string | Date;
	deletedAt?: string | Date;
	createdAt: string | Date;
	updatedAt: string | Date;
	senderData?: ParticipantPreview;
}

export interface ChatPopupProps {
	open: boolean;
	onClose: () => void;
	/** Existing conversation — skips start/create */
	conversationId?: string;
	/** Start or resume a DIRECT chat with this member */
	targetMemberId?: string;
	/** Open (or create) the user's ADMIN_SUPPORT thread */
	isAdminSupport?: boolean;
}

/** Chronological (oldest → newest). API returns newest-first. */
const toChronological = (list: ChatMessageItem[]): ChatMessageItem[] =>
	[...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const ChatPopup: React.FC<ChatPopupProps> = ({
	open,
	onClose,
	conversationId: conversationIdProp,
	targetMemberId,
	isAdminSupport = false,
}) => {
	const client = useApolloClient();
	const user = useReactiveVar(userVar);
	const listEndRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const composerRef = useRef<HTMLTextAreaElement>(null);
	/** Set on a successful send so the composer can reclaim focus once it re-enables. */
	const refocusComposerRef = useRef(false);
	/** Ids present at first load — only messages arriving after this batch get the entrance animation. */
	const initialIdsRef = useRef<Set<string> | null>(null);

	const [resolvedId, setResolvedId] = useState<string | null>(null);
	const [conversationType, setConversationType] = useState<ConversationType | null>(null);
	const [otherParty, setOtherParty] = useState<ParticipantPreview | null>(null);
	const [messages, setMessages] = useState<ChatMessageItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [resolveError, setResolveError] = useState<string | null>(null);
	const [draft, setDraft] = useState('');
	const [sending, setSending] = useState(false);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState('');
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [menuMessageId, setMenuMessageId] = useState<string | null>(null);

	const scrollToBottom = useCallback((smooth = false) => {
		requestAnimationFrame(() => {
			listEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
		});
	}, []);

	const loadMessages = useCallback(
		async (conversationId: string, opts?: { silent?: boolean }) => {
			if (!opts?.silent) setLoading(true);
			try {
				const result = await client.query({
					query: GET_CONVERSATION_MESSAGES,
					variables: { conversationId, input: MESSAGES_INPUT },
					fetchPolicy: 'network-only',
				});
				const list = (result.data?.getConversationMessages?.list ?? []) as ChatMessageItem[];
				if (initialIdsRef.current === null) {
					initialIdsRef.current = new Set(list.map((m) => m._id));
				}
				setMessages(toChronological(list));
			} finally {
				if (!opts?.silent) setLoading(false);
			}
		},
		[client],
	);

	const markRead = useCallback(
		async (conversationId: string) => {
			try {
				await client.mutate({
					mutation: MARK_CONVERSATION_READ,
					variables: { conversationId },
				});
			} catch {
				/* non-blocking */
			}
		},
		[client],
	);

	/** Resolve conversation + load messages + mark read when the dialog opens. */
	useEffect(() => {
		if (!open) {
			setResolvedId(null);
			setConversationType(null);
			setOtherParty(null);
			setMessages([]);
			setDraft('');
			setResolveError(null);
			setEditingId(null);
			setMenuAnchor(null);
			setMenuMessageId(null);
			initialIdsRef.current = null;
			return;
		}

		if (!user?._id) {
			setResolveError('Please sign in to send messages.');
			return;
		}

		let cancelled = false;

		const resolve = async () => {
			setLoading(true);
			setResolveError(null);
			try {
				let id = conversationIdProp?.trim() || '';
				let type: ConversationType | null = null;
				let other: ParticipantPreview | null = null;

				if (id) {
					const mine = await client.query({
						query: GET_MY_CONVERSATIONS,
						fetchPolicy: 'network-only',
					});
					const match = (mine.data?.getMyConversations?.list ?? []).find(
						(c: { _id: string }) => c._id === id,
					) as
						| { _id: string; type: ConversationType; otherParticipant?: ParticipantPreview }
						| undefined;
					type = match?.type ?? null;
					other = match?.otherParticipant ?? null;
				} else if (isAdminSupport) {
					const result = await client.mutate({ mutation: GET_OR_CREATE_ADMIN_SUPPORT });
					const conv = result.data?.getOrCreateAdminSupportConversation;
					id = conv?._id ?? '';
					type = conv?.type ?? 'ADMIN_SUPPORT';
					other = conv?.otherParticipant ?? null;
				} else if (targetMemberId) {
					const result = await client.mutate({
						mutation: START_OR_GET_CONVERSATION,
						variables: { targetMemberId },
					});
					const conv = result.data?.startOrGetConversation;
					id = conv?._id ?? '';
					type = conv?.type ?? 'DIRECT';
					other = conv?.otherParticipant ?? null;
					if (id && !other) {
						const mine = await client.query({
							query: GET_MY_CONVERSATIONS,
							fetchPolicy: 'network-only',
						});
						const match = (mine.data?.getMyConversations?.list ?? []).find(
							(c: { _id: string }) => c._id === id,
						) as { otherParticipant?: ParticipantPreview } | undefined;
						other = match?.otherParticipant ?? null;
					}
				} else {
					throw new Error('ChatPopup requires conversationId, targetMemberId, or isAdminSupport.');
				}

				if (!id) throw new Error('Could not open conversation.');
				if (cancelled) return;

				setResolvedId(id);
				setConversationType(type);
				setOtherParty(other);

				await loadMessages(id);
				await markRead(id);
				if (!cancelled) scrollToBottom(false);
			} catch (err: any) {
				if (cancelled) return;
				const msg =
					err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Could not open conversation.';
				setResolveError(msg);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void resolve();
		return () => {
			cancelled = true;
		};
	}, [
		open,
		user?._id,
		conversationIdProp,
		targetMemberId,
		isAdminSupport,
		client,
		loadMessages,
		markRead,
		scrollToBottom,
	]);

	/** Poll while open. */
	useEffect(() => {
		if (!open || !resolvedId) return;
		const timer = window.setInterval(() => {
			void loadMessages(resolvedId, { silent: true }).then(() => {
				/* keep scroll position unless near bottom — always nudge to latest for chat UX */
			});
		}, POLL_MS);
		return () => window.clearInterval(timer);
	}, [open, resolvedId, loadMessages]);

	useEffect(() => {
		if (open && messages.length > 0) scrollToBottom(true);
	}, [messages.length, open, scrollToBottom]);

	/**
	 * The composer is `disabled` while a send is in flight, and disabling an element drops
	 * its focus — so after Enter/send the caret ends up on <body> and the next keystroke goes
	 * nowhere. Restore focus once the textarea has re-enabled (this effect runs after commit,
	 * so the element is interactive again). Skipped while editing an existing message, which
	 * owns focus via its own autoFocus textarea.
	 */
	useEffect(() => {
		if (sending || !refocusComposerRef.current) return;
		refocusComposerRef.current = false;
		if (editingId) return;
		composerRef.current?.focus();
	}, [sending, editingId]);

	const isAdminSupportThread = isAdminSupport || conversationType === 'ADMIN_SUPPORT';

	const headerTitle = isAdminSupportThread
		? 'PawPal Support'
		: otherParty?.memberFullName?.trim() || otherParty?.memberNick || 'Conversation';

	const headerAvatar = isAdminSupportThread
		? '/img/logo/pawpal-logo-mark.png'
		: resolveMemberImageUrl(otherParty?.memberImage, '/img/profile/defaultUser.svg');

	// Same treatment as AdminTopBarAvatar: real photo when one exists, branded initials otherwise
	const showHeaderPhoto = isAdminSupportThread || hasRealMemberPhoto(otherParty?.memberImage);
	const headerInitials = getMemberInitials(otherParty?.memberFullName || otherParty?.memberNick);

	const handleSend = async () => {
		const content = draft.trim();
		if (!content || !resolvedId || sending) return;
		setSending(true);
		try {
			const result = await client.mutate({
				mutation: SEND_MESSAGE,
				variables: { conversationId: resolvedId, content },
			});
			const created = result.data?.sendMessage as ChatMessageItem | undefined;
			if (created) {
				setMessages((prev) => toChronological([...prev.filter((m) => m._id !== created._id), created]));
			} else {
				await loadMessages(resolvedId, { silent: true });
			}
			setDraft('');
			refocusComposerRef.current = true;
			scrollToBottom(true);
			await markRead(resolvedId);
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Failed to send message.';
			setResolveError(msg);
		} finally {
			setSending(false);
		}
	};

	const openMenu = (e: React.MouseEvent<HTMLElement>, messageId: string) => {
		e.stopPropagation();
		setMenuAnchor(e.currentTarget);
		setMenuMessageId(messageId);
	};

	const closeMenu = () => {
		setMenuAnchor(null);
		setMenuMessageId(null);
	};

	const beginEdit = () => {
		const msg = messages.find((m) => m._id === menuMessageId);
		closeMenu();
		if (!msg || msg.isDeleted) return;
		setEditingId(msg._id);
		setEditDraft(msg.content);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditDraft('');
	};

	const saveEdit = async () => {
		if (!editingId) return;
		const newContent = editDraft.trim();
		if (!newContent) return;
		try {
			const result = await client.mutate({
				mutation: EDIT_MESSAGE,
				variables: { messageId: editingId, newContent },
			});
			const updated = result.data?.editMessage as ChatMessageItem | undefined;
			if (updated) {
				setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
			} else if (resolvedId) {
				await loadMessages(resolvedId, { silent: true });
			}
			cancelEdit();
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Failed to edit message.';
			setResolveError(msg);
		}
	};

	const handleDelete = async () => {
		const id = menuMessageId;
		closeMenu();
		if (!id) return;
		// Must stack above this MUI Dialog (theme.zIndex.modal = 1300)
		if (!(await sweetConfirmAlert('Delete this message?', { zIndex: 2000 }))) return;
		try {
			const result = await client.mutate({
				mutation: DELETE_MESSAGE,
				variables: { messageId: id },
			});
			const updated = result.data?.deleteMessage as ChatMessageItem | undefined;
			if (updated) {
				setMessages((prev) =>
					prev.map((m) =>
						m._id === updated._id
							? { ...updated, content: '', isDeleted: true }
							: m,
					),
				);
			} else if (resolvedId) {
				await loadMessages(resolvedId, { silent: true });
			}
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Failed to delete message.';
			setResolveError(msg);
		}
	};

	const onEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void saveEdit();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			// Keep Escape from bubbling to the Dialog, which would close the whole popup
			e.stopPropagation();
			cancelEdit();
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: '16px' } }}
		>
		<DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: { xs: '80vh', sm: 560 } }}>
				<style>{`
					@keyframes ppChatMsgIn {
						from { opacity: 0; transform: translateY(10px); }
						to { opacity: 1; transform: translateY(0); }
					}
					@keyframes ppChatMsgFade {
						from { opacity: 0; }
						to { opacity: 1; }
					}
					.pp-chatmsg--in {
						animation: ppChatMsgIn 260ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
					}
					@media (prefers-reduced-motion: reduce) {
						.pp-chatmsg--in {
							animation: ppChatMsgFade 120ms ease-out backwards;
						}
					}
				`}</style>
				{/* Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '16px 16px 14px',
						background: 'var(--pp-primary-soft)',
						borderBottom: '1px solid rgba(23, 62, 50, 0.1)',
						flexShrink: 0,
					}}
				>
					{showHeaderPhoto ? (
						<Avatar
							src={headerAvatar}
							alt={headerTitle}
							sx={{
								width: 40,
								height: 40,
								bgcolor: 'var(--pp-primary-soft)',
								border: '1px solid rgba(23, 62, 50, 0.1)',
								boxShadow: '0 2px 8px rgba(23, 62, 50, 0.12)',
							}}
						/>
					) : (
						<Avatar
							aria-label={headerTitle}
							sx={{
								width: 40,
								height: 40,
								bgcolor: 'var(--pp-honey)',
								color: 'var(--pp-primary-hover)',
								fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
								fontSize: '0.95rem',
								fontWeight: 700,
								letterSpacing: '0.02em',
								border: '1px solid rgba(23, 62, 50, 0.12)',
								boxShadow: '0 2px 8px rgba(23, 62, 50, 0.12)',
							}}
						>
							{headerInitials}
						</Avatar>
					)}
					<div style={{ flex: 1, minWidth: 0 }}>
						<p
							style={{
								margin: 0,
								fontSize: 16,
								fontWeight: 700,
								color: '#181A20',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{headerTitle}
						</p>
						{isAdminSupportThread ? (
							<p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>We typically reply within a day</p>
						) : null}
					</div>
					<IconButton aria-label="Close chat" onClick={onClose} size="small">
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>

				{/* Messages */}
				<div
					ref={listRef}
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '16px',
						background: 'linear-gradient(180deg, #f7faf8 0%, #ffffff 40%)',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					{resolveError && !resolvedId ? (
						<p role="alert" style={{ color: '#c62828', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
							{resolveError}
						</p>
					) : loading && messages.length === 0 ? (
						<p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginTop: 40 }}>Loading…</p>
					) : messages.length === 0 ? (
						<p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
							No messages yet — say hello!
						</p>
					) : (
						/* marginTop: auto anchors short conversations to the bottom, near the composer */
						<div style={{ marginTop: 'auto' }}>
						{messages.map((msg) => {
							const isOwn = msg.senderId === user?._id;
							const isEditing = editingId === msg._id;
							const entered = initialIdsRef.current !== null && !initialIdsRef.current.has(msg._id);

							return (
								<div
									key={msg._id}
									className={entered ? 'pp-chatmsg--in' : undefined}
									style={{
										display: 'flex',
										justifyContent: isOwn ? 'flex-end' : 'flex-start',
										marginBottom: 12,
									}}
								>
									<div
										style={{
											maxWidth: '78%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: isOwn ? 'flex-end' : 'flex-start',
											position: 'relative',
										}}
									>
										<div
											style={{
												padding: isEditing ? '10px 12px' : '10px 14px',
												borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
												background: isOwn ? 'var(--pp-primary)' : '#eef4f0',
												color: isOwn ? 'var(--pp-honey)' : '#15241e',
												fontFamily: "'Poppins', sans-serif",
												fontSize: 14,
												lineHeight: 1.45,
												wordBreak: 'break-word',
												boxShadow: isOwn ? '0 2px 8px rgba(23, 62, 50, 0.18)' : 'none',
											}}
										>
											{msg.isDeleted ? (
												<span style={{ fontStyle: 'italic', opacity: 0.75 }}>This message was deleted</span>
											) : isEditing ? (
												<div>
													<textarea
														value={editDraft}
														onChange={(e) => setEditDraft(e.target.value)}
														onKeyDown={onEditKeyDown}
														autoFocus
														rows={3}
														style={{
															width: '100%',
															boxSizing: 'border-box',
															border: '1.5px solid rgba(232, 160, 75, 0.55)',
															borderRadius: 10,
															padding: '8px 10px',
															fontFamily: "'Poppins', sans-serif",
															fontSize: 14,
															resize: 'vertical',
															outline: 'none',
															background: '#fff',
															color: '#15241e',
														}}
													/>
													<div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
														<Button
															size="small"
															onClick={cancelEdit}
															sx={{ textTransform: 'none', color: isOwn ? 'var(--pp-honey)' : '#666' }}
														>
															Cancel
														</Button>
														<Button
															size="small"
															onClick={() => void saveEdit()}
															sx={{
																textTransform: 'none',
																background: 'var(--pp-honey)',
																color: 'var(--pp-primary)',
																fontWeight: 600,
																borderRadius: '50px',
																px: 1.5,
																'&:hover': { background: '#f0b15f' },
															}}
														>
															Save
														</Button>
													</div>
												</div>
											) : (
												msg.content
											)}
										</div>

										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: isOwn ? 'flex-end' : 'flex-start',
												alignSelf: isOwn ? 'flex-end' : 'flex-start',
												gap: 4,
												marginTop: 4,
												paddingInline: 4,
											}}
										>
											{/* #5f6b65 ≈ 5.5:1 on white — #8a9490 failed WCAG AA (3.1:1) */}
											<span style={{ fontSize: 11, color: '#5f6b65' }}>{timeAgo(msg.createdAt)}</span>
											{msg.isEdited && !msg.isDeleted ? (
												<span style={{ fontSize: 11, color: '#5f6b65' }}>(edited)</span>
											) : null}
											{isOwn && !msg.isDeleted && !isEditing ? (
												<IconButton
													size="small"
													aria-label="Message actions"
													onClick={(e) => openMenu(e, msg._id)}
													sx={{
														// 44x44 tap target; negative margin keeps the ~22px visual footprint in the row
														width: 44,
														height: 44,
														margin: '-11px',
														opacity: 0.55,
														'&:hover': { opacity: 1 },
													}}
												>
													<MoreVertIcon sx={{ fontSize: 16 }} />
												</IconButton>
											) : null}
										</div>
									</div>
								</div>
							);
						})}
						</div>
					)}
					<div ref={listEndRef} aria-hidden />
				</div>

				{resolveError && resolvedId ? (
					<p
						role="alert"
						style={{
							margin: 0,
							padding: '6px 16px',
							fontSize: 12,
							color: '#c62828',
							borderTop: '1px solid rgba(198, 40, 40, 0.12)',
						}}
					>
						{resolveError}
					</p>
				) : null}

				{/* Composer — mirrors Chat.tsx AI footer rhythm */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						gap: 10,
						padding: '12px 16px 16px',
						borderTop: '1px solid rgba(23, 62, 50, 0.1)',
						flexShrink: 0,
						background: '#fff',
					}}
				>
					<textarea
						ref={composerRef}
						className="chat-ai-input"
						placeholder="Type a message…"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={onKeyDown}
						rows={1}
						disabled={!resolvedId || sending}
						style={{
							flex: 1,
							border: 'none',
							borderBottom: '1.5px solid rgba(30, 107, 79, 0.2)',
							padding: '8px 4px',
							fontFamily: "'Poppins', sans-serif",
							fontSize: '0.9rem',
							color: '#15241e',
							resize: 'none',
							outline: 'none',
							background: 'transparent',
							minHeight: 36,
							maxHeight: 80,
						}}
					/>
					<button
						type="button"
						className="pp-btn pp-btn--primary"
						onClick={() => void handleSend()}
						disabled={!resolvedId || sending || !draft.trim()}
						aria-label="Send message"
						style={{
							width: 40,
							height: 40,
							minWidth: 40,
							padding: 0,
							borderRadius: '50%',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'var(--pp-primary)',
							color: 'var(--pp-honey)',
							border: 'none',
							cursor: !resolvedId || sending || !draft.trim() ? 'not-allowed' : 'pointer',
							opacity: !resolvedId || sending || !draft.trim() ? 0.5 : 1,
						}}
					>
						<ArrowUpwardIcon fontSize="small" />
					</button>
				</div>
			</DialogContent>

			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={closeMenu}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MenuItem onClick={beginEdit}>Edit</MenuItem>
				<MenuItem onClick={() => void handleDelete()} sx={{ color: '#c62828' }}>
					Delete
				</MenuItem>
			</Menu>
		</Dialog>
	);
};

export default ChatPopup;
