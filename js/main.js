import { drawTree } from "./drawTree.js";
import { makeTree } from "./makeTree.js";
import { BTree } from "./balancedTree.js";
import { BTreeNode } from "./balancedTree.js";
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
let isDragMode = false;
let draggedKeyIndex;
let draggedKeyNodeIndex;
let draggedKeyLevelIndex;
let threshold = 10;
let closeToNeighbors;

// Try initialize canvas and graphics else display unsupported canvas error
function init(insertDeleteSection, validateButton, questionsParamtersContainer) {
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

function clear() {
    // Find the rightmost and bottommost nodes
    let maxX = 0;
    let maxY = 0;

    tree.levels.forEach((level) => {
        level.forEach((node) => {
            if (node && node.keys && node.keys.length > 0) {
                node.keys.forEach((key) => {
                    if (key.x > maxX) {
                        maxX = key.x;
                    }
                    if (key.y > maxY) {
                        maxY = key.y;
                    }
                });
            }
        });
    });

    // Clear the canvas based on the rightmost and bottommost node coordinates
    graphics.clearRect(-10, 0, maxX + 60, maxY + 60);
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

    clear();
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    // Apply the transformation
    graphics.setTransform(scaleFactor, 0, 0, scaleFactor, offsetX, 0);

    // TODO: logic to be handled between create and question
    tree.assignNodePositions();
    drawTree(tree.root, canvas);
}


function zoomCanvas(zoom) {
    if (zoom == 'zoom-out') {
        scaleFactor *= 0.9;
    } else if (zoom == 'zoom-in') {
        scaleFactor /= 0.9;
    }

    clear();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
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
        document.getElementById("question").innerHTML = "Search: " + key;
    }
    drawQuestion();
}

function validateTree() {
    var treeEqual = areBTreesEqual(tree, userTree);
    if (treeEqual) {
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
                    let inXBounds = key.x - 30 <= mouseX && mouseX <= key.x + 30;
                    let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                    if (inXBounds && inYBounds) {
                        isDragMode = true;
                        draggedKeyIndex = k;
                        draggedKeyNodeIndex = j;
                        draggedKeyLevelIndex = i;
                    }
                }
            });
        });
    });
}

// if they do intersect check immediate left and right neighbor and key that intersects there, except this code already finds immediate left and right neighbours
// it should find 2 at most unless there is messed up overlapping
// other option is is far if its already present within a node group then unsnap otherwise I just unsnap from where it is currently saved indices at
// it means its too far from others now and while being dragged must be unsnapped
function getCloseNeighbors(draggedKey, levels) {
    let draggedKeyX = draggedKey.x;
    let draggedKeyY = draggedKey.y;
    let neighboringKeyInfoObject = {
        neighborExists: false,
    };
    // check if the key centers are close enough in the x, if at least 60 from each other than they are virtually touching their edges
    // the centers are useful since they are already defined that way
    let distanceFromKeyCenters = 60;
    levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                if (!(key.value === undefined) && draggedKeyIndex !== k) {
                    // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                    // if they close in x regardless of which is left or right
                    let closeInX = (Math.max(draggedKeyX, key.x) - Math.min(draggedKeyX, key.x)) <= distanceFromKeyCenters;
                    // center of one y must lie within range of other
                    // if you subtract one y from another they must be an absolute distance of 30 from each other
                    let intersectingInY = Math.abs(draggedKeyY - key.y) <= 30;
                    if (closeInX && intersectingInY) {
                        // save left and right neighbor if left or right neighbor
                        // check by x value if less than else if greater than
                        // always insert to the left (see as right neighbor) if equal by convention
                        // can mark this intersected key position on left and right
                        // ideally there should be maximum two
                        isDragMode = true;
                        let neighborKeyIndex = k;
                        let neighborKeyNodeIndex = j;
                        let neighborKeyLevelIndex = i;
                        // save actual right and left neighbor
                        let neighbor = {
                            neighborKeyIndex,
                            neighborKeyNodeIndex,
                            neighborKeyLevelIndex
                        };

                        if (draggedKeyX <= key.x) {
                            console.log("I am right neighbor: ");
                            console.log(neighbor);
                            neighboringKeyInfoObject.leftNeighbor = neighbor;
                        } else {
                            console.log("I am left neighbor: ");
                            console.log(neighbor);
                            neighboringKeyInfoObject.rightNeighbor = neighbor;
                        }
                    }
                }
            });
        });
    });
    return neighboringKeyInfoObject;
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

let createTreeParametersContainer = document.getElementById('parameters-container-c');
let questionsParametersContainer = document.getElementById('parameters-container-q');
let questionLabel = document.getElementById('question');

canvas = document.getElementById("canvas");

