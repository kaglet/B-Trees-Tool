/*ToDo: 
Sort out question logic (figure out logic to do with delete... bin icon at bottom left)
Clean up Create Tree Interface and add an option to go staright to a question
Fix all canvas related bugs ie, resize and moving
Limit the user in terms of degree and number of keys
FREE NODE SUBTREE - figure out logistics

Nice To haves:
Add user experience where when snapping to middle of node, while hovering the two adjacvent nodes move away slightly as if to give room for the hovering key
Add user experience to change colour of node when it is the node being dragged to orange/red? and when able to snap then change colour to green
Make dark mode button small and in top corner with just an icon
Make side bar into top bar? especially for random question section

DONE:
Snapping Nodes together
Snap key off a node 
Vaidate logic tree and user tree
Draw arrows and make children

Bugs:
-When breaking off 1st key in node the children of the node all disappear sometimes (ie fix addChildrenToFreeNode)
-NB a key never slighty overlaps another key (only if bugs arrise)
*/

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
let selectedNodeForDrawArrow;
let isSelectedLevelsForDrawArrowLevel;
let SelectedLevelForDrawArrowLevel;
let SelectedChildDrawArrowLevel;
let moveFullNodeMode =false;
let rootNodeSelcted = false;
let selectedKeyObject;
let selectedNodeObject;


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
    // const question = Math.floor(Math.random() * 3);
    const question = 0;

    let key = +Math.floor(Math.random() * 100);
    let questionDisplay = document.getElementById("question");
    if (question == 0) {
        //insert
        logicTree.insert(key);
        logicTree.traverse();

        // TODO: this needs to be changed as the user must do it manually
        let tempNode =  new BTreeNode(userDrawingTree.t, false);
        for (let keyIndex = 0; keyIndex<tempNode.keys; keyIndex++) {
            tempNode.keys[keyIndex].value = undefined;
        }
        tempNode.keys[0].value = key;
        tempNode.keys[0].x = 30;
        tempNode.keys[0].y = 50;
        tempNode.keys[0].calculateArrowHitbox();


        console.log(tempNode)
        userDrawingTree.freeNodes.push(tempNode);
        // userDrawingTree.insert(key);
        // userDrawingTree.traverse();

        questionDisplay.textContent = "Insert: " + key;
    } else if (question == 1) {
        //delete
        while (logicTree.root.search(key) == null) {
            key = +Math.floor(Math.random() * 100);
        }
        logicTree.remove(key);
        logicTree.traverse();

        // TODO:  this needs to be changed as the user must do it manually
        // userDrawingTree.remove(key);
        // userDrawingTree.traverse();
        questionDisplay.textContent = "Delete: " + key;
    } else if (question == 2) {
        //search
        key = Math.floor(Math.random() * 100); 
        console.log("Search: ", key)
        document.getElementById("question").innerHTML  = "Search: "+ key;
    }
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
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
        let selectedKey = pullKeyOffTheTree(userDrawingTree.levels, mouseX, mouseY); 
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

    if (isMouseHoveringOverHitbox && isDrawArrowMode == false){
        isDrawArrowMode = true;
        let functionResult = findselectedItemsFromArrowHitBoxClick(userDrawingTree.levels,mouseX,mouseY);
        selectedKeyForDrawArrow = functionResult[0];
        selectedNodeForDrawArrow = functionResult[1];
        isSelectedLevelsForDrawArrowLevel = functionResult[2];
        SelectedChildDrawArrowLevel = functionResult[3];
        SelectedLevelForDrawArrowLevel = functionResult[4]


        console.log("isDrawarrowMode: ", isDrawArrowMode);
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
    } else {
        // draws the red dot
    if(userDrawingTree){
        isMouseHoveringOverHitbox = detectMouseHoverOverArrowHitbox(mouseX,mouseY);
        if (isDrawArrowMode && selectedKeyForDrawArrow) {
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
            if (selectedNodeForDrawArrow.keys.indexOf(selectedKeyForDrawArrow)===0){
                if (SelectedChildDrawArrowLevel===1){
                    drawArrow(graphics,[selectedKeyForDrawArrow.arrowHitbox.rightX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY],10,5);                    
                } else {
                    drawArrow(graphics,[selectedKeyForDrawArrow.arrowHitbox.leftX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY],10,5);
                }

            }else{
                drawArrow(graphics,[selectedKeyForDrawArrow.arrowHitbox.rightX, selectedKeyForDrawArrow.arrowHitbox.centerY, mouseX, mouseY],10,5);
            }
            // call function to make arrows display
            recieveNodesRedCircles(userDrawingTree.freeNodes,mouseX,mouseY);
        }
    }
    }
    
    
});

