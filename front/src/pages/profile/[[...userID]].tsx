import Head from 'next/head'
import { useRouter } from 'next/router'
import Image from 'next/image'

import {
	MatchCardsContainer,
	MatchHistoryContainer,
	PageContainer,
	ProfileContainer,
	ProfileDataContainer,
	ProfileImageContainer,
	TitleContainer,
} from '@/styles/pages/profile'

import { FaUserAstronaut } from 'react-icons/fa6'
import { MdViewList } from 'react-icons/md'
import Stats from '@/components/stats'
import MatchCard from '@/components/matchCard'

import userDefaulAvatar from '../../../public/assets/user.png'
import Layout from '@/components/layout'
import { ReactElement, useEffect } from 'react'
import { api } from '@/services/api'

interface iPlayer {
	username: string
	score: number
	winner?: boolean
}

export default function Profile() {
	const router = useRouter()
	console.log('router:', router)

	const gamesPlayed = 10
	const wins = 4
	const stats = { gamesPlayed, wins }

	const player1: iPlayer = { username: 'acarneir', score: 3 }
	const player2: iPlayer = { username: 'rfelipe-', score: 2 }

	const match1 = [player1, player2]
	const match2 = [player2, player1]
	const matchHistory = [match1, match2, match2, match1, match1, match2]

	const profileUser = router.query.userID ? router.query.userID : 'acarneir'

	async function getUserData() {
		try {
			const { data: userData } = await api.get(
				`/users/findUsersByUserID/${1}`,
			)
			console.log('user data:', userData)
			const { data: matchHistoryData } = await api.get(
				`/game/match_history/${1}`,
			)
			console.log('matchHistory data:', matchHistoryData)
		} catch (error) {}
	}

	useEffect(() => {
		getUserData()
	}, [])

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
			<PageContainer>
				<ProfileDataContainer>
					<ProfileContainer>
						<ProfileImageContainer>
							<Image
								src={userDefaulAvatar.src}
								width={180}
								height={180}
								priority={true}
								alt="user"
							/>
						</ProfileImageContainer>
						<TitleContainer
							css={{
								borderBottom: '2px solid $white',
								borderRadius: 24,
							}}
						>
							<FaUserAstronaut size={40} />
							<h2>{profileUser}</h2>
						</TitleContainer>
					</ProfileContainer>
					<Stats stats={stats} />
				</ProfileDataContainer>
				<MatchHistoryContainer>
					<TitleContainer>
						<MdViewList size={56} />
						<h2>Match History</h2>
					</TitleContainer>
					<MatchCardsContainer>
						{matchHistory.map((match, i) => (
							<MatchCard key={i} players={match} />
						))}
					</MatchCardsContainer>
				</MatchHistoryContainer>
			</PageContainer>
		</>
	)
}

Profile.getLayout = (page: ReactElement) => {
	return <Layout>{page}</Layout>
}
