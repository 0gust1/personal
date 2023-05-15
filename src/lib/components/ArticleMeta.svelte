<script lang="ts">
  export let date: string;
  export let locale = 'fr';
  const formattedDate = new Date(date).toLocaleDateString(locale);
</script>

<span>
  <time class="date">{formattedDate ?? ''}</time>
</span>

<style lang="postcss">
  .date {
    @apply text-stone-400 font-mono text-xs font-light;
  }
</style>
