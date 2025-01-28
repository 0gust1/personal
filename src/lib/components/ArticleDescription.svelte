<script lang="ts">
	interface Props {
		description: string;
	}

	let { description }: Props = $props();
</script>

{#if description}
	<p class="text-sm italic text-eigengrau-900/70 dark:text-cosmiclatte-50/50">
		{description}
	</p>
{/if}
