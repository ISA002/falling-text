import * as THREE from "three";
// import gsap from 'gsap';
import fontSculpt from "../assets/fonts/splt.typeface.json";
import { DragControls } from "three/examples/jsm/controls/DragControls";
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

    this.textList = [
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
      "THREE",
      "REACT",
      "CANNON",
      "VISUAL",
      "JAVASCRIPT",
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
    this.wordsList = [];
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
    this.controls.addEventListener("dragstart", (event) => {
      this.draggingId = event.object.textId;
    });
    this.controls.addEventListener("drag", () => {
      this.updatePhisics();
      this.renderer.render(this.scene, this.camera);
    });
    this.controls.addEventListener("dragend", () => {
      this.draggingId = null;
    });
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
    // loader.load(JSON.stringify(fontsss), (font) => {

    this.groundMat = new C.Material();
    this.letterMat = new C.Material();

    const contactMaterial = new C.ContactMaterial(
      this.groundMat,
      this.letterMat,
      {
        friction: 0.01,
      }
    );

    this.world.addContactMaterial(contactMaterial);

    const color = 0xffffff;

    this.wordsGroup = new THREE.Group();
    this.wordsGroup.ground = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(100, 50, 20)),
      position: new C.Vec3(10, -65, -10),
      material: this.groundMat,
    });

    this.wordsGroup.wallLeft = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(10, 100, 20)),
      position: new C.Vec3(-35, -59, -10),
      material: this.groundMat,
    });

    this.wordsGroup.wallRight = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(10, 100, 20)),
      position: new C.Vec3(35, -59, -10),
      material: this.groundMat,
    });

    this.world.addBody(this.wordsGroup.ground);
    this.world.addBody(this.wordsGroup.wallLeft);
    this.world.addBody(this.wordsGroup.wallRight);

    for (let i = 0; i < this.textList.length; i++) {
      this.addNewWord(
        this.textList[i],
        color,
        { x: -4 + (-1) ** i * 5, y: 6 * i },
        this.letterMat,
        0
      );
    }

    this.words.push(this.wordsGroup);
    this.controls = new DragControls(
      this.wordsList,
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.wordsGroup);
    this.addListeners();
  };

  render = () => {
    this.world.step(1 / 60);
    this.updatePhisics();

    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  getCenterPoint = (mesh) => {
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);
    return center;
  };

  updatePhisics = () => {
    if (!this.words) return;
    this.words[0].children.forEach((word) => {
      if (word.id !== this.draggingId) {
        const wordCenter = this.getCenterPoint(word);
        word.body.position.set(word.body.position.x, word.body.position.y, 0);
        word.body.quaternion.x = 0;
        word.body.quaternion.y = 0;
        word.position.copy(word.body.position);
        word.quaternion.copy(word.body.quaternion);
        word.dragPlane.position.x = wordCenter.x;
        word.dragPlane.position.y = wordCenter.y;
        word.dragPlane.quaternion.copy(word.quaternion);
      } else {
        word.position.copy(word.dragPlane.position);
        word.body.position.copy(word.position);
        word.body.quaternion.copy(word.quaternion);
        word.position.z = 0;
      }
    });
  };

  addNewWord = (message, color, position, letterMat, planeOpacity) => {
    const fontsss = new THREE.Font(fontSculpt);

    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.TextGeometry(message, {
      font: fontsss,
      size: 2,
      height: 10,
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

    text.position.set(position.x, position.y, 0);
    text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

    const box = new C.Box(new C.Vec3().copy(text.size).scale(0.5));

    text.body = new C.Body({
      mass: 100,
      position: new C.Vec3(position.x, position.y, 0),
      material: letterMat,
    });

    const { center } = text.geometry.boundingSphere;
    text.body.addShape(box, new C.Vec3(center.x, center.y, center.z));

    const planeGeometry = new THREE.PlaneGeometry(
      text.size.x + 1,
      text.size.y + 1,
      32
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: planeOpacity,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    text.dragPlane = plane;
    text.dragPlane.textId = text.id;

    this.wordsList.push(text.dragPlane);
    this.scene.add(plane);

    this.wordsGroup.add(text);
    this.world.addBody(text.body);
  };

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
    // const color = 0x9910ff;
    // const message = this.textList[
    //   Math.round(Math.random() * (this.textList.length - 1))
    // ];
    // this.addNewWord(
    //   message,
    //   color,
    //   { x: this.mouse.x * 30, y: this.mouse.y * 15 },
    //   this.letterMat,
    //   0.1
    // );
  };
}
