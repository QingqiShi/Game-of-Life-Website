//save function
function save_local(object){
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        var grid = gridToString(object);
        localStorage.setItem("lastGrid", grid);

    } else {
        // Sorry! No Web Storage support..
        alert("Web storage is unsupported in your browser.");

    }
};

function clear_local(){
    if(localStorage.getItem("lastGrid") != null){
        localStorage.removeItem("lastGrid");
    }
};

function local_exist(){
    if(localStorage.getItem("lastGrid") != null){
        return true;
    }else{
        return false;
    }
};
function initialiseObject(object, cellSize, canvas){

    object.CELL_SIZE = cellSize;
    object.X = (canvas.width-canvas.width%object.CELL_SIZE)*2;
    object.Y = (canvas.height-canvas.height%object.CELL_SIZE)*2;
    object.WIDTH = object.X / object.CELL_SIZE;
    object.HEIGHT = object.Y / object.CELL_SIZE;
    object.DEAD = 0;
    object.ALIVE = 1;
    object.DELAY = 500;
    object.STOPPED = 0;
    object.RUNNING = 1;

    object.minimum = 2;
    object.maximum = 3;
    object.spawn = 3;

    object.state = object.STOPPED;
    object.interval = null;

    object.grid = Array.matrix(object.HEIGHT, object.WIDTH, 0);

    object.counter = 0;
};
//convert string from database to grid to load the game
function stringToGrid(str,object){
    object.CELL_SIZE = parseInt(str.substring(str.indexOf("C")+1,str.indexOf("X")));
    object.X = parseInt(str.substring(str.indexOf("X")+1,str.indexOf("Y")));
    object.Y = parseInt(str.substring(str.indexOf("Y")+1,str.indexOf("L")));
    object.WIDTH = object.X / object.CELL_SIZE;
    object.HEIGHT = object.Y / object.CELL_SIZE;
    var coord = str.slice(str.indexOf("L")+1);
    object.grid = Array.matrix(object.Y, object.X, 0);

    while(!coord.startsWith("E")){
        var coords = coord.substring(0,coord.indexOf("/"));
        var loc = coords.split(",");
        object.grid[parseInt(loc[0])][parseInt(loc[1])] = 1;
        coord = coord.slice(coord.indexOf("/")+1);
    }
};
function gridToString(object){
    var string = "C";
    //the first value is CELL_SIZE
    string = string.concat(object.CELL_SIZE.toString());
    string = string.concat("X");
    //second is X
    string = string.concat(object.X.toString());
    string = string.concat("Y");
    //third is Y
    string = string.concat(object.Y.toString());
    string = string.concat("L");
    //the remainings are the coordinates of the cells that have state of ALIVE
    for(var i = 0; i < object.WIDTH; i++) {
        for(var z = 0; z < object.HEIGHT; z++) {
            if(object.grid[z][i]==object.ALIVE){
                var xCoord = z;
                var yCoord = i;
                var tempS = "";
                tempS = tempS.concat(xCoord.toString(),",",yCoord.toString());
                string = string.concat(tempS);
                string = string.concat("/");
            }
        }
    }
    string = string.concat("E");
    return string;
};
Array.matrix = function (m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = 0;
        }
        mat[i] = a;
    }
    return mat;
};
var Life = {};
var savedLife = {};

