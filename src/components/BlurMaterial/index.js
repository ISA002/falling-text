import { ShaderMaterial, FrontSide } from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class BlurMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      extensions: {
        derivatives: "#extension GL_OES_standart_derivatives: enable",
      },
      vertexShader,
      fragmentShader,
      // side: FrontSide,
      // depthTest: false,
    });

    this.uniforms = {
      envMap: { value: options.envMap },
      resolution: { value: options.resolution },
      direction: { value: options.direction },
      time: { value: options.time },
    };
  }
}
