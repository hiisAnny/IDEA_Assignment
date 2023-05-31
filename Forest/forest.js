import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { increaseDensity } from './interaction.js';

let camera, scene, renderer, pointer, raycaster, controls;
let plane, container, gridHelper;

// Objects to be raycasted
const objects = [];


// For testing - Event to notify new element added to the array, to increse the tree density
const newElement_toArray = new Event('newElement_toArray');
const pushWrapper = (arr, element) => {
    arr.push(element);
    document.dispatchEvent(newElement_toArray);
};

export { scene, pushWrapper };

function init() {
    const forest = document.getElementById("forest");
    const fWidth = forest.clientWidth
    const fHeight = forest.clientHeight
    camera = new THREE.PerspectiveCamera(45, fWidth / fHeight, 1, 10000);
    camera.position.set(300, 600, 1400);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6fafc);

    // For testing - Basic Tree with mouse moving
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

    container = new THREE.Group(); // Create a container object
    container.add(trunk); // Add trunk to the container
    container.add(firstLeaf); // Add first leaf to the container
    container.add(secondLeaf); // Add second leaf to the container
    scene.add(container); // Add the container object to the scene

    // For testing - grid help identify the tree or fire position
    // gridHelper = new THREE.GridHelper(1000, 20);
    // gridHelper.material.color.set(0xe6fafc);
    // scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    /**
     * This is a assist plane object plane
     * The raycaster passes through the plane to determine the intersection point
     * which corresponds to the position of the mouse。
     * Make it tangent to the horizontal plane of the scene, parallel to the horizontal plane of the grid.
     */
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    // Create a plane background for grid which is the ground surface
    const backgroundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const backgroundMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2f2 });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundGeometry.rotateX(- Math.PI / 2);
    backgroundPlane.position.set(0, -1, 0); 
    scene.add(backgroundPlane);

    //Here is the ground with 50 deep
    const cubeGeometry = new THREE.BoxGeometry(1000, 50, 1000);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffe4d3 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0,-30,0);
    scene.add(cube);

    
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    forest.appendChild(renderer.domElement);
    
    //create some random trees on our ground
    for (let i = 0; i < 150; i++) {
        increaseDensity();
    }
    controls = new OrbitControls(camera, renderer.domElement);
    document.addEventListener('pointermove', onPointerMove);


    //new tree add into density array
    document.addEventListener('newElement_toArray', () => {
        // console.log("new tree create");
    });

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {
    const forest = document.getElementById("forest");
    const fWidth = forest.clientWidth
    const fHeight = forest.clientHeight 

    camera.aspect = fWidth / fHeight;
    renderer.setSize(fWidth, fHeight);
    camera.updateProjectionMatrix();
    render()
}


/**
 * Mouse (x, y) -> Normalized Device Coordinates (NDC)
 * Normalized Device Coordinates is a 2D coordinate system with a range of [-1, 1],
 * where -1 represents the left/bottom of the screen, and 1 represents the right/top of the screen.
 * Used for consistent calculations and representation across different resolutions and device sizes.
 * @param {*} event 
 */
function onPointerMove(event) {
    // Convert the screen coordinates of the mouse pointer to coordinates in camera space
    const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
    const ndcY = - (event.clientY / window.innerHeight) * 2 + 1;
    pointer.set(ndcX, ndcY);

    /**
     * NDC -> Coordinates (x, y, z) in camera space
     * Update the starting point and direction of the raycaster to be the camera position
     * and the direction from the camera position.
     */
    raycaster.setFromCamera(pointer, camera);

    /**
     * The Raycaster object is used for raycasting, which is the process of finding intersections between a ray and objects in the scene.
     * By setting the starting point (camera position) and direction of the ray, the raycaster can cast a ray and return the intersections with objects.
     * False: Only consider objects in the specified objects list for intersection checks, ignoring their children. True on the other side.
     * intersects is an array containing the intersection results, where each result is an object.
     */
    const intersects = raycaster.intersectObjects(objects, true);

    /**
     * After performing raycasting, ‘intersect.point’ provides the position of the intersection point in world coordinates.
     * Copy the coordinates of the intersection point to ‘container.position’ using the copy method.
     * Add the normal direction of the intersected face to ‘container.position’ to update the position of container.
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

init();
render();