// Important: note that event listener is added to window in case user performs mouse up outside canvas meaning event is not detected in canvas
window.addEventListener('mouseup', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
       
    if (userDrawingTree !== undefined) {
        if (isDragMode) {
        isDragMode = false;
            if (rootNodeSelcted===false){
                //  if a node is being dragged get the keys its trying to snap too
                let functionResult = findDropOffAreaOfNode(userDrawingTree.levels, mouseX, mouseY);
                let insertToTheseKeys = functionResult[0];
                let isNodeAFreeNodeChecker = functionResult[1];
                
                if (insertToTheseKeys.length > 0 && selectedKeyObject!==null){
                    // snape the node to the new node
                    if (isNodeAFreeNodeChecker){
                        snapFreeNodeOntoNode(selectedNodeObject, userDrawingTree.freeNodes[dropOffNodeKeyIndex] , insertToTheseKeys);
                    } else {
                        snapFreeNodeOntoNode(selectedNodeObject, userDrawingTree.levels[dropOffLevelKeyIndex][dropOffNodeKeyIndex], insertToTheseKeys);
                    }
                }
            }                    
        } else if (isDrawArrowMode) {
            isDrawArrowMode = false;
            if (rootNodeSelcted===false){
                // child logic here
                makeNodeHaveChild(userDrawingTree.freeNodes,mouseX,mouseY)
            } 
        }
         // Call drawTree because tree has not changed
        graphics.clearRect(0, 0, canvas.width  , canvas.height  );
        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode);
        console.log(userDrawingTree)
        if (rootNodeSelcted){
            rootNodeSelcted=false;
        }
    }

   
});

