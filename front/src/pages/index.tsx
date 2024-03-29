import Head from 'next/head'
import { ReactElement, useContext, useEffect, useState } from 'react'
import { FaCheck, FaGamepad, FaUserAstronaut, FaX } from 'react-icons/fa6'

import {
	ColorAction,
	GameContainer,
	Header,
	HomeContainer,
	IconContainer,
	LoadingContainer,
	MenuArrow,
	MenuContainer,
	MenuContent,
	MenuItem,
	MenuWrapper,
	PauseModal,
	PlayButton,
} from '@/styles/pages/home'
import Layout from '@/components/layout'
import Game from '@/components/game'
import { GameContext } from '@/contexts/GameContext'
import Loading from '@/components/loading'
import { UserContext } from '@/contexts/UserContext'
import Modal from '@/components/modals/modal'
import Button from '@/components/button'
import { MdClose, MdColorLens } from 'react-icons/md'
import {
	TbSquareArrowDown,
	TbSquareArrowUp,
	TbSquareLetterP,
} from 'react-icons/tb'
import { useRouter } from 'next/router'

export default function Home() {
	const [isDisabled, setIsDisabled] = useState(false)
	const {
		status,
		match,
		joinQueue,
		exitQueue,
		playing,
		resume,
		giveUp,
		cancelRequestMatch,
		matchResult,
		isMatchCompleted,
		clearMatchCompleted,
		sendKey,
		PageContainerRef,
		handleUpdateDimensions,
		handleChangeColor,
		courtColor,
	} = useContext(GameContext)

	const { user } = useContext(UserContext)

	const router = useRouter()

	useEffect(() => {
		setIsDisabled(false)
		return () => {
			if (!isMatchCompleted && status === 'playing') {
				sendKey('keydown', 'p')
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, isMatchCompleted])

	useEffect(() => {
		if (router.isReady && PageContainerRef && PageContainerRef.current) {
			const { offsetWidth, offsetHeight } =
				PageContainerRef.current as unknown as HTMLElement

			handleUpdateDimensions([offsetWidth, offsetHeight])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady])

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
			<HomeContainer>
				<Header>
					<button onClick={() => router.push('/editProfile')}>
						<FaUserAstronaut size={32} />
						<p>
							<b>{user?.username}</b>
						</p>
					</button>
				</Header>
				<GameContainer>
					{isMatchCompleted && (
						<LoadingContainer>
							{/* <Loading size={200} /> */}
							<h3>Game Over</h3>
							<p>
								You{' '}
								{matchResult.winnerID === user?.userID
									? 'won'
									: 'lost'}
							</p>
							<Button
								buttonType={
									matchResult.winnerID === user?.userID
										? 'default'
										: 'cancel'
								}
								onMouseUp={() => clearMatchCompleted()}
							>
								<FaCheck /> OK
							</Button>
						</LoadingContainer>
					)}
					{!isMatchCompleted && status === 'connected' && (
						<PlayButton
							onClick={() => {
								joinQueue()
							}}
						>
							<FaGamepad size={40} />
							Play
						</PlayButton>
					)}
					{!isMatchCompleted && status === 'searching' && (
						<LoadingContainer>
							<Loading size={200} />
							<h3>Looking for a match...</h3>
							<Button
								buttonType="cancel"
								onMouseUp={() => exitQueue()}
							>
								<MdClose size={40} />
								Cancel
							</Button>
						</LoadingContainer>
					)}

					{!isMatchCompleted && status === 'readyToPlay' && (
						<LoadingContainer>
							{/* <Loading size={200} /> */}
							<h3>Ready?</h3>
							<IconContainer>
								Press{' '}
								<TbSquareArrowUp size={48} className="icon" />{' '}
								for Up
							</IconContainer>
							<IconContainer>
								Press{' '}
								<TbSquareArrowDown size={48} className="icon" />{' '}
								for Down
							</IconContainer>
							<IconContainer>
								Press{' '}
								<TbSquareLetterP size={48} className="icon" />{' '}
								for Pause
							</IconContainer>
							<Button
								disabled={isDisabled}
								onMouseUp={() => {
									playing()
									setIsDisabled(true)
								}}
							>
								<FaCheck /> Ready
							</Button>
						</LoadingContainer>
					)}

					{!isMatchCompleted && status === 'awaiting' && (
						<LoadingContainer>
							<h3>Awaiting for the other player.</h3>
							<Button
								buttonType="cancel"
								onMouseUp={() => cancelRequestMatch()}
							>
								<FaX /> cancel
							</Button>
						</LoadingContainer>
					)}
					{!isMatchCompleted && status === 'playing' && (
						<>
							<Game />
							<MenuWrapper>
								<MenuContainer
									css={{ backgroundColor: courtColor }}
								>
									<MdColorLens size={32} />
								</MenuContainer>
								<MenuContent
									side="top"
									onCloseAutoFocus={(e) => {
										e.preventDefault()
									}}
								>
									<MenuArrow />

									<MenuItem>
										<ColorAction
											css={{ color: '$red' }}
											onClick={() =>
												handleChangeColor('$red')
											}
										>
											<MdColorLens size={32} /> red
										</ColorAction>
									</MenuItem>
									<MenuItem>
										<ColorAction
											css={{ color: '$orange' }}
											onClick={() =>
												handleChangeColor('$orange')
											}
										>
											<MdColorLens size={32} /> orange
										</ColorAction>
									</MenuItem>
									<MenuItem>
										<ColorAction
											css={{ color: '$green300' }}
											onClick={() =>
												handleChangeColor('$green300')
											}
										>
											<MdColorLens size={32} /> green
										</ColorAction>
									</MenuItem>

									<MenuItem>
										<ColorAction
											css={{ color: '$blue100' }}
											onClick={() =>
												handleChangeColor('$blue100')
											}
										>
											<MdColorLens size={32} /> blue
										</ColorAction>
									</MenuItem>
								</MenuContent>
							</MenuWrapper>
						</>
					)}
				</GameContainer>
			</HomeContainer>
			<Modal
				isOpen={
					!isMatchCompleted &&
					status === 'playing' &&
					match.status === 'pause'
				}
			>
				<PauseModal>
					{match?.pausedByUserID === user?.userID ? (
						<h2>Paused</h2>
					) : (
						<h2>
							Paused by{' '}
							{match?.pausedByUserID === match?.player1?.userID
								? match?.player1?.username
								: match?.player2?.username}
						</h2>
					)}

					<div className="buttonsContainer">
						<Button
							buttonType="cancel"
							onMouseUp={() => {
								giveUp()
							}}
						>
							<MdClose size={40} /> Give up
						</Button>
						{match?.pausedByUserID === user?.userID && (
							<PlayButton
								type={'modal'}
								onMouseUp={() => {
									resume()
								}}
							>
								<FaGamepad size={40} />
								Resume
							</PlayButton>
						)}
					</div>
				</PauseModal>
			</Modal>
		</>
	)
}

Home.getLayout = (page: ReactElement) => {
	return <Layout>{page}</Layout>
}
