// USER INTERACTIVITY TO DO:
//  ALlow keys to snap on a node
//  fix arrows for both drawing and creating
import { drawTree, drawArrowhead, drawArrow } from "./drawTree.js";
import { makeTree } from "./makeTree.js";
import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";

//import { SubtractiveBlending } from "three";

// DECLARE GLOBAL VARIABLES
let canvas;
let graphics;
let logicTree;
let userDrawingTree;
let offsetX = 0;
let scaleFactor = 1;
let customTreePresent = false;
let randomTreePresent = false;
let isDragMode = false;
let freeNodeSelected = false;
let draggedKeyIndex;
let draggedKeyNodeIndex;
let draggedKeyLevelIndex;
let isMouseHoveringOverHitbox = false;
let isDrawArrowMode = false;
let selectedKeyForDrawArrow;
let moveFullNodeMode =false;

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
    userDrawingTree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    
    userDrawingTree.assignNodePositions();
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
}

function drawQuestion() {
    userDrawingTree.traverse();
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    //to involve user interactivity
    // TODO: this isnt working
    // draw tree is used when creating the tree, and seeting up for questions
    // make tree must be used when generating question. ie. make tree should allow user interactivity while draw tree shoudl not
    // makeTree(tree.root, canvas.width / 2, 30, canvas);
    userDrawingTree.assignNodePositions();
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
    // note, when doing questions, pass in the userTree.root instead of the tree.root
    // the tree is used to validate the userTree, when questions are generated the correct implentation of insert is run on tree
}

function generateRandomTree(numKeys) {
    for (let i = 0; i < numKeys; i++) {
        const key = +Math.floor(Math.random() * 100);
        logicTree.insert(key);
        logicTree.traverse();

        userDrawingTree.insert(key);
        userDrawingTree.traverse();
    }
    console.log(logicTree);
    console.log(userDrawingTree);
    drawCreate();
}

function clear(){
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
    graphics.clearRect(0, 0, canvas.width , canvas.height );

    // Apply the transformation
    graphics.setTransform(scaleFactor, 0, 0, scaleFactor, offsetX, 0);

    // TODO: logic to be handled between create and question
    userDrawingTree.assignNodePositions();
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
}

