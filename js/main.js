import { assignNodePositions } from "./assign-positions.js";
import { drawTree } from "./drawTree.js";
import { makeTree } from "./makeTree.js";
import { BTree } from "./balancedTree.js";

// DECLARE GLOBAL VARIABLES
let offsetX = 0;
var frameNumber = 0;

var canvas;
var rootNode;
var graphics;
var tree;
var userTree;

var createTreeStarted = true;
var randomTreeStarted = true;

function initCreate() {
    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
        document.getElementById("max-degree").focus();
        document.getElementById("insert-delete-section").style.display = "none";
        document.getElementById("parameters-container").style.display = "flex";
        document.getElementById("parameters-container-q").style.display = "none";
        document.getElementById("custom-tree-btn").style.display = "flex";
        document.getElementById("validate-button").style.display = "none";
        document.getElementById("save-button").style.display = "flex";
	} catch(e) {
		document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
	}    
}


var insertValue;
function insertKeyCreate() {
    if (!createTreeStarted  || !randomTreeStarted) {
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

                    userTree.insert(parseInt(insertValue));
                    userTree.traverse();

                    document.getElementById("insert").focus();
                    document.getElementById("error-message").innerHTML  = "";
                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            //drawTree(tree.root, canvas.width / 2, 30);
            makeTree(tree.root, canvas.width / 2, 30);

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
function removeKeyCreate() {
    if (!createTreeStarted || !randomTreeStarted) {
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

                    userTree.remove(parseInt(removeValue));
                    userTree.traverse();

                    document.getElementById("delete").focus();
                    document.getElementById("error-message").innerHTML  = "";

                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            //drawTree(tree.root, canvas.width / 2, 30);
            makeTree(tree.root, canvas.width / 2, 30);

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
    if (randomTreeStarted) {
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
                        userTree = new BTree(parseInt(maxDegree));
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
    } else {
        document.getElementById("error-message").innerHTML  = "Cancel Random Tree Creation before new Custom Tree";
    }

}

var NumKeys;
function randomTree() {
    if (createTreeStarted) {
        if (randomTreeStarted) {
            try {
                maxDegree = document.getElementById("max-degree").value;
                NumKeys = document.getElementById("num-keys").value;
                //ensure a traverse is called after a removal to allow for cleaning tree
                try{
                    if (maxDegree === ""){
                        console.log("Enter a max degree value");
                        document.getElementById("error-message").innerHTML  = "Enter a max degree value before randomizing a tree";
                    } else  if (NumKeys === ""){
                        console.log("Enter a num keys value");
                        document.getElementById("error-message").innerHTML  = "Enter a num keys value before randomizing a tree";
                    } else {
                        document.getElementById("error-message").innerHTML  = "";
                        // randomise here
                        tree = new BTree(parseInt(maxDegree));
                        userTree = new BTree(parseInt(maxDegree));
                        
                        generateRandomTree();
                        document.getElementById("random-tree-btn").innerHTML  = "Cancel";
                        document.getElementById("insert").focus();
                        randomTreeStarted= false;
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
                document.getElementById("num-keys").value = null;
            } catch(e) {
                console.log(e);
            }
        } else {
            console.log("Tree Randomization Canceled");
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            document.getElementById("random-tree-btn").innerHTML  = "Randomize Tree";
            document.getElementById("max-degree").focus();
            randomTreeStarted= true;
            console.log(document.getElementById("insert-delete-section").style.display)
            if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
                document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
            } else {
                document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
            }
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Cancel Custom Tree Creation before new Random Tree";
    }
}

function MoveCanvas(move) {
    if (!createTreeStarted || !randomTreeStarted) {
        if (move == 'l') {
            // Move canvas's graphics to the left
            offsetX -= 30;
        } else if (move == 'r') {
            // Move canvas's graphics to the right
            offsetX += 30;
        } else {
            // Reset canvas's graphics
            offsetX = 0;
        }

        graphics.clearRect(0, 0, canvas.width, canvas.height);
        graphics.setTransform(1, 0, 0, 1, offsetX, 0);
        //drawTree(tree.root, canvas.width / 2 - 60, 50);
        makeTree(tree.root, canvas.width / 2 - 60, 50);
        graphics.setTransform(1, 0, 0, 1, 0, 0);
    }
}

function generateRandomTree() {
    const seed = new Date().getTime().toString();
    console.log(seed);
    // Math.seed(seed);

    for (let i = 0; i < parseInt(NumKeys); i++) {
        const key = Math.floor(Math.random() * 100); 
        tree.insert(parseInt(key));
        tree.traverse();

        userTree.insert(parseInt(key));
        userTree.traverse();
    }

    graphics.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(tree.root, canvas.width / 2 - 60, 50, canvas);
}

function moveCanvas(direction) {
    if (direction == 'l') {
        // Move canvas's graphics to the left
        offsetX -= 30;
    } else if (direction == 'r') {
        // Move canvas's graphics to the right
        offsetX += 30;
    } else {
        // Reset canvas's graphics
        offsetX = 0;
    }

    graphics.clearRect(0, 0, canvas.width, canvas.height);
    graphics.setTransform(1, 0, 0, 1, offsetX, 0);

    makeTree(tree.root, canvas.width / 2 - 60, 50, canvas);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function generateRandomQuestion() {
    const question = Math.floor(Math.random() * 3);
    let key = Math.floor(Math.random() * 100);
    let questionDisplay = document.getElementById("question");
    if (question == 0) {
        //insert
        tree.insert(parseInt(key));
        tree.traverse();

        userTree.insert(parseInt(key));
        userTree.traverse();
        console.log("Insert: ", key)
        document.getElementById("question").innerHTML  = "Insert: "+  key;
    } else if (question==1){
        //delete
        while (tree.root.search(key) == null) {
            key = Math.floor(Math.random() * 100);
        }
        tree.remove(key);
        tree.traverse();

        userTree.remove(key);
        userTree.traverse();

        console.log("Delete: ", key)
        document.getElementById("question").innerHTML  = "Delete: "+ key;
    } else if (question==2){
        //search
        questionDisplay.textContent = "Search: " + key;
    }
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    drawTree(tree.root, canvas.width / 2 - 60, 50, canvas);
}

//userTree = SOME KIND OF CONVERSION of tree

function saveTree() {

    document.getElementById("parameters-container").style.display = "none";
    document.getElementById("parameters-container-q").style.display = "flex";
    document.getElementById("custom-tree-btn").style.display = "none";
    document.getElementById("validate-button").style.display = "flex";
    document.getElementById("save-button").style.display = "none";
    document.getElementById("insert-delete-section").style.display = "none";
    validateTree();
}

function validateTree(){
    var treeEqual = areBtreesEqual(tree, userTree);
    if (treeEqual){
        console.log("Your tree is correct");
    } else {
        console.log("Your tree is in-correct");
    }
}


function areBtreesEqual(tree1, tree2) {
    // Helper function for in-order traversal
    function inOrderTraversal(node, keys) {
        if (node) {
            for (let i = 0; i < node.n; i++) {
                inOrderTraversal(node.C[i], keys);
                keys.push(node.keys[i]);
            }
            inOrderTraversal(node.C[node.n], keys);
        }
    }

    const keys1 = [];
    const keys2 = [];

    // Perform in-order traversal on both trees and collect keys
    inOrderTraversal(tree1.root, keys1);
    inOrderTraversal(tree2.root, keys2);

    // Compare the collected key sequences
    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let i = 0; i < keys1.length; i++) {
        if (keys1[i] !== keys2[i]) {
            return false;
        }
    }

    return true;
}
 

let insertButton = document.querySelector('button.insert');
let deleteButton = document.querySelector('button.delete');

let insertInput = document.getElementById('insert');
let deleteInput = document.getElementById('delete');

let customTreeButton = document.querySelector('button.custom-tree');
let randomTreeButton = document.querySelector('button.random-tree');
let randomQuestionButton = document.querySelector('.random-question');

let maxDegreeInput = document.getElementById('max-degree');
let numKeysInput = document.getElementById('num-keys');

let directionalButtons = document.querySelectorAll('.panning-controls button');

let errorMessageLabel = document.getElementById('error-message');

directionalButtons.forEach((button) => button.addEventListener('click', () => {
    moveCanvas(button.className);
}));

insertButton.addEventListener('click', () => {
    if (insertInput.value) {
        tree.insert(+insertInput.value);
        draw();
        errorMessageLabel.textContent = "";
        return;
    }

    errorMessageLabel.textContent = "Please enter a key to insert";
});

deleteButton.addEventListener('click', () => {
    if (deleteInput.value) {
        tree.remove(+deleteInput.value);
        draw();
        errorMessageLabel.textContent = "";
        return;
    }

    errorMessageLabel.textContent = "Please enter a key to delete";
});

customTreeButton.addEventListener('click', () => {
    if (maxDegreeInput.value) {
        tree = new BTree(+maxDegreeInput.value);
        graphics.clearRect(0, 0, canvas.width, canvas.height);
        if (insertDeleteSection.classList.contains('invisible')) {
            insertDeleteSection.classList.toggle('invisible');
        }
        errorMessageLabel.textContent = "";
        return;
    }

    errorMessageLabel.textContent = "Please enter a max degree value before creating a tree";
});

randomTreeButton.addEventListener('click', () => {
    if (!maxDegreeInput.value) {
        errorMessageLabel.textContent = "Please enter a max degree value before randomizing a tree";
        return;
    } else if (!numKeysInput.value) {
        errorMessageLabel.textContent = "Please enter a num keys value before randomizing a tree";
        return;
    }

    if (!insertDeleteSection.classList.contains('invisible')) {
        insertDeleteSection.classList.toggle('invisible');
    }
    errorMessageLabel.textContent = "";

    tree = new BTree(+maxDegreeInput.value);
    generateRandomTree(+numKeysInput.value);
});

randomQuestionButton.addEventListener('click', generateRandomQuestion);



