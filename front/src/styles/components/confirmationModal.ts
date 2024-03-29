import { styled } from '..'

export const ConfirmationModalContainer = styled('div', {
	overflowY: 'auto',

	'&::-webkit-scrollbar': {
		width: 4,
	},
	'&::-webkit-scrollbar-thumb': {
		borderRadius: 32,
		background: '$blue100',
	},
	height: '100%',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: 32,
	h2: {
		fontSize: '$2xl',
		color: '$blue100',
		textAlign: 'center',

		'@bp2': {
			fontSize: '$3xl',
		},
	},
	h3: {
		fontSize: '$xl',
		textAlign: 'center',

		'@bp2': {
			fontSize: '$2xl',
		},
	},

	'.buttonsContainer': {
		width: '100%',
		display: 'flex',
		flexDirection: 'column-reverse',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 16,

		'@bp2': {
			flexDirection: 'row',
		},
	},
})
