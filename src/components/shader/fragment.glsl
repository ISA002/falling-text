#ifdef GL_ES
precision mediump float;
#endif

// uniform samplerCube envMap;
uniform sampler2D backfaceMap;
uniform vec2 u_resolution;
uniform float frostedGlass;

varying vec3 worldNormal;
varying vec3 viewDirection;

varying vec3 l;
varying vec3 v;
varying vec3 n;

varying vec3 l1;

float fresnelFunc(vec3 viewDirection, vec3 normal) {
  return pow(1.0 + dot(viewDirection, normal), 5.0);
}

float ior = 1.500;
float a = 0.66;

void main (void)
{
  const vec4  diffColor = vec4 ( 0, 0, 0, 1.0 );
  const vec4  diffColor1 = vec4(0.45, 0.49, 0.77, 1.);
  const vec4  specColor = vec4 ( 1., 1., 1.0, 1.0 );
  const float specPower = 30.0;
  const float specPower1 = 60.0;

  vec3 n2   = normalize ( n );
  vec3 l2   = normalize ( l );
  vec3 l22 = normalize ( l1 );
  vec3 v2   = normalize ( v );
  vec3 r    = reflect ( -v2, n2 );

  vec4 diff = diffColor * max ( dot ( n2, l2 ), 0.0 );
  vec4 spec = specColor * pow ( max ( dot ( l2, r ), 0.0 ), specPower1 );
  vec4 spec1 = diffColor1 * pow ( max ( dot ( l22, r ), 0.0 ), specPower );


  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 backfaceNormal = texture2D(backfaceMap, uv).rgb;
  vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;
  // vec3 refracted = refract(viewDirection, normal, 1.0 / ior);

  // ** //
  // vec3 reflectColor = textureCube(envMap, normal).xyz;

  vec4 rr = diff + spec + spec1;
  // ** //
  float fresnel = fresnelFunc(viewDirection, normal);
  // vec4 refractColor = rr * max ( dot ( normal, worldNormal), 0.0 );
  // float fresnel = 0.5;
  vec4 result = mix(rr, vec4(frostedGlass), fresnel);
  // vec3 result = mix(rr, vec4(1.0), fresnel);

  gl_FragColor = vec4(result.x, result.y, result.z, 1.);
}