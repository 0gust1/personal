<script lang="ts">
  import { siteTitle } from '$lib/config';
  export let title: string;
  export let description: string;
  const formattedTitle = title ? `${title} | ${siteTitle}` : siteTitle;
</script>

<svelte:head>
  <title>{formattedTitle}</title>

  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={title} />
  {#if description}
    <meta property="og:description" content={description} />
  {/if}
</svelte:head>
