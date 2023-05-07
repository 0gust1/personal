<script lang="ts">
  export let date: string;
  const formattedDate = new Date(date).toLocaleDateString();
</script>

<span>
  <time class="date">{formattedDate ?? ''}</time>
</span>

<style lang="postcss">
  .date {
    @apply text-stone-400 font-mono text-sm;
  }
</style>
