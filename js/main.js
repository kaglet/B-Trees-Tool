// function sayHello(){
//     console.log("Hello");
// }

//-----------------------------USER INPUT AND INITIALISATION

var canvas;
var rootNode;
var graphics;
var canvasWidth, canvasHeight;
const t = new BTree(2); // 2 is the max degree

function resizeCanvas(){        //function to get window size so that the canvas is in proportion to the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init() {

    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}

    resizeCanvas();
	 // A B-Tree with minimum degree 3
    t.insert(10);
    t.insert(20);
    t.insert(30);

    t.insert(2);
    t.insert(1);
    t.insert(35);


    console.log(t.root.keys);
    // console.log(t.root.C[0].keys);
    // console.log(t.root.C[1].keys);

    console.log("Traversal of the constructed tree is:");
    t.traverse();

    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawTree(t.root, canvas.width / 2 - 60, 50);

    //console.log(canvasHeight);
}

// user input and insert that value into the tree
var insertValue;
function insertKey() {
    try {
		insertValue = document.getElementById("insertKeyValue").value;
        t.insert(insertValue);
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawTree(t.root, canvas.width / 2 - 60, 50);
        document.getElementById("insertKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}

// user input and remove that value from the tree
var removalValue;
function removeKey() {
    try {
		removalValue = document.getElementById("removeKeyValue").value;
        t.remove(removalValue);
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawTree(t.root, canvas.width / 2 - 60, 50);
        document.getElementById("removeKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}