function zoomCanvas(zoom) {
    if (zoom == 'zoom-out') {
        scaleFactor *= 0.9;
    } else if (zoom == 'zoom-in') {
        scaleFactor /= 0.9;
    } 

    clear();
    graphics.clearRect(0, 0, canvas.width  , canvas.height  );
    graphics.setTransform(scaleFactor, 0, 0, scaleFactor, offsetX, 0);
    // TODO: logic to be handeld between create and question
    userDrawingTree.assignNodePositions();
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function generateRandomQuestion() {
    const question = Math.floor(Math.random() * 3);
    let key = +Math.floor(Math.random() * 100);
    let questionDisplay = document.getElementById("question");
    if (question == 0) {
        //insert
        logicTree.insert(key);
        logicTree.traverse();

        // TODO: this needs to be changed as the user must do it manually
        userDrawingTree.insert(key);
        userDrawingTree.traverse();

        questionDisplay.textContent = "Insert: " + key;
    } else if (question == 1) {
        //delete
        while (logicTree.root.search(key) == null) {
            key = +Math.floor(Math.random() * 100);
        }
        logicTree.remove(key);
        logicTree.traverse();

        // TODO:  this needs to be changed as the user must do it manually
        userDrawingTree.remove(key);
        userDrawingTree.traverse();
        questionDisplay.textContent = "Delete: " + key;
    } else if (question == 2) {
        //search
        key = Math.floor(Math.random() * 100); 
        console.log("Search: ", key)
        document.getElementById("question").innerHTML  = "Search: "+ key;
    }
    // drawQuestion();
}

let selectedKeyObject;
let newBTreeNode;
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
                    if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY)) {
                        isDragMode = true;
                        draggedKeyIndex = k;
                        draggedKeyNodeIndex = j;
                        draggedKeyLevelIndex = i;
                        console.log(`I am key ${draggedKeyIndex} in node ${draggedKeyNodeIndex} in level ${draggedKeyLevelIndex} at coordinates ${key.x} in x and ${key.y} in y`);
                        
                        // set this to false as its not dealing with a free node but rather a node in the levels array
                        freeNodeSelected =false;   

                        // if the move full node option is not selected then do the following (allow user to break a key of a node)
                        if (moveFullNodeMode === false){
                            // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                            selectedKeyObject = key;
                            newBTreeNode =  new BTreeNode(node.t, node.leaf);
                            newBTreeNode.keys[0] = selectedKeyObject;
                            userDrawingTree.freeNodes.push(newBTreeNode);
                            // this makes all the children of the selected key into free nodes 
                            // case dependant
                            if (k==0){
                                //left case
                                // if the key is on the left of the node, remove only the left child and the subtree
                                addChildrenToFreeNode(node, 0,k);
                            } else if (k === node.keys.filter((key) => key.value != undefined).length -1){
                                //right case
                                // if the key is on the right of the node, remove only the right child and the subtree
                                addChildrenToFreeNode(node, 1,k);
                            } else {
                                // middle case
                                // if the key is in the middle of the node, remove two of the children
                                addChildrenToFreeNode(node, 2,k);
                            }
                            // checks the free node array and removes all nodes still in the levels representation
                            removeFreeNodesFromLevel();

                            // this removes the selected key from the node
                            node.keys.splice(k,1);
                            
                            // if the node is empty it removes the node from the tree
                            if (isEmptyNode(node)){
                                levels[i].splice(j,1);                            
                            } 
                            // FOR DEBUG PURPOSES
                            console.log(userDrawingTree);
                        }                        
                        return;
                    }
                }
            });
        });       
    }); 
    
    userDrawingTree.freeNodes.forEach((node, j) => {
        node.keys.forEach((key, k) => {
            // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
            if (!(key.value === undefined)) {
                // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                let inXBounds = key.x - 30 <= mouseX && mouseX <= key.x + 30;
                let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY)) {
                    isDragMode = true;
                    freeNodeSelected = true;
                    draggedKeyIndex = k;
                    draggedKeyNodeIndex = j;
                    console.log(`I am a free node`);
                    // TODO: add split logic here
                    return;
                }
            }
        });
    });
}

// does what is described above (split node and remove children functionality)
function addChildrenToFreeNode(node , position, k){ 
    // LEFT
    if (position ===0 ){
        userDrawingTree.levels.forEach((level, i) => {
            level.forEach((comparingNode, j) => {
                if (node.C[k]=== comparingNode){
                    if (findParent(node, comparingNode)){
                        userDrawingTree.freeNodes.push(comparingNode);
                        node.C[k] =null;
                    }
                    comparingNode.C.forEach((comparingNodeChild) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild, j)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C[j]= null;
                            }
                        }                        
                    });
                }                
            });       
        }); 
    } 
    
    // RIGHT
    if (position === 1 ){
        userDrawingTree.levels.forEach((level, i) => {
            level.forEach((comparingNode, j) => {
                if (node.C[k+1]=== comparingNode){
                    if (findParent(node, comparingNode)){
                        userDrawingTree.freeNodes.push(comparingNode);
                        node.C[k+1] =null;
                    }
                    comparingNode.C.forEach((comparingNodeChild, j) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C[j]= null;
                            }
                        }   
                    });
                }                
            });       
        }); 
    } 

    // MIDDLE
    if (position === 2 ){
        userDrawingTree.levels.forEach((level, i) => {
            level.forEach((comparingNode, j) => {
                if (node.C[k] === comparingNode || node.C[k+1] === comparingNode){
                    if (findParent(node, comparingNode)){
                        userDrawingTree.freeNodes.push(comparingNode);
                        if (node.C[k] === comparingNode){
                            node.C[k] =null;
                        } else {
                            node.C[k] =null;
                        }

                    }
                    comparingNode.C.forEach((comparingNodeChild, j) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C[j]= null;
                            }
                        }   
                    });
                }               
            });       
        }); 
    } 
    
}

