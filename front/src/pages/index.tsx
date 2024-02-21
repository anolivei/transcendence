import Head from 'next/head'
import { ReactElement, useContext, useEffect } from 'react'
import { FaCheck, FaGamepad, FaUserAstronaut } from 'react-icons/fa6'

import {
	Header,
	HomeContainer,
	LoadingContainer,
	PauseModal,
	PlayButton,
} from '@/styles/pages/home'
import Layout from '@/components/layout'
import Game from '@/components/game'
import { GameContext } from '@/contexts/GameContext'
import Loading from '@/components/loading'
import { UserContext } from '@/contexts/UserContext'
import Modal from '@/components/modal'
import Button from '@/components/button'
import { MdClose } from 'react-icons/md'

export default function Home() {
	const {
		status,
		match,
		joinQueue,
		exitQueue,
		playing,
		resume,
		matchResult,
		isMatchCompleted,
		clearMatchCompleted,
		sendKey,
	} = useContext(GameContext)

	const { user } = useContext(UserContext)

	useEffect(() => {
		console.log('rodou effect game')
		return () => {
			if (!isMatchCompleted && status === 'playing') {
				sendKey('keydown', 'p')
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, isMatchCompleted])

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
					<button>
						<FaUserAstronaut size={32} />
						<p>
							<b>{user?.username}</b>
						</p>
					</button>
				</Header>
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
						<Button onMouseUp={() => playing()}>
							<FaCheck /> Ready
						</Button>
					</LoadingContainer>
				)}
				{!isMatchCompleted && status === 'playing' && <Game />}
			</HomeContainer>
			<Modal
				isOpen={
					!isMatchCompleted &&
					status === 'playing' &&
					match.status === 'pause'
				}
			>
				<PauseModal>
					{match.pausedByUserID === user?.userID ? (
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
						<Button buttonType="cancel">
							<MdClose size={40} /> Give up
						</Button>
						{match.pausedByUserID === user?.userID && (
							<PlayButton
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
