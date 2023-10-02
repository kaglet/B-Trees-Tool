import { assignNodePositions } from "./assign-positions.js";
import { drawTree } from "./drawTree.js";
import { makeTree } from "./makeTree.js";
import { BTree } from "./balancedTree.js";

// DECLARE GLOBAL VARIABLES
let canvas;
let graphics;
let tree;
let userTree;
let offsetX = 0;
let customTreePresent = false;
let randomTreePresent = false;

// Try initialize canvas and graphics else display unsupported canvas error
function init(insertDeleteSection, validateButton,questionsParamtersContainer) {
    try {
        canvas = document.getElementById("canvas");
        graphics = canvas.getContext("2d");

        //hide
        questionsParamtersContainer.classList.toggle('invisible');
        validateButton.classList.toggle('invisible');
        insertDeleteSection.classList.toggle('invisible');
    } catch (e) {
        document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
    }
}

// function insertKeyCreate() {
//     if (!createTreeStarted  || !randomTreeStarted) {
//         document.getElementById("error-message").innerHTML  = "";
//         try {
//             insertValue = document.getElementById("insert").value;
//             //ensure a traverse is called after an insert to allow for cleaning tree
//             try{
//                 if (insertValue === ""){
//                     console.log("Enter a number");
//                     document.getElementById("error-message").innerHTML  = "Please enter a key to insert";
//                 } else {
//                     tree.insert(parseInt(insertValue));
//                     tree.traverse();

//                     userTree.insert(parseInt(insertValue));
//                     userTree.traverse();

//                     document.getElementById("insert").focus();
//                     document.getElementById("error-message").innerHTML  = "";
//                 }
//             } catch(e) {
//                 console.log(e);
//             }
//             graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//             console.log("The Tree:");
//             drawTree(tree.root, canvas.width / 2, 30);
//             // makeTree(tree.root, canvas.width / 2, 30);

//             document.getElementById("insert").value = null;
//         } catch(e) {
//             console.log(e);
//         }
//     } else {
//         document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
//     }
// }

// user input and remove that value from the tree
// function removeKeyCreate() {
//     if (!createTreeStarted || !randomTreeStarted) {
//         document.getElementById("error-message").innerHTML  = "";
//         try {
//             removeValue = document.getElementById("delete").value;
//             //ensure a traverse is called after a removal to allow for cleaning tree
//             try{
//                 if (removeValue === ""){
//                     console.log("Enter a number");
//                     document.getElementById("error-message").innerHTML  = "Please enter a key to remove";
//                 } else {
//                     tree.remove(parseInt(removeValue));
//                     tree.traverse();

//                     userTree.remove(parseInt(removeValue));
//                     userTree.traverse();

//                     document.getElementById("delete").focus();
//                     document.getElementById("error-message").innerHTML  = "";

//                 }
//             } catch(e) {
//                 console.log(e);
//             }
//             graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//             console.log("The Tree:");
//             drawTree(tree.root, canvas.width / 2, 30);
//             // makeTree(tree.root, canvas.width / 2, 30);

//             document.getElementById("delete").value = null;
//         } catch(e) {
//             console.log(e);
//         }
//     } else {
//         document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
//     }
// }

// function createTree() {
//     if (randomTreeStarted) {
//         if (createTreeStarted) {
//             try {
//                 maxDegree = document.getElementById("max-degree").value;
//                 //ensure a traverse is called after a removal to allow for cleaning tree
//                 try{
//                     if (maxDegree === ""){
//                         console.log("Enter a max degree value");
//                         document.getElementById("error-message").innerHTML  = "Enter a max degree value before creating a tree";
//                     } else {
//                         document.getElementById("error-message").innerHTML  = "";
//                         tree = new BTree(parseInt(maxDegree));
//                         userTree = new BTree(parseInt(maxDegree));
//                         document.getElementById("custom-tree-btn").innerHTML  = "Cancel";
//                         document.getElementById("insert").focus();
//                         createTreeStarted= false;
//                         console.log(document.getElementById("insert-delete-section").style.display)
//                         if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
//                             document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
//                         } else {
//                             document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
//                         }
//                     }
//                 } catch(e) {
//                     console.log(e);
//                 }
//                 document.getElementById("max-degree").value = null;
//             } catch(e) {
//                 console.log(e);
//             }
            
//         } else {
//             console.log("Tree Creation Canceled");
//             graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//             document.getElementById("custom-tree-btn").innerHTML  = "Custom tree";
//             document.getElementById("max-degree").focus();
//             createTreeStarted= true;
//             console.log(document.getElementById("insert-delete-section").style.display)
//             if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
//                 document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
//             } else {
//                 document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
//             }
//         }
//     } else {
//         document.getElementById("error-message").innerHTML  = "Cancel Random Tree Creation before new Custom Tree";
//     }