// checks the free node array and removes all nodes still in the levels representation
function removeFreeNodesFromLevel() {
    for (let i = userDrawingTree.levels.length - 1; i >= 0; i--) {
      const level = userDrawingTree.levels[i];
  
      for (let j = level.length - 1; j >= 0; j--) {
        const comparingNode = level[j];
  
        if (userDrawingTree.freeNodes.includes(comparingNode)) {
          userDrawingTree.levels[i].splice(j, 1);
        }
      }
    }
}

// used to find all children
function findParent(node, comparingNode){

    if (comparingNode.parent === null){
        return false;
    } else if (node === comparingNode.parent){
        return true;
    }

    findParent(node, comparingNode.parent)
}

// checks if a node is empty and removes it from the levels
function isEmptyNode(node){
    let emptyNode = true;
    node.keys.forEach((key, k) => {
        if(key.value !== undefined){
            emptyNode = false;
        }
    });
    return emptyNode;
}


function findSelectedKeyFromHitboxHover(levels,mouseX,mouseY){
    let selectedKey = null;
    levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                if (!(key.value === undefined)) {  
                    if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY)) {
                        selectedKey = key;
                    }
                }
            });
        });
    });

    return selectedKey;
}

// arrow functionality
function detectMouseHoverOverArrowHitbox(mouseX, mouseY) {
    let isHovering = false;

    userDrawingTree.levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                if (key && key.value !== undefined) {
                    if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY)) {
                        console.log(`Mouse is hovering over key with value ${key.value}`);
                        isHovering = true;
                        drawRedCircleForHitbox(graphics, key.arrowHitbox.centerX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                    }
                }
            });
        });
    });

    isMouseHoveringOverHitbox = isHovering;

    if (!isMouseHoveringOverHitbox) {
        graphics.clearRect(0, 0, canvas.width  , canvas.height  );
        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
    }

    return isHovering;
}

function isMouseWithinHitboxBounds(mouseX, mouseY, centerX, centerY) {
    const inXBounds = mouseX >= centerX - 10 && mouseX <= centerX + 10;
    const inYBounds = mouseY >= centerY - 10 && mouseY <= centerY + 10;
    return inXBounds && inYBounds;
}

function drawRedCircleForHitbox(graphics, centerX, centerY, radius) {
    graphics.beginPath();
    graphics.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    graphics.fillStyle = "red";
    graphics.lineWidth = 2;
    graphics.fill();
    graphics.closePath();
}

// function drawArrowhead(graphics, arrowCoordinates, arrowSize) {
//     graphics.beginPath();
//     graphics.moveTo(arrowCoordinates[2], arrowCoordinates[3]);

//     const angle = calculateArrowHeadAngle(arrowCoordinates, childWidth);

//     const arrowHeadCoordinates = calculateArrowHeadCoordinates(arrowCoordinates, arrowSize, angle);

//     graphics.lineTo(arrowHeadCoordinates[0], arrowHeadCoordinates[1]);
//     graphics.lineTo(arrowHeadCoordinates[2], arrowHeadCoordinates[3]);
//     graphics.fillStyle = "orange";
//     graphics.fill();
//     graphics.closePath();
// }

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

let zoomButtons = document.querySelectorAll('.zoom-controls button');

const darkModeButton = document.getElementById('dark-mode-toggle');
const body = document.body;

let errorMessageLabel = document.getElementById('error-message');

let createTreeParamtersContainer = document.getElementById('parameters-container-c');
let questionsParamtersContainer = document.getElementById('parameters-container-q');
let questionLabel = document.getElementById('question');

canvas = document.getElementById("canvas");

window.addEventListener('load', () => init(insertDeleteSection, validateButton,questionsParamtersContainer));

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

