import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";
import { drawSplitFunction } from "./drawTree.js";

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

// HELPER FUNCTION
// does what is described above (split node and remove children functionality)
function addChildrenToFreeNode(levels, freeNodes, node, nodePlacement){ 

    function fixChildNodePlacement(node, nodePlacement){
        if (nodePlacement === 0){
            console.log("LEFT:",node.C);
            const firstElement = node.C.shift();
            node.C.push(firstElement);
            console.log("LEFT AFTER FIX:",node.C);
        } else if (nodePlacement === 1){
            console.log("RIGHT:",node.C);
            node.C.splice(node.C.length-1,0,undefined);
            console.log("RIGHT AFTER FIX:",node.C);
        } else if (nodePlacement === 2){
            console.log("MIDDLE:",node.C);
            let nodeCounter = 0;
            for (let index = 0; index <node.C.length;index++){
                if (node.C[index]!==undefined && node.C[index]!==null){
                    nodeCounter+=1;
                    if (nodeCounter === 2){
                        node.C[index-1]=node.C[index];
                        node.C[index] = undefined;
                    }
                }
            }
            console.log("MIDDLE AFTER FIX:",node.C);
        } else{
            console.log("MIDDLE:",node.C);
            for (let index = 0; index <node.C.length;index++){
                if (node.C[index] === undefined || node.C[index]===null){
                    while (index <node.C.length) {
                        node.C[index]=node.C[index+1];
                        index+=1;
                    }
                    break;
            
                    
                }
            }
            console.log("MIDDLE AFTER FIX:",node.C);

        }
    }

    if (nodePlacement === 0){
        // LEFT
        let children = [];
        let lastFirstIndex=0;
        for (let i = 0; i <  node.C.length; i++) {
            if (node.C[i] !== undefined && node.C[i] !== null) {
                lastFirstIndex = i; // Update the lastIndex when a non-undefined item is found
                break;
            }
        }
        for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
            for (let nodeIndex = 0; nodeIndex < levels[levelIndex].length; nodeIndex++) {
                let index = node.C.indexOf(levels[levelIndex][nodeIndex]);
                if (index === lastFirstIndex){      
                    console.log("BEFORE SPLICE:",node.C);              
                    if (lastFirstIndex===0){
                        node.C.splice(index, 1,undefined);
                        console.log("AFTER SPLICE:",node.C);  
                        freeNodes.push(levels[levelIndex][nodeIndex]);
                    } else {
                        node.C.splice(index-1, 1,undefined);
                        console.log("AFTER SPLICE:",node.C); 
                    }                                  
                    children.push(levels[levelIndex][nodeIndex]);
                    fixChildNodePlacement(node,nodePlacement);

                    break;
                    // addChildrenToFreeNode(levels,freeNodes,levels[levelIndex][nodeIndex]);
                }     
            }
        }
        for (let childIndex = 0; childIndex< children.length; childIndex++) {
            addChildrenToFreeNode(levels,freeNodes,children[childIndex],3);
        }
    } else if (nodePlacement === 1){
        // RIGHT
        let children = [];
        let lastIndex = node.C.length-1;
        for (let i = node.C.length-1; i >=0 ; i--) {
            if (node.C[i] === undefined || node.C[i] === null) {
                lastIndex = i-1; // Update the lastIndex when a non-undefined item is found
            }
        }
        for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
            for (let nodeIndex = 0; nodeIndex < levels[levelIndex].length; nodeIndex++) {
                let index = node.C.indexOf(levels[levelIndex][nodeIndex]);
                if (index === lastIndex && index !== -1){      
                    console.log("BEFORE SPLICE:",node.C);              

                    if (index === node.keys.filter((key) => key.value != undefined).length) {
                        freeNodes.push(levels[levelIndex][nodeIndex]);

                        node.C.splice(index, 1,undefined);
                        console.log("AFTER SPLICE:",node.C);              

                        children.push(levels[levelIndex][nodeIndex]);
                        fixChildNodePlacement(node,nodePlacement);
                    }
                    

                    break;
                    // addChildrenToFreeNode(levels,freeNodes,levels[levelIndex][nodeIndex]);
                }   
            }
        }
        for (let childIndex = 0; childIndex< children.length; childIndex++) {
            addChildrenToFreeNode(levels,freeNodes,children[childIndex],3);
        }

    } else if (nodePlacement === 2 ) {
        // MIDDLE
        let children = [];
        let lastIndex = node.C.length-1;
        for (let i = node.C.length-1; i >=0 ; i--) {
            if (node.C[i] === undefined && node.C[i] === null) {
                lastIndex = i-1; // Update the lastIndex when a non-undefined item is found
            }
        }
        for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
            for (let nodeIndex = 0; nodeIndex < levels[levelIndex].length; nodeIndex++) {
                let index = node.C.indexOf(levels[levelIndex][nodeIndex]);
                if (index !==0 && index !== lastIndex && index !== -1){    
                    console.log("BEFORE SPLICE:",node.C);              

                    if (node.keys.filter((key) => key.value != undefined).length % 2 === 0){
                        console.log("HEYO")
                        freeNodes.push(levels[levelIndex][nodeIndex]);
                        node.C.splice(index, 1,undefined);
                        children.push(levels[levelIndex][nodeIndex]);
                        console.log("AFTER SPLICE:",node.C);     
                        fixChildNodePlacement(node,nodePlacement +1);
                    } else {
                        freeNodes.push(levels[levelIndex][nodeIndex]);
                        node.C.splice(index, 1,undefined);
                        children.push(levels[levelIndex][nodeIndex]);
                        freeNodes.push(levels[levelIndex][nodeIndex+1]);
                        node.C.splice(index+1, 1,undefined);
                        children.push(levels[levelIndex][nodeIndex+1]);
                        console.log("AFTER SPLICE:",node.C);     
                        fixChildNodePlacement(node,nodePlacement);
                    }                   
                    break;
                }     
            }
        }
        for (let childIndex = 0; childIndex< children.length; childIndex++) {
            addChildrenToFreeNode(levels,freeNodes,children[childIndex],3);
        }

    } else {
        let children = [];
        for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
            for (let nodeIndex = 0; nodeIndex < levels[levelIndex].length; nodeIndex++) {
                let index = node.C.indexOf(levels[levelIndex][nodeIndex]);
                if (index !==-1){      
                    console.log(levels[levelIndex][nodeIndex]);    
                    console.log("BEFORE SPLICE:",node.C);              

                    freeNodes.push(levels[levelIndex][nodeIndex]);
                    node.C.splice(index, 1,undefined);
                    console.log("AFTER SPLICE:",node.C);              

                    children.push(levels[levelIndex][nodeIndex]);
                    // addChildrenToFreeNode(levels,freeNodes,levels[levelIndex][nodeIndex]);
                }     
            }
        }
        for (let childIndex = 0; childIndex< children.length; childIndex++) {
            addChildrenToFreeNode(levels,freeNodes,children[childIndex],3);
        }
    }
    
}