// }

// function randomTree() {
//     if (createTreeStarted) {
//         if (randomTreeStarted) {
//             try {
//                 maxDegree = document.getElementById("max-degree").value;
//                 NumKeys = document.getElementById("num-keys").value;
//                 //ensure a traverse is called after a removal to allow for cleaning tree
//                 try{
//                     if (maxDegree === ""){
//                         console.log("Enter a max degree value");
//                         document.getElementById("error-message").innerHTML  = "Enter a max degree value before randomizing a tree";
//                     } else  if (NumKeys === ""){
//                         console.log("Enter a num keys value");
//                         document.getElementById("error-message").innerHTML  = "Enter a num keys value before randomizing a tree";
//                     } else {
//                         document.getElementById("error-message").innerHTML  = "";
//                         // randomise here
//                         tree = new BTree(parseInt(maxDegree));
//                         userTree = new BTree(parseInt(maxDegree));
                        
//                         generateRandomTree();
//                         document.getElementById("random-tree-btn").innerHTML  = "Cancel";
//                         document.getElementById("insert").focus();
//                         randomTreeStarted= false;
//                         console.log(document.getElementById("insert-delete-section").style.display)
//                         if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
//                             document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
//                         } else {
//                             document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
//                         }
//                     }
//                 } catch(e) {
//                     console.log(e);
//                 }
//                 document.getElementById("max-degree").value = null;
//                 document.getElementById("num-keys").value = null;
//             } catch(e) {
//                 console.log(e);
//             }
//         } else {
//             console.log("Tree Randomization Canceled");
//             graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//             document.getElementById("random-tree-btn").innerHTML  = "Randomize Tree";
//             document.getElementById("max-degree").focus();
//             randomTreeStarted= true;
//             console.log(document.getElementById("insert-delete-section").style.display)
//             if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
//                 document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
//             } else {
//                 document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
//             }
//         }
//     } else {
//         document.getElementById("error-message").innerHTML  = "Cancel Custom Tree Creation before new Random Tree";
//     }
// }

function drawCreate() {
    tree.traverse();
    console.log(tree.levels);
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(tree.root, canvas.width / 2, 30, canvas);
}

function drawQuestion() {
    tree.traverse();
    console.log(tree.levels);
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    //to involve user interactivity
    // TODO: this isnt working
    // draw tree is used when creating the tree, and seeting up for questions
    // make tree must be used when generating question. ie. make tree should allow user interactivity while draw tree shoudl not
    // makeTree(tree.root, canvas.width / 2, 30, canvas);
    
    drawTree(tree.root, canvas.width / 2, 30, canvas);

    // note, when doing questions, pass in the userTree.root instead of the tree.root
    // the tree is used to validate the userTree, when questions are generated the correct implentation of insert is run on tree
}