document.addEventListener("DOMContentLoaded", function() {
    var wrapper = document.getElementsByClassName('on_canvas_controls')[0];
    var canvas = document.getElementById('game_canvas');
    canvas.setAttribute("width", wrapper.offsetWidth);
    canvas.setAttribute("height", wrapper.offsetHeight);

    // From JavaScript: The good parts - Chapter 6. Arrays, Section 6.7. Dimensions
    var gridCanvas = document.getElementById('game_canvas');
    var counterSpan = document.getElementById("counter");
    var controlLinkStart = document.getElementById("start");
    var controlLinkStop = document.getElementById("stop");
    var clearLink = document.getElementById("clearLink");
    var zoomInLink = document.getElementById("zoomin");
    var zoomOutLink = document.getElementById("zoomout");
    var zoomLink = document.getElementById("zoom");
    var speedUpLink = document.getElementById("speedup");
    var speedDownLink = document.getElementById("speeddown");
    var speedRangeLink = document.getElementById("speed");

    var loadedValue = document.getElementById('loaded_data').innerHTML;
    loadedValue = loadedValue.toString();


    var width = gridCanvas.width;
    var height = gridCanvas.height;

    //initialise objects
    initialiseObject(Life,8,gridCanvas);
    savedLife.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);
    if(local_exist()){
       load_local(Life);
       clear_local();
   }
    if(loadedValue != ""){
        stringToGrid(loadedValue,Life);
    }



    var context = gridCanvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    drawGrid(context,Life);
    updateAnimations(Life);


    Life.updateState = function() {
        var neighbours;

        var nextGenerationGrid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);

        for (var h = 0; h < Life.HEIGHT; h++) {
            for (var w = 0; w < Life.WIDTH; w++) {
                neighbours = Life.calculateNeighbours(h, w);
                if (Life.grid[h][w] == Life.ALIVE) {
                    if ((neighbours >= Life.minimum) && (neighbours <= Life.maximum)) {
                        nextGenerationGrid[h][w] = Life.ALIVE;
                    }
                } else {
                    if (neighbours == Life.spawn) {
                        nextGenerationGrid[h][w] = Life.ALIVE;
                    }
                }
            }
        }
        copyGrid(nextGenerationGrid, Life.grid);
        Life.counter++;
    };

    Life.calculateNeighbours = function(y, x) {
        if(Life.grid[y][x]==Life.DEAD){
            var total = 0;
        }else{
            var total = -1;
        }
        for (var h = -1; h <= 1; h++) {
            for (var w = -1; w <= 1; w++) {
                if (Life.grid[(Life.HEIGHT + (y + h)) % Life.HEIGHT][(Life.WIDTH + (x + w)) % Life.WIDTH] !== Life.DEAD) {
                    total++;
                }
            }
        }
        return total;
    };
    function load_local(object){
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if(localStorage.getItem("lastGrid") != null){
                if(localStorage.lastGrid.toString()!=""){
                    stringToGrid(localStorage.lastGrid.toString(),Life);

                }
            }
        } else {
            // Sorry! No Web Storage support..
            alert("Web storage is unsupported in your browser.");

        }
    };
    window.addEventListener('resize', function(){
        saveGrid();
        var wrapper = document.getElementsByClassName('on_canvas_controls')[0];
        var canvas = document.getElementById('game_canvas');
        canvas.setAttribute("width", wrapper.offsetWidth);
        canvas.setAttribute("height", wrapper.offsetHeight);
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        drawGrid(context,Life);
        copyGrid(savedLife.grid,Life.grid);
        updateAnimations(Life);

    }, true);
    //save function
    function saveGrid(){
        savedLife.CELL_SIZE = Life.CELL_SIZE;
        savedLife.X = Life.X;
        savedLife.Y = Life.Y;
        savedLife.WIDTH = Life.WIDTH;
        savedLife.HEIGHT = Life.HEIGHT;
        copyGrid(Life.grid,savedLife.grid);

    };
    //load function
    function loadGrid(){
        Life.CELL_SIZE = savedLife.CELL_SIZE;
        Life.X = savedLife.X;
        Life.Y = savedLife.Y;
        Life.WIDTH = savedLife.WIDTH;
        Life.HEIGHT = savedLife.HEIGHT;
        var context = gridCanvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        drawGrid(context,Life);
        copyGrid(savedLife.grid,Life.grid);
    };
    function Cell(row, column) {
        this.row = row;
        this.column = column;
    };

    // start button execution
    controlLinkStart.onclick = function() {
        if(Life.state == Life.STOPPED){
            if (controlLinkStop.classList.contains("active")) {
                controlLinkStop.classList.remove("active");
            }
            if (!controlLinkStart.classList.contains("active")) {
                controlLinkStart.classList.add("active");
            }
            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
            Life.state = Life.RUNNING;
        }
    };
    function pause(life){
        if(life.state == life.RUNNING){
            if (controlLinkStart.classList.contains("active")) {
                controlLinkStart.classList.remove("active");
            }
            if (!controlLinkStop.classList.contains("active")) {
                controlLinkStop.classList.add("active");
            }
            clearInterval(life.interval);
            life.state = life.STOPPED;
        }
    };
    // stop button execution
    controlLinkStop.onclick = function() {
        pause(Life);
    };

    // clean button execution
    clearLink.onclick = function() {
        if (controlLinkStart.classList.contains("active")) {
            controlLinkStart.classList.remove("active");
        }
        if (!controlLinkStop.classList.contains("active")) {
            controlLinkStop.classList.add("active");
        }
        Life.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);
        Life.counter = 0;
        clearInterval(Life.interval);
        Life.state = Life.STOPPED;
        update();
    };
    //speed up button execution
    speedUpLink.onclick = function() {
        if(Life.state == Life.RUNNING){
            if(Life.DELAY>=70){
                Life.DELAY-=20;
            }
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
            speedRangeLink.value = 550 - Life.DELAY;

        }
    };

    //speed down button execution
    speedDownLink.onclick = function() {
        if(Life.state == Life.RUNNING){
            if(Life.DELAY<=480){
                Life.DELAY+=20;
            }
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
            speedRangeLink.value = 550 - Life.DELAY;

        }
    };

    speedRangeLink.onchange = function() {
        if(Life.state == Life.RUNNING){
            Life.DELAY = 550 - speedRangeLink.value;
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
        }
    };

    zoomInLink.onclick = function(){
        if(Life.CELL_SIZE<=31){
            Life.CELL_SIZE+=1;
            Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
            Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
            Life.WIDTH = Life.X / Life.CELL_SIZE;
            Life.HEIGHT = Life.Y / Life.CELL_SIZE;
            var context = gridCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            drawGrid(context,Life);
            updateAnimations(Life);
            zoomLink.value = Life.CELL_SIZE;

        }
    };
    zoomOutLink.onclick = function(){
        if(Life.CELL_SIZE>=9){
            Life.CELL_SIZE-=1;
            Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
            Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
            Life.WIDTH = Life.X / Life.CELL_SIZE;
            Life.HEIGHT = Life.Y / Life.CELL_SIZE;
            var context = gridCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            drawGrid(context,Life);
            updateAnimations(Life);
            zoomLink.value = Life.CELL_SIZE;
        }
    };
    zoomLink.onchange = function(){
        Life.CELL_SIZE = zoomLink.value;
        Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
        Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
        Life.WIDTH = Life.X / Life.CELL_SIZE;
        Life.HEIGHT = Life.Y / Life.CELL_SIZE;
        var context = gridCanvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        drawGrid(context,Life);
        updateAnimations(Life);
        // console.log(Life.CELL_SIZE);
    };


    function update() {
        Life.updateState();
        updateAnimations(Life);
    };

    //copy grid from source to target
    function copyGrid(source,target){
        // for (var h = 0; h < target.length; h++) {
        //     target[h] = source[h].slice(0);
        // }
        var height = Math.min(target.length,source.length);


        for(var h = 0; h < height; h++) {
            var targets = target[h];
            var width1 = target[h];
            var width2 = source[h];
            var width = Math.min(width1.length,width1.length);
            for(var w = 0; w < width; w++) {
                target[h][w] = source[h][w];

            }
        }
    };


    function updateAnimations(life) {
        for (var h = 0; h < life.HEIGHT; h++) {
            for (var w = 0; w < life.WIDTH; w++) {
                if (life.grid[h][w] === life.ALIVE) {
                    context.fillStyle = "#555";

                } else {
                    context.fillStyle = "#f6f6f6";
                    //context.clearRect();
                }
                context.fillRect(
                    w * life.CELL_SIZE +1,
                    h * life.CELL_SIZE +1,
                    life.CELL_SIZE -1,
                    life.CELL_SIZE -1);
                }
            }
            counterSpan.innerHTML = life.counter;
        };

        function drawGrid(context,life){


            for (var x = 0; x <= life.X; x += life.CELL_SIZE) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, life.Y);
                console.log(life.CELL_SIZE);

            }
            for (var y = 0; y <= life.Y; y += life.CELL_SIZE) {
                context.moveTo(0, 0.5 + y);
                context.lineTo(life.X, 0.5 + y);
            }
            context.strokeStyle = "#ffffff";
            context.stroke();
        };
        if (gridCanvas.getContext) {
            var context = gridCanvas.getContext('2d');
            var offset = Life.CELL_SIZE;
            drawGrid(context,Life);

            var mouseDownFlag = false;

            function canvasHoldHandler(event) {
                if (mouseDownFlag) {
                    var cell = getCursorPosition(event);
                    Life.grid[cell.row][cell.column] = Life.ALIVE;
                    updateAnimations(Life);
                }
            };

            function canvasClickHandler(event) {
                var cell = getCursorPosition(event);
                if(Life.grid[cell.row][cell.column] == Life.ALIVE){
                    var state = Life.DEAD;
                }else{
                    var state = Life.ALIVE;
                }
                Life.grid[cell.row][cell.column] = state;
                updateAnimations(Life);
            };

            function getCursorPosition(event) {
                var x;
                var y;
                if (event.pageX || event.pageY) {
                    x = event.pageX;
                    y = event.pageY;
                } else {
                    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                x -= gridCanvas.offsetLeft + gridCanvas.offsetParent.offsetLeft;
                y -= gridCanvas.offsetTop + gridCanvas.offsetParent.offsetTop;


                var cell = new Cell(Math.floor(y / Life.CELL_SIZE), Math.floor(x / Life.CELL_SIZE));
                return cell;
            };

            gridCanvas.addEventListener("click", canvasClickHandler, false);
            gridCanvas.addEventListener("mousedown", function() {
                mouseDownFlag = true;
            }, false);
            gridCanvas.addEventListener("mouseup", function() {
                mouseDownFlag = false;
            }, false);
            gridCanvas.addEventListener("mousemove", canvasHoldHandler, false);
        } else {
            alert("Canvas is unsupported in your browser.");
        }
    }
);
