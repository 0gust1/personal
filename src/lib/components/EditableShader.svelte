<script lang="ts">
  import WebGlCanvas from '$lib/components/WebGLCanvas.svelte';
  export let fragShader: string;
  export let webglVersion = 1;

  let shaderCode = fragShader;
</script>

{#key shaderCode}
  <WebGlCanvas {webglVersion} fragShaders={[shaderCode]} />
{/key}

<details>
  <summary>GLSL code (editable)</summary>
  <textarea bind:value={shaderCode} class="w-full h-96 p-4 font-mono text-xs" />
</details>
