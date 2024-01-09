<script lang="ts">
	import '../app.postcss';
	import { MoonIcon, SunIcon } from 'heroicons-svelte/24/solid';
	import { browser } from '$app/environment';
	import '$lib/code-highlight-styles.css';

	let isDarkMode = browser ? Boolean(document.documentElement.classList.contains('dark')) : true;
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="0gust1 - all content" href="/rss.xml" />
	<link rel="alternate" type="application/rss+xml" title="0gust1 - all logs" href="/logs/rss.xml" />
	<link
		rel="alternate"
		type="application/rss+xml"
		title="0gust1 - all blog posts"
		href="/posts/rss.xml"
	/>
	<script>
		// On page load or when changing themes, best to add inline in `head` to avoid FOUC
		if (
			localStorage.lightTheme === 'dark' ||
			(!('lightTheme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	</script>
</svelte:head>

<header class="site-header">
	<a href="/" class="flex gap-3 items-center">
		<img src="/Cretan-labyrinth-circular-disc.svg" alt="" class="w-16 h-16" />
		<h1 class="font-didone text-3xl">0gust1</h1></a
	>
	<button
		type="button"
		role="switch"
		aria-label="Toggle Dark Mode"
		aria-checked={isDarkMode}
		class="w-5 h-5 sm:h-8 sm:w-8 sm:p-1"
		on:click={() => {
			isDarkMode = !isDarkMode;
			localStorage.setItem('lightTheme', isDarkMode ? 'dark' : 'light');

			//disableTransitionsTemporarily()

			if (isDarkMode) {
				document.querySelector('html')?.classList.add('dark');
			} else {
				document.querySelector('html')?.classList.remove('dark');
			}
		}}
	>
		<MoonIcon class="hidden text-zinc-500 dark:block" />
		<SunIcon class="block text-zinc-400 dark:hidden" />
	</button>
</header>

<main class="site-main container">
	<slot />
</main>

<footer class="site-footer">
	<p>
		&#169; 0gust1, {new Date().getFullYear()} —
		<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license external"
			>BY-NC-SA 4.0</a
		>
	</p>
</footer>

<style lang="postcss">
	.site-header {
		@apply px-2 py-2 mb-12;
		@apply flex items-center justify-between;
		/* @apply bg-stone-500 bg-opacity-50; */
	}
	.site-header a {
		@apply text-stone-700;
	}
	.site-main {
		@apply px-2 w-full;
		@apply grow;
		@apply mx-auto;
	}
	.site-footer {
		@apply px-2 py-2 mt-12;
		@apply border-t border-stone-500 border-opacity-10;
		@apply text-stone-400 text-xs;
	}
</style>
