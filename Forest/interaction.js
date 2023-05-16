import * as THREE from 'three';
import { scene, objects, density, cubeGeo, cubeMaterial } from './forest.js';
import { render, pushWrapper} from './forest.js';

let fire,fireRadius;
const fireAreas = [];

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);


export { fireAreas };
    
function startSimulation() {
    if (checkScene()) {
        updateFire();
    }
    else {
        createFire();
    }
    showFireAreas();
    checkFire();
    render();
}

function increaseDensity() {
    addRandomTree();
    render();
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

function checkScene() {
    const target = 'PointLight';

    let isTargetFound = false;
    scene.children.forEach(object => {
        if (object.type === target) {
            isTargetFound = true;
            // 找到了目标对象
            console.log(object, ' -- 找到了目标对象');
            return true; // 终止循环
        }
    });

    if (!isTargetFound) {
        // 没有找到目标对象
        console.log('没有找到目标对象');
        return false; // 终止循环
    }
}

function randomPosition(min, max) {
    return Math.random() * (max - min) + min
}

function addRandomTree() {
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
    pushWrapper(density, newCube);
    // density.push(newCube);
}
/**
 * 斜边是100，直边距离是50，球的半径是16
 * 火苗边缘到地面的距离是 50-16 = 34
 */
function createFire() {
    fire = new THREE.PointLight(0xff0000, 2, 100);
    fire.add(new THREE.Mesh(new THREE.SphereGeometry(16, 12, 2,0, Math.PI * 2,0,3.65681384877852), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
    fire.position.set(0, 50, 0);
    scene.add(fire);
}

function showFireAreas() {
    // 将角度转换为弧度
    var angleInRadians = 30 * Math.PI / 180;
    fireRadius = (fire.distance * 0.7) * Math.cos(angleInRadians);
    const fireAreaGeometry = new THREE.CircleGeometry(fireRadius, 32);
    const fireAreaMaterial = new THREE.MeshStandardMaterial({ color: 0xffa8a8, visible: true });
    const fireArea = new THREE.Mesh(fireAreaGeometry, fireAreaMaterial);
    fireArea.rotateX(- Math.PI / 2);
    // fireArea.position.copy(fire.position);
    scene.add(fireArea);
    pushWrapper(fireAreas, fireArea);
    // fireAreas.push(fireArea);

    // console.log("火光的范围：", fireArea.position); // 输出点光源的范围值
    console.log("被点着的fireAreas有：", fireAreas);


}

// 更新函数，用于每一帧更新小球的旋转
function updateFire() {
    requestAnimationFrame(render);
    // 每一帧更新小球的旋转角度
    // fire.rotation.x += 0.05; // 绕X轴旋转
    // fire.rotation.y += 0.01; // 绕Y轴旋转
    // setInterval(updateRotation, 100); // 1000毫秒，即1秒
    console.log("旧的：", fire.position);
    const time = Date.now() * 0.0005;

    const x = fire.position.x + Math.sin(time * 0.7) * 30; // 在 x 轴上进行偏移
    const fireX = THREE.MathUtils.clamp(x, -492, 492);

    const z = fire.position.z + Math.cos(time * 0.3) * 30; // 在 z 轴上进行偏移
    const fireZ = THREE.MathUtils.clamp(z, -492, 492);

    fire.position.set(fireX, fire.position.y, fireZ);
    console.log("新的：", fire.position, "距离：", fire.distance);
}

export function checkFire() {
    console.log("check了");
    if (density.length > 0 && fireAreas.length > 0) {
        // 遍历每个平面，对每个立方体进行判断
        fireAreas.forEach(fireArea => {
            console.log("查找的这片着火区域坐标：",fireArea.position);
            density.forEach(tree => {
                console.log("查找的这颗树坐标：", tree.position);
                isTreeInFireAreas(fireArea, tree);
            });
        });
    }
}

// 判断树是否在火焰范围内
function isTreeInFireAreas(fireArea, tree) {

    const fireAreaBounds = {
        FMinX: fireArea.position.x - fireRadius,
        FMaxX: fireArea.position.x + fireRadius,
        FMinZ: fireArea.position.z - fireRadius,
        FMaxZ: fireArea.position.z + fireRadius
    };
    
    const boundingTree = new THREE.Box3().setFromObject(tree);

    const treeBounds = {
        TMinX: boundingTree.min.x,
        TMaxX: boundingTree.max.x,
        TMinZ: boundingTree.min.z,
        TMaxZ: boundingTree.max.z
    }
    // console.log("着火区域：", fireAreaBounds);
    // console.log("树的区域：", treeBounds);
    // console.log('树的范围：');
    // console.log('最小点坐标：', boundingTree.min);
    // console.log('最大点坐标：', boundingTree.max);

    // 判断树的边界框是否与平面圆的范围相交：左右上下
    const isTree_outOfArea =
        (treeBounds.TMaxX < fireAreaBounds.FMinX) 
        || (treeBounds.TMinX > fireAreaBounds.FMaxX)
        || (treeBounds.TMaxZ < fireAreaBounds.FMinZ)
        || (treeBounds.TMinZ > fireAreaBounds.FMaxZ);
    // console.log('这颗树没在火焰燃烧范围内：', isTree_outOfArea);
    if (!isTree_outOfArea) {
        const index = objects.indexOf(tree);
        if (index != -1) {
            objects.splice(index, 1);
            density.splice(density.indexOf(tree), 1);
            scene.remove(tree);
        }
    }
    render();
}

