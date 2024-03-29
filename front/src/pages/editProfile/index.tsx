import {
	EditProfileContainer,
	EditProfileImageContainer,
	EditProfileWrapper,
	InputContainer,
	SwitchButton,
	SwitchContainer,
	TwoFAContainer,
	UploadProgessContainer,
} from '@/styles/pages/editProfile'
import Image from 'next/image'
import { FaUserAstronaut } from 'react-icons/fa6'
import { MdEdit } from 'react-icons/md'

import userDefaulAvatar from '../../../public/assets/user.png'
import {
	ChangeEvent,
	FormEvent,
	ReactElement,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useRouter } from 'next/router'
import { api } from '@/services/api'
import { toast } from 'react-toastify'
import { UserContext } from '@/contexts/UserContext'
import { LoadingContainer } from '@/styles/pages/profile'
import Loading from '@/components/loading'
import Layout from '@/components/layout'
import Button from '@/components/button'
import { SwitchThumb } from '@radix-ui/react-switch'
import { GrUpdate } from 'react-icons/gr'
import { delayMs } from '@/utils/functions'
import { z } from 'zod'
import EnableTwoFAModal from '@/components/modals/enableTwoFAModal'
import axios from 'axios'

const editUsernameSchema = z
	.string()
	.length(8, { message: 'Username must be exactly 8 characters long' })
	.regex(/^[a-zA-Z0-9-]+$/, {
		message: 'Username must contain only letters, numbers or hyphen',
	})

