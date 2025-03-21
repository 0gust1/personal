<script lang="ts">
	interface Props {
		date: string;
		updated_at?: string | null;
		locale?: string;
	}

	let { date, updated_at = null, locale = 'fr' }: Props = $props();
	const formattedDate = new Date(date).toLocaleDateString(locale);
</script>

<div>
	<time class="text-stone-400 date text-sm" datetime={date}>{formattedDate ?? ''}</time>
</div>
{#if updated_at}
	<div class="text-stone-400 text-xs text-opacity-60">
		<span class="align-super mr-0.5">*</span><time class="date" datetime={updated_at}
			>{new Date(updated_at).toLocaleDateString(locale)}</time
		>
	</div>
{/if}

<style lang="postcss">
	.date {
		@apply font-mono font-light;
	}
</style>
