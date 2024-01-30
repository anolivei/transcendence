import Head from 'next/head'
import Image from 'next/image'

import {
	ConnectButton,
	ConnectButtonContainer,
	LoginContainer,
	Title,
} from '@/styles/pages/login'

import { FcGoogle } from 'react-icons/fc'

export default function Login() {
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
			<LoginContainer>
				<Title>
					<Image
						src="/assets/logo.png"
						fill
						sizes="(min-width: 640px) 384"
						priority
						alt="Pong"
					/>
				</Title>
				<ConnectButtonContainer>
					<a
						href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth&response_type=code`}
					>
						<ConnectButton>
							<Image
								src="/assets/42.png"
								width={48}
								height={48}
								alt="42logo"
							/>
							Login with 42
						</ConnectButton>
					</a>
					<ConnectButton>
						<FcGoogle size={48} />
						Login Google
					</ConnectButton>
				</ConnectButtonContainer>
			</LoginContainer>
		</>
	)
}