export default function EditProfile() {
	const router = useRouter()
	const { user, handleLogin } = useContext(UserContext)

	const usernameInput = useRef(null)
	const fileInput = useRef(null)

	const [isLoading, setIsLoading] = useState(true)
	const [username, setUsername] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')
	const [error, setError] = useState('')
	const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
	const [isUsernameDisabled, setIsUsernameDisabled] = useState(true)
	const [showEnableTwoFAModal, setShowEnableTwoFAModal] = useState(false)
	const [uploadProgress, setUploadProgress] = useState<number>(100)

	async function handleEditUsername() {
		setIsUsernameDisabled(false)
		await delayMs(100)
		;(usernameInput.current as unknown as HTMLElement).focus()
	}

	async function handleSubmitEditUsername(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const validateUsername = editUsernameSchema.safeParse(username)
		if (!validateUsername.success) {
			const errors = (validateUsername as any).error.format()._errors
			setError(errors[0])
		} else {
			setError('')
			try {
				await api.patch('/users/', { username })
				if (user) {
					const updatedUser = user
					updatedUser.username = username
					handleLogin(updatedUser)
				}
				toast('Username updated.', {
					type: 'success',
					draggable: false,
				})
				setIsUsernameDisabled(true)
			} catch (error: any) {
				toast(error.response.data.message, {
					type: 'error',
					draggable: false,
				})
			}
		}
	}

	async function handleToogleTwoFA() {
		if (isTwoFactorEnabled) {
			try {
				await api.post(`/users/activeTwoFactor`)
				setIsTwoFactorEnabled(false)
			} catch (error: any) {
				toast(error.message ? error.message : error, {
					type: 'error',
					draggable: false,
				})
			}
		} else {
			setShowEnableTwoFAModal(true)
		}
	}

	function handleEditAvatar() {
		;(fileInput.current as unknown as HTMLElement).click()
	}

	async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) {
			try {
				const formData = new FormData()
				formData.append('avatar', file)
				const cancelTokenSource = axios.CancelToken.source()
				const response = await api.post(
					'users/upload-avatar',
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
						onUploadProgress: (progressEvent) => {
							if (progressEvent.total) {
								const progress = Math.round(
									(progressEvent.loaded * 100) /
										progressEvent.total,
								)
								setUploadProgress(progress)
							}
						},
						cancelToken: cancelTokenSource.token,
					},
				)
				setAvatarUrl(response.data.url)
				toast('Avatar changed successfuly', {
					type: 'success',
					draggable: false,
				})
			} catch (error: any) {
				toast(error.response.data.message, {
					type: 'error',
					draggable: false,
				})
			}
		}
	}

	useEffect(() => {
		async function getUserData() {
			setIsLoading(true)
			try {
				const { data: userData } = await api.get(`/users/me`)
				setUsername(userData.username)
				setAvatarUrl(userData.avatar_url)
				setIsTwoFactorEnabled(userData.two_factor_enabled)
				setIsLoading(false)
			} catch (error: any) {
				setUsername('')
				setAvatarUrl('')
				setIsTwoFactorEnabled(false)
				setIsLoading(false)
				toast(error.message ? error.message : error, {
					type: 'error',
					draggable: false,
				})
			}
		}

		if (router.isReady && user) {
			getUserData()
		} else {
			setIsLoading(false)
			toast('Error', {
				type: 'error',
				draggable: false,
			})
		}
	}, [router.isReady, user])

	return isLoading ? (
		<LoadingContainer>
			<Loading size={200} />
		</LoadingContainer>
	) : (
		<EditProfileWrapper>
			<EditProfileContainer>
				<h2>Edit Profile</h2>
				<EditProfileImageContainer onClick={handleEditAvatar}>
					<Image
						src={avatarUrl || userDefaulAvatar.src}
						width={180}
						height={180}
						alt="user"
						placeholder="blur"
						blurDataURL={userDefaulAvatar.src}
					/>
					<div className="icon">
						<MdEdit size={32} />
					</div>
					{uploadProgress > 0 && uploadProgress < 100 && (
						<UploadProgessContainer>
							<p>Uploading: {uploadProgress}%</p>
							<progress value={uploadProgress} max={100} />
						</UploadProgessContainer>
					)}
					<input
						type="file"
						accept="image/*"
						onChange={handleAvatarChange}
						ref={fileInput}
						style={{ display: 'none' }}
					/>
				</EditProfileImageContainer>
				<InputContainer onSubmit={(e) => handleSubmitEditUsername(e)}>
					<input
						type="text"
						value={username}
						maxLength={8}
						onChange={(e) => setUsername(e.target.value)}
						ref={usernameInput}
						disabled={isUsernameDisabled}
					/>
					<FaUserAstronaut size={32} className="icon" />
					<span>{error}</span>

					{isUsernameDisabled && (
						<Button type="button" onClick={handleEditUsername}>
							<MdEdit size={32} />
							Username
						</Button>
					)}
					{!isUsernameDisabled && (
						<Button buttonType="accept" type="submit">
							<GrUpdate size={32} />
							Username
						</Button>
					)}
				</InputContainer>

				<TwoFAContainer
					isTwoFAEnabled={isTwoFactorEnabled}
					onClick={handleToogleTwoFA}
				>
					<SwitchContainer>
						<label
							htmlFor="2fa"
							style={{
								color: isTwoFactorEnabled
									? '$green500'
									: '$gray600',
							}}
						>
							2FA
						</label>
						<SwitchButton
							id="2fa"
							checked={isTwoFactorEnabled}
							// onCheckedChange={(value) =>
							// 	setIsTwoFactorEnabled(value)
							// }
							// ref={switchButtonRef}
						>
							<SwitchThumb asChild>
								<div className="thumb">
									{isTwoFactorEnabled ? 'On' : 'Off'}
								</div>
							</SwitchThumb>
						</SwitchButton>
					</SwitchContainer>
				</TwoFAContainer>
			</EditProfileContainer>
			<EnableTwoFAModal
				showEnableTwoFAModal={showEnableTwoFAModal}
				setShowEnableTwoFAModal={setShowEnableTwoFAModal}
				setIsTwoFactorEnabled={setIsTwoFactorEnabled}
			/>
		</EditProfileWrapper>
	)
}

EditProfile.getLayout = (page: ReactElement) => {
	return <Layout>{page}</Layout>
}
