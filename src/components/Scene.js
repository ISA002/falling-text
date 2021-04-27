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
      // "VISUAL",
      // "JAVASCRIPT",
      // "THREE",
      // "REACT",
      // "CANNON",
      // "VISUAL",
      // "JAVASCRIPT",
      // "VISUAL",
      // "JAVASCRIPT",
      // "THREE",
      // "REACT",
      // "CANNON",
      // "VISUAL",
      // "JAVASCRIPT",
      // "THREE",
      // "REACT",
      // "CANNON",
      // "VISUAL",
      // "JAVASCRIPT",
      // "THREE",
      // "REACT",
      // "CANNON",
      // "VISUAL",
      // "JAVASCRIPT",
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
    this.planeOpacity = 0;
    this.dragGroup = null;
    this.dragEnd = false;
    this.lastDraggingPossition = null;

    this.world = new C.World();
    this.world.gravity.set(0, -20, 0);

    this.raycaster = new THREE.Raycaster();

    this.addObjects();
    this.render();
  }

  addListeners = () => {
    this.dom.addEventListener("mousemove", this.mouseEvent);
    window.addEventListener("resize", this.onResize);
    this.controls.addEventListener("dragstart", (event) => {
      this.draggingId = event.object.parentId;
      this.dragGroup = this.wordsList.find((gr) => gr.id === this.draggingId);
    });
    this.controls.addEventListener("drag", () => {
      this.updatePhisics();
      this.renderer.render(this.scene, this.camera);
    });
    this.controls.addEventListener("dragend", () => {
      this.dragGroup = null;
      this.dragEnd = true;
    });
    this.dom.addEventListener("click", this.handleClick);
    this.controls.activate();
  };

  mouseEvent = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
    this.dom.removeEventListener("click", this.handleClick);
    this.controls.deactivate();
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
        this.planeOpacity
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
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.updatePhisics();

    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  getCenterPoint = (mesh) => {
    const geometry = mesh.geometry;
    let center = new THREE.Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);
    return center;
  };

  updatePhisics = () => {
    if (!this.words) return;
    this.words[0].children.forEach((group) => {
      const word = group.children[1];
      const plane = group.children[0];
      if (this.dragEnd && group.id === this.draggingId) {
        group.position.x = this.lastDraggingPossition.x;
        group.position.y = this.lastDraggingPossition.y;
        word.position.set(0, 0, 0);
        let wordVector = new THREE.Vector3();
        wordVector.setFromMatrixPosition(word.matrixWorld);
        word.body.quaternion.copy(group.quaternion);
        word.body.position.set(wordVector.x, wordVector.y, 0);
        plane.position.set(word.size.x / 2, word.size.y / 2, 0);
        word.body.velocity.set(0, 0, 0);
        word.body.angularVelocity.set(0, 0, 0);

        this.dragEnd = false;
        this.draggingId = null;
        this.lastDraggingPossition = null;
      }
      if (group.id !== this.draggingId) {
        word.body.position.set(word.body.position.x, word.body.position.y, 0);
        word.body.quaternion.x = 0;
        word.body.quaternion.y = 0;
        group.position.copy(word.body.position);
        group.quaternion.copy(word.body.quaternion);
      } else {
        let vector = new THREE.Vector3();
        vector.setFromMatrixPosition(plane.matrixWorld);
        let wordVector = new THREE.Vector3();
        wordVector.setFromMatrixPosition(word.matrixWorld);
        this.lastDraggingPossition = vector;
        word.position.x = plane.position.x - word.size.x / 2;
        word.position.y = plane.position.y - word.size.y / 2;
        word.body.position.set(wordVector.x, wordVector.y, 0);
        word.body.quaternion.copy(group.quaternion);
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

    text.position.set(0, 0, 0);
    text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

    const box = new C.Box(new C.Vec3().copy(text.size).scale(0.5));

    text.body = new C.Body({
      mass: 0.1,
      position: new C.Vec3(position.x, position.y, 0),
      material: letterMat,
    });

    const { center } = text.geometry.boundingSphere;
    text.body.addShape(box, new C.Vec3(center.x, center.y, center.z));

    const planeGeometry = new THREE.PlaneGeometry(
      text.size.x + 1,
      text.size.y + 1,
      10
    );

    planeGeometry.computeBoundingBox();
    planeGeometry.computeBoundingSphere();

    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: planeOpacity,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.size = plane.geometry.boundingBox.getSize(new THREE.Vector3());
    plane.position.set(center.x, center.y, 0);

    const textWithPlaneGroup = new THREE.Object3D();
    textWithPlaneGroup.attach(plane);
    textWithPlaneGroup.attach(text);

    plane.textId = text.id;
    plane.parentId = textWithPlaneGroup.id;

    textWithPlaneGroup.position.set(position.x, position.y, 0);

    this.wordsList.push(plane);
    this.scene.add(textWithPlaneGroup);

    this.wordsGroup.add(textWithPlaneGroup);
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
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length < 1 && !this.draggingId) {
      const color = 0x9910ff;
      const message = this.textList[
        Math.round(Math.random() * (this.textList.length - 1))
      ];
      this.addNewWord(
        message,
        color,
        { x: this.mouse.x * 30, y: this.mouse.y * 15 },
        this.letterMat,
        this.planeOpacity
      );
    }
  };
}
