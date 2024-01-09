<script lang="ts">
	import { siteTitle } from '$lib/config';
	export let title: string;
	export let description: string;
	export let tags: string[] = [];
	const formattedTitle = title ? `${title} | ${siteTitle}` : siteTitle;
</script>

<svelte:head>
	<!-- <html {lang} /> -->
	<title>{formattedTitle}</title>
	<meta property="og:site_name" content={siteTitle} />
	<meta property="og:title" content={title} />
	<meta property="og:type" content="website" />
	{#if tags.length}
		<meta property="og:article:tag" content={tags.join(',')} />
	{/if}
</svelte:head>