// spacebar used to activate move node
document.addEventListener("keydown", function(event) {
    if(userDrawingTree){
        if (event.key === " " || event.key === "Spacebar") {
            // Spacebar was pressed
            moveFullNodeMode = !moveFullNodeMode;
            if (moveFullNodeMode){
              console.log("Move Full Node mode active");
            } else {
              console.log("Move Full Node mode NOT active");
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
            // You can add your code here to handle the spacebar event
          }
    }
    
});

// PULLING OFF THE TREE =====================================================
// ==========================================================================
// ==========================================================================

function pullKeyOffTheTree(levels, mouseX, mouseY) {
    selectedKeyObject=null;
    levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
                if (!(key.value === undefined)) {
                    // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                    let inXBounds = key.x - 30 <= mouseX && mouseX <= key.x + 30;
                    let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;

                    if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                    && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                        isDragMode = true;
                        draggedKeyIndex = k;
                        draggedKeyNodeIndex = j;
                        draggedKeyLevelIndex = i;
                        selectedKeyObject = key;
                        console.log(`I am key in the tree`, selectedKeyObject);
         
                        
                        // set this to false as its not dealing with a free node but rather a node in the levels array
                        freeNodeSelected =false;   

                        // if the move full node option is not selected then do the following (allow user to break a key of a node)
                        if (node.parent === null && node.keys.filter((key) => key.value != undefined).length === 1 ){
                            rootNodeSelcted = true;
                        } else if (moveFullNodeMode === false){
                            // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                            selectedNodeObject =  new BTreeNode(node.t, node.leaf);
                            selectedNodeObject.keys[0] = selectedKeyObject;
                            userDrawingTree.freeNodes.push(selectedNodeObject);                          

                            // this makes all the children of the selected key into free nodes  if nmber of keys is > 1
                            // case dependant                           
                            if (k===0 && node.keys.filter((key) => key.value != undefined).length > 1){
                                //left case
                                // if the key is on the left of the node, remove only the left child and the subtree
                                addChildrenToFreeNode(node, 0,k);
                            } else if (k === node.keys.filter((key) => key.value != undefined).length -1 && node.keys.filter((key) => key.value != undefined).length > 1){
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
                                console.log('parent slice HAPPNES NOW')
                                removeParentFromFreeNode(node);                                
                                levels[i].splice(j,1);                            
                            } 
                            // FOR DEBUG PURPOSES
                            // console.log(userDrawingTree);

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
                if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                    isDragMode = true;
                    freeNodeSelected = true;    
                    draggedKeyIndex = k;
                    draggedKeyNodeIndex = j;    
                    selectedKeyObject = key;
                    console.log(`I am key in the free nodes`, selectedKeyObject);
                    // if the mode is not in move full node then  do this
                    if (moveFullNodeMode === false){
                            // if the node has more than one key then allow splitting else just move the node
                            if (node.keys.filter((key) => key.value != undefined).length >1){
                                // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                                selectedNodeObject =  new BTreeNode(node.t, node.leaf);
                                selectedNodeObject.keys[0] = selectedKeyObject;
                                userDrawingTree.freeNodes.push(selectedNodeObject);
                                // get the new index in the free nodes stucture
                                draggedKeyIndex = 0;
                                draggedKeyNodeIndex = userDrawingTree.freeNodes.indexOf(selectedNodeObject);   
                                
                                // rmove the key from the older node
                                node.keys.splice(k,1);
                                // if the node is empty it removes the node from the free node structure 
                                if (isEmptyNode(node)){
                                    userDrawingTree.freeNodes.splice(j,1);                            
                                } 
                            } else {
                                selectedNodeObject = node;
                            }                     
                        // FOR DEBUG PURPOSES
                        // console.log(userDrawingTree);

                    }                       
                    return;
                }
            }
        });
    });
}

