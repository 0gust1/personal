
<script lang="ts">
const { children } = $props();
</script>

{#if children}
<div class="markdown-layout">
	{@render children()}
</div>
{:else}
	<p>fallback content</p>
{/if}