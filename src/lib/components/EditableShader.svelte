<script lang="ts">
	import WebGlCanvas from '$lib/components/WebGLCanvas.svelte';
	interface Props {
		fragShader: string;
		webglVersion?: number;
	}

	let { fragShader, webglVersion = 1 }: Props = $props();

	let shaderCode = $state(fragShader);
</script>

{#key shaderCode}
	<WebGlCanvas {webglVersion} fragShaders={[shaderCode]} />
{/key}

<details>
	<summary>GLSL code (editable)</summary>
	<textarea bind:value={shaderCode} class="w-full h-96 p-4 font-mono text-xs"></textarea>
</details>
