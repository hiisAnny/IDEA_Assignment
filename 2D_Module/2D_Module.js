var grid = document.getElementById("grid");
var density = 0.5; // 初始密度
var cells = [];

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

function toggleFire(cell) {
    if (cell.classList.contains("on-fire")) {
        cell.classList.remove("on-fire");
    } else {
        cell.classList.add("on-fire");
        spreadFire();
    }
}

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

    // 递归传播新的火源
    if (newFireCells.length > 0) {
        setTimeout(function () {
            spreadFire();
        }, 500);
    }
}

function getIndex(row, col) {
    if (row < 0 || row >= 100 || col < 0 || col >= 100) {
        return -1;
    }
    return row * 100 + col;
}

function startSimulation() {
    resetGrid();
    generateTrees();
}

function resetGrid() {
    cells.forEach(function (cell) {
        cell.classList.remove("on-fire");
        cell.classList.remove("cell");
   
    });
}

function generateTrees() {
    cells.forEach(function (cell) {
        if (Math.random() < density) {
            cell.classList.add("cell");
        }
    });
}

function increaseDensity() {
    if (density < 1) {
        density += 0.1;
        startSimulation();
    }
}

function decreaseDensity() {
    if (density > 0.1) {
        density -= 0.1;
        startSimulation();
    }
}

createGrid();
