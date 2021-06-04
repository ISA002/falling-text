/* eslint-disable */
import * as THREE from "three";
// import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fontSculpt from "../assets/fonts/splt.typeface.json";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import BlurMaterial from "./BlurMaterial";
import BackfaceMaterial from "./BackfaceMaterial";

import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";

export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.75;

    dom.appendChild(this.renderer.domElement);

    const aspect = this.width / this.height;

    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const cPosition = { x: -6, y: 3, z: 3 };

    this.camera.position.set(cPosition.x, cPosition.y, cPosition.z);
    this.camera.lookAt(cPosition.x, cPosition.y, cPosition.z);

    this.mouse = { x: 0, y: 0 };
    this.time = 0;

    this.clock = new THREE.Clock();

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
    this.aFbo = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    this.bFbo = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    console.log(this.aFbo);

    this.addObjects();
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
  };

  addObjects = () => {
    const fontsss = new THREE.Font(fontSculpt);
    const pi = Math.PI;

    // const API = {
    //   metalness: 1,
    //   roughness: 0.36,
    //   clearcoat: 0.34,
    //   clearcoatRoughness: 0.24,
    //   reflectivity: 0.5,
    //   // envMapIntensity: 1,
    //   opacity: 1,
    //   depthWrite: true,
    //   // ior: 1.5,
    //   transmission: 0,
    //   color: 0x202020,
    // };

    const API = {
      frostedGlass: 0.44,
    };

    const GEOMETRY_API = {
      bevelThickness: 0.1,
      bevelSize: 0.24,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    const LETTER_ROTATION = {
      _x: 5.7,
      _y: 3.1,
      _z: 5.62,
    };

    const LIGHT_POSITION = {
      x: 42,
      y: 10.3,
      z: 8.5,
    };

    const LIGHT_POSITION2 = {
      x: 100,
      y: 31.7,
      z: 31.7,
    };

    const geometry = new THREE.TextGeometry("T", {
      font: fontsss,
      size: 30,
      height: 6,
      curveSegments: 128,
      bevelEnabled: true,
      bevelThickness: GEOMETRY_API.bevelThickness,
      bevelSize: GEOMETRY_API.bevelSize,
      bevelOffset: GEOMETRY_API.bevelOffset,
      bevelSegments: GEOMETRY_API.bevelSegments,
    });

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: {
          type: "v2",
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        u_light1_position: {
          type: "v3",
          value: new THREE.Vector3(
            LIGHT_POSITION.x,
            LIGHT_POSITION.y,
            LIGHT_POSITION.z
          ),
        },
        u_light2_position: {
          type: "v3",
          value: new THREE.Vector3(
            LIGHT_POSITION2.x,
            LIGHT_POSITION2.y,
            LIGHT_POSITION2.z
          ),
        },
        alpha: { value: 0 },
        backfaceMap: { value: null },
        envMap: { value: null },
        frostedGlass: {
          type: "float",
          value: API.frostedGlass,
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      // depthTest: true,
      // side: THREE.CullFaceNone,
      // side: THREE.BackSide,
    });

    this.backfaceMaterial = new BackfaceMaterial();

    this.blurMaterial = new BlurMaterial({
      radius: 0.01,
      resolution: [window.innerWidth, window.innerHeight],
      direction: [0.0, 0.0],
      side: THREE.DoubleSide,
    });

    // const boxGeometry = new THREE.SphereGeometry(15, 32, 32);
    this.text = new THREE.Mesh(geometry, this.shaderMaterial);
    console.log(this.text);
    this.text.position.set(30, -2, -10);
    this.text.rotation.set(
      LETTER_ROTATION._x,
      LETTER_ROTATION._y,
      LETTER_ROTATION._z
    );
    this.scene.add(this.text);
    this.renderGui(
      this.text,
      API,
      GEOMETRY_API,
      LIGHT_POSITION,
      LIGHT_POSITION2,
      LETTER_ROTATION
    );

    this.addListeners();
    this.render();
  };

  renderGui = (
    mesh,
    API,
    GEOMETRY_API,
    LIGHT_POSITION,
    LIGHT_POSITION2,
    LETTER_ROTATION
  ) => {
    const gui = new GUI();
    gui.width = 300;
    gui.domElement.style.userSelect = "none";
    const fl = gui.addFolder("Settings");

    const apiArray = Object.keys(API);
    for (let i = 0; i < apiArray.length; i++) {
      fl.add(API, apiArray[i], 0, 1, 0.01)
        .name(apiArray[i])
        .onChange(function () {
          mesh.material.uniforms[apiArray[i]].value = API[apiArray[i]];
        });
    }

    const fl1 = gui.addFolder("light");

    const geometryApiArray = Object.keys(LIGHT_POSITION);
    for (let i = 0; i < geometryApiArray.length; i++) {
      fl1
        .add(LIGHT_POSITION, geometryApiArray[i], -100, 100)
        .name(geometryApiArray[i])
        .onChange(function () {
          mesh.material.uniforms.u_light1_position.value[geometryApiArray[i]] =
            LIGHT_POSITION[geometryApiArray[i]];
        });
    }

    const fl22 = gui.addFolder("light2");

    const array = Object.keys(LIGHT_POSITION2);
    for (let i = 0; i < array.length; i++) {
      fl22
        .add(LIGHT_POSITION, geometryApiArray[i], -100, 100)
        .name(geometryApiArray[i])
        .onChange(function () {
          mesh.material.uniforms.u_light2_position.value[geometryApiArray[i]] =
            LIGHT_POSITION[geometryApiArray[i]];
        });
    }

    const fl2 = gui.addFolder("letter rotate");

    const a = Object.keys(LETTER_ROTATION);
    for (let i = 0; i < a.length; i++) {
      fl2
        .add(LETTER_ROTATION, a[i], 0, 2 * Math.PI, 0.02)
        .name(a[i])
        .onChange(() => {
          mesh.rotation[a[i][1]] = LETTER_ROTATION[a[i]];
        });
    }

    fl1.open();
  };

  renderBlur = (deltaTime, mesh, blurMaterial, aFbo, bFbo, iterations = 14) => {
    const sinTime = Math.sin(deltaTime) * 0.5 + 0.5;

    for (let i = 0; i < iterations; i++) {
      const radius = (iterations - i - 1) * sinTime;
      const direction = i % 2 === 0 ? [radius, 0] : [0, radius];

      mesh.material = blurMaterial;
      mesh.material.uniforms.direction.value = direction;

      if (i % 2) {
        mesh.material.uniforms.envMap.value = aFbo.texture;
        this.renderer.setRenderTarget(bFbo);
      } else {
        mesh.material.uniforms.envMap.value = bFbo.texture;
        this.renderer.setRenderTarget(aFbo);
      }

      this.renderer.render(this.scene, this.camera);
    }
  };

  render = () => {
    this.time += 0.01;
    // console.log(this.clock.getDelta());
    if (this.text) {
      this.text.material = this.backfaceMaterial;
      this.renderer.setRenderTarget(this.bFbo);
      this.renderer.render(this.scene, this.camera);

      this.renderBlur(
        this.clock.getDelta(),
        this.text,
        this.blurMaterial,
        this.aFbo,
        this.bFbo
      );
      this.renderer.setRenderTarget(null);
      this.text.material = this.shaderMaterial;
      this.text.material.uniforms.backfaceMap.value = this.bFbo.texture;
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  };

  onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };
}
