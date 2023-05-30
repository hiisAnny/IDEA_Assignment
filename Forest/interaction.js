import * as THREE from 'three';
import { scene } from './forest.js';
import { render, pushWrapper } from './forest.js';
let density = [];
const burnTrees = [];
let fire, fireRadius, isOnFire;
const fireAreas = [];
const trunks = [];

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);


export { isOnFire };
function getRandomPosition(min, max) {
    return Math.random() * (max - min) + min
}
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function startSimulation() {
    if (density.length > 0) {
        console.log("has tree?");
        createFire();
        render();
    } else console.log("No trees anymore!")
}

export function increaseDensity() {
    addRandomTree();
    render();
}

function decreaseDensity() {
    if (density.length != 0) {
        const lastObject = scene.children[scene.children.length - 1];
        scene.remove(lastObject);
        density.pop();
        render();
    }
}


function addRandomTree() {

    const positionX = getRandomPosition(-425, 425);
    const positionZ = getRandomPosition(-425, 425);

    // 悬浮的树
    const trunkShape = new THREE.CylinderGeometry(5, 10, 40, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x82571c, opacity: 0.5, transparent: true });
    const trunk = new THREE.Mesh(trunkShape, trunkMaterial);
    trunk.position.set(positionX, 20, positionZ);
    trunks.push(trunk);

    const firstLeaf_shape = new THREE.ConeGeometry(20, 20, 32);
    const firstLeaf_material = new THREE.MeshBasicMaterial({ color: 0xa7e5a7 });
    const firstLeaf = new THREE.Mesh(firstLeaf_shape, firstLeaf_material);
    firstLeaf.position.set(positionX, 40, positionZ);

    const secondLeaf_shape = new THREE.ConeGeometry(15, 20, 32);
    const secondLeaf_material = new THREE.MeshBasicMaterial({ color: 0x1b855c });
    const secondLeaf = new THREE.Mesh(secondLeaf_shape, secondLeaf_material);
    secondLeaf.position.set(positionX, 60, positionZ);

    const container = new THREE.Object3D(); // 创建一个容器对象
    container.add(trunk); // 将rollOverMesh添加到容器中
    container.add(firstLeaf); // 将coneMesh添加到容器中
    container.add(secondLeaf); // 将coneMesh添加到容器中

    container.name = "alive tree";
    // 将立方体添加到场景中
    scene.add(container);
    pushWrapper(density, container);
}
/**
 * 斜边是100，直边距离是50，球的半径是16
 * 火苗边缘到地面的距离是 50-16 = 34
 */
function createFire() {
    // console.log(getRandomElement(density).children[0].position.y);
    const fireTree = getRandomElement(density);
    const firePosition = fireTree.children[0].position;
    // console.log(fireTree);
    const geometry = new THREE.SphereGeometry(10, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff8686 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(firePosition);
    sphere.position.y += 60
    scene.add(sphere);

    changeColor(fireTree, 0);
    scene.remove(sphere);
}

function changeColor(fireTree, currentIndex) {
    //删掉这棵树
    const index = density.indexOf(fireTree);
    if (index !== -1) {
        density.splice(index, 1);
    }

    const delayTime = 1000; // 3秒

    // 延迟一定时间后执行颜色变化的操作
    setTimeout(() => {
        const mesh = fireTree.children[currentIndex];
        mesh.material.color = new THREE.Color(0xff8686); 

        render();

        currentIndex++; // 增加索引

        if (currentIndex < fireTree.children.length) {
            changeColor(fireTree, currentIndex);
        } else removeMesh(fireTree);
    }, delayTime);

}

function removeMesh(fireTree) {

    const index = burnTrees.indexOf(fireTree);
    if (index == -1) {
        fireTree.name = "burnTree";
        pushWrapper(burnTrees, fireTree);
        // console.log(burnTrees);
        // 创建辅助平面
        const planeGeometry = new THREE.CircleGeometry( 50, 32 );; // 根据实际需要调整平面的宽度和深度
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, visible: false });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        planeGeometry.rotateX(- Math.PI / 2); //使其与场景的水平面相切，平行于网格的水平面

        plane.position.set(fireTree.children[0].position.x, 0, fireTree.children[0].position.z)
        scene.add(plane);console.log(plane.position)
        checkSurroundingTrees(50, plane.position.x, plane.position.y, plane.position.z);
    }

    const delayTime = 1000;

    // 延迟一定时间后执行删除操作
    setTimeout(() => {

        fireTree.children.pop();
        render();

        if (fireTree.children.length != 0) {
            removeMesh(fireTree);
        } else {
            increaseDensity();
        }
    }, delayTime);


}


function checkSurroundingTrees(radius,x,y,z) {
    density.forEach(element => {

        const a = new THREE.Vector3(element.children[0].position.x, 0, element.children[0].position.z);
        const b = new THREE.Vector3(x, y, z);
        const d = a.distanceTo(b);
        if(d<=radius) changeColor(element,0)
    });

}

