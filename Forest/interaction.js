import * as THREE from 'three';
import { scene, objects, density, cubeGeo, cubeMaterial } from './forest.js';
import { render } from './forest.js';

let fire;
const fireAreas = [];

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);
  
function startSimulation() {
    createFire();
}  

function increaseDensity() {
    addRandomCube();
}  

function decreaseDensity() {
    // plane平面
    // console.log(objects[0]); 
    if (objects.length != 1) { 
        const lastObject = scene.children[scene.children.length - 1];
        scene.remove(lastObject);
        // console.log("原来长度：", objects.length);
        objects.pop();
        // console.log("new长度：", objects.length);
        render();
    }
} 

function randomPosition(min, max) {
    return Math.random() * (max - min) + min
}

function addRandomCube() {
    //   console.log('Position:', plane.position);
    //   console.log('Scale:', plane.scale);
    const positionX = randomPosition(-425, 425);
    const positionY = 20;// 平面所在的高度
    const positionZ = randomPosition(-425, 425);

    const newCube = new THREE.Mesh(cubeGeo, cubeMaterial);
    newCube.position.set(positionX, positionY, positionZ);

    // 将立方体添加到场景中
    scene.add(newCube);
    objects.push(newCube);
    density.push(newCube);

    render();
}

function createFire() {
    fire = new THREE.PointLight(0xff0000, 1, 100);
    fire.add(new THREE.Mesh(new THREE.SphereGeometry(15, 12, 2), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    fire.position.set(20, 50, 0);
    scene.add(fire);
    
    const range = fire.distance;
    const fireAreaGeometry = new THREE.PlaneGeometry(range, range);
    const fireAreaMaterial = new THREE.MeshStandardMaterial({ color: 0xffa8a8, visible: true });
    const fireArea = new THREE.Mesh(fireAreaGeometry, fireAreaMaterial);
    fireArea.rotateX(- Math.PI / 2);

    scene.add(fireArea);
    fireAreas.push(fireArea);

    console.log("火光的范围：", range); // 输出点光源的范围值
    console.log("被点着的有：", fireAreas);

    if (density.length > 0 && fireAreas.length > 0) {
        // 遍历每个平面，对每个立方体进行判断
        fireAreas.forEach(fireArea => {
            density.forEach(tree => {
                isTreeInFireArea(fireArea, tree)
            });
        });
    }
}

// 更新函数，用于每一帧更新小球的旋转
function updateRotation() {
    // 每一帧更新小球的旋转角度
    fire.rotation.x += 0.05; // 绕X轴旋转
    fire.rotation.y += 0.01; // 绕Y轴旋转
    setInterval(updateRotation, 100); // 1000毫秒，即1秒
}

// 判断立方体是否在火焰范围内
function isTreeInFireArea(fireArea, tree) {

    // 获取平面的边界框或包围盒
    const boundingBox = new THREE.Box3().setFromObject(fireArea);

    // 获取最小点和最大点的坐标
    const minPoint = boundingBox.min;
    const maxPoint = boundingBox.max;

    // // 输出平面的范围
    // console.log('平面的范围：');
    // console.log('最小点坐标：', minPoint);
    // console.log('最大点坐标：', maxPoint);

    const boundingBox2 = new THREE.Box3().setFromObject(tree);
    // 获取最小点和最大点的坐标
    const minPoint2 = boundingBox2.min;
    const maxPoint2 = boundingBox2.max;

    // // 输出平面的范围
    // console.log('树的范围：');
    // console.log('最小点坐标：', minPoint2);
    //     console.log('最大点坐标：', maxPoint2);

    // 判断立方体的边界框是否与平面的范围相交
    const isCubeAbovePlane =
        minPoint2.x <= maxPoint.x &&
        maxPoint2.x >= minPoint.x &&
        minPoint2.y <= maxPoint.y &&
        maxPoint2.y >= minPoint.y &&
        minPoint2.z <= maxPoint.z &&
        maxPoint2.z >= minPoint.z;
    console.log('立方体是否在平面的上方：', isCubeAbovePlane);
    if (isCubeAbovePlane) {
        const index = objects.indexOf(tree);
        if (index != -1) {
            objects.splice(index, 1);
            density.splice(density.indexOf(tree), 1);
            scene.remove(tree);
        }
    }
}