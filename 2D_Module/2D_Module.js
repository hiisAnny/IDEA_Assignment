var grid = document.getElementById("grid");
var density = 0.5; // 初始密度
var cells = [];

//生成网格函数
function createGrid() {
    for (var i = 0; i < 80; i++) {
        for (var j = 0; j < 80; j++) {
            var cell = document.createElement("div");
            cell.className = "cell";
            cell.addEventListener("click", function () {
                toggleFire(this); //点击就着火啦
            });
            grid.appendChild(cell);
            cells.push(cell);
        }
    }
}

//切换火焰状态函数
function toggleFire(cell) {
    if (cell.classList.contains("on-fire")) {//已经着火，点击就生长新的树啦
        cell.classList.remove("on-fire");
    } else {
        cell.classList.add("on-fire");//加一个着火的单元格，让他着火
        spreadFire();//火焰蔓延
    }
}

//火焰传播函数
function spreadFire() {
    //Array.from接受一个 类数组对象 作为参数，并返回一个由该对象的元素组成的新数组
    var fireCells = Array.from(grid.getElementsByClassName("on-fire"));

    var newFireCells = [];
    fireCells.forEach(function (cell) {
        /**
         * gridchildren是 类数组对象（Array-like object），
         * 它是一种类似数组的对象，具有类似数组的特性，
         * 具有数值键和 length 属性，但不具备数组的方法和功能
         * 但并非严格的 JavaScript 数组。
         */

        //找到着火的点的坐标行和列
        var index = Array.prototype.indexOf.call(grid.children, cell); //返回cell首次出现的索引位置
        var row = Math.floor(index / 80);
        var col = index % 80;

        //火源周围的八个格子
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

        //是否点燃的规则
        neighbors.forEach(function (neighbor) {
            if (neighbor && neighbor.classList.contains("cell") && Math.random() < 0.5) {
                //没有超过边界，且周围是树，然后再根据一定的概率（1-0.5）决定是否将这些相邻格子标记为着火状态
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
    //设置forest的范围
    if (row < 0 || row >= 80 || col < 0 || col >= 80) {
        return -1;
    }
    return row * 80 + col;
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