window.addEventListener('load', () => init(insertDeleteSection, validateButton, questionsParametersContainer));

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
    createTreeParametersContainer.classList.toggle('invisible');
    insertDeleteSection.classList.toggle('invisible');

    //show
    questionsParametersContainer.classList.toggle('invisible');
    questionsParametersContainer.classList.toggle('visible');
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
    if (!randomTreePresent) {
        // there is no random tree created then run this
        if (!customTreePresent) {
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
    if (!customTreePresent) {
        // there is no custom tree created then run this
        if (!randomTreePresent) {
            // there is no random tree created then run this
            if (!maxDegreeInput.value) {
                errorMessageLabel.textContent = "Please enter a max degree value before randomizing a tree";
                return;
            } else if (!numKeysInput.value) {
                errorMessageLabel.textContent = "Please enter a num keys value before randomizing a tree";
                return;
            }

            insertDeleteSection.classList.toggle('invisible'); 

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
            clear();
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


// on mouse down key is selected if possible then translated else searched for if not, dragMode is turned on.
// on mouse up dragMode is turned off so mouse coordinates are not used for dragging, only during mouse down.
// or don't even need to track a drag mode, it just won't be dragged.
// so that a new node is selected
// to detect a mouseup for redragging
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    // TODO: Optionally check tree exists in canvas before bothering to try find any selected keys
    // If you try access properties of an undefined tree errors are thrown so wait until a new btree is created whose properties can be iterated over
    if (tree !== undefined && isDragMode == false) {
        findSelectedKey(tree.levels, mouseX, mouseY);
    }
    // after key selected if drag mode turned on now drag here in same method until mouse up event

    if (isDragMode) {
        // alter coordinates and call draw tree based off changed levels
        // drag selected key in levels to match mouse coordinates, mouse already matches center of bounds the way I've done it
        // call redraw based on levels
        // render animation in frames maybe though its not an animation with updated frames
        tree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
        tree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
        // Call drawTree because tree has not changed
        graphics.clearRect(0, 0, canvas.width, canvas.height);
        drawTree(tree.root, canvas);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    if (isDragMode) {
        let key = draggedKeyLevelIndex !== -1 ? tree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex] : tree.floatingNodes[draggedKeyNodeIndex].keys[draggedKeyIndex];
        // TODO: Make work with the currently selected tree whether from floatingNodes representation if level = -1 or normal representation
        // TODO: Wherever a node from levels is assumed be careful to account for if dragged node has level -1 and is therefore in floating Nodes, it's fine we'll get there

        key.x = mouseX;
        key.y = mouseY;
        // Call drawTree because tree has not changed
        graphics.clearRect(0, 0, canvas.width, canvas.height);
        drawTree(tree.root, canvas);
    }
});

// Important: note that event listener is added to window in case user performs mouse up outside canvas meaning event is not detected in canvas
// mouse down can then call draw to redraw such that its only drawing translation of key but not other levels representations updates which is fine
// as effective and easy to follow
window.addEventListener('mouseup', () => {
    isDragMode = false;
    if (tree !== undefined) {
        let key = draggedKeyLevelIndex !== -1 ? tree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex] : tree.floatingNodes[draggedKeyNodeIndex].keys[draggedKeyIndex];
        // TODO: Make work with the currently selected tree whether from floatingNodes representation if level = -1 or normal representation
        // TODO: Wherever a node from levels is assumed be careful to account for if dragged node has level -1 and is therefore in floating Nodes, it's fine we'll get there
    
        // If neighbors detected snap in or out else do nothing if not close to other keys in nodes
        // Getting right neighbours of key but it does not exist on next mouse move if removed at previous mouse move
        // snap in and out on mouse up for now
        let neighboringKeyInfoObject = getCloseNeighbors(key, tree.levels);
        if (neighboringKeyInfoObject.exists) {
            // try find left neighbor and can just replace itself
            if (neighboringKeyInfoObject.leftNeighbor !== undefined) {
                let neighborLevelIndex = getCloseNeighbors.leftNeighbor.neighborKeyLevelIndex;
                let neighborNodeIndex = getCloseNeighbors.leftNeighbor.neighborKeyNodeIndex;
                let neighborKeyIndex = getCloseNeighbors.leftNeighbor.neighborKeyIndex;
                tree.levels[neighborLevelIndex][neighborNodeIndex].keys.splice(neighborKeyIndex + 1, 0, key);
            } else if (neighboringKeyInfoObject.rightNeighbor !== undefined){
                let neighborLevelIndex = getCloseNeighbors.rightNeighbor.neighborKeyLevelIndex;
                let neighborNodeIndex = getCloseNeighbors.rightNeighbor.neighborKeyNodeIndex;
                tree.levels[neighborLevelIndex][neighborNodeIndex].keys.splice(0, 0, key);
            }
            // use print statements to test for now, when it snaps in or out and print 
            // need to draw key to be able to translate it if floating, from floatingNodes structure
            // always find left neighbor index to insert from the left
            // else if only right neighbor exists insert from left with splice method still
            
            // if left
            // snap in
            // check if left and right and up and down buffer region overlaps any other key (is key detected in overlap region)
        } else {
            tree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys.splice(draggedKeyIndex, 1);
            let floatingNode = new BTreeNode(tree.t, false);
            floatingNode.keys.push(key);
            tree.floatingNodes.push(floatingNode);
            // snap out if key inside else 
            // pop off where it is without leaving a hole
        }
    }
    console.log(tree);
});

// TODO: Draw free nodes where they are supposed be be on zoom and pan so i.e. apply translations to those nodes too don't just call redraw

// They are the coordinates of the center and 30 is the width and height 
// So check 15 to right and left, and 15 up and down to see if mouse click is within that key.
// from mouse click check horizontal bounds and vertical bounds with withinBounds booleans
// In fact its 30 in both directions

// TODO: Define behavior on to snap and to unsnap during drag start (are we snapping in or out)
// if threshold is within snap it in next to neighbors (is close to neighbors begin snap in else snap out alternate between two states)
// snap in or out then drag if snapped in previously and still snapped in do nothing and vice versa for snapped out so it doesn't redo the snapping
// after snap just call redraw
// make it self node on snap, then we call draw node on everything in floating levels, wherever the coordinates of them are at, that is what is supplied
// add to floating levels for it to be able to redraw
// if threshold is without snap it out away from neighbors
// test this behavior

/* TODO: 
    node to insert is inserted into free node structure 
    node to delete is left free
*/