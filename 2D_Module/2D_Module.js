// JavaScript code for the simulation
        var grid = document.getElementById("grid");
        var density = 0.5; // Initial density
        var cells = [];

        // Function to create the grid of cells
        function createGrid() {
            for (var i = 0; i < 100; i++) {
                for (var j = 0; j < 100; j++) {
                    var cell = document.createElement("div");
                    cell.className = "cell";
                    cell.addEventListener("click", function () {
                        toggleFire(this);
                    });
                    grid.appendChild(cell);
                    cells.push(cell);
                }
            }
        }

        // Function to toggle the fire state of a cell
        function toggleFire(cell) {
            if (cell.classList.contains("on-fire")) {
                cell.classList.remove("on-fire");
            } else {
                cell.classList.add("on-fire");
                spreadFire();
            }
        }

        // Function to spread the fire to neighboring cells
        function spreadFire() {
            var fireCells = Array.from(grid.getElementsByClassName("on-fire"));

            var newFireCells = [];
            fireCells.forEach(function (cell) {
                var index = Array.prototype.indexOf.call(grid.children, cell);
                var row = Math.floor(index / 100);
                var col = index % 100;

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

                neighbors.forEach(function (neighbor) {
                    if (neighbor && neighbor.classList.contains("cell") && Math.random() < 0.5) {
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

        // Function to get the index of a cell in the grid
        function getIndex(row, col) {
            if (row < 0 || row >= 100 || col < 0 || col >= 100) {
                return -1;
            }
            return row * 100 + col;
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
