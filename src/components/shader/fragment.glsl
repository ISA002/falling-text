#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
// uniform vec2 u_resolution;
// uniform sampler2D u_txr;
uniform samplerCube u_cubeMap;

varying vec3 Normal;
varying vec3 EyeDir;

// vec3 rgb2hsb( in vec3 c ){
//     vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
//     vec4 p = mix(vec4(c.bg, K.wz),
//                  vec4(c.gb, K.xy),
//                  step(c.b, c.g));
//     vec4 q = mix(vec4(p.xyw, c.r),
//                  vec4(c.r, p.yzx),
//                  step(p.x, c.r));
//     float d = q.x - min(q.w, q.y);
//     float e = 1.0e-10;
//     return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
//                 d / (q.x + e),
//                 q.x);
// }

// vec3 hsb2rgb( in vec3 c ){
//     vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
//                              6.0)-3.0)-1.0,
//                      0.0,
//                      1.0 );
//     rgb = rgb*rgb*(3.0-2.0*rgb);
//     return c.z * mix(vec3(1.0), rgb, c.y);
// }

// float plot(vec2 st, float pct) {
//   return smoothstep( pct-0.01, pct, st.y) - smoothstep( pct, pct+0.01, st.y);
// }

// vec2 cubema(in vec3 t3) {
//   vec2 t2;
//   t3 = normalize(t3) / sqrt(2.0);
//   vec3 q3=abs(t3);
//   if ((q3.x>=q3.y)&&(q3.x>=q3.z)) {
//     t2.x=0.5-t3.z/t3.x;
//     t2.y=0.5-t3.y/q3.x;
//   }
//   else if ((q3.y>=q3.x)&&(q3.y>=q3.z)) {
//     t2.x=0.5+t3.x/q3.y;
//     t2.y=0.5+t3.z/t3.y;
//   }
//   else {
//     t2.x=0.5+t3.x/t3.z;
//     t2.y=0.5-t3.y/q3.z;
//   }
//   return t2;
// }

void main(void) {
  // vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  // vec3 color = hsb2rgb(vec3(vUv.y, 1., 1.));
  // vec3 co = mix(color, vec3(1., 0., 0.), vec3(vUv.x, vUv.y, vUv.x));

  // co = mix(co,vec3(1.0,0.0,0.0),plot(vUv, vUv.x));
  // co = mix(co,vec3(0.0,1.0,0.0),plot(vUv,vUv.x));
  // co = mix(co,vec3(0.0,0.0,1.0),plot(vUv,vUv.x));

  // vec3 c = mix(color, vec3(0., 1., 0.), plot(vUv, vUv.x));

  // vec3 reflectedDirection = normalize(reflect(EyeDir, normalize(Normal)));
  // reflectedDirection.y = -reflectedDirection.y;
  // vec2 cub = cubema(u_txr);
  // vec4 p = texture2D(u_txr, cub);
  // vec4 fragColor = textureCube(u_cubeMap, reflectedDirection);

  if (vUv.y < 0.6 && vUv.y > -0.6) {
    gl_FragColor = vec4(0.38, 0.37, 0.44, 1);
  } else {
    gl_FragColor = vec4(0.61, 0.62, 0.61, 1);
  }
}