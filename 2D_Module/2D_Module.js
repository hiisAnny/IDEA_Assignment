// JavaScript code for the simulation
var grid = document.getElementById("grid");
var density = 0.5; // Initial density
var cells = [];


/**
 * create a grid. 
 * It generates 100x100 cells through a loop and appends them to the grid container. 
 * Each cell is represented as a <div> element with the appropriate class name and event listeners added.
 */
function createGrid() {
    for (var i = 0; i < 80; i++) {
        for (var j = 0; j < 80; j++) {
            var cell = document.createElement("div");
            cell.className = "cell";
            cell.addEventListener("click", function () {
                toggleFire(this); //click for fire
            });
            grid.appendChild(cell);
            cells.push(cell);
        }
    }
}

/**
 * Toggle the fire state of the cell. 
 * When clicking on an unlit cell, it will add the "on-fire" class name, and trigger the flame spread.
 * @param {*} cell 
 */
function toggleFire(cell) {
    if (cell.classList.contains("on-fire")) {
        cell.classList.remove("on-fire");
    } else {
        cell.classList.add("on-fire");//Add a burning cell and set it on fire
        spreadFire();//flame spread
    }
}

/**
 * Implement the flame spreading logic. 
 * It iterates over the cell that is currently on fire, checks its neighbors, and ignites them with a certain probability. 
 * Newly fired cells will have the "on-fire" class name added, and will be recorded for use in the next propagation.
 */
function spreadFire() {
    //Array.from takes an array-like object as an argument and returns a new array consisting of the elements of that object
    var fireCells = Array.from(grid.getElementsByClassName("on-fire"));

    var newFireCells = [];
    fireCells.forEach(function (cell) {

        /**
         * gridchildren is an Array-like object,
         * It is an array-like object with array-like properties,
         * Has numeric keys and a length property, but lacks the methods and functionality of arrays
         * But not strictly JavaScript arrays.
         */

        //Find the coordinate row and column of the point on fire
        var index = Array.prototype.indexOf.call(grid.children, cell); //Returns the index position of the first occurrence of the cell
        var row = Math.floor(index / 80);
        var col = index % 80;

        //Eight tiles around the fire source
        var neighbors = [
            cells[getIndex(row - 1, col - 1)],
            cells[getIndex(row - 1, col)],
            cells[getIndex(row - 1, col + 1)],
            cells[getIndex(row, col - 1)],
            cells[getIndex(row, col + 1)],
            cells[getIndex(row + 1, col - 1)],
            cells[getIndex(row + 1, col)],
            cells[getIndex(row + 1, col + 1)]
        ];


        //Rule：fire or not 
        neighbors.forEach(function (neighbor) {
            if (neighbor && neighbor.classList.contains("cell") && Math.random() < 0.5) {
                //It does not exceed the boundary and is surrounded by trees, and then decides whether to mark these adjacent grids as on fire according to a certain probability (1-0.5)
                neighbor.classList.add("on-fire");
                newFireCells.push(neighbor);
            }
        });
    });

    // Continue spreading the fire if new cells caught fire
    if (newFireCells.length > 0) {
        setTimeout(function () {
            spreadFire();
        }, 500);
    }
}

/**
 * Get the index of the cell in the grid according to the row and column index. 
 * It calculates the unique index value by multiplying by 100 and adding the column index.
 * @param {*} row 
 * @param {*} col 
 * @returns 
 */
function getIndex(row, col) {
    //Set the scope of the forest
    if (row < 0 || row >= 80 || col < 0 || col >= 80) {
        return -1;
    }
    return row * 80 + col;
}

/**
 * Start the simulation. 
 * It resets the mesh and generates trees with the specified density.
 */
function startSimulation() {
    resetGrid();
    generateTrees();
}

/**
 * Reset the grid and remove fire and trees, 
 * restoring the class names of all cells to their initial state.
 */
function resetGrid() {
    cells.forEach(function (cell) {
        cell.classList.remove("on-fire");
        cell.classList.remove("cell");
    });
}

/**
 * generate trees with a specified density. 
 * It iterates over each cell, adding the "cell" class name with a certain probability based on the given density value, 
 * indicating that the cell is a tree.
 */
function generateTrees() {
    cells.forEach(function (cell) {
        if (Math.random() < density) {
            cell.classList.add("cell");
        }
    });
}

/**
 * They each adjust the density value and restart the simulation.
 * Increase the tree density
 */
function increaseDensity() {
    if (density < 1) {
        density += 0.1;
        startSimulation();
    }
}

/**
 * They each adjust the density value and restart the simulation.
 * Decrease the tree density
 */
function decreaseDensity() {
    if (density > 0.1) {
        density -= 0.1;
        startSimulation();
    }
}

// Create the grid when the page is loaded
createGrid();
