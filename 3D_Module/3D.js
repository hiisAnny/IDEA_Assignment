import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

let container;

let camera, scene, renderer, effect;
let particleLight, sphere;

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444488);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 200, 60);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio); //设置渲染器的像素比例，以适应不同的设备屏幕
    renderer.setSize(window.innerWidth, window.innerHeight); //设置渲染器的尺寸，以适应窗口的大小
    container.appendChild(renderer.domElement); //将渲染器的画布元素添加到之前创建的容器中

    const geometry = new THREE.SphereGeometry(20, 32, 16);
    const format = (renderer.capabilities.isWebGL2) ? THREE.RedFormat : THREE.LuminanceFormat;
    const colors = [0x00ff00, 0x00cc00, 0x009900];// 渐变的绿色值数组
    const gradientMap = new THREE.DataTexture(new Uint8Array(colors), colors.length, 1, format);
    gradientMap.needsUpdate = true;
    
    const material = new THREE.MeshToonMaterial({
        color: 0xffffff,
        gradientMap: gradientMap
    })
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    particleLight = new THREE.Mesh(
        new THREE.SphereGeometry(20, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    scene.add(particleLight);

    scene.add(new THREE.AmbientLight(0x404040));

    const pointLight = new THREE.PointLight(0xffffff, 2, 30);
    particleLight.add(pointLight);

    // 添加网格辅助
    const gridHelper = new THREE.GridHelper(100, 10);
    scene.add(gridHelper);

    effect = new OutlineEffect(renderer); // 创建OutlineEffect实例

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    effect.render(scene, camera); // 使用OutlineEffect渲染场景
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    const timer = Date.now() * 0.00025;

    particleLight.position.x = Math.sin(timer * 7) * 300;
    particleLight.position.y = Math.cos(timer * 5) * 400;
    particleLight.position.z = Math.cos(timer * 3) * 300;
}

init();
animate();