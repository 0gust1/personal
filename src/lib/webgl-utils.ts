/*
	WebGL utility methods from Gregg Tavares :
	https://webglfundamentals.org/webgl/resources/webgl-utils.js
	07/2023 - Converted to TS by 0gust1
*
* Copyright 2012, Gregg Tavares.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*     * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*     * Neither the name of Gregg Tavares. nor the names of his
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

type ShaderType = 'VERTEX_SHADER' | 'FRAGMENT_SHADER';

const defaultShaderType: ShaderType[] = ['VERTEX_SHADER', 'FRAGMENT_SHADER'];

export const vertexShader = `
		attribute vec4 a_position;
		void main() { gl_Position = a_position; }
	`;

export function createProgramFromSources(
	gl: WebGLRenderingContext,
	shaderSources: string[],
	opt_attribs?: string[],
	opt_locations?: number[],
	opt_errorCallback?: CallableFunction
) {
	const shaders = [];
	for (let ii = 0; ii < shaderSources.length; ++ii) {
		shaders.push(loadShader(gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
	}
	return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

function loadShader(
	gl: WebGLRenderingContext,
	shaderSource: string,
	shaderType: number,
	opt_errorCallback: CallableFunction
) {
	const errFn = opt_errorCallback || error;
	// Create the shader object
	const shader = gl.createShader(shaderType) as WebGLShader;

	// Load the shader source
	gl.shaderSource(shader, shaderSource);

	// Compile the shader
	gl.compileShader(shader);

	// Check the compile status
	const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!compiled) {
		// Something went wrong during compilation; get the error
		const lastError = gl.getShaderInfoLog(shader);
		errFn("*** Error compiling shader '" + shader + "':" + lastError);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

export function bindQuadBuffer(gl: WebGLRenderingContext, positionAttributeLocation: number) {
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
		gl.STATIC_DRAW
	);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}

export function createProgram(
	gl: WebGLRenderingContext,
	shaders: WebGLShader[],
	opt_attribs: string[],
	opt_locations: number[] | null | undefined,
	opt_errorCallback: CallableFunction
) {
	const errFn = opt_errorCallback || error;
	const program = gl.createProgram() as WebGLProgram;
	shaders.forEach(function (shader) {
		gl.attachShader(program, shader);
	});
	if (opt_attribs) {
		opt_attribs.forEach(function (attrib, ndx) {
			gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib);
		});
	}
	gl.linkProgram(program);

	// Check the link status
	const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!linked) {
		// something went wrong with the link
		const lastError = gl.getProgramInfoLog(program);
		errFn('Error in program linking:' + lastError);

		gl.deleteProgram(program);
		return null;
	}
	return program;
}

function error(msg) {
	if (console) {
		if (console.error) {
			console.error(msg);
		} else if (console.log) {
			console.log(msg);
		}
	}
}
