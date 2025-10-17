<script lang="ts">
	import '../app.postcss';
	import { MoonIcon, SunIcon, RssIcon } from 'heroicons-svelte/24/solid';
	import { browser } from '$app/environment';
	import { updated } from '$app/state';
	import UpdateNotification from '$lib/components/UpdateNotification.svelte';
	import '$lib/code-highlight-styles.css';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let isDarkMode = $state(
		browser ? Boolean(document.documentElement.classList.contains('dark')) : true
	);

	// Track whether to show update notification and if it's been dismissed
	let showUpdateNotification = $state(false);
	let updateDismissed = $state(false);

	// Watch for updates and show notification
	$effect(() => {
		if (browser && updated.current && !updateDismissed) {
			showUpdateNotification = true;
		}
	});

	function handleUpdateDismiss() {
		showUpdateNotification = false;
		updateDismissed = true;
	}

	function handleUpdateReload() {
		// Clear any dismissal state before reloading
		updateDismissed = false;
		window.location.reload();
	}
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
	<div class="flex items-center gap-3">
		<a href="/rss.xml" title="RSS Feed" aria-label="RSS Feed" class="w-5 h-5 sm:h-8 sm:w-8 sm:p-1">
			<RssIcon
				class="w-full h-full text-zinc-400 dark:text-zinc-400 hover:text-orange-700 dark:hover:text-orange-300"
			/>
		</a>
		<button
			type="button"
			role="switch"
			aria-label="Toggle Dark Mode"
			aria-checked={isDarkMode}
			class="w-5 h-5 sm:h-8 sm:w-8 sm:p-1"
			onclick={() => {
				isDarkMode = !isDarkMode;
				localStorage.setItem('lightTheme', isDarkMode ? 'dark' : 'light');

				if (isDarkMode) {
					document.querySelector('html')?.classList.add('dark');
				} else {
					document.querySelector('html')?.classList.remove('dark');
				}
			}}
		>
			<MoonIcon class="hidden text-zinc-500 dark:block hover:text-zinc-300" />
			<SunIcon class="block text-zinc-400 dark:hidden hover:text-zinc-500" />
		</button>
	</div>
</header>

<main class="site-main container">
	{@render children?.()}
</main>

<footer class="site-footer">
	<p>
		&#169; 0gust1, {new Date().getFullYear()} —
		<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license external"
			>BY-NC-SA 4.0</a
		>
	</p>
	<p class="ml-auto">
		<a href="/rss.xml">RSS Feed</a>
	</p>
</footer>

<!-- Update notification -->
<UpdateNotification
	show={showUpdateNotification}
	onReload={handleUpdateReload}
	onDismiss={handleUpdateDismiss}
/>

<style lang="postcss">
	.site-header {
		@apply px-2 py-2 mb-12;
		@apply flex items-center justify-between;
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
		@apply flex;
		@apply px-2 pt-2 pb-12 mt-48;
		@apply border-t border-stone-500 border-opacity-10;
		@apply text-stone-400 text-xs;
	}
</style>
