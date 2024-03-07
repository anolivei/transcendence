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

import { ReactElement, useContext, useEffect, useRef, useState } from 'react'
import Layout from '@/components/layout'
import {
	MenuArrow,
	MenuContent,
	MenuItem,
} from '@/styles/components/friendListItem'
import {
	FaGamepad,
	FaUserAstronaut,
	FaUserPlus,
	FaUserShield,
	FaUserSlash,
} from 'react-icons/fa6'
import { GiQueenCrown } from 'react-icons/gi'
import { GrUpdate } from 'react-icons/gr'
import { UserContext } from '@/contexts/UserContext'
import { useRouter } from 'next/router'
import { ChatContext } from '@/contexts/ChatContext'
import { iChannelMessage } from '@/reducers/Chat/Types'
import ChatInput from '@/components/ChatInput'
import MessageContainer from '@/components/messageContainer'
import { toast } from 'react-toastify'
import {
	BiExit,
	BiLogOut,
	BiShieldPlus,
	BiSolidShieldX,
	BiVolumeMute,
} from 'react-icons/bi'
import { MdBlock } from 'react-icons/md'
import ConfirmationModal from '@/components/modals/confirmationModal'
import AddUserToChannelModal from '@/components/modals/addUserToChannelModal'
import { GameContext } from '@/contexts/GameContext'
import ChangeChannelPasswordModal from '@/components/modals/changeChannelPasswordModal'
import { capitalize } from '@/utils/functions'
import Loading from '@/components/loading'