// does what is described above (split node and remove children functionality)
function addChildrenToFreeNode(node , position, k){ 
    // LEFT
    if (position === 0 ){
        userDrawingTree.levels.forEach((level, i) => {
            level.forEach((comparingNode, j) => {
                if (node.C[k] === comparingNode){
                    console.log(comparingNode)
                    console.log('is this happening left')

                    if (findParent(node, comparingNode)){
                        userDrawingTree.freeNodes.push(comparingNode);
                        node.C.splice(k,1);
                        removeParentFromFreeNode(comparingNode);
                    }
                    comparingNode.C.forEach((comparingNodeChild) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild, j)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C.splice(j,1);
                                removeParentFromFreeNode(comparingNodeChild);
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
                    console.log('is this happening right')

                    if (findParent(node, comparingNode)){
                        userDrawingTree.freeNodes.push(comparingNode);
                        node.C.splice(k+1,1);
                        removeParentFromFreeNode(comparingNode);
                    }
                    comparingNode.C.forEach((comparingNodeChild, j) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C.splice(j,1);
                                removeParentFromFreeNode(comparingNodeChild);
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
                        console.log('is this happening middle')

                        if (node.C[k] === comparingNode){
                            node.C.splice(k,1);  
                            removeParentFromFreeNode(comparingNode);
                        } else {
                            node.C.splice(k+1,1);   
                            removeParentFromFreeNode(comparingNode);
                        }
                    }
                    comparingNode.C.forEach((comparingNodeChild, j) => {
                        if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                            if (findParent(comparingNode, comparingNodeChild)){
                                userDrawingTree.freeNodes.push(comparingNodeChild);
                                comparingNode.C.splice(j,1);
                                removeParentFromFreeNode(comparingNodeChild);
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

// removes the node from its parent child node
function removeParentFromFreeNode(node){
    if (node.parent!==null){
        let index = node.parent.C.indexOf(node)
        node.parent.C.splice(index,1);
        node.parent.C.splice(index,0,undefined);
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
// ==========================================================================
// ==========================================================================
// ==========================================================================

// SNAPPING FREE NODES TO OTHER NODES =======================================
// ==========================================================================
// ==========================================================================

//handles logic for node snap too
let dropOffKeyIndex, dropOffNodeKeyIndex, dropOffLevelKeyIndex;
function findDropOffAreaOfNode(levels, mouseX, mouseY){
    let keysThatNeedToChange = [];
    let isNodeAFreeNode = false;
        levels.forEach((level, i) => {
            level.forEach((node, j) => {
                node.keys.forEach((key, k) => {
                    // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
                    if (!(key.value === undefined)) {
                        // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                        let inXBounds = key.x - 45 <= mouseX && mouseX <= key.x + 45;
                        let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                        if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                        && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            dropOffKeyIndex = k;
                            dropOffNodeKeyIndex = j;
                            dropOffLevelKeyIndex = i;
                            // if the move full node option is not selected then do the following (allow user to break a key of a node)
                            if (moveFullNodeMode === false){ 
                                if (key !== selectedKeyObject){
                                    keysThatNeedToChange.push(level[dropOffNodeKeyIndex].keys[dropOffKeyIndex]);
                                }                                
                            }                        
                        }
                    }
                });
            });       
        }); 
        if (keysThatNeedToChange.length === 0) {
            userDrawingTree.freeNodes.forEach((node, j) => {
                node.keys.forEach((key, k) => {
                    // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
                    if (!(key.value === undefined)) {
                        // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                        let inXBounds = key.x - 45 <= mouseX && mouseX <= key.x + 45;
                        let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                        
                        if (selectedNodeObject!==node){
                            if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                            && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {  
                                dropOffKeyIndex = k;
                                dropOffNodeKeyIndex = j;               
        
                                    // if the mode is not in move full node then  do this
                                if (moveFullNodeMode === false){
                                    if (key !== selectedKeyObject){
                                        keysThatNeedToChange.push(userDrawingTree.freeNodes[dropOffNodeKeyIndex].keys[dropOffKeyIndex]);
                                        isNodeAFreeNode =true;
                                    }                                                      
                                }                       
                            }
                        }
                    
                    }
                });
            });
        }      
    return [keysThatNeedToChange,isNodeAFreeNode];
}

// snaps the free node to the existing levelo node or free node
function snapFreeNodeOntoNode(nodeToSnap, nodeToReceive, keysBetween){
    // if there is only one node to snap to, it is the left end or right end
    console.log(nodeToSnap)
    if (keysBetween.indexOf(selectedKeyObject)!==-1){
        keysBetween.splice(keysBetween.indexOf(selectedKeyObject),1);
    }
    if (keysBetween.length === 1){
        // end of a node
        // consider left or right
        if (nodeToSnap.keys[0].x < nodeToReceive.keys[0].x + 10){
            // left end
            console.log('ADD LEFT ',nodeToSnap,' to end',nodeToReceive);
            //remove the node to snap from the free nodes and add the key to the beinging of the new nodes keys and fix the y value
            userDrawingTree.freeNodes.splice(userDrawingTree.freeNodes.indexOf(nodeToSnap),1);
            nodeToReceive.keys.unshift(nodeToSnap.keys[0]);
            nodeToReceive.keys[0].y = nodeToReceive.keys[1].y;

        } else {
            // right end
            console.log('ADD RIGHT',nodeToSnap,' to end',nodeToReceive);

            // check for undefines in the node to recieve
            let areThereUndefines = false;
            let undefinedIndex = 0;
            nodeToReceive.keys.forEach((key,i) => {
                if (key.value=== undefined){
                    if (areThereUndefines ===false){
                        areThereUndefines=true;
                        undefinedIndex=i;
                    }
                }
            });

            // remove the node to snap form the free nodes
            userDrawingTree.freeNodes.splice(userDrawingTree.freeNodes.indexOf(nodeToSnap),1);

            if (areThereUndefines){
                // if there are undefines add the key to the index of the first undefined
                nodeToReceive.keys[undefinedIndex] = nodeToSnap.keys[0];
                nodeToReceive.keys[undefinedIndex].y = nodeToReceive.keys[0].y;
                return nodeToReceive;

            } else {
                // if there arent undefines, then push the key to the end of the array of keys
                nodeToReceive.keys.push(nodeToSnap.keys[0]);
                nodeToReceive.keys[nodeToReceive.keys.length-1].y = nodeToReceive.keys[1].y;

            }

        }
    } else {        
        // middle of a node
        console.log('ADD MIDDLE',nodeToSnap,' to ',nodeToReceive);
        console.log('between keys ', keysBetween)
        // find the first key from the keysBetween in the array
        let foundKey = false;
        let insertKeyInThisIndex = 0;
        nodeToReceive.keys.forEach((key,i) => {
            if (key.value === keysBetween[0].value){
                if (foundKey === false){
                    foundKey=true;
                    // found the first key, increment it by one to add it inbetween
                    insertKeyInThisIndex=i+1;
                }
            }
        });
        if (foundKey){
            // if thekey is found, remove the node to snap from the free nodes and ad the key to the correct index of the new node
            userDrawingTree.freeNodes.splice(userDrawingTree.freeNodes.indexOf(nodeToSnap),1);
            nodeToReceive.keys.splice(insertKeyInThisIndex,0,nodeToSnap.keys[0]);
            nodeToReceive.keys[insertKeyInThisIndex].y = nodeToReceive.keys[0].y;

        } else {
            console.log("odd middle error look into it")
        }

    }
}

// ==========================================================================
// ==========================================================================
// ==========================================================================



// ARROW FUNCTIONALITY ======================================================
// ==========================================================================
// ==========================================================================

// finds the selcted node, level and key when selecting the hit box
function findselectedItemsFromArrowHitBoxClick(levels,mouseX,mouseY){
    let selectedKey = null;
    let selectedNode = null;
    let selectedLevel = false;
    let childIndex = null;
    let levelIndex = null;

    levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                if (!(key.value === undefined)) {  
                    // if the key is the first key give it a left and right hitbox
                    
                    if (k===0) {

                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = true;
                            childIndex=0;
                            levelIndex = i;
                        } else  if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = true;
                            childIndex = 1;
                            levelIndex = i;

                        }                        
                    } else {
                    // if the key is not the first key give it a right hitbox ONLY
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = true;
                            childIndex = k+1;
                            levelIndex = i;

                        }                       
                    }   
                   
                }
            });
        });
    });

    if (!selectedLevel){
        userDrawingTree.freeNodes.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                if (!(key.value === undefined)) {  
                    // if the key is the first key give it a left and right hitbox
                    if (k===0) {

                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = false;
                            childIndex = 0;

                        } else  if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = false;
                            childIndex = 1;

                        }                        
                    } else {
                    // if the key is not the first key give it a right hitbox ONLY
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            selectedKey = key;
                            selectedNode = node;
                            selectedLevel = false;
                        }                       
                    }   
                    
                }
            });
        });
    }

    return [selectedKey, selectedNode, selectedLevel,childIndex,levelIndex];
}

