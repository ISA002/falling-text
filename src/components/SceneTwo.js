/* eslint-disable */
import * as THREE from "three";
// import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fontSculpt from "../assets/fonts/splt.typeface.json";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

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
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0x000000, 1);
    // this.renderer.toneMapping = THREE.NoToneMapping;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // textureEquirec.mapping = EquirectangularReflectionMapping;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.75;

    dom.appendChild(this.renderer.domElement);

    const aspect = this.width / this.height;

    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // const intensity = 1;
    // const light = new THREE.AmbientLight(0xffffff, intensity);
    // this.scene.add(light);

    // const lightt = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    // this.scene.add(lightt);

    const cPosition = { x: 16, y: 4, z: 4 };

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(5, 5, 5);
    // this.scene.add(directionalLight);

    // const pointLight = new THREE.PointLight(0x000000, 1, 100);
    // pointLight.position.set(5, 5, 5);
    // this.scene.add(pointLight);

    // const sphereSize = 1;
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    // this.scene.add(pointLightHelper);

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
    const pi = Math.PI;

    const API = {
      metalness: 1,
      roughness: 0.14,
      clearcoat: 0.34,
      clearcoatRoughness: 0.24,
      reflectivity: 0.5,
      // envMapIntensity: 1,
      opacity: 1,
      depthWrite: true,
      // ior: 1.5,
      transmission: 0,
      color: 0x0e0f11,
    };

    const GEOMETRY_API = {
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    const LIGHT_POSITION = {
      x: 5,
      y: 5,
      z: 5,
      _x: 0,
      _y: 0,
      _z: 0,
      color: 0x485270,
    };

    const geometry = new THREE.TextGeometry("T", {
      font: fontsss,
      size: 10,
      height: 3,
      curveSegments: 128,
      bevelEnabled: true,
      bevelThickness: GEOMETRY_API.bevelThickness,
      bevelSize: GEOMETRY_API.bevelSize,
      bevelOffset: GEOMETRY_API.bevelOffset,
      bevelSegments: GEOMETRY_API.bevelSegments,
    });

    RectAreaLightUniformsLib.init();

    const rectLight1 = new THREE.RectAreaLight(LIGHT_POSITION.color, 5, 30, 30);
    rectLight1.position.set(
      LIGHT_POSITION.x,
      LIGHT_POSITION.y,
      LIGHT_POSITION.z
    );

    const rectLight2 = new THREE.RectAreaLight(0x223263, 5, 30, 30);
    rectLight2.position.set(
      LIGHT_POSITION.x,
      LIGHT_POSITION.y,
      LIGHT_POSITION.z - 90
    );
    rectLight1.rotation.set(
      LIGHT_POSITION._x,
      LIGHT_POSITION._y,
      LIGHT_POSITION._z
    );
    rectLight2.rotateY(pi);
    this.scene.add(rectLight1);
    this.scene.add(rectLight2);

    this.scene.add(new RectAreaLightHelper(rectLight1));
    this.scene.add(new RectAreaLightHelper(rectLight2));

    // const colors = [new THREE.Color(0xffffff), new THREE.Color(0xff0000)];

    // const gradientMap = new THREE.DataTexture(
    //   colors,
    //   colors.length,
    //   100,
    //   THREE.LuminanceFormat
    // );
    // gradientMap.minFilter = THREE.NearestFilter;
    // gradientMap.magFilter = THREE.NearestFilter;
    // gradientMap.generateMipmaps = false;

    // this.scene.background = envMap
    const material = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      color: API.color,
      // gradientMap: gradientMap
      // emissive: 0x000000,
      // sheen: 0x000000,
      metalness: API.metalness,
      roughness: API.roughness,
      clearcoat: API.clearcoat,
      clearcoatRoughness: API.clearcoatRoughness,
      reflectivity: API.reflectivity,
      // envMapIntensity: API.envMapIntensity,
      transparent: true,
      opacity: API.opacity,
      depthWrite: API.depthWrite,
      // ior: API.ior,
      transmission: API.transmission,
    });

    const letter = new THREE.Mesh(geometry, material);

    letter.position.set(0, 0, 0);
    letter.rotation.set(0, 0, 0);
    this.scene.add(letter);
    this.renderGui(letter, rectLight1, API, GEOMETRY_API, LIGHT_POSITION);

    this.addListeners();
    this.render();
  };

  renderGui = (mesh, light, API, GEOMETRY_API, LIGHT_POSITION) => {
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

    const fl1 = gui.addFolder("light");

    const geometryApiArray = Object.keys(LIGHT_POSITION);
    for (let i = 0; i < geometryApiArray.length; i++) {
      if (geometryApiArray[i] === "color") {
        fl1
          .addColor(API, "color")
          .name(geometryApiArray[i])
          .onChange(function () {
            light.color.set(LIGHT_POSITION.color);
          });
      } else {
        if (geometryApiArray[i][0] === '_') {
          fl1
          .add(LIGHT_POSITION, geometryApiArray[i], 0, 2 * Math.PI, 0.02)
          .name(geometryApiArray[i])
          .onChange(() => {
            console.log(LIGHT_POSITION[geometryApiArray[i][1]]);
            light.rotation[geometryApiArray[i][1]] =
              LIGHT_POSITION[geometryApiArray[i]];
          });
        } else {
          fl1
          .add(LIGHT_POSITION, geometryApiArray[i], -50, 50)
          .name(geometryApiArray[i])
          .onChange(function () {
            light.position[geometryApiArray[i]] =
              LIGHT_POSITION[geometryApiArray[i]];
          }); 
        }
      }
    }

    fl1.open();
  };

  render = () => {
    requestAnimationFrame(this.render);
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
