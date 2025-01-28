<script lang="ts">
	import { siteTitle } from '$lib/config';
	interface Props {
		title: string;
		description: string;
		tags?: string[];
	}

	let { title, description, tags = [] }: Props = $props();
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
