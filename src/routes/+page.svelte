<script lang="ts">
  import type { PageData } from './$types';
  import Cartridge from './cartridge.svelte';
  import PageHead from '$lib/components/PageHead.svelte';
  import ArticleTitle from '$lib/components/ArticleTitle.svelte';
  import ArticleMeta from '$lib/components/ArticleMeta.svelte';
  import ArticleDescription from '$lib/components/ArticleDescription.svelte';

  export let data: PageData;
</script>

<PageHead title="Home" description="0gust1's notes and ramblings" />

<Cartridge />

<h2>Logs</h2>
<div class="posts-list">
  <!-- {#each data.logs as { slug, title, author, description, date }}
    <article>
      <div class="order-2">
        <a href="/posts/{slug}">{title}</a>
        <ArticleTitle {slug} {title} />
        <ArticleDescription {description} {slug} />
      </div>
      <div class="order-1">
        <ArticleMeta {date} />
      </div>
    </article>
  {/each} -->
</div>
<h2>Posts</h2>
<div class="posts-list">
  {#each data.posts as { slug, title, author, description, date }}
    <article class="flex">
      <div class=" order-2">
        <ArticleTitle {slug} {title} />
        <ArticleDescription {description} {slug} />
      </div>
      <div class="order-1">
        <ArticleMeta {date} />
      </div>
    </article>
  {/each}
</div>
<h2>Topics</h2>
<div>
  <ul class="topics-list">
    {#each data.tagsInfo.tags as tagAcc}
      <li>
        <span>{tagAcc.tag}({tagAcc.count})</span>
      </li>
    {/each}
  </ul>
</div>

<h2>Debug</h2>
<div>
  {JSON.stringify(data, null, 2)}
</div>

<slot />

<style lang="postcss">
  h2 {
    @apply text-xl font-semibold font-didone mt-2;
  }

  .posts-list {
    @apply pl-2;
  }

  article {
    @apply mb-1;
    @apply flex gap-4;
  }
  .topics-list {
    @apply flex flex-wrap gap-2;
    @apply text-sm;
  }
</style>
