#version 100
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_xscrollPerc;
uniform float u_yscrollPerc;

// Nothing really fancy here:  
// It's a port of https://www.shadertoy.com/view/ctGSDh, which itself is a fork of https://www.shadertoy.com/view/MdsXDM

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 pos = (uv.xy - 0.5);
    vec2 cir = ((pos.xy + pos.xy + sin(uv.x * 16.0 + u_time) / (16.0-u_mouse.x)*u_mouse*1.0 * sin(uv.y * 7.0 + u_time * 1.) / 1.0) + uv.x * sin(u_time) / (1.5-u_mouse.y)*16.0 + uv.y * sin(u_time * 8.0) / 64.0);
    float circles = (sqrt(abs(cir.x + cir.y * 1.5) * 5.0) * 16.0);
    
    vec3 color = 1.0 - vec3(sin(circles * 0.25 + 2.0), abs(sin(circles * 1.25 - 16.0) - sin(circles)), abs(sin(circles) * 1.0));
    
    gl_FragColor = vec4(color, 1.0);
}