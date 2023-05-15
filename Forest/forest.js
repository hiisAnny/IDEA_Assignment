import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;
let plane;
let pointer, raycaster, isShiftDown = false;

//立方体们
let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;
let fire;
const fireAreas = [];

let gridHelper,controls;

//需要进行射线相交检测的对象
const objects = [];
let density = [];

  
init();
render();

export { scene, objects, density };
    
function init() {
    const forest = document.getElementById("forest");

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 悬浮的树
    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xb7ffb7, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.position.set(0,20,0);
    scene.add(rollOverMesh);

    // cubes
    const map = new THREE.TextureLoader().load('ground.png');
    map.colorSpace = THREE.SRGBColorSpace;
    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map });

    // grid
    gridHelper = new THREE.GridHelper(1000, 20);
    gridHelper.material.color.set(0xff0000); // 设置网格颜色为红色
    scene.add(gridHelper);

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
    const backgroundMaterial = new THREE.MeshStandardMaterial({ color: 0xffede9 });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundGeometry.rotateX(- Math.PI / 2);
    backgroundPlane.position.set(0, -1, 0); // 将背景平面设置在网格的后面
    scene.add(backgroundPlane);

    fire = new THREE.PointLight(0xff0000, 1, 100);
    fire.add(new THREE.Mesh(new THREE.SphereGeometry(15, 12, 2), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    fire.position.set(20, 50, 0);
    scene.add(fire);


    const range = fire.distance;
    console.log("火光的范围哦：", range); // 输出点光源的范围值
    const fireAreaGeometry = new THREE.PlaneGeometry(range, range);
    const fireAreaMaterial = new THREE.MeshStandardMaterial({ color: 0xffa8a8,visible:true  });
    const fireArea = new THREE.Mesh(fireAreaGeometry, fireAreaMaterial);
    fireArea.rotateX(- Math.PI / 2);
    scene.add(fireArea);
    fireAreas.push(fireArea);
    console.log("被点着的有：", fireAreas);

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

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
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
    const intersects = raycaster.intersectObjects(objects, false);

    /**
     * 在进行射线相交检测后，通过 intersect.point 可以获取相交点在 世界坐标系中 的位置
     * 通过 copy 方法将相交点的坐标复制到 rollOverMesh.position 中
     * add 方法将相交面的法线方向加到 rollOverMesh.position 上，从而得到更新后的 rollOverMesh 的位置。
     */
    if (intersects.length > 0) {

        const intersect = intersects[0];

        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        render();

    }

}

function onPointerDown(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube
        if (isShiftDown) {
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
        } 
        // create cube
        else {
            const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(voxel);

            objects.push(voxel);
        }
        
        render();
    }
}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = true; break;

    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16: isShiftDown = false; break;

    }

}

// 更新函数，用于每一帧更新小球的旋转
function updateRotation() {
    // 每一帧更新小球的旋转角度
    fire.rotation.x += 0.05; // 绕X轴旋转
    fire.rotation.y += 0.01; // 绕Y轴旋转
}
  
export function render() {
    updateRotation();
  
    // 每隔一定时间调用一次更新函数，实现小球的旋转
    setInterval(updateRotation, 100); // 1000毫秒，即1秒
    controls.update();
    // const time = Date.now() * 0.0005;
    // const planePosition = plane.getWorldPosition(new THREE.Vector3()); // 获取正方体的全局位置
    // // 获取正方体对象的边界坐标
    // const planeHalfSize = 1000 / 2;

    // let x = planePosition.x + Math.sin(time * 0.7) * 30; // 在 x 轴上进行偏移
    // let z = planePosition.z + Math.cos(time * 0.3) * 30; // 在 z 轴上进行偏移

    // fire.position.x = THREE.MathUtils.clamp(x, planePosition.x - planeHalfSize, planePosition.x + planeHalfSize);
    // fire.position.z = THREE.MathUtils.clamp(z, planePosition.z - planeHalfSize, planePosition.z + planeHalfSize);
    // fire.position.y = planePosition.y + planeHalfSize  +10; // 在正方体顶部偏移
    renderer.render(scene, camera);
    
}

export function addRandomCube() {
    //   console.log('Position:', plane.position);
//   console.log('Scale:', plane.scale);
    const positionX = randomPosition(-425,425);
const positionY = 20;// 平面所在的高度
    const positionZ = randomPosition(-425,425); 
    
    const newGeo = new THREE.BoxGeometry(50, 50, 50);
    const newCube = new THREE.Mesh(newGeo, cubeMaterial);
    newCube.position.set(positionX,positionY,positionZ);

  // 将立方体添加到场景中
    scene.add(newCube);
    objects.push(newCube);
    density.push(newCube);

    // console.log("用了吗")
    render();
}

function randomPosition(min, max) {
    return Math.random() * (max - min) + min
}
