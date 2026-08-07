import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useTranslation } from 'next-i18next';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { errorToast } from '../sweetAlert';
import { resolveMemberImageUrl } from '../utils/mediaUrl';
import { type AIMessage } from '../api/aiChat';
import { getJwtToken } from '../auth';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}
interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

type ChatMode = 'ai' | 'live';

const Chat = () => {
	const { t } = useTranslation('common');
	const chatContentRef = useRef<HTMLDivElement>(null);
	const aiEndRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [mode, setMode] = useState<ChatMode>('ai');
	const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
	const [aiInput, setAiInput] = useState('');
	const [aiTyping, setAiTyping] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	const aiSuggestions = useMemo(
		() => [t('chat.suggestionBook'), t('chat.suggestionEat'), t('chat.suggestionVaccines')],
		[t],
	);

	useEffect(() => {
		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data);

			switch (data.event) {
				case 'info': {
					const newInfo: InfoPayload = data;
					setOnlineUsers(newInfo.totalClients);
					break;
				}
				case 'getMessages': {
					const list: MessagePayload[] = data.list;
					setMessagesList(list);
					break;
				}
				case 'message': {
					const newMessage: MessagePayload = data;
					setMessagesList((prev) => [...prev, newMessage]);
					break;
				}
			}
		};
	}, [socket]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		const openAiChat = () => {
			setMode('ai');
			setOpen(true);
			setOpenButton(true);
		};
		window.addEventListener('pawpal:open-ai-chat', openAiChat);
		return () => window.removeEventListener('pawpal:open-ai-chat', openAiChat);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	const handleOpenChat = () => {
		setOpen((prevState) => {
			if (prevState) {
				setAiMessages([]);
				setAiInput('');
				setAiTyping(false);
			}
			return !prevState;
		});
	};

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const onClickHandler = () => {
		if (!messageInput) errorToast(Messages.error4);
		else {
			socket.send(JSON.stringify({ event: 'message', data: messageInput }));
			setMessageInput('');
		}
	};

	const sendAi = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || aiTyping) return;

		const nextMessages: AIMessage[] = [...aiMessages, { role: 'user', content: trimmed }];
		setAiMessages(nextMessages);
		setAiInput('');
		setAiTyping(true);

		const genericError = 'Something went wrong, please try again.';

		try {
			const token = getJwtToken();
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			let res: Response;
			try {
				res = await fetch(`${REACT_APP_API_URL}/ai-chat`, {
					method: 'POST',
					headers,
					body: JSON.stringify({ messages: nextMessages }),
				});
			} catch {
				setAiMessages((prev) => [...prev, { role: 'assistant', content: genericError }]);
				return;
			}

			if (!res.ok) {
				if (res.status === 429) {
					let rateLimitMessage = genericError;
					try {
						const errBody = (await res.json()) as { message?: string | string[] };
						const raw = Array.isArray(errBody.message) ? errBody.message[0] : errBody.message;
						if (typeof raw === 'string' && raw.trim()) {
							rateLimitMessage = raw.trim();
						}
					} catch {
						/* keep genericError if body is unreadable */
					}
					setAiMessages((prev) => [...prev, { role: 'assistant', content: rateLimitMessage }]);
					return;
				}
				if (res.status === 401 || res.status === 400) {
					setAiMessages((prev) => [
						...prev,
						{ role: 'assistant', content: 'Please sign in to use Ask AI.' },
					]);
					return;
				}
				setAiMessages((prev) => [...prev, { role: 'assistant', content: genericError }]);
				return;
			}

			const data = (await res.json()) as { reply?: string };
			const reply = data.reply?.trim();
			if (!reply) {
				setAiMessages((prev) => [...prev, { role: 'assistant', content: genericError }]);
				return;
			}
			setAiMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
		} catch {
			setAiMessages((prev) => [...prev, { role: 'assistant', content: t('chat.errorGeneric') }]);
		} finally {
			setAiTyping(false);
		}
	};

	useEffect(() => {
		if (mode !== 'ai' || aiMessages.length === 0) return;
		aiEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [aiMessages, aiTyping, mode]);

	const onAiKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void sendAi(aiInput);
		}
	};

	const isHome = router.pathname === '/';
	const [clearMarquee, setClearMarquee] = useState(false);

	useEffect(() => {
		if (!isHome) {
			setClearMarquee(false);
			return;
		}

		const updateMarqueeClearance = () => {
			const stage = document.querySelector('.pp-hero-stage');
			if (!stage) {
				setClearMarquee(false);
				return;
			}
			const { bottom } = stage.getBoundingClientRect();
			setClearMarquee(bottom >= window.innerHeight - 4);
		};

		updateMarqueeClearance();
		window.addEventListener('scroll', updateMarqueeClearance, { passive: true });
		window.addEventListener('resize', updateMarqueeClearance, { passive: true });
		return () => {
			window.removeEventListener('scroll', updateMarqueeClearance);
			window.removeEventListener('resize', updateMarqueeClearance);
		};
	}, [isHome]);

	return (
		<Stack className={`chatting${clearMarquee ? ' chatting--clear-marquee' : ''}`}>
			{openButton ? (
				<button
					type="button"
					className={`chat-button${clearMarquee ? ' chat-button--clear-marquee' : ''}`}
					onClick={handleOpenChat}
					aria-label={open ? t('chat.closeAssistant') : t('chat.openAssistant')}
				>
					{open ? (
						<CloseIcon sx={{ fontSize: 22, color: '#173E32' }} />
					) : (
						<img
							src="/img/icons/ai-assistant.png"
							alt="Open PawPal Assistant"
							style={{ width: 32, height: 32, objectFit: 'contain' }}
						/>
					)}
				</button>
			) : null}
			<Stack className={`chat-panel ${open ? 'open' : ''}`}>
				<Box className="chat-panel__header" component="div">
					<div className="chat-panel__title">{t('chat.assistantTitle')}</div>
					<button type="button" className="chat-panel__close" onClick={handleOpenChat} aria-label={t('chat.close')}>
						<CloseIcon sx={{ fontSize: 20 }} />
					</button>
					{mode === 'live' ? (
						<RippleBadge style={{ margin: '0 0 0 8px' }} badgeContent={onlineUsers} />
					) : null}
				</Box>

				<div className="chat-mode-tabs" role="tablist">
					<button
						type="button"
						role="tab"
						className={`chat-mode-tabs__tab ${mode === 'ai' ? 'is-active' : ''}`}
						onClick={() => setMode('ai')}
					>
						🤖 {t('chat.askAi')}
					</button>
					<button
						type="button"
						role="tab"
						className={`chat-mode-tabs__tab ${mode === 'live' ? 'is-active' : ''}`}
						onClick={() => setMode('live')}
					>
						💬 {t('chat.liveChat')}
					</button>
				</div>

				{mode === 'ai' ? (
					<>
						<Box className="chat-panel__body chat-panel__body--ai" component="div">
							{aiMessages.length === 0 ? (
								<div className="chat-ai-welcome">
									<img
										src="/img/icons/ai-assistant.png"
										alt="PawPal Assistant"
										className="chat-ai-welcome__icon"
										style={{ width: 64, height: 64, objectFit: 'contain' }}
									/>
									<h3>{t('chat.welcomeTitle')}</h3>
									<p>{t('chat.welcomeBody')}</p>
									<div className="chat-ai-welcome__chips">
										{aiSuggestions.map((chip) => (
											<button
												key={chip}
												type="button"
												className="pp-btn pp-btn--ghost chat-ai-chip"
												onClick={() => void sendAi(chip)}
												disabled={aiTyping}
											>
												{chip}
											</button>
										))}
									</div>
								</div>
							) : (
								<ScrollableFeed>
									<div className="chat-ai-messages">
										{aiMessages.map((msg, idx) => (
											<div
												key={`${msg.role}-${idx}`}
												className={`chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'}`}
											>
												{msg.role === 'assistant' ? (
													<img
														src="/img/icons/ai-assistant.png"
														alt=""
														className="chat-bubble__avatar"
														width={20}
														height={20}
													/>
												) : null}
												<span>{msg.content}</span>
											</div>
										))}
										{aiTyping ? (
											<div className="chat-bubble chat-bubble--ai chat-bubble--typing">
												<span className="chat-typing-dot" />
												<span className="chat-typing-dot" />
												<span className="chat-typing-dot" />
											</div>
										) : null}
										<div ref={aiEndRef} aria-hidden />
									</div>
								</ScrollableFeed>
							)}
						</Box>
						<Box className="chat-panel__footer chat-panel__footer--ai" component="div">
							<textarea
								className="chat-ai-input"
								placeholder={t('chat.placeholder')}
								value={aiInput}
								onChange={(e) => setAiInput(e.target.value)}
								onKeyDown={onAiKeyDown}
								rows={1}
							/>
							<button
								type="button"
								className="pp-btn pp-btn--primary chat-ai-send"
								onClick={() => void sendAi(aiInput)}
								disabled={aiTyping || !aiInput.trim()}
								aria-label={t('chat.send')}
							>
								<ArrowUpwardIcon fontSize="small" />
							</button>
						</Box>
					</>
				) : (
					<>
						<Box className="chat-panel__body" id="chat-content" ref={chatContentRef} component="div">
							<ScrollableFeed>
								<Stack className="chat-main">
									<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<div className="welcome">{t('chat.liveWelcome')}</div>
									</Box>
									{messagesList.map((ele: MessagePayload) => {
										const { text, memberData } = ele;
										const memberImage = resolveMemberImageUrl(
											memberData?.memberImage,
											'/img/profile/defaultUser.svg',
										);

										return memberData?._id === user?._id ? (
											<Box
												component="div"
												flexDirection="row"
												style={{ display: 'flex' }}
												alignItems="flex-end"
												justifyContent="flex-end"
												sx={{ m: '10px 0px' }}
											>
												<div className="msg-right">{text}</div>
											</Box>
										) : (
											<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
												<Avatar alt={memberData?.memberNick ?? 'user'} src={memberImage} />
												<div className="msg-left-wrap">
													<span className="msg-author">{memberData?.memberNick}</span>
													<div className="msg-left">{text}</div>
												</div>
											</Box>
										);
									})}
								</Stack>
							</ScrollableFeed>
						</Box>
						<Box className="chat-panel__footer" component="div">
							<input
								type="text"
								name="message"
								className="msg-input"
								placeholder="Type a message..."
								value={messageInput}
								onChange={getInputMessageHandler}
								onKeyDown={getKeyHandler}
							/>
							<button
								type="button"
								className="pp-btn pp-btn--primary chat-live-send"
								onClick={onClickHandler}
								aria-label="Send message"
							>
								<ArrowUpwardIcon fontSize="small" />
							</button>
						</Box>
					</>
				)}
			</Stack>
		</Stack>
	);
};

export default Chat;
