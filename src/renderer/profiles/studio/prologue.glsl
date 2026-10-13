/* UBER BULB V3.0 -- WebGL port of supplied Octane OSL formula.
 * Original formula Copyright (c) 2020 Machina-Infinitum.
 * Core iteration order, bailout, orbit trap and history updates are preserved.
 * Additional lighting is a procedural studio approximation, not an Octane renderer.
 */
precision highp float;
uniform vec2 resolution;
uniform float detailResolution; // Keep the chosen geometric and normal precision sharp.
uniform float mappingResolution; // Screen-space material coordinates keep the selected full size.
uniform vec4 camera;
uniform vec4 A,B,C,D,E,F,G,H,I,J;
uniform vec4 M,L,N,T;
uniform vec4 K0,K1,K2,K3,MG;
uniform int quality;
const float PI=3.141592653589793;
