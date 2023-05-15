import { scene, objects, density } from './forest.js';
import { addRandomCube, render } from './forest.js';
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startSimulation);

const increaseButton = document.getElementById('increaseDensity');
increaseButton.addEventListener('click', increaseDensity);

const decreaseButton = document.getElementById('decreaseDensity');
decreaseButton.addEventListener('click', decreaseDensity);
  
function startSimulation() {
    
    console.log(density);
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
