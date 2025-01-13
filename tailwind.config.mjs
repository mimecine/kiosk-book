/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				red: '#f00',
				blue: '#00f',
			}
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
