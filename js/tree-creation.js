/*ToDo: 
REFACTOR CODE (Clean it up)
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
Allow you to detect a hitbox that already has a child and when you draw an arrow to a different child, it overwrites to new child and the old child gets added to free nodes

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
import { pullKeyOffTheTree, snapFreeNodeOntoNode, findDropOffAreaOfNode, 
         detectMouseHoverOverArrowHitbox, recieveNodesRedCircles, findselectedItemsFromArrowHitBoxClick,
         makeNodeHaveChild, drawBinIcon} from "./manipulateTree.js";
import { makeTree } from "./makeTree.js";
import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";
import { validateTree } from "./validateTree.js";

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
let isFreeNodeSelected = false;
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

let seed;

let dropOffKeyIndex, dropOffNodeKeyIndex, dropOffLevelKeyIndex;

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
    
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode,  scaleFactor, null, null,null);
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
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor,  null, null,null);
    // note, when doing questions, pass in the userTree.root instead of the tree.root
    // the tree is used to validate the userTree, when questions are generated the correct implentation of insert is run on tree
}

function generateRandomTree(numKeys, seed) {
    const rng = new Math.seedrandom(seed);
    for (let i = 0; i < numKeys; i++) {
        const key = +Math.floor(rng() * 100);
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
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode,  scaleFactor, null, null,null);
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
    userDrawingTree.assignNodePositions(scaleFactor);
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor,  null, null,null);
    graphics.setTransform(1, 0, 0, 1, 0, 0);
}

function generateRandomQuestion(seed) {
    const rng = new Math.seedrandom(seed);
    validateButton.classList.toggle('invisible');
    randomQuestionButton.classList.toggle('invisible');

    let validationLabel = document.getElementById('validation');
    validationLabel.textContent = "";
    // CHANGE TO 3 WHEN SEARCH IS A THING
    const question = Math.floor(rng() * 2);

    let key = +Math.floor(rng() * 100);
    let questionDisplay = document.getElementById("question");
    if (question == 0) {
        //insert

        while (logicTree.root.search(key) != null) {
            key = +Math.floor(rng() * 100);
        }
        
        logicTree.insert(key);
        logicTree.traverse();

        let tempNode =  new BTreeNode(userDrawingTree.t, false);
        for (let keyIndex = 0; keyIndex<tempNode.keys; keyIndex++) {
            tempNode.keys[keyIndex].value = undefined;
        }
        tempNode.keys[0].value = key;
        tempNode.keys[0].x = 50;
        tempNode.keys[0].y = 50;
        tempNode.keys[0].calculateArrowHitbox();

        userDrawingTree.freeNodes.push(tempNode);
        questionDisplay.textContent = "Insert: " + key;
    } else if (question == 1) {
        //delete
        while (logicTree.root.search(key) == null) {
            key = +Math.floor(rng() * 100);
        }
        logicTree.remove(key);
        logicTree.traverse();

        questionDisplay.textContent = "Delete: " + key;
    } else if (question == 2) {
        //search
        key = Math.floor(rng() * 100); 
        console.log("Search: ", key)
        document.getElementById("question").innerHTML  = "Search: "+ key;
    }
    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode,  scaleFactor, null, null,null);
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

const darkModeIcon = document.querySelector('.dark-mode-toggle');
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

darkModeIcon.addEventListener('click', () => {
    body.classList.toggle("dark-mode");
});


saveButton.addEventListener('click', () => {
    if (logicTree && userDrawingTree){
        let treeDegreeLabel = document.getElementById('treeDegree');
        //hide
        saveButton.classList.toggle('invisible');
        createTreeParamtersContainer.classList.toggle('invisible');
        insertDeleteSection.classList.toggle('invisible');

        //show
        questionsParamtersContainer.classList.toggle('invisible');
        questionsParamtersContainer.classList.toggle('visible');

        treeDegreeLabel.textContent = "Tree Degree: " + logicTree.t;
    } else {
        errorMessageLabel.textContent = "Please create a tree before saving"
    }    
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

document.getElementById('seedButton').addEventListener('click', function() {
    seed = document.getElementById('seedInput').value;
    console.log(seed);

    if (!isNaN(seed) && seed == '') {
        alert('Please enter a valid seed (a number)');
    } 
});

customTreeButton.addEventListener('click', () => {
    if (!randomTreePresent){
        // there is no random tree created then run this
        if (!customTreePresent){
            // there is no custom tree created then run this
            if (maxDegreeInput.value) {
                if (+maxDegreeInput.value > 4 || +maxDegreeInput.value <= 1) {
                    errorMessageLabel.textContent = "Please enter a degree between 2 and 4";
                    customTreePresent = false;
                    return;
                } else {
                    logicTree = new BTree(+maxDegreeInput.value);
                    userDrawingTree = new BTree(+maxDegreeInput.value);
                    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                    insertDeleteSection.classList.toggle('invisible');
                    errorMessageLabel.textContent = "";
                    customTreePresent = true;
                    customTreeButton.textContent = "Cancel";
                    insertInput.focus();
                    return;
                }                
            }
        } else {
            // there is already a custom tree created then run this
            insertDeleteSection.classList.toggle('invisible');
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            clear();
            userDrawingTree = null;
            logicTree = null;
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

            if (+maxDegreeInput.value > 4 || +maxDegreeInput.value <= 1) {
                errorMessageLabel.textContent = "Please enter a degree between 2 and 4";
                randomTreePresent = false;
                return;
            } else  if (+numKeysInput.value > 20) {
                errorMessageLabel.textContent = "The max number of keys is 20";
                randomTreePresent = false;
                return;
            } else  if (+numKeysInput.value < 1) {
                errorMessageLabel.textContent = "The minimum number of keys is 1"; 
                randomTreePresent = false;
                return;
            } else {
                insertDeleteSection.classList.toggle('invisible');
                logicTree = new BTree(+maxDegreeInput.value);
                userDrawingTree = new BTree(+maxDegreeInput.value);
                generateRandomTree(+numKeysInput.value, seed);
                errorMessageLabel.textContent = "";
                randomTreePresent = true;
                randomTreeButton.textContent = "Cancel";
                insertInput.focus();
                return;
            }
        } else {
            // there is already a random tree created then run this
            insertDeleteSection.classList.toggle('invisible');
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            clear();
            userDrawingTree = null;
            logicTree = null;
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

randomQuestionButton.addEventListener('click', function() {
    generateRandomQuestion(seed);
});

validateButton.addEventListener('click', (e) => {
    let validationLabel = document.getElementById('validation');

    if (userDrawingTree && logicTree){
        let treeCorrect = validateTree(logicTree,userDrawingTree);
        if (treeCorrect){
            validationLabel.style.color = "green";
            validationLabel.textContent = "Your operation was valid";
            validateButton.classList.toggle('invisible');
            randomQuestionButton.classList.toggle('invisible');

        } else {
            validationLabel.style.color = "red";
            validationLabel.textContent = "Your operation was in-valid";
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
            let functionResult = pullKeyOffTheTree(userDrawingTree.levels, userDrawingTree.freeNodes,mouseX, mouseY, moveFullNodeMode); 
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
            if (moveFullNodeMode){
                if (draggedKeyIndex==0){
                    if (isFreeNodeSelected){
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    } else {
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    }
                }            
            } else {
                if (isFreeNodeSelected){
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
            }
            
            // Call drawTree because tree has not changed
            graphics.clearRect(0, 0, canvas.width  , canvas.height  );
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode,  scaleFactor, selectedKeyObject, false, false);

        }

        if (isMouseHoveringOverHitbox && isDrawArrowMode == false){
            isDrawArrowMode = true;
            let functionResult = findselectedItemsFromArrowHitBoxClick(userDrawingTree.levels,userDrawingTree.freeNodes,mouseX,mouseY);
            selectedKeyForDrawArrow = functionResult[0];
            selectedNodeForDrawArrow = functionResult[1];
            isSelectedLevelsForDrawArrowLevel = functionResult[2];
            SelectedChildDrawArrowLevel = functionResult[3];
            SelectedLevelForDrawArrowLevel = functionResult[4]


            console.log("isDrawarrowMode: ", isDrawArrowMode);
            console.log(selectedKeyForDrawArrow);
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (userDrawingTree && logicTree) {

        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        if (isDragMode) {
            if (moveFullNodeMode){
                if (draggedKeyIndex==0){
                    if (isFreeNodeSelected){
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    } else {
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                        userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                    }
                    graphics.clearRect(0, 0, canvas.width  , canvas.height);
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode,  scaleFactor, selectedKeyObject, false, false);
    
                }            
            } else {
                if (isFreeNodeSelected){
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.freeNodes[draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                } else {
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].x = mouseX;
                    userDrawingTree.levels[draggedKeyLevelIndex][draggedKeyNodeIndex].keys[draggedKeyIndex].y = mouseY;
                }
                // Call drawTree because tree has not changed
                let isInPlace= findDropOffAreaOfNode(userDrawingTree.levels, userDrawingTree.freeNodes,selectedKeyObject,selectedNodeObject, mouseX, mouseY, moveFullNodeMode)
                let binPositions = drawBinIcon(graphics);
                const isInsideBoundsBin = (mouseX >= binPositions[0] && mouseX <= binPositions[2]) && (mouseY >= binPositions[1] && mouseY <= binPositions[3]);
                if (isInsideBoundsBin) {
                    graphics.clearRect(0, 0, canvas.width  , canvas.height);
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode,scaleFactor, selectedKeyObject, true, true);
                    drawBinIcon(graphics);
                } else {
                    if (isInPlace[0].length>0){
                        graphics.clearRect(0, 0, canvas.width  , canvas.height);
                        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode,scaleFactor, selectedKeyObject, true, false);
                        drawBinIcon(graphics);
                    } else {
                        graphics.clearRect(0, 0, canvas.width  , canvas.height);
                        drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode,  scaleFactor, selectedKeyObject, false, false);
                        drawBinIcon(graphics);
                    }
                }
            }
        } else {
            // draws the red dot
            if(userDrawingTree){
                isMouseHoveringOverHitbox = detectMouseHoverOverArrowHitbox(userDrawingTree.levels, userDrawingTree.freeNodes, mouseX,mouseY, graphics);
                if (!isMouseHoveringOverHitbox) {
                    graphics.clearRect(0, 0, canvas.width  , canvas.height  );
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode, scaleFactor, null,null,null);

                }
                if (isDrawArrowMode && selectedKeyForDrawArrow) {
                    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                    drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode,  scaleFactor, null, null,null);
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
                if (rootNodeSelcted===false){
                    let binPositions = drawBinIcon(graphics);
                    const isInsideBoundsBin = (mouseX >= binPositions[0] && mouseX <= binPositions[2]) && (mouseY >= binPositions[1] && mouseY <= binPositions[3]);
                    if (isInsideBoundsBin && userDrawingTree.freeNodes.indexOf(selectedNodeObject)!==-1) {
                        userDrawingTree.freeNodes.splice(userDrawingTree.freeNodes.indexOf(selectedNodeObject),1);
                    } else {
                        //  if a node is being dragged get the keys its trying to snap too
                        let functionResult = findDropOffAreaOfNode(userDrawingTree.levels, userDrawingTree.freeNodes, selectedKeyObject,selectedNodeObject, mouseX, mouseY,moveFullNodeMode);
                        let insertToTheseKeys = functionResult[0];
                        let isNodeAFreeNodeChecker = functionResult[1];
                        dropOffKeyIndex = functionResult[2];
                        dropOffNodeKeyIndex = functionResult[3];
                        dropOffLevelKeyIndex = functionResult[4];
                        
                        if (insertToTheseKeys.length > 0 && selectedKeyObject!==null){
                            // snape the node to the new node
                            if (isNodeAFreeNodeChecker){
                                snapFreeNodeOntoNode(userDrawingTree.freeNodes, selectedNodeObject, userDrawingTree.freeNodes[dropOffNodeKeyIndex] , insertToTheseKeys, selectedKeyObject);
                            } else {
                                snapFreeNodeOntoNode(userDrawingTree.freeNodes, selectedNodeObject, userDrawingTree.levels[dropOffLevelKeyIndex][dropOffNodeKeyIndex], insertToTheseKeys, selectedKeyObject);
                            }
                        }
                    }
                
                }                    
            } else if (isDrawArrowMode) {
                isDrawArrowMode = false;
                if (rootNodeSelcted===false){
                    // child logic here levels, freeNodes, mouseX, mouseY, isLevelSelected, selectedLevel, selectedNode, selectedChild)
                    makeNodeHaveChild(userDrawingTree.levels, userDrawingTree.freeNodes,mouseX,mouseY,isSelectedLevelsForDrawArrowLevel,SelectedLevelForDrawArrowLevel, selectedNodeForDrawArrow, SelectedChildDrawArrowLevel)
                } 
            }
            // Call drawTree because tree has not changed
            graphics.clearRect(0, 0, canvas.width  , canvas.height  );
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes,moveFullNodeMode, scaleFactor, null,null,null);
            console.log(userDrawingTree)
            if (rootNodeSelcted){
                rootNodeSelcted=false;
            }
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
            drawTree(userDrawingTree.root, canvas, userDrawingTree.freeNodes, moveFullNodeMode, scaleFactor, null, null);
            // You can add your code here to handle the spacebar event
          }
    }
});





// TODO: Draw free nodes where they are supposed be be on zoom and pan so i.e. apply translations to those nodes too don't just call redraw

// They are the coordinates of the center and 30 is the width and height 
// So check 15 to right and left, and 15 up and down to see if mouse click is within that key.
// from mouse click check horizontal bounds and vertical bounds with withinBounds booleans
// In fact its 30 in both directions