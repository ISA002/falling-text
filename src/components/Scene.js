import * as THREE from "three";
// import gsap from 'gsap';
import fontSculpt from "../assets/fonts/sculpture.typeface.json";
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import C from "cannon";

const distance = 15;
// const totalMass = 1;

export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x111111, 1);
    dom.appendChild(this.renderer.domElement);

    this.textList = ["VISUAL", "JAVASCRIPT",
    //  "THREE", "REACT", "CANNON", "VISUAL", "JAVASCRIPT",
    //   "THREE", "REACT", "CANNON", "VISUAL", "JAVASCRIPT", "THREE", "REACT", "CANNON", "VISUAL",
    //   "JAVASCRIPT", "VISUAL", "JAVASCRIPT", "THREE", "REACT", "CANNON", "VISUAL", "JAVASCRIPT", "THREE",
    //   "REACT", "CANNON", "VISUAL", "JAVASCRIPT", "THREE", "REACT", "CANNON", "VISUAL", "JAVASCRIPT",
    ];

    const aspect = this.width / this.height;

    this.camera = new THREE.OrthographicCamera(
      -distance * aspect,
      distance * aspect,
      distance,
      -distance,
      -10,
      100
    );

    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(new THREE.Vector3());
    // this.time = 0;

    this.mouse = { x: 0, y: 0 };

    this.words = [];
    this.dragging = false;
    this.draggingId = null;

    this.world = new C.World();
    this.world.gravity.set(0, -20, 0);

    this.addObjects();
    this.render();
  }

  addListeners = () => {
    this.dom.addEventListener("mousemove", this.mouseEvent);
    this.dom.addEventListener("click", this.handleClick);
    window.addEventListener("resize", this.onResize);
  };

  mouseEvent = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
    this.dom.removeEventListener("click", this.handleClick);
  };

  addObjects = () => {
    // const loader = new THREE.FontLoader();
    const fontsss = new THREE.Font(fontSculpt);
    // loader.load(JSON.stringify(fontsss), (font) => {

    const groundMat = new C.Material();
    const letterMat = new C.Material();

    const contactMaterial = new C.ContactMaterial(groundMat, letterMat, {
      friction: 0.01,
    });

    this.world.addContactMaterial(contactMaterial);

    const color = 0xffffff;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    this.wordsGroup = new THREE.Group();
    this.wordsGroup.ground = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(100, 50, 20)),
      position: new C.Vec3(10, -65, -10),
      material: groundMat,
    });

    this.wordsGroup.wallLeft = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(10, 100, 20)),
      position: new C.Vec3(-35, -59, -10),
      material: groundMat,
    });

    this.wordsGroup.wallRight = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(10, 100, 20)),
      position: new C.Vec3(35, -59, -10),
      material: groundMat,
    });

    this.world.addBody(this.wordsGroup.ground);
    this.world.addBody(this.wordsGroup.wallLeft);
    this.world.addBody(this.wordsGroup.wallRight);

    for (let i = 0; i < this.textList.length; i++) {
      const VISUAL = this.textList[i];

      const geometry = new THREE.TextGeometry(VISUAL, {
        font: fontsss,
        size: 2,
        height: 100000,
        curveSegments: 24,
        bevelEnabled: false,
        bevelThickness: 0.9,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 10,
      });

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const text = new THREE.Mesh(geometry, matLite);

      text.position.set(0, 0, 0);
      text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

      const box = new C.Box(new C.Vec3().copy(text.size).scale(0.6));

      text.body = new C.Body({
        mass: 100,
        position: new C.Vec3(-4 + (-1) ** i * 5, 6 * i, 0),
        material: letterMat,
      });

      const { center } = text.geometry.boundingSphere;
      text.body.addShape(box, new C.Vec3(center.x, center.y, center.z));

      this.wordsGroup.add(text);
      this.world.addBody(text.body);
    }

    this.words.push(this.wordsGroup);
    this.controls = new DragControls(this.words, this.camera, this.renderer.domElement);
    this.scene.add(this.wordsGroup);
    this.scene.add(this.controls);
    this.addListeners();
    // });
  };

  render = () => {
    this.updatePhisics();
    this.world.step(1 / 60);

    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  updatePhisics = () => {
    if (!this.words) return;

    this.words[0].children.forEach((word) => {
      if (word.id === this.draggingId) return;
      word.position.copy(word.body.position);
      word.quaternion.copy(word.body.quaternion);
      word.position.z = 0;
      word.rotation._z = 0;
      word.rotation._y = 0;
      word.rotation._x = 0;
    });
  };

  addNewWord = () => {
    const fontsss = new THREE.Font(fontSculpt);
    const letterMat = new C.Material();

    const color = 0x9910ff;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const VISUAL = this.textList[0];

    const geometry = new THREE.TextGeometry(VISUAL, {
      font: fontsss,
      size: 2,
      height: 50000,
      curveSegments: 24,
      bevelEnabled: false,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10,
    });

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const text = new THREE.Mesh(geometry, matLite);

    text.position.set(this.mouse.x * 30, this.mouse.y * 15, 0);
    text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

    const box = new C.Box(new C.Vec3().copy(text.size).scale(0.6));

    text.body = new C.Body({
      mass: 100,
      position: new C.Vec3(this.mouse.x * 30, this.mouse.y * 15, 0),
      material: letterMat,
    });

    const { center } = text.geometry.boundingSphere;
    text.body.addShape(box, new C.Vec3(center.x, center.y, center.z));
    text.addEventListener('drag', this.handleDrag)

    this.wordsGroup.add(text);
    this.world.addBody(text.body);
  }

  onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.top = distance;
    this.camera.right = distance * this.camera.aspect;
    this.camera.bottom = -distance;
    this.camera.left = -distance * this.camera.aspect;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  handleClick = () => {
    if (!this.dragging) {
      const value = this.textList.pop();
      this.textList.unshift(value);
      this.words[0].children.pop();
      this.world.bodies.pop();
      this.addNewWord();
    }
  };
}
