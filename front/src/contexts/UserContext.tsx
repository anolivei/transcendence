'use client'
import { login, logout } from '@/reducers/User/Action'
import { UserReducer, isDateExpired } from '@/reducers/User/Reducer'
import { iUser } from '@/reducers/User/Types'
import { ReactNode, createContext, useEffect, useReducer } from 'react'

interface UserContextType {
	user: iUser | undefined
	handleLogin: (user: iUser | undefined) => void
	handleLogout: () => void
}

interface UserProviderProps {
	children: ReactNode
}

export const UserContext = createContext({} as UserContextType)

export function UserProvider({ children }: UserProviderProps) {
	const [state, dispatch] = useReducer(
		UserReducer,
		{
			user: undefined,
		},
		(initialState) => {
			if (typeof window !== 'undefined') {
				console.log('reducer rodou')
				const storedStateAsJSON = localStorage.getItem(
					'@42Transcendence:user',
				)
				if (storedStateAsJSON) {
					const newUser = JSON.parse(storedStateAsJSON)
					// console.log('reducer newUser:', newUser)
					if (newUser) {
						if (!isDateExpired(newUser.expiresAt)) {
							// console.log('retorna newUser:', newUser)
							return { user: newUser }
						}
					}
				}
			}
			return initialState
		},
	)

	const { user } = state

	// function handleUpdateUser() {
	// 	dispatch(updateUser())
	// }

	function handleLogin(user: iUser | undefined) {
		dispatch(login(user))
	}

	function handleLogout() {
		dispatch(logout())
	}

	useEffect(() => {
		console.log('userChanged:', user)
	}, [user])

	return (
		<UserContext.Provider
			value={{
				user,
				handleLogin,
				handleLogout,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}
