import * as THREE from 'three';
import { scene, render, pushWrapper } from './forest.js';

let density = [];
const burnTrees = [];
const trunks = [];

const startButton = document.getElementById('startSimulation');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);

function getRandomPosition(min, max) {
    return Math.random() * (max - min) + min
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

/**
 * Start create fire if there are tree on the ground
 */
function startSimulation() {
    if (density.length > 0) {
        console.log("There are trees on the ground");
        createFire();
        render();
    } else console.log("No trees on the ground and fire is no use anymore!")
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

/**
 * The trunk is a distorted cylinder with
 * a bottom base radius of 10, a top base radius of 5, and a height of 40.
 * The leaves are represented by a cylinder shape.
 */
function addRandomTree() {

    const positionX = getRandomPosition(-425, 425);
    const positionZ = getRandomPosition(-425, 425);

    const trunkShape = new THREE.CylinderGeometry(5, 10, 40, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x82571c, opacity: 0.5, transparent: true });
    const trunk = new THREE.Mesh(trunkShape, trunkMaterial);
    trunk.position.set(positionX, 20, positionZ);
    trunks.push(trunk);

    //ConeGeometry with radius-20, height-20, radialSegments-32
    const firstLeaf_shape = new THREE.ConeGeometry(20, 20, 32);
    const firstLeaf_material = new THREE.MeshBasicMaterial({ color: 0xa7e5a7 });
    const firstLeaf = new THREE.Mesh(firstLeaf_shape, firstLeaf_material);
    firstLeaf.position.set(positionX, 40, positionZ);

    //ConeGeometry with radius-15, height-20, radialSegments-32
    const secondLeaf_shape = new THREE.ConeGeometry(15, 20, 32);
    const secondLeaf_material = new THREE.MeshBasicMaterial({ color: 0x1b855c });
    const secondLeaf = new THREE.Mesh(secondLeaf_shape, secondLeaf_material);
    secondLeaf.position.set(positionX, 60, positionZ);

    // create a container to group trunk and leaves
    const container = new THREE.Object3D();
    container.add(trunk);
    container.add(firstLeaf);
    container.add(secondLeaf);

    container.name = "alive tree";
    scene.add(container);

    pushWrapper(density, container);//For testing - if it do add it to the scene
}

/**
 * create a fire, represented by a pink sphere shape
 */
function createFire() {
    // console.log(getRandomElement(density).children[0].position.y);
    const fireTree = getRandomElement(density);
    const firePosition = fireTree.children[0].position;
    const geometry = new THREE.SphereGeometry(10, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff8686 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(firePosition);
    sphere.position.y += 60
    scene.add(sphere);

    changeColor(fireTree, 0);

    scene.remove(sphere);
}

/**
 * The burning tree will gradually ignite, starting from the trunk and moving up towards the leaves. 
 * Once fully engulfed in flames, it will begin to dissipate, starting from the leaves. (removeMesh function)
 * @param {*} fireTree 
 * @param {*} currentIndex 
 */
function changeColor(fireTree, currentIndex) {
    const index = density.indexOf(fireTree);
    if (index !== -1) {
        density.splice(index, 1);
    }

    //Delay to achieve a gradient effect
    const delayTime = 1000;

    setTimeout(() => {
        const mesh = fireTree.children[currentIndex];
        mesh.material.color = new THREE.Color(0xff8686);

        render();

        currentIndex++;

        if (currentIndex < fireTree.children.length) {
            changeColor(fireTree, currentIndex);
        } else removeMesh(fireTree);
    }, delayTime);

}

/**
 * Once fully engulfed in flames, it will begin to dissipate, starting from the leaves.
 * Meanwhile check the surrondingTrees if it is influenced by flame.
 * @param {*} fireTree 
 */
function removeMesh(fireTree) {
    const index = burnTrees.indexOf(fireTree);
    if (index == -1) {
        fireTree.name = "burnTree";
        pushWrapper(burnTrees, fireTree);

        // Assist plane represent the fire areas
        const planeGeometry = new THREE.CircleGeometry(50, 32);;
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, visible: false });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        planeGeometry.rotateX(- Math.PI / 2);
        plane.position.set(fireTree.children[0].position.x, 0, fireTree.children[0].position.z)
        scene.add(plane);
        // console.log(plane.position)

        checkSurroundingTrees(50, plane.position.x, plane.position.y, plane.position.z);
    }

    const delayTime = 1000;

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

/**
 * The program determines if the surrounding trees are within the range of a fire by 
 * calculating the distances between each tree and the burning tree. 
 * If a tree is within a specified fire range, it is considered to be affected by the fire.
 * @param {*} radius 
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 */
function checkSurroundingTrees(radius, x, y, z) {
    density.forEach(element => {
        const a = new THREE.Vector3(element.children[0].position.x, 0, element.children[0].position.z);
        const b = new THREE.Vector3(x, y, z);
        const d = a.distanceTo(b);
        if (d <= radius) changeColor(element, 0)
    });

}