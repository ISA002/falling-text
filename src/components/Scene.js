import * as THREE from "three";
// import gsap from 'gsap';
import fontSculpt from "../assets/fonts/sculpture.typeface.json";
import C from "cannon";

const distance = 15;
const totalMass = 1;

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

    this.textList = ["MESSAGE", "SIMPLE", "THREE", "REACT"];

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
    this.time = 0;

    this.isPlaying = 0;
    this.mouse = { x: 0, y: 0 };

    this.words = [];

    this.world = new C.World();
    this.world.gravity.set(0, -50, 0);

    this.addListeners();
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
    //   console.log("log", font);

    const groundMat = new C.Material();
    const letterMat = new C.Material();

    const contactMaterial = new C.ContactMaterial(groundMat, letterMat, {
      friction: 0.01,
    });

    this.world.addContactMaterial(contactMaterial);

    const color = 0x006699;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const words = new THREE.Group();
    words.ground = new C.Body({
      mass: 0,
      shape: new C.Box(new C.Vec3(100, 50, 10000)),
      position: new C.Vec3(10, -59, -1000),
      material: groundMat,
    });

    this.world.addBody(words.ground);

    for (let i = 0; i < this.textList.length; i++) {
      const message = this.textList[i];

      const geometry = new THREE.TextGeometry(message, {
        font: fontsss,
        size: 3,
        height: 1,
        curveSegments: 24,
        bevelEnabled: false,
        bevelThickness: 0.9,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 10,
      });

      // const shapes = fontsss.generateShapes(message, 2);
      // const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      // const xMid =
      //   -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      // geometry.translate(-15 + i * 7, i * 2, 0);

      const text = new THREE.Mesh(geometry, matLite);

      text.position.set(-20 + i * 6, i * 6, 0);
      text.size = text.geometry.boundingBox.getSize(new THREE.Vector3());

      const box = new C.Box(new C.Vec3().copy(text.size).scale(0.5));

      text.body = new C.Body({
        mass: 0.1,
        position: new C.Vec3(-20 + i * 8, i * 6, 0),
        material: letterMat,
      });

      const { center } = text.geometry.boundingSphere;

      text.body.addShape(box, new C.Vec3(center.x, center.y, center.z));

      this.world.addBody(text.body);
      words.add(text);
    }

    this.words.push(words);
    this.scene.add(words);
    // this.setConstraints();
    // });
  };

  stop = () => {
    this.isPlaying = false;
  };

  play = () => {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  };

  render = () => {
    if (this.isPlaying) return;

    this.time += 0.001;

    this.updatePhisics();
    this.world.step(1 / 60);

    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  updatePhisics = () => {
    if (!this.words) return;

    this.words[0].children.forEach((word) => {
      // console.log(word.position, word.quaternion);
      word.position.copy(word.body.position);
      word.quaternion.copy(word.body.quaternion);
    });
  };

  setConstraints() {
    const arr = this.words[0].children;
    for (let i = 0; i < arr.length; i++) {
      const word = arr[i];
      const nextLetter = i === arr.length - 1 ? null : arr[i + 1];

      if (!nextLetter) continue;

      const c = new C.ConeTwistConstraint(word.body, nextLetter.body, {
        pivotA: new C.Vec3(word.size.x * 0.5, 0, 0),
        pivotB: new C.Vec3(-word.size.x * 0.5, 0, 0),
      });

      c.collideConnected = true;

      this.world.addConstraint(c);
    }
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
    const value = this.textList.pop();
    this.textList.unshift(value);
    console.log(this.words);
    this.words[0].children.pop();
  };
}
