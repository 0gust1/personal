<script lang="ts">
  import { dev } from '$app/environment';
  import type { PageData } from './$types';
  import Debug from '$lib/components/Debug.svelte';
  import Cartridge from './cartridge.svelte';
  import PageHead from '$lib/components/PageHead.svelte';
  import ArticleMeta from '$lib/components/ArticleMeta.svelte';
  import ArticleDescription from '$lib/components/ArticleDescription.svelte';

  export let data: PageData;

  const locale = 'fr';
</script>

<PageHead title="Home" description="0gust1's notes and ramblings" />

<Cartridge />

<h2>Logs</h2>
<div class="posts-list">
  {#each data.logs as { slug, title, description, date, tags, updated_at }}
    {@const formattedDate = new Date(date).toLocaleDateString(locale)}
    {@const formattedUpdatedDate = updated_at
      ? new Date(updated_at).toLocaleDateString(locale)
      : null}
    <article>
      <div class="order-2">
        <a href="/logs/{slug}">{title}</a>
        <ArticleDescription {description} {slug} {tags} />
      </div>
      <div class="order-1 w-20">
        <span>
          <time class="date" datetime={date}>{formattedDate ?? ''}</time>
        </span>
        <!-- {#if updated_at}
          <span class="ml-2 text-xs">
            (updated:
            <time class="date">{new Date(updated_at).toLocaleDateString(locale)}</time>
            )
          </span>
        {/if} -->
      </div>
    </article>
  {/each}
</div>
<h2>Posts</h2>
<div class="posts-list">
  {#each data.posts as { slug, title, description, date, tags }}
    {@const formattedDate = new Date(date).toLocaleDateString(locale)}
    <article class="flex">
      <div class=" order-2">
        <a href="/posts/{slug}">{title}</a>
        <ArticleDescription {description} {slug} {tags} />
      </div>
      <div class="order-1 w-20">
        <span>
          <time class="date" datetime={date}>{formattedDate ?? ''}</time>
        </span>
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
{#if dev}
  <Debug {data} />
{/if}
<slot />

<style lang="postcss">
  h2 {
    @apply text-xl font-medium font-didone mt-3 mb-1;
  }

  .posts-list {
    @apply pl-2;
  }

  .date {
    @apply text-stone-400 font-mono text-xs font-light;
  }

  article {
    @apply mb-1.5;
    @apply flex gap-4;
  }
  .topics-list {
    @apply flex flex-wrap gap-2;
    @apply text-sm;
  }
</style>
