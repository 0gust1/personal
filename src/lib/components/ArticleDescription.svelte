<script lang="ts">
  export let description: string;
  export let tags: string[] = [];
</script>

{#if description}
  <p class="text-sm italic text-eigengrau-900/70 dark:text-cosmiclatte-50/50">
    {description}
  </p>
{/if}
{#if tags.length}
  <div class="flex flex-wrap mt-0.5">
    {#each tags as tag}
      <span class="text-xs text-gray-500 dark:text-gray-400 text-opacity-60 mr-2">
        {tag}
      </span>
    {/each}
  </div>
{/if}
