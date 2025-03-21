<script lang="ts">
	interface Props {
		data: unknown;
	}

	let { data }: Props = $props();
</script>

<pre class="text-xs font-mono px-4 py-6 my-4 bg-slate-200 dark:bg-slate-800">
  {JSON.stringify(data, null, 2)}
</pre>
