// JavaScript code for the simulation
        var grid = document.getElementById("grid");
        var density = 0.5; // Initial density
        var cells = [];


//generate grid function
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
//Toggle flame state function
function toggleFire(cell) {
    if (cell.classList.contains("on-fire")) {
        cell.classList.remove("on-fire");
    } else {
        cell.classList.add("on-fire");//Add a burning cell and set it on fire
        spreadFire();//flame spread
    }
}

//flame spread function
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

        //fire or not rule
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


function getIndex(row, col) {
    //Set the scope of the forest
    if (row < 0 || row >= 80 || col < 0 || col >= 80) {
        return -1;
    }
    return row * 80 + col;
}

        // Function to start the simulation
        function startSimulation() {
            resetGrid();
            generateTrees();
        }

        // Function to reset the grid and remove fire and trees
        function resetGrid() {
            cells.forEach(function (cell) {
                cell.classList.remove("on-fire");
                cell.classList.remove("cell");
            });
        }

        // Function to generate trees with the specified density
        function generateTrees() {
            cells.forEach(function (cell) {
                if (Math.random() < density) {
                    cell.classList.add("cell");
                }
            });
        }

        // Function to increase the tree density
        function increaseDensity() {
            if (density < 1) {
                density += 0.1;
                startSimulation();
            }
        }

        // Function to decrease the tree density
        function decreaseDensity() {
            if (density > 0.1) {
                density -= 0.1;
                startSimulation();
            }
        }

        // Create the grid when the page is loaded
        createGrid();