// detects the mouse location and compares toi every nodes hitbox are, if so draws red circle
function detectMouseHoverOverArrowHitbox(mouseX, mouseY) {
    let isHovering = false;
    userDrawingTree.levels.forEach((level, i) => {
        level.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                // if index is undefined then ensure you first check lenght vs key number !!!!!!!!!!!!!!!!!!!!!!!!!!
                if (key && key.value !== undefined) {
                    // if the key is the first key give it a left and right hitbox
                    if (k===0) {
                        // if the hover is on the left end then the left hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)) {
                            if (node.C[k]===null || node.C[k]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.leftX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }                            
                        } 
                        // if the hover is on the right end then the right hitbox is shown
                        else if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }   
                            
                        }
                    } else {
                        // if the hover is on the right end then the right hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }
                        }
                    }                    
                }
            });
        });
    });

    if (!isHovering){
        userDrawingTree.freeNodes.forEach((node, j) => {
            node.keys.forEach((key, k) => {
                // if index is undefined then ensure you first check lenght vs key number !!!!!!!!!!!!!!!!!!!!!!!!!!
                if (key && key.value !== undefined) {
                    // if the key is the first key give it a left and right hitbox
                    if (k===0) {
                        // if the hover is on the left end then the left hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)) {
                            if (node.C[k]===null || node.C[k]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.leftX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }                            
                        } 
                        // if the hover is on the right end then the right hitbox is shown
                        else if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }   
                            
                        }
                    } else {
                        // if the hover is on the right end then the right hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            }
                        }
                    }                    
                }
            });
        });
    }

    if (!isHovering) {
        graphics.clearRect(0, 0, canvas.width  , canvas.height  );
        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode);
    }

    return isHovering;
}

