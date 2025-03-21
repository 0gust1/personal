<script lang="ts">
	interface Props {
		lang?: string;
	}

	let { lang = 'en' }: Props = $props();
</script>

<svelte:head>
	<html {lang}></html>
</svelte:head>
