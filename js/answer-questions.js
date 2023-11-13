import { drawTree, drawArrowhead, drawArrow } from "./drawTree.js";
import {
    pullKeyOffTheTree, snapFreeNodeOntoNode, findDropOffAreaOfNode,
    detectMouseHoverOverArrowHitbox, recieveNodesRedCircles, findselectedItemsFromArrowHitBoxClick,
    makeNodeHaveChild, drawBinIcon, splitRootNode, detectMouseHoverOverRootMedian
} from "./manipulateTree.js";
import { makeTree } from "./makeTree.js";
import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";
import { validateTree } from "./validateTree.js";

// DECLARE GLOBAL VARIABLES
let savedTreeInfo;
let canvas;
let graphics;
let logicTree;
let userDrawingTree;
let offsetX = 0;
let scaleFactor = 1;
let customTreePresent = false;
let randomTreePresent = false;
let isDragMode = false;
let isFreeNodeSelected = false;
let draggedKeyIndex;
let draggedKeyNodeIndex;
let draggedKeyLevelIndex;
let isMouseHoveringOverHitbox = false;
let isMouseHoveringOverRootMedian;
let isDrawArrowMode = false;
let selectedKeyForDrawArrow;
let selectedNodeForDrawArrow;
let isSelectedLevelsForDrawArrowLevel;
let SelectedLevelForDrawArrowLevel;
let SelectedChildDrawArrowLevel;
let moveFullNodeMode = false;
let rootNodeSelcted = false;
let selectedKeyObject;
let selectedNodeObject;

let seed;

let dropOffKeyIndex, dropOffNodeKeyIndex, dropOffLevelKeyIndex;

// Try initialize canvas and graphics else display unsupported canvas error
function init(showCorrectTreeButton) {
    try {
        canvas = document.getElementById("canvas");
        graphics = canvas.getContext("2d");
        // hide showCorrectTreeButton on show of parameters container q
        showCorrectTreeButton.classList.toggle('invisible');
        showRandomTreeAndQuestion();
    } catch (e) {
        document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
    }
}

function drawCreate() {
    userDrawingTree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
}

function drawQuestion() {
    userDrawingTree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    //to involve user interactivity
    // TODO: this isnt working
    // draw tree is used when creating the tree, and seeting up for questions
    // make tree must be used when generating question. ie. make tree should allow user interactivity while draw tree shoudl not
    // makeTree(tree.root, canvas.width / 2, 30, canvas);
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
    // note, when doing questions, pass in the userTree.root instead of the tree.root
    // the tree is used to validate the userTree, when questions are generated the correct implentation of insert is run on tree
}

function generateRandomTree(numKeys, seed) {
    let treeDegreeLabel = document.getElementById('treeDegree');
    treeDegreeLabel.textContent = "Tree Degree: " + logicTree.t;

    const rng = new Math.seedrandom(seed);
    // for (let i = 0; i < 2; i++) {
    //     const key = Math.floor(rng() * 100);
    //     logicTree.insert(key); // Insert the key into the tree
    //     userDrawingTree.insert(key);
    //     logicTree.traverse();
    //     userDrawingTree.traverse();
    // }

    // for (let i = 2; i < numKeys; i++) {
    //     const key = +Math.floor(rng() * 100);
    //     logicTree.insert(key);
    //     logicTree.traverse();

    //     userDrawingTree.insert(key);
    //     userDrawingTree.traverse();
    // }
    let generatedKeys = new Set();
    for (let i = 0; i < numKeys; i++) {
        let key;
        do {
            key = Math.floor(rng() * 100);
        } while (generatedKeys.has(key)); // Keep generating until you get a unique key

        generatedKeys.add(key); // Add the key to the set of generated keys
        logicTree.insert(key);
        userDrawingTree.insert(key);
        logicTree.traverse();
        userDrawingTree.traverse();
    }

    console.log(logicTree);
    console.log(logicTree.t);
    console.log(userDrawingTree);
   
    drawCreate();
    
    saveTree(userDrawingTree.root, userDrawingTree.levels);
}

