// function sayHello(){
//     console.log("Hello");
// }

// import BTree from "./balancedTree.js"; // Import classes from balancedTree.js
// import { drawKey, drawNode, drawTree } from './drawTree.js';

var frameNumber = 0;

var canvas;
var rootNode;
var graphics;
const tree = new BTree(2); // 2 is the max degree
var insertButton = document.getElementById('insertBtn');
var removeButton = document.getElementById('removeBtn');

function init() {
    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}

	// A B-Tree with minimum degree 3
    tree.insert(100);
    tree.traverse();
    tree.insert(200);
    tree.traverse();
    tree.insert(300);
    tree.traverse();

    tree.insert(150);
    tree.traverse();
    tree.insert(250);
    tree.traverse();
    tree.insert(350);
    tree.traverse();

    tree.insert(50);
    tree.traverse();
    tree.insert(275);
    tree.traverse();
    tree.insert(380);
    tree.traverse();

    // console.log("Traversal of the constructed tree is:");
    // tree.traverse();

    console.log("The Tree:");
    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawTree(tree.root, canvas.width / 2 - 60, 50);

    
}

// export default init;

// user input and insert that value into the tree
var insertValue;
function insertKey() {
    try {
		insertValue = document.getElementById("insertKeyValue").value;
        //ensure a traverse is called after an insert to allow for cleaning tree
        try{
            if (insertValue === ""){
                console.log("Enter a number");
            } else {
                tree.insert(parseInt(insertValue));
                tree.traverse();
            }
        } catch(e) {
            console.log(e);
        }
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        console.log("The Tree:");
        drawTree(tree.root, canvas.width / 2 - 60, 50);
        document.getElementById("insertKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}
// user input and remove that value from the tree
var removeValue;
function removeKey() {
    try {
		removeValue = document.getElementById("removeKeyValue").value;
        //ensure a traverse is called after a removal to allow for cleaning tree
        try{
            if (removeValue === ""){
                console.log("Enter a number");
            } else {
                tree.remove(parseInt(removeValue));
                tree.traverse();
            }
        } catch(e) {
            console.log(e);
        }
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        console.log("The Tree:");
        drawTree(tree.root, canvas.width / 2 - 60, 50);
        document.getElementById("removeKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}

insertButton.addEventListener( 'click', () => {
    insertKey();    
} );

removeButton.addEventListener( 'click', () => {
    removeKey();    
} );

// document.addEventListener("DOMContentLoaded", function () {
//     // Your initialization code here
//     init(); // Call your init function
// });

//document.addEventListener("DOMContentLoaded", init);