darkModeButton.addEventListener('click', () => {
    body.classList.toggle("dark-mode");
});

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
        logicTree.insert(+insertInput.value);
        logicTree.traverse();

        userDrawingTree.insert(+insertInput.value);
        userDrawingTree.traverse();
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
        logicTree.remove(+deleteInput.value);
        logicTree.traverse();

        userDrawingTree.remove(parseInt(+deleteInput.value));
        userDrawingTree.traverse();
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
                logicTree = new BTree(+maxDegreeInput.value);
                userDrawingTree = new BTree(+maxDegreeInput.value);
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
         
            logicTree = new BTree(+maxDegreeInput.value);
            userDrawingTree = new BTree(+maxDegreeInput.value);
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
    if (userDrawingTree !== undefined && isDragMode == false) {
        let selectedKey = findSelectedKey(userDrawingTree.levels, mouseX, mouseY); 
    }
    // after key selected if drag mode turned on now drag here in same method until mouse up event
    
    if (isDragMode) {
        // alter coordinates and call draw tree based off changed levels
        // drag selected key in levels to match mouse coordinates, mouse already matches center of bounds the way I've done it
        // call redraw based on levels
        // render animation in frames maybe though its not an animation with updated frames
        if (moveFullNodeMode){
            if (draggedKeyIndex==0){
                if (freeNodeSelected){
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
            }            
        } else {
            if (freeNodeSelected){
                userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
            } else {
                userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
            }
        }
        
        
        // Call drawTree because tree has not changed
        graphics.clearRect(0, 0, canvas.width  , canvas.height  );
        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode);
    }

    if (isMouseHoveringOverHitbox){
        isDrawArrowMode = true;
        selectedKeyForDrawArrow = findSelectedKeyFromHitboxHover(userDrawingTree.levels,mouseX,mouseY);
        console.log("isDrawarrowMode: "+ isDrawArrowMode);
        console.log(selectedKeyForDrawArrow);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    if (isDragMode) {
        if (moveFullNodeMode){
            if (draggedKeyIndex==0){
                if (freeNodeSelected){
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
            }            
        } else {
            if (freeNodeSelected){
                userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
            } else {
                userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
            }
        }
        // Call drawTree because tree has not changed
        graphics.clearRect(0, 0, canvas.width  , canvas.height  );
        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode);
    }
    // draws the red dot
    if(userDrawingTree){
        isMouseHoveringOverHitbox = detectMouseHoverOverArrowHitbox(mouseX,mouseY);
        if (isDrawArrowMode && selectedKeyForDrawArrow) {
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
            drawArrow(graphics,[selectedKeyForDrawArrow.arrowHitbox.centerX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY],10,5);
        }
    }
    
});

document.addEventListener("keydown", function(event) {
    if (event.key === " " || event.key === "Spacebar") {
      // Spacebar was pressed
      moveFullNodeMode = !moveFullNodeMode;
      if (moveFullNodeMode){
        console.log("Move Full Node mode active");
      } else {
        console.log("Move Full Node mode NOT active");
      }
      // You can add your code here to handle the spacebar event
    }
});

// Important: note that event listener is added to window in case user performs mouse up outside canvas meaning event is not detected in canvas
window.addEventListener('mouseup', () => {
    isDragMode = false;
    isDrawArrowMode = false;

    // userDrawingTree.levels.forEach((level, i) => {
    //     level.forEach((node, j) => {
    //         node.keys.forEach((key, k) => {
    //             if (key && key.value !== undefined) {
    //                 if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY)) {
    //                     console.log(`Mouse is hovering over key with value ${key.value}`);
    //                     isHovering = true;
    //                     drawRedCircleForHitbox(graphics, key.arrowHitbox.centerX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
    //                 }
    //             }
    //         });
    //     });
    // });


});

// TODO: Draw free nodes where they are supposed be be on zoom and pan so i.e. apply translations to those nodes too don't just call redraw

// They are the coordinates of the center and 30 is the width and height 
// So check 15 to right and left, and 15 up and down to see if mouse click is within that key.
// from mouse click check horizontal bounds and vertical bounds with withinBounds booleans
// In fact its 30 in both directions


function validateTree(){
    var treeEqual = areBTreesEqual(logicTree, userDrawingTree);
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