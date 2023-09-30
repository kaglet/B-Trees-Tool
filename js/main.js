// import { assignNodePositions } from "./assign-positions.js";
// DECLARE GLOBAL VARIABLES
let frameNumber = 0;

let canvas;
let graphics;
let rootNode;
let tree;
let offsetX = 0;

let createTreeStarted = true;
let randomTreeStarted = true;

// initialize canvas and graphics else display unsupported canvas error
function init(insertDeleteSection) {
    try {
        canvas = document.getElementById("canvas");
        graphics = canvas.getContext("2d");
        insertDeleteSection.classList.toggle('invisible');
    } catch (e) {
        document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
    }
}

function draw() {
    tree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    makeTree(tree.root, canvas.width / 2, 30);
}

function generateRandomTree(numKeys) {
    for (let i = 0; i < numKeys; i++) {
        const key = Math.floor(Math.random() * 100);
        tree.insert(parseInt(key));
        tree.traverse();
    }

    graphics.clearRect(0, 0, canvas.width, canvas.height);
    console.log("The Tree:");
    drawTree(tree.root, canvas.width / 2 - 60, 50);
    console.log(tree);
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

    makeTree(tree.root, canvas.width / 2 - 60, 50);
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
        questionDisplay.textContent = "Insert: " + key;
    } else if (question == 1) {
        //delete
        while (tree.root.search(key) == null) {
            key = Math.floor(Math.random() * 100);
        }
        tree.remove(key);
        tree.traverse();
        questionDisplay.textContent = "Delete: " + key;
    } else if (question == 2) {
        //search
        questionDisplay.textContent = "Search: " + key;
    }
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    drawTree(tree.root, canvas.width / 2 - 60, 50);
}

let insertDeleteSection = document.getElementById('insert-delete-section');

window.addEventListener('load', () => init(insertDeleteSection));

let insertButton = document.querySelector('button.insert');
let deleteButton = document.querySelector('button.delete');

let insertInput = document.getElementById('insert');
let deleteInput = document.getElementById('delete');

let customTreeButton = document.querySelector('button.custom-tree');
let randomTreeButton = document.querySelector('button.random-tree');

let maxDegreeInput = document.getElementById('max-degree');
let numKeysInput = document.getElementById('num-keys');

let directionalButtons = document.querySelectorAll('.panning-controls button');
directionalButtons.forEach((button) => button.addEventListener('click', () => {
    moveCanvas(button.className);
}));

let errorMessageLabel = document.getElementById('error-message');

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
        insertDeleteSection.classList.toggle('invisible');
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








