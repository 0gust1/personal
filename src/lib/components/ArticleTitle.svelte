<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();
	const id = title
		.toLowerCase()
		.replace(/[^a-zA-Z ]/g, '')
		.replace(/\s/g, '-');
	const href = '#' + id;
</script>

<h1 class="heading" {id}>
	<a {href}>
		{title}
	</a>
</h1>

<style lang="postcss">
	h1 {
		@apply font-didone text-3xl;
	}
	h1 a {
		text-decoration: none;
	}
</style>