// HELPER FUNCTION
// checks the free node array and removes all nodes still in the levels representation
function removeFreeNodesFromLevel(levels, freeNodes) {
    for (let i = levels.length - 1; i >= 0; i--) {
        const level = levels[i];        
        for (let j = level.length - 1; j >= 0; j--) {
            const comparingNode = level[j];        
            if (freeNodes.includes(comparingNode)) {
                removeParentFromFreeNode(comparingNode);
                levels[i].splice(j, 1);
            }
        }
        }
}

// HELPER FUNCTION
// removes the node from its parent child node
function removeParentFromFreeNode(node){
    if (node.parent!==null){
        // let index = node.parent.C.indexOf(node)
        // node.parent.C.splice(index,1);
        // node.parent.C.splice(index,0,undefined);
        node.parent = null;
    }
}


// PULLS A KEY OFF A NODE
export function pullKeyOffTheTree(levels, freeNodes, mouseX, mouseY, moveFullNodeMode) { 
    
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
    let rootNodeSelcted = false;

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
                            console.log("ROOT");
                            rootNodeSelcted = true;
                        } else if (moveFullNodeMode === false){
                            // on selecting a new key, this adds the node to the free nodes structure and adds the key to the new node
                            selectedNode =  new BTreeNode(node.t, false);
                            selectedNode.keys[0] = selectedKey;
                            freeNodes.push(selectedNode); 
                            if (k===0){
                                if ( node.keys.filter((key) => key.value != undefined).length === 1){    
                                    //left with no keys
                                    console.log("LEFT NO KEYS");
                                    addChildrenToFreeNode(levels, freeNodes, node,3);
                                } else {
                                    //left with other keys
                                    console.log("LEFT");
                                    addChildrenToFreeNode(levels, freeNodes, node,0);
                                }                                
                            } else if (k === node.keys.filter((key) => key.value != undefined).length-1){
                                //right
                                console.log("RIGHT");
                                addChildrenToFreeNode(levels, freeNodes, node,1);
                            } else {
                                //middle
                                console.log("MIDLE");
                                addChildrenToFreeNode(levels, freeNodes, node,2);
                            }
                            
                            removeFreeNodesFromLevel(levels, freeNodes);

                            // this removes the selected key from the node
                            node.keys.splice(k,1);                           
                            
                            // if the node is empty it removes the node from the tree
                            if (isEmptyNode(node)){
                                console.log('parent slice HAPPNES NOW')
                                if (node.parent!==null){
                                    let index = node.parent.C.indexOf(node)
                                    node.parent.C.splice(index,1,undefined);  
                                }       
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
    return [selectedKey, selectedNode, draggedKeyIndex, draggedKeyNodeIndex, draggedKeyLevelIndex, isDragMode, isFreeNodeSelected, rootNodeSelcted]
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
                        let inXBounds = key.x - 60 <= mouseX && mouseX <= key.x + 60;
                        let inYBounds = key.y - 45 <= mouseY && mouseY <= key.y + 45;
                        // if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                        // && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                        if (inXBounds && inYBounds){ 
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
                        let inXBounds = key.x - 60 <= mouseX && mouseX <= key.x + 60;
                        let inYBounds = key.y - 45 <= mouseY && mouseY <= key.y + 45;
                        
                        if (selectedNode!==node){
                            // if (inXBounds && inYBounds && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.leftX, key.arrowHitbox.centerY)
                            // && !isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            if (inXBounds && inYBounds){  
                                dropOffKeyIndex = k;
                                dropOffNodeKeyIndex = j;               
        
                                    // if the mode is not in move full node then  do this
                                if (moveFullNodeMode === false){
                                    if (key !== selectedKey){
                                        keysThatNeedToChange.push(freeNodes[dropOffNodeKeyIndex].keys[dropOffKeyIndex]);
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
            // if (nodeToReceive.C[0] !== undefined && nodeToReceive.C[0] !== null){
            //     if (nodeToReceive.C[nodeToReceive.C.length-1] === undefined || nodeToReceive.C[nodeToReceive.C.length-1] === null){
            //         nodeToReceive.C.splice(nodeToReceive.C.length-1,1);
            //     }
            //     nodeToReceive.C.splice(0,0,undefined);
            // }
            console.log("LEFT AFTER ADD BACK",nodeToReceive.C)


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
                // if (nodeToReceive.C[undefinedIndex+1] !== undefined || nodeToReceive.C[undefinedIndex+1] !== null){
                //     nodeToReceive.C.splice(undefinedIndex+1,0,undefined);
                // }
                // console.log("RIGHT AFTER ADD BACK UNDEFINES",nodeToReceive.C)

            } else {
                // if there arent undefines, then push the key to the end of the array of keys
                nodeToReceive.keys.push(nodeToSnap.keys[0]);
                nodeToReceive.keys[nodeToReceive.keys.length-1].y = nodeToReceive.keys[1].y;
                // if (nodeToReceive.C[nodeToReceive.C.length-1] !== undefined || nodeToReceive.C[nodeToReceive.C.length-1]!== null){
                //     nodeToReceive.C.splice(nodeToReceive.keys.length,0,undefined);
                // }
                // console.log("RIGHT AFTER ADD BACK",nodeToReceive.C)


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
            // nodeToReceive.C.splice(insertKeyInThisIndex+1,0,undefined);

        } else {
            console.log("odd middle error look into it")
        }

    }
}

export function makeNodeHaveChild(levels, freeNodes, mouseX, mouseY, isLevelSelected, selectedLevel, selectedNode, selectedChild){
    // FIX ERROR HERE - PROBLEM WITH FREE NODES
    let complete = false;
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
                    complete = true;
                }    
            } else {
                // if its not a new level
                if (isLevelSelected) {

                    // console.log("NUM CHILDREN",numChildrenInLevel)
                    console.log("F SELECTED CHILD INT",selectedChild)    
                    console.log("F NODE",node);
                    console.log("F CHILD SELECTED NODE",selectedNode.C[selectedChild]);
                    console.log("F PARENT SELECTE NODE",selectedNode)

                    let parentNodeIndex = levels[selectedLevel].indexOf(selectedNode);
                    let numChildrenInLevel = 0;
                    for (let nodeIndex = 0; nodeIndex < parentNodeIndex; nodeIndex++) {
                        let numChildrenInNode = levels[selectedLevel][nodeIndex].C.filter(child => child !== undefined || child !== null).length;
                        if (nodeIndex!==0 && numChildrenInNode>0){
                            numChildrenInLevel+=1;
                        }
                        numChildrenInLevel += numChildrenInNode;
                    }
                    numChildrenInLevel += selectedChild;
                    
                    if (node!==selectedNode.C[selectedChild] && selectedNode.C[selectedChild]!==undefined && selectedNode.C[selectedChild]!== null){
                        levels[selectedLevel+1].splice(levels[selectedLevel+1].indexOf(selectedNode.C[selectedChild]),1)
                        freeNodes.push(selectedNode.C[selectedChild]);
                        selectedNode.C[selectedChild].parent = null;
                    }

                    // adds the node to the designated spot in levels
                    console.log("LEVEL INDEX",numChildrenInLevel)
                    console.log("LEVEL SELECTED",selectedLevel)

                    levels[selectedLevel +1].splice(numChildrenInLevel,0,node);
                    // removes newly add node from free nodes
                    freeNodes.splice(freeNodes.indexOf(node),1);
                    // set the parent node to have the new child node and make it not a leaf
                    selectedNode.C[selectedChild] = node;
                    //  set the new nodes parent node to the parent and make it a leaf
                    node.parent = selectedNode;
                    selectedNode.leaf = false;
                    node.leaf = true;
                    complete = true;
                    console.log(freeNodes);

                }  
            }
        }
    });

    // checks the free node array and removes all nodes still in the levels representation
    if (!complete) {
        levels.forEach(level => {
            level.forEach(node => {
                let treeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
                let receiveArrowY = node.keys[0].y -30;
                let receiveArrowX = (node.keys[treeNodeKeyLength-1].x + node.keys[0].x)/2;
                if (isMouseWithinHitboxBounds(mouseX,mouseY,receiveArrowX,receiveArrowY)){
                        if (selectedNode.C.indexOf(node) !==-1){
                        // if the levele is selcted and an idnetical arrow is not trying to be created then do the folowing
                            if (isLevelSelected && node !== selectedNode.C[selectedChild]) {

                                console.log("L PARENT Level : ",selectedLevel);
                                console.log("L INDEX to insters into parent child : ",selectedChild);                               
                                console.log("L SELECTED CHILD INT",selectedChild);  
                                console.log("L NODE",node);
                                console.log("L CHILD SELECTED NODE",selectedNode.C[selectedChild]);
                                console.log("L PARENT SELECTE NODE",selectedNode);
    
                                // adds the old node child to the freenodes
                                if (selectedNode.C[selectedChild] !== undefined && selectedNode.C[selectedChild] !== null) {
                                    freeNodes.push(selectedNode.C[selectedChild]);
                                    level.splice(level.indexOf(selectedNode.C[selectedChild]),1);
                                    addChildrenToFreeNode(levels,freeNodes,selectedNode.C[selectedChild],3);
                                    selectedNode.C[selectedChild].parent = null;
                                    selectedNode.C.splice(selectedChild,1,undefined);
                                }
    
                                // removing previous selcted items children and childrens children
                                for (let index = 0; index < selectedNode.C.length; index++) {
                                    if (selectedNode.C[index] === node && index !== selectedChild){
                                        console.log("FOR LOOP HUH",selectedNode.C[index]);
                                        console.log("FOR LOOP HUH INDEX",index);
                                        addChildrenToFreeNode(levels,freeNodes,selectedNode.C[index],3);                            
                                        level.splice(level.indexOf(selectedNode.C[index]),1);
                                        selectedNode.C.splice(index,1,undefined);                                       
                                        break;
                                    }                            
                                }
    
                                let parentNodeIndex = levels[selectedLevel].indexOf(selectedNode);
                                let numChildrenInLevel = 0;
                                for (let nodeIndex = 0; nodeIndex < parentNodeIndex; nodeIndex++) {
                                    let numChildrenInNode = levels[selectedLevel][nodeIndex].C.filter(child => child !== undefined || child !== null).length;
                                    if (nodeIndex!==0 && numChildrenInNode>0){
                                        numChildrenInLevel+=1;
                                        console.log("YAAAAAS",node);

                                    }
                                    numChildrenInLevel += numChildrenInNode;
                                }
                                
                                numChildrenInLevel += selectedChild;
    
                                
                                // adds the node to the designated spot in levels
                                levels[selectedLevel +1].splice(numChildrenInLevel,0,node);
                                
                                // set the parent node to have the new child node and make it not a leaf
                                //  set the new nodes parent node to the parent and make it a leaf
                                selectedNode.C[selectedChild] = node;
                                node.parent = selectedNode;
                                selectedNode.leaf=false;
                                node.leaf = true;
                            }      
                    }                    
                }
            });
        });
        removeFreeNodesFromLevel(levels, freeNodes);

    }
   
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
                            // if (node.C[k]===null || node.C[k]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.leftX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }                            
                        } 
                        // if the hover is on the right end then the right hitbox is shown
                        else if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            // if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }
                        }
                    } else {
                        // if the hover is on the right end then the right hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            // if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }
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
                            // if (node.C[k]===null || node.C[k]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.leftX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }                            
                        } 
                        // if the hover is on the right end then the right hitbox is shown
                        else if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            // if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }   
                            
                        }
                    } else {
                        // if the hover is on the right end then the right hitbox is shown
                        if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.rightX, key.arrowHitbox.centerY)) {
                            // if (node.C[k+1]===null || node.C[k+1]===undefined){
                                isHovering = true;
                                drawRedCircleForHitbox(graphics, key.arrowHitbox.rightX, key.arrowHitbox.centerY, key.arrowHitbox.radius);
                            // }
                        }
                    }                    
                }
            });
        });
    }

    return isHovering;
}

