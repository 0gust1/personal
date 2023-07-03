<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import { createProgramFromSources } from '$lib/webgl-utils';

  export let scale = 1;
  export let xscrollPerc = 0;
  export let yscrollPerc = 0;

  export let fragShader = `
		precision highp float;

		uniform vec2 u_resolution;
		uniform vec2 u_mouse;
		uniform float u_time;
		uniform float u_xscrollPerc;
		uniform float u_yscrollPerc;

		void main() {
			gl_FragColor = vec4(fract((gl_FragCoord.xy - u_mouse) / u_resolution), fract(u_time), 1);
		}
	`;

  let time = 0;
  let m = { x: 0, y: 0 };
  let canvasWidth: number;
  let canvasHeight: number;
  let gl: WebGLRenderingContext | null;
  let program: WebGLProgram | null;
  let positionBuffer: WebGLBuffer | null;
  let canvas: HTMLCanvasElement;
  let error: string;

  const vs = `
			attribute vec4 a_position;
			void main() { gl_Position = a_position; }
		`;

  onMount(() => {
    if (browser) {
      setupWebGL();
    }
  });

  onDestroy(() => {
    if (gl) {
      cleanup(gl);
    }
  });

  function setupWebGL() {
    let frame: number;
    //window.removeEventListener(evt.type, setupWebGL, false);
    if (!(gl = getRenderingContext())) return;
    try {
      program = createProgramFromSources(gl, [vs, fragShader]) as WebGLProgram; //will be checked later
    } catch (err) {
      cleanup(gl);
      error = `WebGL program creation failed. Error log:
        ${err}`;

      return;
    }

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const linkErrLog = gl.getProgramInfoLog(program);
      cleanup(gl);

      error = `Shader program did not link successfully. Error log: ${linkErrLog}`;

      return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const xscrollLocation = gl.getUniformLocation(program, 'u_xscrollPerc');
    const yscrollLocation = gl.getUniformLocation(program, 'u_yscrollPerc');

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    (function loop() {
      frame = requestAnimationFrame(loop);
      time += 0.01;

      gl.viewport(0.95, 0, gl.canvas.width, gl.canvas.height);
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(mouseLocation, m.x, -m.y);
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(yscrollLocation, yscrollPerc);
      gl.uniform1f(xscrollLocation, xscrollPerc);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    })();

    return () => {
      cancelAnimationFrame(frame);
    };
  }

  function cleanup(gl: WebGLRenderingContext) {
    gl.useProgram(null);
    if (positionBuffer) {
      gl.deleteBuffer(positionBuffer);
    }
    if (program) {
      gl.deleteProgram(program);
    }
  }

  function getRenderingContext() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) {
      error = `gettting webgl context failed. Your browser or device may not support WebGL.`;
      return null;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
  }
</script>

<div class="canvas_container">
  <canvas class="" bind:this={canvas} width={canvasWidth} height={canvasHeight} />
  {#if error}
    <div class="error">
      <p class="font-bold">Problem compiling the WebGL program:</p>
      <p>{error}</p>
    </div>
  {/if}
</div>

<style lang="postcss">
  .canvas_container {
    position: relative;
    & canvas {
      @apply w-full h-96;
    }
    & .error {
      @apply absolute top-0 left-0 w-full h-full flex flex-col text-white bg-black bg-opacity-50 p-4;
    }
  }
</style>
