import { drawTree } from "./drawTree.js";
import { makeTree } from "./makeTree.js";
import { BTree } from "./balancedTree.js";
//import { SubtractiveBlending } from "three";

// DECLARE GLOBAL VARIABLES
let canvas;
let graphics;
let tree;
let userTree;
let offsetX = 0;
let scaleFactor = 1;
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

function drawCreate() {
    tree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    
    tree.assignNodePositions();
    drawTree(tree.root, canvas);
}

function drawQuestion() {
    tree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    //to involve user interactivity
    // TODO: this isnt working
    // draw tree is used when creating the tree, and seeting up for questions
    // make tree must be used when generating question. ie. make tree should allow user interactivity while draw tree shoudl not
    // makeTree(tree.root, canvas.width / 2, 30, canvas);
    tree.assignNodePositions();
    drawTree(tree.root, canvas);

    // note, when doing questions, pass in the userTree.root instead of the tree.root
    // the tree is used to validate the userTree, when questions are generated the correct implentation of insert is run on tree
}

function generateRandomTree(numKeys) {
    for (let i = 0; i < numKeys; i++) {
        const key = +Math.floor(Math.random() * 100);
        tree.insert(key);
        tree.traverse();

        // userTree.insert(key);
        // userTree.traverse();
    }
    console.log(tree);
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
        scaleFactor = 1;
    }

    graphics.clearRect(0, 0, canvas.width , canvas.height );
    graphics.setTransform(scaleFactor, 0, 0, scaleFactor, offsetX, 0);
    // TODO: logic to be handeld between create and question
    tree.assignNodePositions();
    drawTree(tree.root,  canvas);
}

function zoomCanvas(zoom) {
    if (zoom == 'zoom-out') {
        scaleFactor *= 0.9;
    } else if (zoom == 'zoom-in') {
        scaleFactor /= 0.9;
    } 

    graphics.clearRect(0, 0, canvas.width  , canvas.height  );
    graphics.setTransform(scaleFactor, 0, 0, scaleFactor, offsetX, 0);
    // TODO: logic to be handeld between create and question
    tree.assignNodePositions();
    drawTree(tree.root, canvas);
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
        userTree.remove(key);
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
    var treeEqual = areBTreesEqual(tree, userTree);
    if (treeEqual){
        console.log("Your tree is correct");
    } else {
        console.log("Your tree is in-correct");
    }
}

function areBTreesEqual(tree1, tree2) {
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

function findSelectedKey(levels, mouseX, mouseY) {
    console.log(`I am mouseX: ${mouseX}`);
    console.log(`I am mouseY: ${mouseY}`);
    levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
                if (!(key.value === undefined)) {
                    // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                    let inXBounds = key.x <= mouseX && mouseX <= key.x + 30;
                    let inYBounds = key.y <= mouseY && mouseY <= key.y + 30;
                    if (inXBounds && inYBounds) {
                        console.log(`I am key ${k} in node ${j} in level ${i}`);
                    }
                }
            });
        });
    });
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

let zoomButtons = document.querySelectorAll('.zoom-controls button')

let errorMessageLabel = document.getElementById('error-message');

let createTreeParamtersContainer = document.getElementById('parameters-container-c');
let questionsParamtersContainer = document.getElementById('parameters-container-q');
let questionLabel = document.getElementById('question');

window.addEventListener('load', () => init(insertDeleteSection, validateButton,questionsParamtersContainer));

// Add event listeners to all GUI components that execute code (i.e. anonymous functions) bound to the listener
directionalButtons.forEach((button) => button.addEventListener('click', () => {
    moveCanvas(button.className);
}));

zoomButtons.forEach((button) => button.addEventListener('click', () => {
    zoomCanvas(button.className);
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

canvas = document.getElementById("canvas");
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    // TODO: Optionally check tree exists in canvas before bothering to try find any selected keys
    // If you try access properties of an undefined tree errors are thrown so wait until a new btree is created whose properties can be iterated over
    if (tree !== undefined) {
        findSelectedKey(tree.levels, mouseX, mouseY); 
    }
});