function generateRandomTree(numKeys) {
    for (let i = 0; i < numKeys; i++) {
        const key = +Math.floor(Math.random() * 100);
        tree.insert(key);
        tree.traverse();

        userTree.insert(key);
        userTree.traverse();
    }
    drawCreate();
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
    // TODO: logic to be handeld between create and question
    drawTree(tree.root, canvas.width / 2 - 60, 50, canvas);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function generateRandomQuestion() {
    const question = Math.floor(Math.random() * 3);
    let key = +Math.floor(Math.random() * 100);
    let questionDisplay = document.getElementById("question");
    if (question == 0) {
        //insert
        tree.insert(key);
        tree.traverse();

        // TODO: this needs to be changed as the user must do it manually
        userTree.insert(key);
        userTree.traverse();

        questionDisplay.textContent = "Insert: " + key;
    } else if (question == 1) {
        //delete
        while (tree.root.search(key) == null) {
            key = +Math.floor(Math.random() * 100);
        }
        tree.remove(key);
        tree.traverse();

        // TODO:  this needs to be changed as the user must do it manually
        userTree.insert(key);
        userTree.traverse();
        questionDisplay.textContent = "Delete: " + key;
    } else if (question == 2) {
        //search
        key = Math.floor(Math.random() * 100); 
        console.log("Search: ", key)
        document.getElementById("question").innerHTML  = "Search: "+ key;
    }
    drawQuestion();
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

// Initialize all GUI components
let insertDeleteSection = document.getElementById('insert-delete-section');

let insertButton = document.querySelector('button.insert');
let deleteButton = document.querySelector('button.delete');

let saveButton = document.querySelector('button.save');
let validateButton = document.querySelector('button.validate');

let insertInput = document.getElementById('insert');
let deleteInput = document.getElementById('delete');

let customTreeButton = document.querySelector('button.custom-tree');
let randomTreeButton = document.querySelector('button.random-tree');
let randomQuestionButton = document.querySelector('.random-question');

let maxDegreeInput = document.getElementById('max-degree');
let numKeysInput = document.getElementById('num-keys');

let directionalButtons = document.querySelectorAll('.panning-controls button');

let errorMessageLabel = document.getElementById('error-message');

let createTreeParamtersContainer = document.getElementById('parameters-container-c');
let questionsParamtersContainer = document.getElementById('parameters-container-q');
let questionLabel = document.getElementById('question');

window.addEventListener('load', () => init(insertDeleteSection, validateButton,questionsParamtersContainer));

// Add event listeners to all GUI components that execute code (i.e. anonymous functions) bound to the listener
directionalButtons.forEach((button) => button.addEventListener('click', () => {
    moveCanvas(button.className);
}));

saveButton.addEventListener('click', () => {
    //hide
    saveButton.classList.toggle('invisible');
    createTreeParamtersContainer.classList.toggle('invisible');
    insertDeleteSection.classList.toggle('invisible');

    //show
    questionsParamtersContainer.classList.toggle('invisible');
    questionsParamtersContainer.classList.toggle('visible');
    validateButton.classList.toggle('invisible');

    validateTree();
});

insertButton.addEventListener('click', () => {
    if (insertInput.value) {
        tree.insert(+insertInput.value);
        tree.traverse();

        userTree.insert(+insertInput.value);
        userTree.traverse();
        drawCreate();
        insertInput.focus();
        insertInput.value = "";
        errorMessageLabel.textContent = "";
        return;
    }

    errorMessageLabel.textContent = "Please enter a key to insert";
});

deleteButton.addEventListener('click', () => {
    if (deleteInput.value) {
        tree.remove(+deleteInput.value);
        tree.traverse();

        userTree.remove(parseInt(+deleteInput.value));
        userTree.traverse();
        drawCreate();
        deleteInput.focus();
        deleteInput.value = "";

        errorMessageLabel.textContent = "";
        return;
    }

    errorMessageLabel.textContent = "Please enter a key to delete";
});

customTreeButton.addEventListener('click', () => {
    if (!randomTreePresent){
        // there is no random tree created then run this
        if (!customTreePresent){
            // there is no custom tree created then run this
            if (maxDegreeInput.value) {
                tree = new BTree(+maxDegreeInput.value);
                userTree = new BTree(+maxDegreeInput.value);
                graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                // if (insertDeleteSection.classList.contains('invisible')) {
                    insertDeleteSection.classList.toggle('invisible');
                // }
                errorMessageLabel.textContent = "";
                customTreePresent = true;
                customTreeButton.textContent = "Cancel";
                insertInput.focus();
                return;
            }
        } else {
            // there is already a custom tree created then run this
            insertDeleteSection.classList.toggle('invisible');
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            customTreePresent = false;
            customTreeButton.textContent = "Custom Tree";
            errorMessageLabel.textContent = "";
            return;
        }  
    } else {
        // there is already a random tree created then run this
        errorMessageLabel.textContent = "Cancel the Random Tree Creation before creating a new Custom Tree";
        return;
    }
    errorMessageLabel.textContent = "Please enter a max degree value before creating a tree";
});

randomTreeButton.addEventListener('click', () => {
    if (!customTreePresent){
        // there is no custom tree created then run this
        if (!randomTreePresent){
            // there is no random tree created then run this
            if (!maxDegreeInput.value) {
                errorMessageLabel.textContent = "Please enter a max degree value before randomizing a tree";
                return;
            } else if (!numKeysInput.value) {
                errorMessageLabel.textContent = "Please enter a num keys value before randomizing a tree";
                return;
            }
        
            // if (!insertDeleteSection.classList.contains('invisible')) {
                insertDeleteSection.classList.toggle('invisible');
            // }       
            tree = new BTree(+maxDegreeInput.value);
            userTree = new BTree(+maxDegreeInput.value);
            generateRandomTree(+numKeysInput.value);
            errorMessageLabel.textContent = "";
            randomTreePresent = true;
            randomTreeButton.textContent = "Cancel";
            insertInput.focus();
            return;
        } else {
            // there is already a random tree created then run this
            insertDeleteSection.classList.toggle('invisible');
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            randomTreePresent = false;
            randomTreeButton.textContent = "Random Tree";
            errorMessageLabel.textContent = "";
            return;
        }  
    } else {
        // there is already a random tree created then run this
        errorMessageLabel.textContent = "Cancel the Custom Tree Creation before creating a new Random Tree";
        return;

    }
    
});

randomQuestionButton.addEventListener('click', generateRandomQuestion);

validateButton.addEventListener('click', validateTree);


