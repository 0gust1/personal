<script lang="ts">
  export let description: string;
</script>

{#if description}
  <p class="text-sm italic text-eigengrau-900/70 dark:text-cosmiclatte-50/50">
    {description}
  </p>
{/if}
