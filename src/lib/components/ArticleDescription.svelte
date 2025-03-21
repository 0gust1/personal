<script lang="ts">
	interface Props {
		description: string | null | undefined;
	}

	let { description }: Props = $props();
</script>

{#if description}
	<p class="text-xs italic text-eigengrau-900/50 dark:text-cosmiclatte-50/50">
		{description}
	</p>
{/if}
