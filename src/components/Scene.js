/* eslint-disable */
import * as THREE from "three";
// import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fontSculpt from "../assets/fonts/splt.typeface.json";
import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";
import txr from "../assets/images/bg.png";
import nx from "../assets/images/rainbow/high/nx.png";
import ny from "../assets/images/rainbow/high/ny.png";
import nz from "../assets/images/rainbow/high/nz.png";
import px from "../assets/images/rainbow/high/px.png";
import py from "../assets/images/rainbow/high/py.png";
import pz from "../assets/images/rainbow/high/pz.png";
import rainbowHdr from "../assets/images/rainbow/untitled9.hdr";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { LightProbeGenerator } from "three/examples/jsm/lights/LightProbeGenerator.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.toneMapping = THREE.NoToneMapping;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // textureEquirec.mapping = EquirectangularReflectionMapping;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.75;

    dom.appendChild(this.renderer.domElement);

    const aspect = this.width / this.height;

    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const intensity = 1;
    const light = new THREE.AmbientLight(0xffffff, intensity);
    this.scene.add(light);

    // const lightt = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    // this.scene.add(lightt);

    const cPosition = { x: 5.1, y: 4, z: 1 };

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(5, 5, 5);
    // this.scene.add(directionalLight);

    // const lightProbe = new THREE.LightProbe();
    // this.scene.add(lightProbe);

    this.camera.position.set(cPosition.x, cPosition.y, cPosition.z);
    this.camera.lookAt(cPosition.x, cPosition.y, cPosition.z);

    this.mouse = { x: 0, y: 0 };
    this.startLoader();
  }

  addListeners = () => {
    this.dom.addEventListener("mousemove", this.mouseEvent);
    window.addEventListener("resize", this.onResize);
  };

  mouseEvent = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  startLoader = () => {
    this.addObjects();
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
  };

  addObjects = () => {
    const fontsss = new THREE.Font(fontSculpt);

    const geometry = new THREE.TextGeometry("orange", {
      font: fontsss,
      size: 6,
      height: 1,
      curveSegments: 128,
      bevelEnabled: false,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10,
    });

    const API = {
      metalness: 0.62,
      roughness: 0,
      clearcoat: 0.34,
      clearcoatRoughness: 0.24,
      reflectivity: 0.5,
      envMapIntensity: 1,
      opacity: 1,
      depthWrite: true,
      ior: 1.5,
      transmission: 0,
      color: 0x1b1b0e,
    };

    let rgbeLoader = new RGBELoader();
    rgbeLoader.setDataType(THREE.UnsignedByteType);
    new Promise((resolve) => {
      rgbeLoader.load(rainbowHdr, (texture) => {
        let pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        // texture.encoding = THREE.sRGBEncoding;
        // texture.mapping = THREE.EquirectangularReflectionMapping;
        let envMap = pmremGenerator.fromEquirectangular(texture).texture;
        pmremGenerator.dispose();

        // this.scene.background = envMap
        const material = new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          color: API.color,
          emissive: 0x000000,
          // sheen: 0x000000,
          metalness: API.metalness,
          roughness: API.roughness,
          clearcoat: API.clearcoat,
          clearcoatRoughness: API.clearcoatRoughness,
          envMap: envMap,
          reflectivity: API.reflectivity,
          envMapIntensity: API.envMapIntensity,
          transparent: true,
          opacity: API.opacity,
          depthWrite: API.depthWrite,
          ior: API.ior,
          transmission: API.transmission,
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = 'varying vec3 normalInterp;\n' + 'varying vec3 pos;\n' + shader.vertexShader
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <begin_vertex>",
            [
              "#include <begin_vertex>",
              "vec4 pos4 = modelViewMatrix * vec4(position, 1.0);",
              "normalInterp = normalMatrix * normal;",
              "pos = vec3(pos4) / pos4.w;",
            ].join("\n")
          );

          shader.fragmentShader = 'varying vec3 pos;\n' + 'varying vec3 normalInterp;\n' + 'uniform float bFlat;\n' + shader.fragmentShader
          shader.fragmentShader = shader.fragmentShader.replace(
            "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
            [
              "vec4 color = vec4(outgoingLight, diffuseColor.a);",
              "vec3 n = mix(normalize(normalInterp), normalize(cross(dFdx(pos), dFdy(pos))), bFlat);",
              "vec3 lightDir = normalize(vec3(200, 60, 100) - pos);",
              "float lambertian = max(dot(lightDir, n), 0.0); float specular = 0.0;",
              "if(lambertian > 0.0) { vec3 viewDir = normalize(-pos); vec3 halfDir = normalize(lightDir + viewDir); float specAngle = max(dot(halfDir, n), 0.0); specular = pow(specAngle, 16.0); }",
              "vec4 ccc = vec4(vec3(0.2, 0.0, 0.0) + lambertian * vec3(0.5, 0.0, 0.0) + specular * outgoingLight, diffuseColor.a);",
              "gl_FragColor = color;",
            ].join("\n")
          );
          // console.log(shader.vertexShader);
          // console.log(shader.fragmentShader);
          material.userData.shader = shader;
        };

        material.customProgramCacheKey = () => {
          return 2;
        };

        const letter = new THREE.Mesh(geometry, material);

        const sphereGeom = new THREE.BoxGeometry(3, 3, 3);
        const sphereMat = new THREE.MeshBasicMaterial({ color: "red" });
        const sphere = new THREE.Mesh(sphereGeom, material);
        sphere.position.set(8, 7, -4);
        this.scene.add(sphere);

        // letter.receiveShadow = true;
        letter.position.set(0, 0, 0);
        letter.rotation.set(-0.7, 0, 0);
        this.scene.add(letter);
        this.renderGui(letter, API);

        resolve(envMap);
      });
    });

    // const lightProbe = new THREE.LightProbe();
    // this.scene.add(lightProbe);

    // new THREE.CubeTextureLoader().load(
    //   [px, nx, py, ny, pz, nz],
    //   (cubeTexture) => {
    //     // cubeTexture.encoding = THREE.sRGBEncoding;
    //     lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));
    //     // this.scene.background = cubeTexture;

    //     // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    //     // this.sphereCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
    //     // console.log(this.sphereCamera);
    //     // this.sphereCamera.rotation.set(-0.7, 0, 0);
    //     // this.scene.add(this.sphereCamera);

    //     const material = new THREE.MeshPhysicalMaterial({
    //       side: THREE.DoubleSide,
    //       // color: 0x332914,
    //       color: 0xffffff,
    //       emissive: 0x000000,
    //       metalness: API.metalness,
    //       roughness: API.roughness,
    //       clearcoat: API.clearcoat,
    //       clearcoatRoughness: API.clearcoatRoughness,
    //       envMap: cubeTexture,
    //       reflectivity: API.reflectivity,
    //       envMapIntensity: API.envMapIntensity,
    //       transparent: true,
    //       opacity: API.opacity,
    //       depthWrite: API.depthWrite,
    //       ior: API.ior,
    //       transmission: API.transmission,
    //     });

    //     material.onBeforeCompile = (shader) => {
    //       shader.fragmentShader = shader.fragmentShader.replace(
    //         "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
    //         [
    //           "vec4 color = vec4(outgoingLight, diffuseColor.a);",
    //           // "if (color.r > 0.6 && color.r < 0.7) color *= 10.;",

    //           "gl_FragColor = color;",
    //         ].join("\n")
    //       );
    //       material.userData.shader = shader;
    //     };

    //     material.customProgramCacheKey = () => {
    //       return 2;
    //     };

    //     const letter = new THREE.Mesh(geometry, material);
    //     letter.position.set(0, 0, 0);
    //     letter.rotation.set(-0.7, 0, 0);
    //     this.scene.add(letter);
    //     this.renderGui(letter, API);
    //   }
    // );

    this.addListeners();
    this.render();
  };

  renderGui = (mesh, API) => {
    const gui = new GUI();
    gui.width = 300;
    gui.domElement.style.userSelect = "none";
    const fl = gui.addFolder("Settings");

    const apiArray = Object.keys(API);
    for (let i = 0; i < apiArray.length; i++) {
      if (apiArray[i] === "depthWrite") {
        fl.add(API, apiArray[i], 0, 1)
          .name(apiArray[i])
          .onChange(function () {
            mesh.material[apiArray[i]] = API[apiArray[i]];
          });
      } else if (apiArray[i] === "ior") {
        fl.add(API, apiArray[i], 1.0, 2.3, 0.02)
          .name(apiArray[i])
          .onChange(function () {
            mesh.material[apiArray[i]] = API[apiArray[i]];
          });
      } else if (apiArray[i] === "color") {
        fl.addColor(API, "color")
          .name(apiArray[i])
          .onChange(function () {
            mesh.material.color.set(API.color);
          });
      } else {
        fl.add(API, apiArray[i], 0, 1, 0.02)
          .name(apiArray[i])
          .onChange(function () {
            mesh.material[apiArray[i]] = API[apiArray[i]];
          });
      }
    }

    fl.open();
  };

  render = () => {
    requestAnimationFrame(this.render);
    // if (this.sphereCamera) this.sphereCamera.update(this.renderer, this.scene);
    this.renderer.render(this.scene, this.camera);
  };

  onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };
}
