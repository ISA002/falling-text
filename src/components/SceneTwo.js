/* eslint-disable */
import * as THREE from "three";
// import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fontSculpt from "../assets/fonts/splt.typeface.json";
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
    this.renderer.setClearColor(0x111111, 1);
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

    const pointLight = new THREE.PointLight(0x000000, 1, 100);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.scene.add(pointLightHelper);

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
      // metalness: 0.62,
      // roughness: 0,
      // clearcoat: 0.34,
      // clearcoatRoughness: 0.24,
      // reflectivity: 0.5,
      // envMapIntensity: 1,
      // opacity: 1,
      // depthWrite: true,
      // ior: 1.5,
      // transmission: 0,
      color: 0xffffff,
    };

    const gradientMap = new THREE.DataTexture( colors, colors.length, 1, THREE.LuminanceFormat );
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    // this.scene.background = envMap
    const material = new THREE.MeshToonMaterial({
      side: THREE.DoubleSide,
      color: API.color,
      gradientMap: gradientMap
      // emissive: 0x000000,
      // sheen: 0x000000,
      // metalness: API.metalness,
      // roughness: API.roughness,
      // clearcoat: API.clearcoat,
      // clearcoatRoughness: API.clearcoatRoughness,
      // reflectivity: API.reflectivity,
      // envMapIntensity: API.envMapIntensity,
      // transparent: true,
      // opacity: API.opacity,
      // depthWrite: API.depthWrite,
      // ior: API.ior,
      // transmission: API.transmission,
    });

    const letter = new THREE.Mesh(geometry, material);

    letter.position.set(0, 0, 0);
    letter.rotation.set(-0.7, 0, 0);
    this.scene.add(letter);
    this.renderGui(letter, API);

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