function clear() {
    // Find the rightmost and bottommost nodes
    let maxX = 0;
    let maxY = 0;

    userDrawingTree.levels.forEach((level) => {
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
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
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
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function generateRandomQuestion(seed) {
    const rng = new Math.seedrandom(seed);

    // CHANGE TO 3 WHEN SEARCH IS A THING
    const question = Math.floor(rng() * 2);

    let key = +Math.floor(rng() * 100);
    let questionDisplay = document.getElementById("question");
    let questionDisplayContainer = document.querySelector('.question');
    questionDisplayContainer.classList.add('scale-small');
    if (question == 0) {
        //insert
        while (logicTree.root.search(key) != null) {
            key = +Math.floor(rng() * 100);
        }

        logicTree.insert(key);
        logicTree.traverse();

        let tempNode = new BTreeNode(userDrawingTree.t, false);
        for (let keyIndex = 0; keyIndex < tempNode.keys; keyIndex++) {
            tempNode.keys[keyIndex].value = undefined;
        }
        tempNode.keys[0].value = key;
        tempNode.keys[0].x = 50;
        tempNode.keys[0].y = 50;
        tempNode.keys[0].calculateArrowHitbox();

        userDrawingTree.freeNodes.push(tempNode);
        // toggling off will set to normal scale but why not with transition? Because it's not detected by the other selector
        // it should still transition out on same selector right?
        // not sure that's how it works unless it's global
        // I am right that's how the transition property seems to work
        questionDisplay.textContent = "Insert: " + key;
        questionDisplayContainer.classList.remove('scale-small');
    } else if (question == 1) {
        //delete
        while (logicTree.root.search(key) == null) {
            key = +Math.floor(rng() * 100);
        }
        logicTree.remove(key);
        logicTree.traverse();
        // toggle scale-small off and toggle on in time for next question
        // start small and go big each time
        questionDisplay.textContent = "Delete: " + key;
        questionDisplayContainer.classList.remove('scale-small');

    } else if (question == 2) {
        //search
        key = Math.floor(rng() * 100);
        console.log("Search: ", key)
        document.getElementById("question").innerHTML = "Search: " + key;
    }
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function showRandomTreeAndQuestion() {
    let min = 2;
    let max = 3;
    const randomDegree = Math.floor(Math.random() * (max - min + 1)) + min;
    min = 1;
    max = Number.MAX_VALUE;
    let randomSeed = Math.floor(Math.random() * (max - min + 1)) + min;
    min = 2;
    max = 20;
    let randomNodeNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    logicTree = new BTree(randomDegree);
    userDrawingTree = new BTree(randomDegree);

    generateRandomTree(randomNodeNumber, randomSeed);
    generateRandomQuestion(randomSeed);
}

let validateButton = document.querySelector('button.validate');
let randomQuestionButton = document.querySelector('.random-question');
let randomTreeButton = document.querySelector('button.random-tree');

let directionalButtons = document.querySelectorAll('.panning-controls button');
let zoomButtons = document.querySelectorAll('.zoom-controls button');
const darkModeIcon = document.querySelector('.dark-mode-toggle');
const body = document.body;

let showCorrectTreeButton = document.querySelector('.show-correct-tree');
let resetIcon = document.querySelector('.reset-icon');

canvas = document.getElementById("canvas");

window.addEventListener('load', () => init(showCorrectTreeButton));

// Add event listeners to all GUI components that execute code (i.e. anonymous functions) bound to the listener
directionalButtons.forEach((button) => button.addEventListener('click', () => {
    moveCanvas(button.className);
}));

zoomButtons.forEach((button) => button.addEventListener('click', () => {
    zoomCanvas(button.className);
}));

const helpButton = document.getElementById("help-button");
const helpGuide = document.getElementById("help-guide");
const closeHelpGuide = document.getElementById("close-help-guide");

helpButton.addEventListener("click", () => {
    helpGuide.style.display = "block";
});

closeHelpGuide.addEventListener("click", () => {
    helpGuide.style.display = "none";
});

darkModeIcon.addEventListener('click', () => {
    body.classList.toggle("dark-mode");
});

randomQuestionButton.addEventListener('click', function () {
    showRandomTreeAndQuestion();
    // hide showCorrectTreeButton on show of parameters container q;
    if (showCorrectTreeButton.classList.contains('visible')) {
        showCorrectTreeButton.classList.toggle('invisible');
        showCorrectTreeButton.classList.toggle('visible');
    }
});

validateButton.addEventListener('click', (e) => {
    let validationLabel = document.getElementById('validation');

    if (userDrawingTree && logicTree) {
        let treeCorrect = validateTree(logicTree, userDrawingTree);
        if (treeCorrect) {
            validationLabel.style.color = "green";
            validationLabel.textContent = "Your operation was valid!";
            validateButton.disabled = true;
            setTimeout(() => {
                validationLabel.textContent = "";
                showRandomTreeAndQuestion();
                validateButton.disabled = false;
            }, 2000);
        } else {
            validationLabel.style.color = "red";
            validationLabel.textContent = "Your operation was in-valid";
            setTimeout(() => {
                validationLabel.textContent = "";
                if (showCorrectTreeButton.classList.contains('invisible')) {
                    showCorrectTreeButton.classList.toggle('invisible');
                    showCorrectTreeButton.classList.toggle('visible');
                }
            }, 2000);
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (userDrawingTree && logicTree) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        // TODO: Optionally check tree exists in canvas before bothering to try find any selected keys
        // If you try access properties of an undefined tree errors are thrown so wait until a new btree is created whose properties can be iterated over
        if (userDrawingTree !== undefined && isDragMode == false) {
            let functionResult = pullKeyOffTheTree(userDrawingTree.levels, userDrawingTree.freeNodes, mouseX, mouseY, moveFullNodeMode);
            selectedKeyObject = functionResult[0];
            selectedNodeObject = functionResult[1];
            draggedKeyIndex = functionResult[2];
            draggedKeyNodeIndex = functionResult[3];
            draggedKeyLevelIndex = functionResult[4];
            isDragMode = functionResult[5];
            isFreeNodeSelected = functionResult[6];
            console.log(userDrawingTree)
        }
        // after key selected if drag mode turned on now drag here in same method until mouse up event

        if (isDragMode) {
            // alter coordinates and call draw tree based off changed levels
            // drag selected key in levels to match mouse coordinates, mouse already matches center of bounds the way I've done it
            // call redraw based on levels
            // render animation in frames maybe though its not an animation with updated frames
            if (moveFullNodeMode) {
                if (draggedKeyIndex == 0) {
                    if (isFreeNodeSelected) {
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    } else {
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    }
                }
            } else {
                if (isFreeNodeSelected) {
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
            }

            // Call drawTree because tree has not changed
            graphics.clearRect(0, 0, canvas.width, canvas.height);
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, false, false);

        }

        if (isMouseHoveringOverHitbox && isDrawArrowMode == false) {
            isDrawArrowMode = true;
            let functionResult = findselectedItemsFromArrowHitBoxClick(userDrawingTree.levels, userDrawingTree.freeNodes, mouseX, mouseY);
            selectedKeyForDrawArrow = functionResult[0];
            selectedNodeForDrawArrow = functionResult[1];
            isSelectedLevelsForDrawArrowLevel = functionResult[2];
            SelectedChildDrawArrowLevel = functionResult[3];
            SelectedLevelForDrawArrowLevel = functionResult[4]


            console.log("isDrawarrowMode: ", isDrawArrowMode);
            console.log(selectedKeyForDrawArrow);
        }
        
        isMouseHoveringOverRootMedian = detectMouseHoverOverRootMedian(userDrawingTree.levels, mouseX, mouseY, graphics);
        if (isMouseHoveringOverRootMedian){
            splitRootNode(userDrawingTree.levels, userDrawingTree);
            
            graphics.clearRect(0, 0, canvas.width, canvas.height);
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, false, false);

        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (userDrawingTree && logicTree) {

        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        if (isDragMode) {
            if (moveFullNodeMode) {
                if (draggedKeyIndex == 0) {
                    if (isFreeNodeSelected) {
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    } else {
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    }
                    graphics.clearRect(0, 0, canvas.width, canvas.height);
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, false, false);

                }
            } else {
                if (isFreeNodeSelected) {
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
                // Call drawTree because tree has not changed
                let isInPlace = findDropOffAreaOfNode(userDrawingTree.levels, userDrawingTree.freeNodes, selectedKeyObject, selectedNodeObject, mouseX, mouseY, moveFullNodeMode)
                let binPositions = drawBinIcon(graphics);
                const isInsideBoundsBin = (mouseX >= binPositions[0] && mouseX <= binPositions[2]) && (mouseY >= binPositions[1] && mouseY <= binPositions[3]);
                if (isInsideBoundsBin) {
                    graphics.clearRect(0, 0, canvas.width, canvas.height);
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, true, true);
                    drawBinIcon(graphics);
                } else {
                    if (isInPlace[0].length > 0) {
                        graphics.clearRect(0, 0, canvas.width, canvas.height);
                        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, true, false);
                        drawBinIcon(graphics);
                    } else {
                        graphics.clearRect(0, 0, canvas.width, canvas.height);
                        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, selectedKeyObject, false, false);
                        drawBinIcon(graphics);
                    }
                }
            }
        } else {
            // draws the red dot
            if (userDrawingTree) {
                isMouseHoveringOverHitbox = detectMouseHoverOverArrowHitbox(userDrawingTree.levels, userDrawingTree.freeNodes, mouseX, mouseY, graphics);
                isMouseHoveringOverRootMedian = detectMouseHoverOverRootMedian(userDrawingTree.levels, mouseX, mouseY, graphics);

                if (!isMouseHoveringOverHitbox && !isMouseHoveringOverRootMedian) {
                    graphics.clearRect(0, 0, canvas.width, canvas.height);
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
                } 
                if (isDrawArrowMode && selectedKeyForDrawArrow) {
                    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
                    if (selectedNodeForDrawArrow.keys.indexOf(selectedKeyForDrawArrow) === 0) {
                        if (SelectedChildDrawArrowLevel === 1) {
                            drawArrow(graphics, [selectedKeyForDrawArrow.arrowHitbox.rightX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY], 10, 5);
                        } else {
                            drawArrow(graphics, [selectedKeyForDrawArrow.arrowHitbox.leftX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY], 10, 5);
                        }

                    } else {
                        drawArrow(graphics, [selectedKeyForDrawArrow.arrowHitbox.rightX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY], 10, 5);
                    }
                    // call function to make arrows display
                    recieveNodesRedCircles(userDrawingTree.levels, userDrawingTree.freeNodes, selectedNodeForDrawArrow, graphics);
                }
            }
        }
    }


});

// Important: note that event listener is added to window in case user performs mouse up outside canvas meaning event is not detected in canvas
window.addEventListener('mouseup', (e) => {
    if (userDrawingTree && logicTree) {

        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        if (userDrawingTree !== undefined) {
            if (isDragMode) {
                isDragMode = false;
                if (rootNodeSelcted === false) {
                    let binPositions = drawBinIcon(graphics);
                    const isInsideBoundsBin = (mouseX >= binPositions[0] && mouseX <= binPositions[2]) && (mouseY >= binPositions[1] && mouseY <= binPositions[3]);
                    if (isInsideBoundsBin && userDrawingTree.freeNodes.indexOf(selectedNodeObject) !== -1) {
                        userDrawingTree.freeNodes.splice(userDrawingTree.freeNodes.indexOf(selectedNodeObject), 1);
                    } else {
                        //  if a node is being dragged get the keys its trying to snap too
                        let functionResult = findDropOffAreaOfNode(userDrawingTree.levels, userDrawingTree.freeNodes, selectedKeyObject, selectedNodeObject, mouseX, mouseY, moveFullNodeMode);
                        let insertToTheseKeys = functionResult[0];
                        let isNodeAFreeNodeChecker = functionResult[1];
                        dropOffKeyIndex = functionResult[2];
                        dropOffNodeKeyIndex = functionResult[3];
                        dropOffLevelKeyIndex = functionResult[4];

                        if (insertToTheseKeys.length > 0 && selectedKeyObject !== null) {
                            // snape the node to the new node
                            if (isNodeAFreeNodeChecker) {
                                snapFreeNodeOntoNode(userDrawingTree.freeNodes, selectedNodeObject, userDrawingTree.freeNodes[dropOffNodeKeyIndex], insertToTheseKeys, selectedKeyObject);
                            } else {
                                snapFreeNodeOntoNode(userDrawingTree.freeNodes, selectedNodeObject, userDrawingTree.levels[dropOffLevelKeyIndex][dropOffNodeKeyIndex], insertToTheseKeys, selectedKeyObject);
                            }
                        }
                    }

                }
            } else if (isDrawArrowMode) {
                isDrawArrowMode = false;
                if (rootNodeSelcted === false) {
                    // child logic here levels, freeNodes, mouseX, mouseY, isLevelSelected, selectedLevel, selectedNode, selectedChild)
                    makeNodeHaveChild(userDrawingTree.levels, userDrawingTree.freeNodes, mouseX, mouseY, isSelectedLevelsForDrawArrowLevel, SelectedLevelForDrawArrowLevel, selectedNodeForDrawArrow, SelectedChildDrawArrowLevel)
                }
            }
            // Call drawTree because tree has not changed
            graphics.clearRect(0, 0, canvas.width, canvas.height);
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null, null);
            console.log(userDrawingTree)
            if (rootNodeSelcted) {
                rootNodeSelcted = false;
            }
        }

    }
});

// spacebar used to activate move node
document.addEventListener("keydown", function (event) {
    if (userDrawingTree) {
        if (event.key === " " || event.key === "Spacebar") {
            // Spacebar was pressed
            moveFullNodeMode = !moveFullNodeMode;
            if (moveFullNodeMode) {
                console.log("Move Full Node mode active");
            } else {
                console.log("Move Full Node mode NOT active");
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null);
            // You can add your code here to handle the spacebar event
        }
    }
});

showCorrectTreeButton.addEventListener('click', () => {
    // Place button that shows correct tree here
});

resetIcon.addEventListener('click', () => {
    loadSavedTree();

    
});




// will be imported later

function getCoordinates(node, levels) {
    for (let row = 0; row < levels.length; row++) {
        for (let col = 0; col < levels[row].length; col++) {
            if (levels[row][col] === node) {
                return { row, col };
            }
        }
    }
    return null; // Node not found
}

function collectBTreeInfo(node, levels) {
    if (!node) {
        return '';
    }

    let info = '';

    // Node Type (L for leaf, I for internal)
    info += node.leaf ? 'L' : 'I';

    // Get current node coordinates
    const currentCoordinates = getCoordinates(node, levels);

    if (currentCoordinates) {
        // Current Node Row and Column
        info += `|${currentCoordinates.row}|${currentCoordinates.col}`;
    } else {
        // Node not found in levels
        info += '|-1|-1';
    }

    // Node Keys (comma-separated values)
    if (node.keys && node.keys.length > 0) {
        info += `|${node.keys.map(key => key.value).join(',')}`;
    }

    // Find parent coordinates
    const parentCoordinates = getCoordinates(node.parent, levels);

    if (parentCoordinates) {
        // Parent Row and Column
        info += `|${parentCoordinates.row}|${parentCoordinates.col}`;
    } else {
        // Root node (no parent)
        info += '|-1|-1';
    }

    // Additional Node Properties (customize this as needed)
    // info += `|${node.someProperty}`;

    info += '\n';

    // Recursively traverse all children
    if (!node.leaf) {
        node.C.forEach((child) => {
            info += collectBTreeInfo(child, levels);
        });
    }

    return info;
}

function saveTree(rootNode, levels) {
    console.log('Saved tree info before function call:');
    console.log(savedTreeInfo);
    // Collect B-tree information using depth-first traversal
    savedTreeInfo = `|${rootNode.t}|${+numKeysInput.value}\n`;
    savedTreeInfo += collectBTreeInfo(rootNode, levels);


    
   console.log('Saved tree info after function calls');
  console.log(savedTreeInfo);
}

function loadSavedTree() {
    // TODO: do whatever happens on cancel button click
    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    clear();
    userDrawingTree = null;
    logicTree = null;
    // console.log(savedTreeInfo);
    reconstructBTreeFromText(savedTreeInfo);
    // // Move your tree drawing and manipulation functions here
    logicTree.traverse();
    userDrawingTree.traverse();
    drawCreate();

}


// Function to save B-tree information to a text file


function reconstructBTreeFromText(text) {
    // Split the text into lines
    const lines = text.split('\n');

    // Extract the B-tree parameters from the first line
    const [degree, numKeys] = lines[0].match(/\d+/g).map(Number);

    // Create a new B-tree with the specified degree for userDrawingTree and logicTree
    userDrawingTree = new BTree(degree);
    logicTree = new BTree(degree);

    // Initialize level coordinates
    let currentRow = 0;
    let currentCol = 0;

    // Create separate arrays to keep track of the nodes at each level for userDrawingTree and logicTree
    const userDrawingLevels = [[]];
    const logicLevels = [[]];

    // Loop through the lines starting from line 1
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line) {
            const parts = line.split('|');
            // console.log(parts);
            const [nodeType, row, col, keys, parentRow, parentCol] = parts.map((part, index) => {
                if (index === 3) {
                    // Split the keys part into an array of strings
                    return part.split(',').filter(value => value !== '');
                } else if (index === 0) {
                    // Keep nodeType as a string
                    return part;
                } else {
                    // Parse other parts as integers
                    return parseInt(part);
                }
            });

            // Create a new B-tree node for userDrawingTree and logicTree
            const newUserDrawingNode = new BTreeNode(degree, nodeType === 'L'); // Compare with 'L' to set as leaf
            const newLogicNode = new BTreeNode(degree, nodeType === 'L');

            // Set the parent node (null for the root node) for both trees
            let userDrawingParent = null;
            let logicParent = null;

            if (parentRow >= 0 && parentCol >= 0) {
                userDrawingParent = userDrawingLevels[parentRow][parentCol];
                logicParent = logicLevels[parentRow][parentCol];
            }

            newUserDrawingNode.parent = userDrawingParent;
            newLogicNode.parent = logicParent;

            // Initialize a counter to find the first empty slot
            let userDrawingEmptySlotIndex = -1;
            let logicEmptySlotIndex = -1;

            if (userDrawingParent && logicParent) {
                for (let j = 0; j < 2 * degree; j++) {
                    if (!userDrawingParent.C[j]) {
                        userDrawingEmptySlotIndex = j;
                        break;
                    }
                }

                for (let j = 0; j < 2 * degree; j++) {
                    if (!logicParent.C[j]) {
                        logicEmptySlotIndex = j;
                        break;
                    }
                }
            }

            if (userDrawingEmptySlotIndex !== -1) {
                // Assign newUserDrawingNode to the first empty slot
                userDrawingParent.C[userDrawingEmptySlotIndex] = newUserDrawingNode;
            }
            else{
                userDrawingTree.root = newUserDrawingNode;

            }

            if (logicEmptySlotIndex !== -1) {
                // Assign newLogicNode to the first empty slot
                logicParent.C[logicEmptySlotIndex] = newLogicNode;
            } else {
                // For the root node, assign it to both userDrawingTree and logicTree
              
                logicTree.root = newLogicNode;
            }

            for (let i = 0; i < keys.length; i++) {
                newUserDrawingNode.keys[i].value = keys[i];
                newLogicNode.keys[i].value = keys[i];
                newUserDrawingNode.n += 1;
                newLogicNode.n += 1;
            }

            // Add the node to the levels array for userDrawingTree and logicTree
            if (row >= userDrawingLevels.length) {
                userDrawingLevels.push([]);
            }
            userDrawingLevels[row][col] = newUserDrawingNode;

            if (row >= logicLevels.length) {
                logicLevels.push([]);
            }
            logicLevels[row][col] = newLogicNode;

            // Update current coordinates
            currentRow = row;
            currentCol = col;
        }
    }

    // Set the levels array in userDrawingTree and logicTre
}