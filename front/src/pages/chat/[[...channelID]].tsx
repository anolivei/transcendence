import Head from 'next/head'
import Image from 'next/image'

import {
	ChatContainer,
	ChatHeader,
	ChatHeaderTextContainer,
	ChatMenu,
	ChatMenuWrapper,
	ChatMessage,
	ChatMessageContainer,
	ChatMessageTimestamp,
	// ChatSubTitle,
	ChatTitle,
	MenuAction,
	MenuPortal,
	SenderMenu,
	SenderMenuWrapper,
} from '@/styles/pages/chat'

import { SlOptionsVertical } from 'react-icons/sl'

import { ReactElement, useContext, useEffect, useRef } from 'react'
import Layout from '@/components/layout'
import {
	MenuArrow,
	MenuContent,
	MenuItem,
} from '@/styles/components/friendListItem'
import { FaGamepad, FaUserAstronaut } from 'react-icons/fa6'
import { BsChatSquareTextFill } from 'react-icons/bs'
import { UserContext } from '@/contexts/UserContext'
import { useRouter } from 'next/router'
import { ChatContext } from '@/contexts/ChatContext'
import { iChannelMessage } from '@/reducers/Chat/Types'
import ChatInput from '@/components/ChatInput'
import MessageContainer from '@/components/messageContainer'

export default function Chat() {
	const messagesEndRef = useRef(null)
	const menuIconSize = 26
	const broadCastID = 1
	const { user } = useContext(UserContext)
	const {
		activeChannel,
		activeChannelData,
		getUsernameFromChannelMembers,
		getActiveChannelName,
		getActiveChannelAvatar,
		setActiveChannel,
	} = useContext(ChatContext)

	const messages = activeChannelData?.msgs
	const router = useRouter()

	const loggedUserID = user?.userID

	function scrollToBottom(behavior: 'smooth' | 'instant' = 'instant') {
		// eslint-disable-next-line prettier/prettier
		(messagesEndRef.current as unknown as HTMLElement)?.scrollIntoView({
			behavior,
		})
	}

	useEffect(() => {
		const { channelID } = router.query
		setActiveChannel(Number(channelID))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query])

	useEffect(() => {
		if (activeChannelData) {
			scrollToBottom()
		}
	}, [activeChannelData])

	return (
		<>
			<Head>
				<title>Transcendence - Pong</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<ChatContainer>
				{activeChannelData ? (
					<>
						<ChatHeader>
							<ChatHeaderTextContainer>
								<Image
									src={getActiveChannelAvatar(
										activeChannelData.channel.type,
										activeChannelData.channelMembers,
									)}
									width={40}
									height={40}
									alt="user"
								/>
								<ChatTitle>
									{getActiveChannelName(
										activeChannelData.channel.name,
										activeChannelData.channel.type,
										activeChannelData.channelMembers,
									)}
								</ChatTitle>
								{/* <ChatSubTitle>online</ChatSubTitle> */}
							</ChatHeaderTextContainer>
							<ChatMenuWrapper>
								<ChatMenu>
									<SlOptionsVertical size={28} />
								</ChatMenu>
								<MenuPortal>
									<MenuContent
										style={{
											zIndex: 1,
										}}
									>
										<MenuArrow />
										<MenuItem>
											<MenuAction
												onClick={() => {
													console.log('play')
												}}
											>
												<FaGamepad
													size={menuIconSize}
												/>{' '}
												Play
											</MenuAction>
										</MenuItem>
										<MenuItem>
											<MenuAction
												onClick={() => {
													console.log('play')
												}}
											>
												<BsChatSquareTextFill
													size={menuIconSize}
												/>{' '}
												Chat
											</MenuAction>
										</MenuItem>
									</MenuContent>
								</MenuPortal>
							</ChatMenuWrapper>
						</ChatHeader>
						<ChatMessageContainer>
							{messages && messages?.length > 0 ? (
								messages.map((message: iChannelMessage) => (
									<ChatMessage
										key={message.message_id}
										userType={
											message.sender_id === loggedUserID
												? 'logged'
												: message.sender_id ===
												    broadCastID
												  ? 'broadcast'
												  : 'other'
										}
									>
										{message.sender_id !== broadCastID &&
											message.sender_id !==
												loggedUserID && (
												<SenderMenuWrapper>
													<SenderMenu>
														<FaUserAstronaut
															size={28}
														/>
														{getUsernameFromChannelMembers(
															message.sender_id,
														)}
													</SenderMenu>
													<MenuPortal>
														<MenuContent
															style={{
																zIndex: 1,
															}}
														>
															<MenuArrow />
															<MenuItem>
																<MenuAction
																	onClick={() => {
																		console.log(
																			'play',
																		)
																	}}
																>
																	<FaGamepad
																		size={
																			menuIconSize
																		}
																	/>{' '}
																	Play
																</MenuAction>
															</MenuItem>
															<MenuItem>
																<MenuAction
																	onClick={() => {
																		console.log(
																			'profile',
																		)
																	}}
																>
																	<FaUserAstronaut
																		size={
																			menuIconSize
																		}
																	/>{' '}
																	Profile
																</MenuAction>
															</MenuItem>
														</MenuContent>
													</MenuPortal>
												</SenderMenuWrapper>
											)}
										<p>{message.content}</p>
										<ChatMessageTimestamp
											userType={
												message.sender_id !==
												broadCastID
													? 'user'
													: 'broadcast'
											}
										>
											{`@ ${new Date(message.timestamp)
												.toLocaleString('en-CA', {
													hourCycle: 'h23',
													hour: '2-digit',
													minute: '2-digit',
													second: '2-digit',
													year: 'numeric',
													month: '2-digit',
													day: '2-digit',
												})
												.replace(',', ' ')}`}
										</ChatMessageTimestamp>
									</ChatMessage>
								))
							) : (
								<MessageContainer>
									<h2>No messages yet</h2>
								</MessageContainer>
							)}
							<div ref={messagesEndRef} />
						</ChatMessageContainer>
						<ChatInput
							channel_id={activeChannelData.channel.channel_id}
						/>
					</>
				) : (
					<MessageContainer>
						{!activeChannel ? (
							<h2>Select a channel</h2>
						) : (
							<h2>Invalid channel</h2>
						)}
					</MessageContainer>
				)}
			</ChatContainer>
		</>
	)
}

Chat.getLayout = (page: ReactElement) => {
	return <Layout>{page}</Layout>
}
