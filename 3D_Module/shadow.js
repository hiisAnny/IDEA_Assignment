import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x444488);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, 0, 100);
camera.rotation.x = Math.PI / 2;

// 创建一个球体，设置它投射阴影
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(50,0,10);
sphere.castShadow = true;

// 创建一个平面，设置它接收阴影
const planeGeometry = new THREE.PlaneGeometry(400, 400);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x3c8726 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0,0, 0);
// plane.rotation.x = Math.PI / 2;

plane.receiveShadow = true;

// 创建光源，并设置阴影相关属性
const light = new THREE.PointLight(0xe83f45, 5, 100);
light.position.set(50, sphere.position.y+10, 10);
light.shadow.camera.position.copy(light.position)
light.castShadow = true;
// 设置光源的照射方向
light.target = plane;
scene.add(new THREE.AmbientLight(0xffffff));

// 设置阴影属性
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;



// 创建阴影相机帮助器并添加到场景中
const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);

scene.add(light);
scene.add(sphere);
scene.add(plane);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}



animate();