export default function Chat() {
	const [showLeaveChannelModal, setShowLeaveChannelModal] = useState(false)
	const [showAddUserToChannelModal, setShowAddUserToChannelModal] =
		useState(false)
	const [showChangeChannelPasswordModal, setShowChangeChannelPasswordModal] =
		useState(false)

	const messagesEndRef = useRef(null)
	const menuIconSize = 26
	const broadCastID = 1
	const { user } = useContext(UserContext)
	const { requestMatch } = useContext(GameContext)
	const {
		activeChannel,
		activeChannelData,
		leaveChannel,
		adminAtion,
		changeChannelMemberStatus,
		getUsernameFromChannelMembers,
		getActiveChannelName,
		getActiveChannelAvatar,
		updateActiveChannel,
		hasPriveleges,
		getUserStatus,
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

	function DirectChannelBlockUser(userID: number) {
		console.log('direct block', userID)
	}

	useEffect(() => {
		const { channelID } = router.query
		if (router.isReady) {
			if (typeof channelID === 'undefined' || !isNaN(Number(channelID))) {
				updateActiveChannel(Number(channelID))
			} else {
				toast('Invalid channel id', {
					type: 'error',
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query, router.isReady])

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
							{activeChannelData.channel.type !== 'direct' && (
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
														setShowLeaveChannelModal(
															true,
														)
													}}
												>
													<BiExit
														size={menuIconSize}
													/>
													Channel
												</MenuAction>
											</MenuItem>
											{hasPriveleges(
												Number(user?.userID),
												['owner', 'admin'],
											) && (
												<MenuItem>
													<MenuAction
														isAdmin="true"
														onClick={() => {
															setShowAddUserToChannelModal(
																true,
															)
														}}
													>
														<FaUserPlus
															size={menuIconSize}
														/>
														Member
													</MenuAction>
												</MenuItem>
											)}
											{activeChannelData.channel.type ===
												'protected' &&
												hasPriveleges(
													Number(user?.userID),
													['owner'],
												) && (
													<MenuItem>
														<MenuAction
															isAdmin="true"
															onClick={() => {
																setShowChangeChannelPasswordModal(
																	true,
																)
															}}
														>
															<GrUpdate
																size={
																	menuIconSize
																}
															/>
															Password
														</MenuAction>
													</MenuItem>
												)}
										</MenuContent>
									</MenuPortal>
								</ChatMenuWrapper>
							)}
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
													<SenderMenu
														title={
															'Channel ' +
															capitalize(
																getUserStatus(
																	message.sender_id,
																),
															)
														}
													>
														{getUserStatus(
															message.sender_id,
														) === 'owner' ? (
															<GiQueenCrown
																size={28}
															/>
														) : getUserStatus(
																message.sender_id,
														  ) === 'admin' ? (
															<FaUserShield
																size={28}
															/>
														) : (
															<FaUserAstronaut
																size={28}
															/>
														)}

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
																		requestMatch(
																			message.sender_id,
																		)
																		router.push(
																			'/',
																		)
																		toast(
																			`You invited ${getUsernameFromChannelMembers(
																				message.sender_id,
																			)} to play`,
																			{
																				type: 'info',
																			},
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
																		router.push(
																			`/profile/${message.sender_id}`,
																		)
																	}}
																>
																	<FaUserAstronaut
																		size={
																			menuIconSize
																		}
																	/>
																	Profile
																</MenuAction>
															</MenuItem>
															{activeChannelData
																.channel
																.type !==
																'direct' &&
																hasPriveleges(
																	Number(
																		user?.userID,
																	),
																	[
																		'owner',
																		'admin',
																	],
																) && (
																	<>
																		<MenuItem>
																			<MenuAction
																				isAdmin="true"
																				onClick={() => {
																					adminAtion(
																						message.sender_id,
																						message.channel_id,
																						'mute',
																						1,
																					)
																				}}
																			>
																				<BiVolumeMute
																					size={
																						menuIconSize
																					}
																				/>
																				Mute
																			</MenuAction>
																		</MenuItem>
																		<MenuItem>
																			<MenuAction
																				isAdmin="true"
																				onClick={() => {
																					changeChannelMemberStatus(
																						message.sender_id,
																						message.channel_id,
																						hasPriveleges(
																							message.sender_id,
																							[
																								'admin',
																							],
																						)
																							? 'member'
																							: 'admin',
																					)
																				}}
																			>
																				{hasPriveleges(
																					message.sender_id,
																					[
																						'admin',
																					],
																				) ? (
																					<>
																						<BiSolidShieldX
																							size={
																								menuIconSize
																							}
																						/>
																						Demote
																					</>
																				) : (
																					<>
																						<BiShieldPlus
																							size={
																								menuIconSize
																							}
																						/>
																						Promote
																					</>
																				)}
																			</MenuAction>
																		</MenuItem>

																		<MenuItem>
																			<MenuAction
																				isAdmin="true"
																				onClick={() => {
																					adminAtion(
																						message.sender_id,
																						message.channel_id,
																						'kick',
																					)
																				}}
																			>
																				<BiLogOut
																					size={
																						menuIconSize
																					}
																				/>
																				Kick
																			</MenuAction>
																		</MenuItem>
																		<MenuItem>
																			<MenuAction
																				isAdmin="true"
																				onClick={() => {
																					adminAtion(
																						message.sender_id,
																						message.channel_id,
																						'ban',
																					)
																				}}
																			>
																				<FaUserSlash
																					size={
																						menuIconSize
																					}
																				/>
																				Ban
																			</MenuAction>
																		</MenuItem>
																	</>
																)}
															{activeChannelData
																.channel
																.type ===
																'direct' && (
																<MenuItem>
																	<MenuAction
																		onClick={() => {
																			DirectChannelBlockUser(
																				message.sender_id,
																			)
																		}}
																	>
																		<MdBlock
																			size={
																				menuIconSize
																			}
																		/>
																		Block
																	</MenuAction>
																</MenuItem>
															)}
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
						<ConfirmationModal
							setShowConfirmationModal={setShowLeaveChannelModal}
							showConfirmationModal={showLeaveChannelModal}
							title={
								`Channel ${activeChannelData?.channel.name}` ||
								''
							}
							message="Are you sure o want to leave this Channel?"
							onConfirmation={() =>
								leaveChannel(
									activeChannelData?.channel.channel_id,
								)
							}
						/>
						<AddUserToChannelModal
							setShowAddUserToChannelModal={
								setShowAddUserToChannelModal
							}
							showAddUserToChannelModal={
								showAddUserToChannelModal
							}
							channel_id={Number(
								activeChannelData?.channel.channel_id,
							)}
						/>
						<ChangeChannelPasswordModal
							setShowChangeChannelPasswordModal={
								setShowChangeChannelPasswordModal
							}
							showChangeChannelPasswordModal={
								showChangeChannelPasswordModal
							}
						/>
					</>
				) : (
					<MessageContainer>
						{!activeChannel &&
						router.isReady &&
						typeof router.query.channelID === 'undefined' ? (
							<h2>Select a channel</h2>
						) : isNaN(Number(router.query.channelID)) ||
						  activeChannel ? (
							<h2>Invalid channel</h2>
						) : (
							<Loading size={200} />
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