function drawRedCircleForHitbox(graphics, centerX, centerY, radius) {
    graphics.beginPath();
    graphics.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    graphics.fillStyle = "red";
    graphics.lineWidth = 2;
    graphics.fill();
    graphics.closePath();
}

function recieveNodesRedCircles(freeNodes,mouseX,mouseY){
    freeNodes.forEach(node => {
        if (node!==selectedNodeForDrawArrow){
            let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
            let receiveArrowY = node.keys[0].y -30;
            let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;
            drawRedCircleForHitbox(graphics,receiveArrowX,receiveArrowY,node.keys[0].arrowHitbox.radius);
        }       
        
    });
}

function makeNodeHaveChild(freeNodes,mouseX,mouseY){
    freeNodes.forEach(node => {
        let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
        let receiveArrowY = node.keys[0].y -30;
        let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;

        if (isMouseWithinHitboxBounds(mouseX,mouseY,receiveArrowX,receiveArrowY)){


            // if the a new level need to be created, do it here and push the new lowest node to that newly created level
            if(SelectedLevelForDrawArrowLevel > userDrawingTree.levels.length-2){
                if (isSelectedLevelsForDrawArrowLevel) {
                    // creates new level and adds node
                    userDrawingTree.levels.push([]);       
                    userDrawingTree.levels[SelectedLevelForDrawArrowLevel +1].push(node);
                    // removes newly add node from free nodes
                    freeNodes.splice(freeNodes.indexOf(node),1);
                    // set the parent node to have the new child node and make it not a leaf
                    selectedNodeForDrawArrow.C[SelectedChildDrawArrowLevel] = node;
                    selectedNodeForDrawArrow.leaf=false;
                    //  set the new nodes parent node to the parent and make it a leaf
                    node.parent = selectedNodeForDrawArrow;
                    node.leaf = true;
                }              
            } else {
                // if its not a new level
                if (isSelectedLevelsForDrawArrowLevel) {
                    console.log("PARENT Level : ",SelectedLevelForDrawArrowLevel)
                    console.log("INDEX to insters into parent child : ",SelectedChildDrawArrowLevel)

                    let parentNodeIndex = userDrawingTree.levels[SelectedLevelForDrawArrowLevel].indexOf(selectedNodeForDrawArrow);
                    let numChildrenInLevel = 0;
                    for (let nodeIndex = 0; nodeIndex < parentNodeIndex; nodeIndex++) {
                        let numChildrenInNode = userDrawingTree.levels[SelectedLevelForDrawArrowLevel][nodeIndex].C.filter(child => child !== undefined || child !== null).length;
                        numChildrenInLevel += numChildrenInNode;
                    }
                    numChildrenInLevel += SelectedChildDrawArrowLevel;
                    console.log(numChildrenInLevel)


                    // adds the node to the designated spot in levels
                    userDrawingTree.levels[SelectedLevelForDrawArrowLevel +1].splice(numChildrenInLevel,0,node);
                    // removes newly add node from free nodes
                    freeNodes.splice(freeNodes.indexOf(node),1);
                    // set the parent node to have the new child node and make it not a leaf
                    selectedNodeForDrawArrow.C[SelectedChildDrawArrowLevel] = node;
                    //  set the new nodes parent node to the parent and make it a leaf
                    node.parent = selectedNodeForDrawArrow;
                }  
            }

        } else {

        }
    });
}

