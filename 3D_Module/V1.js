import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let container;
let camera, scene, renderer, controls, light1;
const gridStep = 10;
const cubeSize = 500;
let cube, gridHelper;

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444488);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, 600, 600);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio); //设置渲染器的像素比例，以适应不同的设备屏幕
    renderer.setSize(window.innerWidth, window.innerHeight); //设置渲染器的尺寸，以适应窗口的大小
    document.body.appendChild(renderer.domElement); //将渲染器的画布元素添加到之前创建的容器中

    const sphere = new THREE.SphereGeometry(2, 16, 8);
    light1 = new THREE.PointLight(0xff0000, 8, 50);
    light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    scene.add(light1);
    scene.add(new THREE.AmbientLight(0xffffff));

    // 创建正方体
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xb7845a });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // 添加网格辅助
    gridHelper = new THREE.GridHelper(cubeSize, gridStep, 0xffffff, 0xffffff);
    gridHelper.position.y = cubeSize / 2 + 1; // 将网格辅助沿 y 轴平移至正方体的正面
    cube.add(gridHelper);
    controls = new OrbitControls(camera, renderer.domElement);


    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const time = Date.now() * 0.0005;
    const cubePosition = cube.getWorldPosition(new THREE.Vector3()); // 获取正方体的全局位置
    // 获取正方体对象的边界坐标
    const cubeHalfSize = cubeSize / 2;

    let x = cubePosition.x + Math.sin(time * 0.7) * 30; // 在 x 轴上进行偏移
    let z = cubePosition.z + Math.cos(time * 0.3) * 30; // 在 z 轴上进行偏移

    light1.position.x = THREE.MathUtils.clamp(x, cubePosition.x - cubeHalfSize, cubePosition.x + cubeHalfSize);
    light1.position.z = THREE.MathUtils.clamp(z, cubePosition.z - cubeHalfSize, cubePosition.z + cubeHalfSize);
    light1.position.y = cubePosition.y + cubeHalfSize +10; // 在正方体顶部偏移
    renderer.render(scene, camera);
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();