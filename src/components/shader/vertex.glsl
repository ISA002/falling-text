varying vec2 vUv;
varying vec3 Normal;
varying vec3 EyeDir;

void main() {
  vUv = uv;
  Normal = normalMatrix * normal;
  EyeDir = vec3(modelViewMatrix * vec4(position, 1.));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}