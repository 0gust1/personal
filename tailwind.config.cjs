const colors = require('tailwindcss/colors');
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				eigengrau: {
					50: '#e8e8f0',
					100: '#d0d0d2',
					200: '#b9b9bb',
					300: '#a2a2a5',
					400: '#8a8a8e',
					500: '#737377',
					600: '#5c5c61',
					700: '#45454a',
					800: '#2e2e34',
					900: '#16161d'
				},
				cosmiclatte: {
					50: '#FFF8E7',
					100: '#E8DCBE',
					200: '#D2C198',
					300: '#BBA877',
					400: '#A4905A',
					500: '#8E7941',
					600: '#77632C',
					700: '#604E1B',
					800: '#4A3A0E',
					900: '#332705'
				}
			},
			fontFamily: {
				didone: [
					'Didot',
					'Bodoni MT',
					'Noto Serif Display',
					'URW Palladio L',
					'P052',
					'Sylfaen',
					'serif'
				]
			}
		}
	},

	plugins: [require('@tailwindcss/typography')]
};

module.exports = config;
