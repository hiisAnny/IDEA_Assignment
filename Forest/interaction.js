import * as THREE from 'three';
import { scene, objects, density, cubeGeo, cubeMaterial } from './forest.js';
import { render, pushWrapper } from './forest.js';

let fire, fireRadius, isOnFire;
const fireAreas = [];
let backsoonTree = [];

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);


export {  isOnFire };

function startSimulation() {
    if (!scene.getObjectByName("forestFire")) {
        createFire();
        isOnFire = scene.getObjectByName("forestFire");
        showFireAreas();
    }
    else {
        updateFirePosition();
    }
    // checkFire();  

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
    fire.add(new THREE.Mesh(new THREE.SphereGeometry(16, 12, 2, 0, Math.PI * 2, 0, 3.65681384877852),
        new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })));
    fire.position.set(0, 50, 0);
    fire.name = "forestFire";
    scene.add(fire);

}

function showFireAreas() {
    if (scene.getObjectByName("burning")) {
        scene.remove(scene.getObjectByName("burning"));
        
    }
    // 将角度转换为弧度
    var angleInRadians = 30 * Math.PI / 180;
    fireRadius = (fire.distance * 0.7) * Math.cos(angleInRadians);
    const fireAreaGeometry = new THREE.CircleGeometry(fireRadius, 32);
    const fireAreaMaterial = new THREE.MeshStandardMaterial({ color: 0xffa8a8, opacity: 0.5, transparent: true, visible: true });
    const fireArea = new THREE.Mesh(fireAreaGeometry, fireAreaMaterial);
    fireArea.rotateX(- Math.PI / 2);
    fireArea.position.x = fire.position.x;
    fireArea.position.z = fire.position.z;
    fireArea.name = "burning";
    scene.add(fireArea);
    if (fireAreas.length > 0) {
      const what = fireAreas.pop();
    console.log("不要火：", what);      
    }

    pushWrapper(fireAreas, fireArea);
    render();
    // fireAreas.push(fireArea);
    checkFire();
    checkBacksoonTree();
    
}

// 更新函数，用于每一帧更新小球的旋转
export function updateFire() {

    const time = Date.now() * 0.000005;

    const x = fire.position.x + Math.sin(time * 0.7) * 30; // 在 x 轴上进行偏移
    const fireX = THREE.MathUtils.clamp(x, -500 + fireRadius, 500 - fireRadius);

    const z = fire.position.z + Math.cos(time * 0.8) * 30; // 在 z 轴上进行偏移
    const fireZ = THREE.MathUtils.clamp(z, -500 + fireRadius, 500 - fireRadius);

    fire.position.set(fireX, fire.position.y, fireZ);
    showFireAreas();
    // console.log("新的：", fire.position, "距离：", fire.distance);

}

export function updateFirePosition() {

    const x = randomPosition(-500 + fireRadius, 500 - fireRadius);
    const z = randomPosition(-500 + fireRadius, 500 - fireRadius);
    fire.position.set(x, fire.position.y, z);
    showFireAreas();
}

export function checkFire() {

    if (density.length > 0 && fireAreas.length > 0) {
        // 遍历每个平面，对每个立方体进行判断
        fireAreas.forEach(fireArea => {
            // console.log("查找的这片着火区域坐标：",fireArea.position);
            density.forEach(tree => {
                // console.log("查找的这颗树坐标：", tree.position);
                const treeAlive = isTreeAlive(fireArea, tree);
                if (!treeAlive) {
                    const index = objects.indexOf(tree);
                    if (index != -1) {
                        backsoonTree.push(objects[index]);
                        console.log("暂时死亡：", backsoonTree);

                        objects.splice(index, 1);
                        density.splice(density.indexOf(tree), 1);

                        scene.remove(tree);
                        render();
                    }
                }
            });

        });
    }

}
function checkBacksoonTree() {
    if (fireAreas.length > 0 && backsoonTree.length > 0) {
    const elementsToRemove = [];

    backsoonTree.forEach(revivedTree => {
        const treeAlive = isTreeAlive(fireAreas[0], revivedTree);
    
        if (treeAlive) {
            const index = objects.indexOf(revivedTree);
            if (index === -1) {
                objects.push(revivedTree);
                pushWrapper(density, revivedTree);
                scene.add(revivedTree);
                elementsToRemove.push(revivedTree);
            }
            console.log("新长出来啦！");
        } 
        render();
    });
    
    // 移除需要移除的元素
    elementsToRemove.forEach(element => {
        const index = backsoonTree.indexOf(element);
        if (index !== -1) {
            backsoonTree.splice(index, 1);
        }
    });
    

    }
}
// 判断树是否在火焰范围内
function isTreeAlive(fireArea, tree) {

    const fireAreaBounds = {
        FMinX: fireArea.position.x - fireRadius,
        FMaxX: fireArea.position.x + fireRadius,
        FMinZ: fireArea.position.z - fireRadius,
        FMaxZ: fireArea.position.z + fireRadius
    };
    // console.log("1---------",fireAreaBounds);
    const boundingTree = new THREE.Box3().setFromObject(tree);

    const treeBounds = {
        TMinX: boundingTree.min.x,
        TMaxX: boundingTree.max.x,
        TMinZ: boundingTree.min.z,
        TMaxZ: boundingTree.max.z
    }
    // console.log("2",treeBounds);

    // 判断树的边界框是否与平面圆的范围相交：左右上下
    const isTree_outOfArea =
        (treeBounds.TMaxX < fireAreaBounds.FMinX)
        || (treeBounds.TMinX > fireAreaBounds.FMaxX)
        || (treeBounds.TMaxZ < fireAreaBounds.FMinZ)
        || (treeBounds.TMinZ > fireAreaBounds.FMaxZ);
    // console.log('这颗树没在火焰燃烧范围内：', isTree_outOfArea);
    return isTree_outOfArea; //true 活着，false 死了
}
