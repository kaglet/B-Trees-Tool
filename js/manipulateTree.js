import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";

//const hitBoxSize = 10;

// HELPER FUNCTION
function isMouseWithinHitboxBounds(mouseX, mouseY, centerX, centerY) {
    const inXBounds = mouseX >= centerX - 10 && mouseX <= centerX + 10;
    const inYBounds = mouseY >= centerY - 10 && mouseY <= centerY + 10;
    return inXBounds && inYBounds;
}

// HELPER FUNCTION
function drawRedCircleForHitbox(graphics, centerX, centerY, radius) {
    graphics.beginPath();
    graphics.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    graphics.fillStyle = "red";
    graphics.lineWidth = 2;
    graphics.fill();
    graphics.closePath();
}

// PULLS A KEY OFF A NODE
export function pullKeyOffTheTree(levels, freeNodes, mouseX, mouseY, moveFullNodeMode) {

    // removes the node from its parent child node
    function removeParentFromFreeNode(node){
        if (node.parent!==null){
            let index = node.parent.C.indexOf(node)
            node.parent.C.splice(index,1);
            node.parent.C.splice(index,0,undefined);
        }
    }

    // does what is described above (split node and remove children functionality)
    function addChildrenToFreeNode(levels, freeNodes, node , position, k){ 



        // used to find all children
        function findParent(node, comparingNode){

            if (comparingNode.parent === null){
                return false;
            } else if (node === comparingNode.parent){
                return true;
            }

            findParent(node, comparingNode.parent);
        }

        // LEFT
        if (position === 0 ){
            levels.forEach((level, i) => {
                level.forEach((comparingNode, j) => {
                    if (node.C[k] === comparingNode){
                        console.log(comparingNode)
                        console.log('is this happening left')

                        if (findParent(node, comparingNode)){
                            freeNodes.push(comparingNode);
                            node.C.splice(k,1);
                            removeParentFromFreeNode(comparingNode);
                        }
                        comparingNode.C.forEach((comparingNodeChild) => {
                            if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                                if (findParent(comparingNode, comparingNodeChild, j)){
                                    freeNodes.push(comparingNodeChild);
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
            levels.forEach((level, i) => {
                level.forEach((comparingNode, j) => {
                    if (node.C[k+1]=== comparingNode){
                        console.log('is this happening right')

                        if (findParent(node, comparingNode)){
                            freeNodes.push(comparingNode);
                            node.C.splice(k+1,1);
                            removeParentFromFreeNode(comparingNode);
                        }
                        comparingNode.C.forEach((comparingNodeChild, j) => {
                            if (comparingNodeChild!= null || comparingNodeChild!= undefined){
                                if (findParent(comparingNode, comparingNodeChild)){
                                    freeNodes.push(comparingNodeChild);
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
            levels.forEach((level, i) => {
                level.forEach((comparingNode, j) => {
                    if (node.C[k] === comparingNode || node.C[k+1] === comparingNode){
                        if (findParent(node, comparingNode)){
                            freeNodes.push(comparingNode);
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
                                    freeNodes.push(comparingNodeChild);
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
    function removeFreeNodesFromLevel(levels, freeNodes) {
        for (let i = levels.length - 1; i >= 0; i--) {
            const level = levels[i];
        
            for (let j = level.length - 1; j >= 0; j--) {
                const comparingNode = level[j];
        
                if (freeNodes.includes(comparingNode)) {
                    levels[i].splice(j, 1);
                }
            }
            }
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

    // Initialize
    let selectedKey = null;
    let selectedNode = null;
    let isDragMode = false;
    let isFreeNodeSelected = false;
    let draggedKeyIndex = -1;
    let draggedKeyNodeIndex = -1;
    let draggedKeyLevelIndex = -1;

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
                        selectedKey = key;
                        console.log(`I am key in the tree`, selectedKey);
         
                        // if the move full node option is not selected then do the following (allow user to break a key of a node)
                        if (node.parent === null && node.keys.filter((key) => key.value != undefined).length === 1 ){
                            rootNodeSelcted = true;
                        } else if (moveFullNodeMode === false){
                            // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                            selectedNode =  new BTreeNode(node.t, false);
                            selectedNode.keys[0] = selectedKey;
                            freeNodes.push(selectedNode);                          

                            // this makes all the children of the selected key into free nodes  if nmber of keys is > 1
                            // case dependant                           
                            if (k===0 && node.keys.filter((key) => key.value != undefined).length > 1){
                                //left case
                                // if the key is on the left of the node, remove only the left child and the subtree
                                addChildrenToFreeNode(levels, freeNodes,node, 0,k);
                            } else if (k === node.keys.filter((key) => key.value != undefined).length -1 && node.keys.filter((key) => key.value != undefined).length > 1){
                                //right case
                                // if the key is on the right of the node, remove only the right child and the subtree
                                addChildrenToFreeNode(levels, freeNodes,node, 1,k);

                            } else {
                                // middle case
                                // if the key is in the middle of the node, remove two of the children
                                addChildrenToFreeNode(levels, freeNodes,node, 2,k);
                            }
                            // checks the free node array and removes all nodes still in the levels representation
                            removeFreeNodesFromLevel(levels, freeNodes);

                            // this removes the selected key from the node
                            node.keys.splice(k,1);                           
                            
                            // if the node is empty it removes the node from the tree
                            if (isEmptyNode(node)){
                                console.log('parent slice HAPPNES NOW')
                                removeParentFromFreeNode(node);                                
                                levels[i].splice(j,1);                            
                            } 
                        }                        
                    }
                }
            });
        });       
    }); 
    
    freeNodes.forEach((node, j) => {
        node.keys.forEach((key, k) => {
            // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
            if (!(key.value === undefined)) {
                // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                let inXBounds = key.x - 30 <= mouseX && mouseX <= key.x + 30;
                let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                    isDragMode = true;
                    isFreeNodeSelected = true;    
                    draggedKeyIndex = k;
                    draggedKeyNodeIndex = j;    
                    selectedKey = key;
                    console.log(`I am key in the free nodes`, selectedKey);
                    // if the mode is not in move full node then  do this
                    if (moveFullNodeMode === false){
                            // if the node has more than one key then allow splitting else just move the node
                            if (node.keys.filter((key) => key.value != undefined).length >1){
                                // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                                selectedNode =  new BTreeNode(node.t, node.leaf);
                                selectedNode.keys[0] = selectedKey;
                                freeNodes.push(selectedNode);
                                // get the new index in the free nodes stucture
                                draggedKeyIndex = 0;
                                draggedKeyNodeIndex = freeNodes.indexOf(selectedNode);   
                                
                                // rmove the key from the older node
                                node.keys.splice(k,1);
                                // if the node is empty it removes the node from the free node structure 
                                if (isEmptyNode(node)){
                                    freeNodes.splice(j,1);                            
                                } 
                            } else {
                                selectedNode = node;
                            }                     
                    }                       
                }
            }
        });
    });
    return [selectedKey, selectedNode, draggedKeyIndex, draggedKeyNodeIndex, draggedKeyLevelIndex, isDragMode, isFreeNodeSelected]
}

// FIND THE DROP OFF WHEN DRAGGING NODE
export function findDropOffAreaOfNode(levels, freeNodes,selectedKey,selectedNode, mouseX, mouseY, moveFullNodeMode){

    let dropOffKeyIndex = -1;
    let dropOffNodeKeyIndex = -1;
    let dropOffLevelKeyIndex = -1;

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
                                if (key !== selectedKey){
                                    keysThatNeedToChange.push(level[dropOffNodeKeyIndex].keys[dropOffKeyIndex]);
                                }                                
                            }                        
                        }
                    }
                });
            });       
        }); 
        if (keysThatNeedToChange.length === 0) {
            freeNodes.forEach((node, j) => {
                node.keys.forEach((key, k) => {
                    // If coordinate x and y are in range defined by key both then this is the key whose index must be saved
                    if (!(key.value === undefined)) {
                        // This code assumes key.x and key.y define the top left corner and the region of the key is defined by adding 30
                        let inXBounds = key.x - 45 <= mouseX && mouseX <= key.x + 45;
                        let inYBounds = key.y - 30 <= mouseY && mouseY <= key.y + 30;
                        
                        if (selectedNode!==node){
                            if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                            && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {  
                                dropOffKeyIndex = k;
                                dropOffNodeKeyIndex = j;               
        
                                    // if the mode is not in move full node then  do this
                                if (moveFullNodeMode === false){
                                    if (key !== selectedkey){
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
    return [keysThatNeedToChange,isNodeAFreeNode, dropOffKeyIndex, dropOffNodeKeyIndex, dropOffLevelKeyIndex];
}

// SNAPS FREE NODE INTO CORRECT FREE NODE/LEVEL NODE
export function snapFreeNodeOntoNode(freeNodes, nodeToSnap, nodeToReceive, keysBetween, selectedkey){
    // if there is only one node to snap to, it is the left end or right end
    console.log(nodeToSnap)
    if (keysBetween.indexOf(selectedkey)!==-1){
        keysBetween.splice(keysBetween.indexOf(selectedkey),1);
    }
    if (keysBetween.length === 1){
        // end of a node
        // consider left or right
        if (nodeToSnap.keys[0].x < nodeToReceive.keys[0].x + 10){
            // left end
            console.log('ADD LEFT ',nodeToSnap,' to end',nodeToReceive);
            //remove the node to snap from the free nodes and add the key to the beinging of the new nodes keys and fix the y value
            freeNodes.splice(freeNodes.indexOf(nodeToSnap),1);
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
            freeNodes.splice(freeNodes.indexOf(nodeToSnap),1);

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
            freeNodes.splice(freeNodes.indexOf(nodeToSnap),1);
            nodeToReceive.keys.splice(insertKeyInThisIndex,0,nodeToSnap.keys[0]);
            nodeToReceive.keys[insertKeyInThisIndex].y = nodeToReceive.keys[0].y;

        } else {
            console.log("odd middle error look into it")
        }

    }
}


export function makeNodeHaveChild(levels, freeNodes, mouseX, mouseY, isLevelSelected, selectedLevel, selectedNode, selectedChild){
    freeNodes.forEach(node => {
        let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
        let receiveArrowY = node.keys[0].y -30;
        let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;

        if (isMouseWithinHitboxBounds(mouseX,mouseY,receiveArrowX,receiveArrowY)){
            // if the a new level need to be created, do it here and push the new lowest node to that newly created level
            if(selectedLevel > levels.length-2){
                if (isLevelSelected) {
                    // creates new level and adds node
                    levels.push([]);       
                    levels[selectedLevel +1].push(node);
                    // removes newly add node from free nodes
                    freeNodes.splice(freeNodes.indexOf(node),1);
                    // set the parent node to have the new child node and make it not a leaf
                    selectedNode.C[selectedChild] = node;
                    selectedNode.leaf=false;
                    //  set the new nodes parent node to the parent and make it a leaf
                    node.parent = selectedNode;
                    node.leaf = true;
                }              
            } else {
                // if its not a new level
                if (isLevelSelected) {
                    console.log("PARENT Level : ",selectedLevel)
                    console.log("INDEX to insters into parent child : ",selectedChild)

                    let parentNodeIndex = levels[selectedLevel].indexOf(selectedNode);
                    let numChildrenInLevel = 0;
                    for (let nodeIndex = 0; nodeIndex < parentNodeIndex; nodeIndex++) {
                        let numChildrenInNode = levels[selectedLevel][nodeIndex].C.filter(child => child !== undefined || child !== null).length;
                        numChildrenInLevel += numChildrenInNode;
                    }
                    numChildrenInLevel += selectedChild;
                    console.log(numChildrenInLevel)


                    // adds the node to the designated spot in levels
                    levels[selectedLevel +1].splice(numChildrenInLevel,0,node);
                    // removes newly add node from free nodes
                    freeNodes.splice(freeNodes.indexOf(node),1);
                    // set the parent node to have the new child node and make it not a leaf
                    selectedNode.C[selectedChild] = node;
                    //  set the new nodes parent node to the parent and make it a leaf
                    node.parent = selectedNode;
                }  
            }

        } else {

        }
    });
}

export function detectMouseHoverOverArrowHitbox(levels, freeNodes, mouseX, mouseY, graphics) {

    let isHovering = false;
    levels.forEach((level, i) => {
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
        freeNodes.forEach((node, j) => {
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

    return isHovering;
}

// finds the selcted node, level and key when selecting the hit box
export function findselectedItemsFromArrowHitBoxClick(levels,freeNodes,mouseX,mouseY){
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
        freeNodes.forEach((node, j) => {
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

export function recieveNodesRedCircles(freeNodes, selectedNode, graphics){
    freeNodes.forEach(node => {
        if (node!==selectedNode){
            let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
            let receiveArrowY = node.keys[0].y -30;
            let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;
            drawRedCircleForHitbox(graphics,receiveArrowX,receiveArrowY,node.keys[0].arrowHitbox.radius);
        }       
        
    });
}

