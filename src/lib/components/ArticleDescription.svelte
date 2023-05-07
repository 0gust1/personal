<script lang="ts">
  export let description: string;
  export let slug = '';
  const href = slug && `/posts/${slug}`;
</script>

<p>
  {description ?? ''}

  {#if slug}
    <a {href}>Read More &rarr;</a>
  {/if}
</p>
