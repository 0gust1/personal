<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
</script>

<div class="site-container">
  <header class="site-header">
    <a href="/" class="flex gap-3 items-center">
      <img src="/Cretan-labyrinth-circular-disc.svg" alt="" class="w-12 h-12" />
      <h1
        class=" font-didone"
        class:small={$page.url.pathname !== '/'}
        class:big={$page.url.pathname === '/'}
      >
        0gust1
      </h1></a
    >
  </header>

  <main class="site-main container">
    <slot />
  </main>

  <footer class="site-footer">
    <p>
      &#169; 0gust1, {new Date().getFullYear()}
    </p>
  </footer>
</div>

<style lang="postcss">
  .site-container {
    @apply flex flex-col min-h-screen;

    background-color: #fff8e7;
  }
  .site-header {
    @apply px-2 py-2;
    @apply bg-stone-500 bg-opacity-50;
  }
  .site-header a {
    @apply text-stone-700;
  }
  .site-main {
    @apply px-2;
    @apply grow;
  }
  .site-footer {
    @apply px-2;
    @apply py-2;
    @apply text-stone-400 text-xs;
  }

  .small {
    @apply text-sm;
  }
  .big {
    @apply text-3xl;
  }
</style>
