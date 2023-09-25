// function sayHello(){
//     console.log("Hello");
// }

// import BTree from "./balancedTree.js"; // Import classes from balancedTree.js
// import { drawKey, drawNode, drawTree } from './drawTree.js';

var frameNumber = 0;

var canvas;
var rootNode;
var graphics;
var tree; // 2 is the max degree
// var insertButton = document.getElementById('insertBtn');
// var removeButton = document.getElementById('removeBtn');

var createTreeStarted = true;
function init() {
    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
        document.getElementById("max-degree").focus();
        document.getElementById("insert-delete-section").style.display = "none";
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}    
}

var insertValue;
function insertKey() {
    if (!createTreeStarted) {
        document.getElementById("error-message").innerHTML  = "";
        try {
            insertValue = document.getElementById("insert").value;
            //ensure a traverse is called after an insert to allow for cleaning tree
            try{
                if (insertValue === ""){
                    console.log("Enter a number");
                    document.getElementById("error-message").innerHTML  = "Please enter a key to insert";
                } else {
                    tree.insert(parseInt(insertValue));
                    tree.traverse();
                    document.getElementById("insert").focus();
                    document.getElementById("error-message").innerHTML  = "";
                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            drawTree(tree.root, canvas.width / 2, 30);
      
            document.getElementById("insert").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

// user input and remove that value from the tree
var removeValue;
function removeKey() {
    if (!createTreeStarted) {
        document.getElementById("error-message").innerHTML  = "";
        try {
            removeValue = document.getElementById("delete").value;
            //ensure a traverse is called after a removal to allow for cleaning tree
            try{
                if (removeValue === ""){
                    console.log("Enter a number");
                    document.getElementById("error-message").innerHTML  = "Please enter a key to remove";
                } else {
                    tree.remove(parseInt(removeValue));
                    tree.traverse();
                    document.getElementById("delete").focus();
                    document.getElementById("error-message").innerHTML  = "";

                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            drawTree(tree.root, canvas.width / 2, 30);
           
            document.getElementById("delete").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

var maxDegree;
function createTree() {
    if (createTreeStarted) {
        try {
            maxDegree = document.getElementById("max-degree").value;
            //ensure a traverse is called after a removal to allow for cleaning tree
            try{
                if (maxDegree === ""){
                    console.log("Enter a max degree value");
                    document.getElementById("error-message").innerHTML  = "Enter a max degree value before creating a tree";
                } else {
                    document.getElementById("error-message").innerHTML  = "";
                    tree = new BTree(parseInt(maxDegree));
                    document.getElementById("custom-tree-btn").innerHTML  = "Cancel";
		            document.getElementById("insert").focus();
                    createTreeStarted= false;
                    console.log(document.getElementById("insert-delete-section").style.display)
                    if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
                        document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
                    } else {
                        document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
                    }
                }
            } catch(e) {
                console.log(e);
            }
            document.getElementById("max-degree").value = null;
        } catch(e) {
            console.log(e);
        }
        
    } else {
        console.log("Tree Creation Canceled");
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        document.getElementById("custom-tree-btn").innerHTML  = "Custom tree";
        document.getElementById("max-degree").focus();
        createTreeStarted= true;
        console.log(document.getElementById("insert-delete-section").style.display)
        if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
            document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
        } else {
            document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
        }
    }
}


// insertButton.addEventListener( 'click', () => {
//     insertKey();    
// } );

// removeButton.addEventListener( 'click', () => {
//     removeKey();    
// } );

