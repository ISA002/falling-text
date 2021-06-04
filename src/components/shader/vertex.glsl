varying vec2 vUv;
varying vec3 l;
varying vec3 v;
varying vec3 n;

varying vec3 l1;

uniform vec3 u_light1_position;
uniform vec3 u_light2_position;

varying vec3 worldNormal;
varying vec3 viewDirection;

// uniform vec4 lightPos;
// uniform vec4 eyePos;
// vec4 lightPos = vec4(0., 10., 0., 2.);
// vec4 lightPos1 = vec4(10., 50., 0., 10.);

void main(void)
{
    vec4 worldPosition = modelMatrix * vec4( position, 1.0);
    worldNormal = normalize(modelViewMatrix * vec4(normal, 0.0)).xyz;
    viewDirection = normalize(worldPosition.xyz - cameraPosition);

    vec3 p = vec3 ( modelViewMatrix * modelViewMatrix * vec4(position, 1.) );

    l = normalize ( vec3 ( u_light1_position ) - p );
    v = normalize ( vec3 ( cameraPosition ) - p );          
    n = normalize ( normalMatrix * normal );

    l1 = normalize ( vec3 ( u_light2_position ) - p );         

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
