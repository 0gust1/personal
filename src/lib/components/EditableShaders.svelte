<script lang="ts">
  import WebGlCanvas from '$lib/components/WebGLCanvas.svelte';
  export let vertexShaders: string[] = [];
  export let fragShaders: string[];
  export let webglVersion = 1;

  let currShader = 'f0';

  let allShaders = getShadersDict(vertexShaders, fragShaders);

  function getShadersDict(vertexShaders: string[], fragShaders: string[]) {
    let shaders = {} as Record<string, string>;
    for (let i = 0; i < vertexShaders.length; i++) {
      shaders[`v${i}`] = vertexShaders[i];
    }
    for (let i = 0; i < fragShaders.length; i++) {
      shaders[`f${i}`] = fragShaders[i];
    }
    return shaders;
  }

  $: vtxShaders = Object.entries(allShaders)
    .filter(([k]) => k[0] === 'v')
    .map(([_, v]) => v);
  $: frgShaders = Object.entries(allShaders)
    .filter(([k]) => k[0] === 'f')
    .map(([_, v]) => v);
</script>

{#key allShaders}
  <WebGlCanvas {webglVersion} vertexShaders={vtxShaders} fragShaders={frgShaders} />
{/key}

<details class="" open>
  <summary>GLSL code (editable)</summary>
  <div class="shaders_code">
    <div class="shaders-list">
      <h3>Vertex Shaders</h3>
      <ul>
        {#each vertexShaders as vtxS, i}
          <li>
            <label>
              <input type="radio" bind:group={currShader} value={`v${i}`} />
              v{i}
            </label>
          </li>
        {/each}
      </ul>
      <h3>Fragment Shaders</h3>
      <ul>
        {#each fragShaders as frgS, i}
          <li>
            <label>
              <input type="radio" bind:group={currShader} value={`f${i}`} />
              f{i}
            </label>
          </li>
        {/each}
      </ul>
    </div>
    <div class="shader_editor">
      <textarea bind:value={allShaders[currShader]} class="w-full h-96 p-4 font-mono text-xs" />
    </div>
  </div>
  <!-- <textarea bind:value={shaderCode} class="w-full h-96 p-4 font-mono text-xs" /> -->
</details>

<!-- <div>
  {JSON.stringify(frgShaders, null, 2)}
</div>
<div>
  {JSON.stringify(allShaders, null, 2)}
</div> -->

<style lang="postcss">
  .shaders_code {
    @apply w-full h-96 font-mono text-xs flex gap-2;
  }
  .shaders-list {
    @apply w-1/6;
    & h3 {
      @apply text-xs font-normal m-0;
    }
    & ul {
      @apply list-none m-0 mb-4 p-0;
    }
    & ul li label {
      @apply block w-full bg-sky-200 text-sky-600 px-2 py-1 rounded-md;
    }
  }
  .shader_editor {
    @apply flex-1;
  }
</style>
