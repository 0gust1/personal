<script lang="ts">
  const miscellanea_synonyms = [
    'A Miscellanea',
    'An Agglomeration',
    'A Clutter',
    'A Gallimaufry',
    'An Hodgepodge',
    'A Jambalaya',
    'A Mélange',
    'A Patchwork'
  ];
  const random_synonym =
    miscellanea_synonyms[Math.floor(Math.random() * miscellanea_synonyms.length)];
</script>

<p class="text-lg mb-2">{random_synonym} of Ideas, Notes and Ramblings</p>
<div class="text-stone-500">
  find me elsewhere:
  <ul>
    <li>
      <a href="https://twitter.com/0gust1" rel="">twitter</a>
    </li>
    <li>
      <a href="https://merveilles.town/@0gust1">merveilles.town</a>
    </li>
    <li>
      <a href="https://github.com/0gust1">github</a>
    </li>
  </ul>
</div>

<style lang="postcss">
  ul {
    @apply inline-flex;
  }
  ul li {
    @apply mr-2;
  }
  ul li > * {
    @apply mr-2;
  }
  ul li::after {
    content: '|';
  }
  ul li:last-child::after {
    content: '';
  }
</style>
