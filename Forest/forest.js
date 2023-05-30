import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { increaseDensity } from './interaction.js';

let camera, scene, renderer, controls;
let plane;
let pointer, raycaster;

//立方体们
let container;
let gridHelper;

//需要进行射线相交检测的对象
const objects = [];


//检测火源和树木的新增
const newElement_toArray = new Event('newElement_toArray');

const pushWrapper = (arr, element) => {
    arr.push(element);
    document.dispatchEvent(newElement_toArray);
};

init();
render();
export { scene, pushWrapper };


function init() {
    const forest = document.getElementById("forest");

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(300, 600, 1400);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6fafc);

    // 悬浮的树
    const trunkShape = new THREE.CylinderGeometry(5, 10, 40, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x777a1f, opacity: 0.5, transparent: true });
    const trunk = new THREE.Mesh(trunkShape, trunkMaterial);
    trunk.position.set(0, 20, 0);

    const firstLeaf_shape = new THREE.ConeGeometry(20, 20, 32);
    const firstLeaf_material = new THREE.MeshBasicMaterial({ color: 0xa7e5a7 });
    const firstLeaf = new THREE.Mesh(firstLeaf_shape, firstLeaf_material);
    firstLeaf.position.set(0, 40, 0);

    const secondLeaf_shape = new THREE.ConeGeometry(15, 20, 32);
    const secondLeaf_material = new THREE.MeshBasicMaterial({ color: 0x1b855c });
    const secondLeaf = new THREE.Mesh(secondLeaf_shape, secondLeaf_material);
    secondLeaf.position.set(0, 60, 0);

    container = new THREE.Group(); // 创建一个容器对象
    container.add(trunk); // 将rollOverMesh添加到容器中
    container.add(firstLeaf); // 将coneMesh添加到容器中
    container.add(secondLeaf); // 将coneMesh添加到容器中
    scene.add(container); // 将容器对象添加到场景中

    // grid
    // gridHelper = new THREE.GridHelper(1000, 20);
    // gridHelper.material.color.set(0xe6fafc);
    // scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    //辅助平面对象平面来判断交点是哪，判断树建在哪里
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2); //使其与场景的水平面相切，平行于网格的水平面
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    // 创建网格背景
    const backgroundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const backgroundMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2f2 });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundGeometry.rotateX(- Math.PI / 2);
    backgroundPlane.position.set(0, -1, 0); // 将背景平面设置在网格的后面
    scene.add(backgroundPlane);

    const cubeGeometry = new THREE.BoxGeometry(1000, 50, 1000);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffe4d3 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0,-30,0);
    scene.add(cube);

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    // 定向光源
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    forest.appendChild(renderer.domElement);
    for (let i = 0; i < 150; i++) {
        increaseDensity();
    }
    document.addEventListener('pointermove', onPointerMove);


    //新的树进density了
    document.addEventListener('newElement_toArray', () => {
        // console.log("new tree create");
    });

    controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();

}

function onPointerMove(event) {
    /** 
     * 鼠标（x,y) -> 标准化设备坐标（Normalized Device Coordinates，NDC）
     * 标准化设备坐标是一个范围为 [-1, 1] 的二维坐标系统，-1 表示屏幕最左侧/底部，1 表示屏幕最右侧/顶部
     * 
     * 在不同分辨率和尺寸的设备上进行统一计算和表示
     */
    //将鼠标指针的屏幕坐标转换为相机坐标系中的坐标
    const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
    const ndcY = - (event.clientY / window.innerHeight) * 2 + 1;
    pointer.set(ndcX, ndcY);

    /**
     * NDC -> 相机坐标系中的 坐标(x,y,z)
     * 通过将raycaster的起点和方向更新
     * 更新为 起点将是相机的位置，而方向将是从相机位置出发
     */
    raycaster.setFromCamera(pointer, camera);

    /**
     * Raycaster 对象用于进行射线与场景中物体的相交检测。
     * 通过设置射线的起点（相机的位置）和方向，raycaster 可以发射射线，返回与物体相交的结果
     * false：射线只会与指定的 objects 列表中的对象进行相交检测，不考虑其子对象
     * intersects 包含相交结果的数组，每个相交结果都是一个对象
     */
    const intersects = raycaster.intersectObjects(objects, true);

    /**
     * 在进行射线相交检测后，通过 intersect.point 可以获取相交点在 世界坐标系中 的位置
     * 通过 copy 方法将相交点的坐标复制到 container.position 中
     * add 方法将相交面的法线方向加到 container.position 上，从而得到更新后的 container 的位置。
     */
    if (intersects.length > 0) {
        const intersect = intersects[0];

        container.position.copy(intersect.point).add(intersect.face.normal);
        container.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        // console.log(container.position);
        render();

    }

}

export function render() {
    renderer.render(scene, camera);
}

