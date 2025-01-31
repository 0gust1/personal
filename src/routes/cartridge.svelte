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

<div class="ml-12 mb-10">
	<p class="text-lg mb-2">{random_synonym} of Ideas, Notes and Ramblings</p>
	<div class="text-stone-500 text-sm">
		find me elsewhere:
		<ul>
			<li>
				<a href="https://merveilles.town/@0gust1">merveilles.town</a>
			</li>
			<li>
				<a href="https://github.com/0gust1">github</a>
			</li>
			<li>
				<a href="https://bsky.app/profile/0gust1.bsky.social">bluesky</a>
			</li>
			<li>
				<a href="https://twitter.com/0gust1" class="cancel">twitter</a>
			</li>
		</ul>
	</div>
</div>

<style lang="postcss">
	.cancel {
		@apply line-through decoration-solid decoration-red-500;
	}
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