export function detectMouseHoverOverRootMedian(levels, mouseX, mouseY, graphics) {

    let isHovering = false;
        let rootNodeLength = levels[0][0].keys.filter((key) => key.value != undefined).length;
        if (rootNodeLength === levels[0][0].t *2-1) {
            levels[0][0].keys.forEach((key, k) => {
                if ((rootNodeLength+1)/2 - 1  === k){
                    // if index is undefined then ensure you first check lenght vs key number !!!!!!!!!!!!!!!!!!!!!!!!!!
                    if (key && key.value !== undefined) {
                            if (isMouseWithinHitboxBounds(mouseX, mouseY, key.arrowHitbox.centerX, key.arrowHitbox.centerY-60)) {
                                console.log('HAPPENING');
                                    isHovering = true;
                                    //drawRedCircleForHitbox(graphics, key.arrowHitbox.centerX, key.arrowHitbox.centerY - 60, key.arrowHitbox.radius);
                                    drawSplitFunction(graphics, [key.arrowHitbox.centerX, key.arrowHitbox.centerY - 60, key.arrowHitbox.centerX, key.arrowHitbox.centerY - 100], 10, 5);
                            }
                        }                    
                    }
                  
            });
        }
      

    return isHovering;
}

export function splitRootNode(levels) {

        let RootNode;
        let leftChildRootNode;
        let rightChildRootNode;
        let split = false;
        let rootNodeLength = levels[0][0].keys.filter((key) => key.value != undefined).length;
        if (rootNodeLength === levels[0][0].t *2-1) {
            levels[0][0].keys.forEach((key, k) => {
                if ((rootNodeLength+1)/2 - 1  === k){
                    RootNode =  new BTreeNode(levels[0][0].t, false);
                    RootNode.keys[0] = key;
                    key.centerY -= 100;
                    key.calculateArrowHitbox(30);
                    split = true;
                    if (levels.length>1){
                        leftChildRootNode =  new BTreeNode(levels[0][0].t, false);
                        rightChildRootNode =  new BTreeNode(levels[0][0].t, false);
                    } else {
                        leftChildRootNode =  new BTreeNode(levels[0][0].t, true);
                        rightChildRootNode =  new BTreeNode(levels[0][0].t, true);
                    }       
                    RootNode.C[0] =  leftChildRootNode;
                    RootNode.C[1] =  rightChildRootNode;      
                }                     
            });

            if (split){
                levels[0][0].keys.forEach((key, k) => {
                    //left child node
                    if ((rootNodeLength+1)/2 - 1  < k){
                        leftChildRootNode.keys[k] = key
                        leftChildRootNode.C[k] = levels[0][0].C[k];
                    }
                    //right child node
                    if ((rootNodeLength+1)/2 - 1  > k){
                        leftChildRootNode.keys[k- (rootNodeLength+1)/2 - 2] = key;
                        leftChildRootNode.C[k-(rootNodeLength+1)/2 - 2] = levels[0][0].C[k-(rootNodeLength+1)/2 - 2];
                    }
                });
                
                levels.unshift([]);
                levels[0].push(RootNode);
                levels[1].splice(0,1);
                levels[1].push(leftChildRootNode);
                levels[1].push(rightChildRootNode);
            }
        }
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

export function recieveNodesRedCircles(levels, freeNodes, selectedNode, graphics){
    freeNodes.forEach(node => {
        if (node!==selectedNode){
            let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
            let receiveArrowY = node.keys[0].y -30;
            let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;
            drawRedCircleForHitbox(graphics,receiveArrowX,receiveArrowY,node.keys[0].arrowHitbox.radius);
        }      
    });
    let nodeFound = false;
    levels.forEach(level => {
        level.forEach(node => {
            if (node === selectedNode){
                nodeFound = true;
            }
            if (node!==selectedNode && nodeFound && selectedNode.C.indexOf(node) !==-1){
                let freeNodeKeyLength = node.keys.filter((key) => key.value != undefined).length;
                let receiveArrowY = node.keys[0].y -30;
                let receiveArrowX = (node.keys[freeNodeKeyLength-1].x + node.keys[0].x)/2;
                drawRedCircleForHitbox(graphics,receiveArrowX,receiveArrowY,node.keys[0].arrowHitbox.radius);
            }      
        });
    });
}

export function drawBinIcon(graphics){
    graphics.strokeStyle = "red";
    graphics.lineWidth = 3;
    const size = 30; // Size of the "X"
    const x = canvas.width - size - 10; // Adjust the position as needed
    const y = canvas.height - size - 10; // Adjust the position as needed

    // Draw the first line of the "X"
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.lineTo(x + size, y + size);
    graphics.stroke();


    // Draw the second line of the "X"
    graphics.beginPath();
    graphics.moveTo(x + size, y);
    graphics.lineTo(x, y + size);
    graphics.stroke();

    return [x,y,x+size,y+size];
}