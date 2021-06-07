import { ShaderMaterial, DoubleSide, BackSide, FrontSide } from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class BackfaceMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      extensions: {
        derivatives: "#extension GL_OES_standart_derivatives: enable",
      },
      vertexShader,
      fragmentShader,
      side: BackSide,
      // transparent: true,
      // depthTest: false,
      // depthWrite: false,
      // alpha: 0.5,
      // opacity: 0.5,
    });
  }
}
