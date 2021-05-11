/* eslint-disable */
import * as THREE from "three";
// import gsap from 'gsap';
import fontSculpt from "../assets/fonts/splt.typeface.json";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import C from "cannon";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

import bookModel from "../assets/models/bookModel/book.obj";
import bookTexture from "../assets/models/bookModel/livro_te.jpg";
// import CannonDebugRenderer from "./CannonDebugRenderer";
// import { throttle } from "lodash";

const distance = 15;
// const totalMass = 1;

export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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

    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(new THREE.Vector3());

    this.mouse = { x: 0, y: 0 };

    this.words = [];
    this.wordsList = [];
    this.dragging = false;
    this.draggingId = null;
    this.planeOpacity = 0;
    this.dragGroup = null;
    this.dragEnd = false;
    this.lastDraggingPossition = null;
    this.model = null;
    this.models = [];
    this.mainCount = 0;
    this.mass = 1

    this.world = new C.World();
    this.world.gravity.set(0, -25, 0);

    this.raycaster = new THREE.Raycaster();

    // this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world);

    this.startLoader();
    this.render();
  }

  addListeners = () => {
    this.dom.addEventListener("mousemove", this.mouseEvent);
    window.addEventListener("keydown", this.changeView);
    window.addEventListener("keyup", this.changeView2);
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

  changeView = (event) => {
    if (event.keyCode === 32) {
      this.camera.position.set(10, -10, 10);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  };

  changeView2 = () => {
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  };

  mouseEvent = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  startLoader = () => {
    const textureLoader = new THREE.TextureLoader();
    const loader = new OBJLoader();
    textureLoader.load(bookTexture, (tex) => {
      loader.load(
        bookModel,
        (gltf) => {
          this.model = gltf;
          this.model.children[0].material.map = tex;
          this.addObjects();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
    this.dom.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.changeView);
    window.removeEventListener("keyup", this.changeView2);
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
        restitution: 0,
        friction: 1,
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
      position: new C.Vec3(-40, -59, -10),
      material: this.groundMat,
    });

    this.wordsGroup.wallRight = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(10, 100, 20)),
      position: new C.Vec3(40, -59, -10),
      material: this.groundMat,
    });

    this.world.addBody(this.wordsGroup.ground);
    this.world.addBody(this.wordsGroup.wallLeft);
    this.world.addBody(this.wordsGroup.wallRight);

    for (let i = 0; i < this.textList.length; i++) {
      if (i % 3 === 0) {
        this.addNewModel(
          { x: -4 + (-1) ** i * 5, y: 6 * i },
          this.letterMat,
          this.planeOpacity
        );
      } else {
        this.addNewWord(
          this.textList[i],
          color,
          { x: -4 + (-1) ** i * 5, y: 6 * i },
          this.letterMat,
          this.planeOpacity
        );
      }
    }

    this.words.push(this.wordsGroup);
    this.controls = new DragControls(
      this.wordsList,
      this.camera,
      this.renderer.domElement
    );

    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    this.scene.add(light);

    this.scene.add(this.wordsGroup);
    this.addListeners();
  };

  render = () => {
    // this.cannonDebugRenderer.update();
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
    if (!this.words || this.words.length < 1) return;
    this.words[0].children.forEach((group) => {
      if (group.isModel) {
        this.modelPhisics(group);
      } else {
        this.wordPhisics(group);
      }
    });
  };

  modelPhisics = (group) => {
    const model = group.children[1];
    const box = group.children[0];
    if (this.dragEnd && group.id === this.draggingId) {
      group.position.x = this.lastDraggingPossition.x;
      group.position.y = this.lastDraggingPossition.y;
      model.position.set(0, -model.size.y, 0);
      let wordVector = new THREE.Vector3();
      wordVector.setFromMatrixPosition(model.matrixWorld);
      model.body.quaternion.copy(group.quaternion);
      model.body.position.set(group.position.x, group.position.y, 1);
      box.position.set(0, 0, 0);
      model.body.velocity.set(0, 0, 0);
      model.body.angularVelocity.set(0, 0, 0);

      this.dragEnd = false;
      this.draggingId = null;
    }
    if (group.id !== this.draggingId) {
      model.body.position.set(model.body.position.x, model.body.position.y, 1);
      group.position.copy(model.body.position);
      group.quaternion.copy(model.body.quaternion);
    } else {
      let vector = new THREE.Vector3();
      vector.setFromMatrixPosition(box.matrixWorld);
      this.lastDraggingPossition = vector;

      model.position.copy(box.position);
      model.position.y -= model.size.y;
      model.body.position.set(vector.x, vector.y, 1);
      model.body.quaternion.copy(group.quaternion);
    }
  };

  wordPhisics = (group) => {
    const word = group.children[1];
    const plane = group.children[0];
    if (this.dragEnd && group.id === this.draggingId) {
      group.position.x = this.lastDraggingPossition.x;
      group.position.y = this.lastDraggingPossition.y;
      word.position.set(-word.size.x / 2, -word.size.y / 2, 0);
      word.body.quaternion.copy(group.quaternion);
      word.body.position.set(group.position.x, group.position.y, 0);
      plane.position.set(0, 0, 0);
      word.body.velocity.set(0, 0, 0);
      word.body.angularVelocity.set(0, 0, 0);

      this.dragEnd = false;
      this.draggingId = null;
    }
    if (group.id !== this.draggingId) {
      word.body.position.set(word.body.position.x, word.body.position.y, 0);
      word.body.quaternion.x = 0;
      word.body.quaternion.y = 0;
      word.body.quaternion.normalize();
      group.position.copy(word.body.position);
      group.quaternion.copy(word.body.quaternion);
    } else {
      let vector = new THREE.Vector3();
      vector.setFromMatrixPosition(plane.matrixWorld);
      this.lastDraggingPossition = vector;
      word.position.x = plane.position.x - word.size.x / 2;
      word.position.y = plane.position.y - word.size.y / 2;
      word.body.quaternion.copy(group.quaternion);
      word.body.position.set(vector.x, vector.y, 0);
    }
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
      height: 5,
      curveSegments: 64,
      bevelEnabled: false,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10,
    });

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const text = new THREE.Mesh(geometry, matLite);
    // text.position.set(0, 0, 0);
    text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

    const boxxxgeometry = new THREE.BoxGeometry(
      text.size.x,
      text.size.y,
      text.size.z
    );

    boxxxgeometry.computeBoundingBox();
    boxxxgeometry.computeBoundingSphere();

    const boxMesh = new THREE.Mesh(boxxxgeometry, matLite);
    boxMesh.size = boxMesh.geometry.boundingBox.getSize(new THREE.Vector3());

    const boxxxx = new C.Box(new C.Vec3().copy(boxMesh.size).scale(0.5));

    boxMesh.body = new C.Body({
      mass: this.mass,
      position: new C.Vec3(position.x, position.y, 0),
      material: letterMat,
    });

    const { center: c } = boxMesh.geometry.boundingSphere;
    boxMesh.body.addShape(boxxxx, new C.Vec3(c.x, c.y, c.z));

    // const oup = new THREE.Object3D();
    // oup.isTest = true;
    // oup.attach(boxMesh);

    // this.scene.add(oup);
    // this.world.addBody(boxMesh.body);
    // this.wordsGroup.add(oup);

    // const box = new C.Box(new C.Vec3().copy(text.size));
    // const box = new C.Box(new C.Vec3().copy(text.size).scale(0.5));
    const { center } = text.geometry.boundingSphere;

    text.position.set(-center.x, -center.y, -center.z);
    text.body = new C.Body({
      mass: 0.1,
      position: new C.Vec3(position.x, position.y, 0),
      material: letterMat,
    });

    text.body.addShape(boxxxx, new C.Vec3(0, 0, 0));

    // text.body.quaternion.set(0, 0, 0.3)

    const planeGeometry = new THREE.PlaneGeometry(
      text.size.x + 1,
      text.size.y + 1,
      10
    );

    // this.updateCOM(text.body);

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
    plane.position.set(0, 0, 0);

    const textWithPlaneGroup = new THREE.Object3D();
    textWithPlaneGroup.attach(plane);
    textWithPlaneGroup.attach(text);

    plane.textId = text.id;
    plane.parentId = textWithPlaneGroup.id;

    // textWithPlaneGroup.position.set(position.x, position.y, 0);

    this.wordsList.push(plane);
    this.scene.add(textWithPlaneGroup);

    this.wordsGroup.add(textWithPlaneGroup);
    this.world.addBody(text.body);
  };

  addNewModel = (startPos, material, opacity) => {
    const mesh = this.model.children[0].clone();
    mesh.scale.set(0.1, 0.1, 0.1);

    if (mesh) {
      // gr.position.set(0, 0, 0);
      mesh.geometry.computeBoundingBox();
      mesh.geometry.computeBoundingSphere();

      mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());

      mesh.size = new THREE.Vector3(
        mesh.size.x * 0.5 * 0.4,
        mesh.size.y * 0.5 * 0.1,
        mesh.size.z * 0.5 * 0.1
      );

      const boxSize = new C.Vec3().copy(mesh.size);
      const box = new C.Box(boxSize);

      mesh.body = new C.Body({
        mass: this.mass,
        position: new C.Vec3(startPos.x, startPos.y, 0),
        material,
      });

      mesh.body.addShape(box, new C.Vec3(0, 0, 0));

      const boxGeometry = new THREE.BoxGeometry(
        mesh.size.x,
        mesh.size.y,
        mesh.size.z
      );

      boxGeometry.computeBoundingBox();
      boxGeometry.computeBoundingSphere();

      const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        side: THREE.DoubleSide,
        opacity,
      });
      const boxDrag = new THREE.Mesh(boxGeometry, boxMaterial);
      boxDrag.scale.set(2, 2, 2);
      boxDrag.size = boxDrag.geometry.boundingBox.getSize(new THREE.Vector3());
      mesh.position.set(0, -mesh.size.y, 0);

      const modelWithBoxGroup = new THREE.Object3D();
      modelWithBoxGroup.attach(boxDrag);
      modelWithBoxGroup.attach(mesh);

      mesh.parentId = modelWithBoxGroup.id;
      boxDrag.parentId = modelWithBoxGroup.id;

      modelWithBoxGroup.position.set(startPos.x, startPos.y, 0);
      modelWithBoxGroup.isModel = true;

      this.wordsList.push(boxDrag);
      this.scene.add(modelWithBoxGroup);
      this.world.addBody(mesh.body);
      this.wordsGroup.add(modelWithBoxGroup);
    }
  };

  // updateCOM = (body) => {
  //   let com = new C.Vec3();
  //   body.shapeOffsets.forEach((offset) => {
  //     com.vadd(offset, com);
  //   });
  //   com.scale(1 / body.shapes.length, com);

  //   body.shapeOffsets.forEach((offset) => {
  //     offset.vsub(com, offset);
  //   });

  //   let worldCOM = new C.Vec3();
  //   body.vectorToWorldFrame(com, worldCOM);
  //   body.position.vadd(worldCOM, body.position);
  // };

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
      this.words[0].children.shift();

      this.world.bodies.splice(3, 1);
      this.mainCount += 1;

      if (this.mainCount % 3 === 0) {
        this.addNewModel(
          { x: this.mouse.x * 30, y: this.mouse.y * 15 },
          this.letterMat,
          this.planeOpacity
        );
      } else {
        const color = 0xffffff;
        const message =
          this.textList[Math.round(Math.random() * (this.textList.length - 1))];
        this.addNewWord(
          message,
          color,
          { x: this.mouse.x * 30, y: this.mouse.y * 15 },
          this.letterMat,
          this.planeOpacity
        );
      }
    }
  };
}
