<script lang="ts">
  export let slug = '';
  export let title: string;
  const id = title
    .toLowerCase()
    .replace(/[^a-zA-Z ]/g, '')
    .replace(/\s/g, '-');
  const href = slug ? `/posts/${slug}` : '#' + id;
</script>

<h1 class="heading" class:large={!slug} {id}>
  <a {href}>
    {title}
  </a>
</h1>

<!-- {#if slug}
  <h3 class="heading" class:large={!slug} {id}>
    <a {href}>
      {title}
    </a>
  </h3>
{:else}
  <h2 class="heading" class:large={!slug} {id}>
    <a {href}>
      {title}
    </a>
  </h2>
{/if} -->

<style lang="postcss">
  h1 {
    @apply font-didone;
  }
  h1 a {
  }
</style>
