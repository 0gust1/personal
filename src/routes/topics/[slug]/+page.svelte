<script lang="ts">
	import type { PageData } from './$types';
	import PageHead from '$lib/components/PageHead.svelte';
    import ContentList from '$lib/components/ContentList.svelte';
	let { data }: { data: PageData } = $props();
    const locale = 'fr';
</script>

<PageHead
	title={`Topic: "${data.tag}"`}
	description={`All content related to the topic "${data.tag}"`}
	tags={[data.tag]}
/>

<!-- <div>
	{JSON.stringify(data)}
</div> -->

<h1 class="heading"><span class=" opacity-70">Topic:</span> &ldquo;{data.tag}&rdquo;</h1>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
	
	<div class="">
		<h2>Logs</h2>
        <ContentList items={data.logs} type="logs" {locale} />
	</div>
	<div>
		<h2>Posts</h2>
        <ContentList items={data.posts} type="posts" {locale} />
	</div>
</div>

<style lang="postcss">
    h1 {
		@apply font-didone text-3xl;
	}
    h2 {
		@apply text-xl font-medium font-didone mt-3 mb-2;
	}
</style>