// ==========================================================================
// ==========================================================================
// ==========================================================================

// GENERAL HELPERS ===========================================================
// ==========================================================================
// ==========================================================================

function isMouseWithinHitboxBounds(mouseX, mouseY, centerX, centerY) {
    const inXBounds = mouseX >= centerX - 10 && mouseX <= centerX + 10;
    const inYBounds = mouseY >= centerY - 10 && mouseY <= centerY + 10;
    return inXBounds && inYBounds;
}

// ==========================================================================
// ==========================================================================
// ==========================================================================
// returns two booleans to check if the mouse click is within the hitbox bounds


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
    let isCorrect = true;
    if (tree2.freeNodes.length>0){
        isCorrect =false;
        return isCorrect;
    }
    tree1.levels.forEach((logicLevel,levelIndex) => {
        logicLevel.forEach((logicNode,nodeIndex) => {
            let logicKeyValues = [];
            let userKeyValues = [];
            let tempLogicKeys = logicNode.keys.filter((key) => key.value != undefined);
            let tempUserKeys = tree2.levels[levelIndex][nodeIndex].keys.filter((key) => key.value != undefined);
            tempLogicKeys.forEach(key => {
                logicKeyValues.push(key.value);
            });
            tempUserKeys.forEach(key => {
                userKeyValues.push(key.value);
            });
             for (let keyIndex = 0; keyIndex < logicKeyValues.length; keyIndex++){

             }
            if (!deepArrayCompare(logicKeyValues,userKeyValues)){
                isCorrect = false;
                console.log("USER  : ",userKeyValues);
                console.log("LOGIC : ",logicKeyValues);
            }
        });
    });
    return isCorrect;

}

function deepArrayCompare(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}


// function areBTreesEqual(tree1, tree2) {
//     // Helper function for deep array comparison
    
//     let isCorrect = true;
//     tree1.levels.forEach((logicLevel, levelIndex) => {
//         logicLevel.forEach((logicNode, nodeIndex) => {
//             let logicKeyValues = [];
//             let userKeyValues = [];
//             let tempLogicKeys = logicNode.keys.filter((key) => key.value !== undefined);
//             let tempUserKeys = tree2.levels[levelIndex][nodeIndex].keys.filter((key) => key.value !== undefined);
//             tempLogicKeys.forEach(key => {
//                 logicKeyValues.push(key.value);
//             });
//             tempUserKeys.forEach(key => {
//                 userKeyValues.push(key.value);
//             });
//             if (!deepArrayCompare(logicKeyValues, userKeyValues)) {
//                 isCorrect = false;
//                 console.log("USER  : ", userKeyValues);
//                 console.log("LOGIC : ", logicKeyValues);
//             }
//         });
//     });
//     return isCorrect;
// }
