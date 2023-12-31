let graphics;
import { BTree, BTreeNode, BTreeKey } from "./balancedTree.js";
let scaleFactor;


export function drawTree(node, canvas, freeNodes, moveFullNodeMode, scaleFactor1, selectedKey, isBoundSnap, isBoundBin ) {
    scaleFactor = scaleFactor1;
    graphics = canvas.getContext("2d");
    //let canvasWidth = canvas.width;
    if (!node) return;

    drawFreeNodes(freeNodes,moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin );        
    const keys = getNodeKeys(node);
    // const keys = node.keys.filter((key) => key.value !== undefined);
    const nodeWidth = getNodeWidth(keys);
    const nodeSpacing = 40;
    const arrowSize = 15; // Size of the arrowhead

    drawNode(keys, graphics, moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin);    
    fixSnapping(node, moveFullNodeMode);

    if (!node.leaf) {
        const numChildren = node.C.length;

        const childXPositions = [];        

        node.C.forEach((child, index) => {
            if (childExists(child) && hasChildKeys(child)) {
                const childKeys = getChildKeys(child);
                let childWidth = calculateChildWidth(child);
                const childX = getChildX(child);
                const childY = getChildY(child);
                // const isLessThanKey = isChildLessThanKey(childKeys,keys,index);

                //arrowCoordinates = [startX,startY,endX,endY]
                const arrowCoordinates = calculateArrowCoordinates(keys,nodeWidth,index,node,childX,childWidth,childY);
                drawArrow(graphics,arrowCoordinates,arrowSize,childWidth);

                childXPositions.push(childX);

                drawTree(child, canvas, [], moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin);
            }
        });

    }

    

}

function drawFreeNodes(freeNodes, moveFullNodeMode,selectedKey, isBoundSnap, isBoundBin){
    
    if(freeNodes.length > 0){
        freeNodes.forEach((node, index) => {
            fixSnapping(node, moveFullNodeMode);
            const keys = getNodeKeys(node);
            // const keys = node.keys.filter((key) => key.value !== undefined);
            const nodeWidth = getNodeWidth(keys);
            const nodeSpacing = 40;
            const arrowSize = 15; // Size of the arrowhead
            drawNode(keys, graphics, moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin);
        });
    }
    
    
}


function getNodeWidth(keys) {
    
    return keys.length * 60 * scaleFactor;
    // return keys.length * 60;
}

function getNodeKeys(node) {
    return node.keys.filter((key) => key.value != undefined);
}

function getChildY(child) {
    return child.keys[0].y - 30;
}

function getChildX(child) {
    return child.keys[0].x - 30;
}

function isChildLessThanKey(childKeys, keyValues, index) {
    const childKeyValue = childKeys[0] ? childKeys[0].value : undefined;
    const keyToCompare = keyValues[index] ? keyValues[index].value : undefined;
    return childKeyValue !== undefined && keyToCompare !== undefined
        ? childKeyValue < keyToCompare
        : false;
}

function drawKey(key, graphics = graphics, keyZero, moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin) {
    key.calculateArrowHitbox(30);

    const keySize = 60; //problem with scaling??
    if (moveFullNodeMode && keyZero === 0){
        graphics.fillStyle = "lightgreen";
    } else {
        if (key === selectedKey){
            if (isBoundBin) {
                graphics.fillStyle = "#FFCCCC";
            } else {
                if (!isBoundSnap){
                    graphics.fillStyle = "#87CEFA";
                } else {
                    graphics.fillStyle = "lightgreen";
                }
            }
        } else {
            graphics.fillStyle = "lightblue";
        }
    }

    graphics.strokeStyle = "black";
    graphics.lineWidth = 2;
    graphics.strokeRect(key.x-30, key.y-30, keySize, keySize);

    graphics.fillRect(key.x-30, key.y-30, keySize, keySize);  //fills blue small rect

    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    graphics.fillText(key.value, key.x, key.y);  //drawing key text, numbers
    
}

export function drawNode(keys, graphics, moveFullNodeMode , selectedKey, isBoundSnap, isBoundBin) {
    const nodeHeight = 60;
    // const validKeys = keys;
    const validKeys = keys.filter((key) => key.x !== undefined);  //tking away undefined from array
  
    // const nodeWidth = validKeys.length * 60;    //the whole node width (black outlined rects)
    const nodeWidth = 60;
    // draw the node rectangle
    // graphics.strokeRect(validKeys[0].x - 30, validKeys[0].y - 30, nodeWidth, nodeHeight);

    // draw keys in the node
    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";

    validKeys.forEach((key, keyZero) => {

        drawKey(key, graphics, keyZero, moveFullNodeMode, selectedKey, isBoundSnap, isBoundBin);
        
    });
}

function fixSnapping(node, moveFullNodeMode) {
    let prevX;
    let prevY;
    node.keys.filter((key) => key.value != undefined).forEach((key, k) => {
        if (key.value !== undefined) {
            if (k != 0) {
                prevX = node.keys[k - 1].x + 60;
                key.x = prevX;

                prevY = node.keys[k - 1].y;
                key.y = prevY;
            } 
        }
    }); 
    // if (moveFullNodeMode === false ){
    //     let prevX;
    //     node.keys.forEach((key, k) => {
    //         if (key.value !== undefined) {
    //             if (k != 0) {
    //                 prevX = node.keys[k - 1].x + 60;
    //                 key.x = prevX;
    //             }
    //         }
    //     });
    // } else {
    //     let prevX;
    //     let prevY;
    //     node.keys.filter((key) => key.value != undefined).forEach((key, k) => {
    //         if (key.value !== undefined) {
    //             if (k != 0) {
    //                 console.log(node)

    //                 prevX = node.keys[k - 1].x + 60;
    //                 key.x = prevX;

    //                 prevY = node.keys[k - 1].y;
    //                 key.y = prevY;
    //             } 
    //         }
    //     });      
        
    // } 
}


function calculateArrowStartX(keys, nodeWidth, index, node) {
    return keys[0].x-30 + (index) * 60;
}

function calculateArrowStartY(keys){
    return keys[0].y+30;
}

function calculateArrowEndX(childX,childWidth){
    return childX + childWidth;
}

function calculateArrowEndY(childY){
    return childY;
}

function calculateArrowCoordinates(keys, nodeWidth, index, node, childX, childWidth, childY){
    const arrowStartX = calculateArrowStartX(keys, nodeWidth, index, node);
    const arrowStartY = calculateArrowStartY(keys);
    const arrowEndX = calculateArrowEndX(childX, childWidth);
    const arrowEndY = calculateArrowEndY(childY);

    return [arrowStartX, arrowStartY, arrowEndX, arrowEndY];
}

function drawArrowLine(graphics,arrowCoordinates){
    graphics.save();
    graphics.beginPath();
    graphics.moveTo(arrowCoordinates[0], arrowCoordinates[1]); // Arrow starts from the appropriate side of the key
    graphics.lineTo(arrowCoordinates[2], arrowCoordinates[3]);
    graphics.lineWidth = 3;
    graphics.strokeStyle = "orange";
    graphics.stroke();
    graphics.closePath();
    graphics.restore();
}

export function calculateArrowHeadAngle(arrowCoordinates,childWidth){
    return Math.atan2(arrowCoordinates[3] - arrowCoordinates[1], arrowCoordinates[2] - arrowCoordinates[0]);
}

function calculateArrowHeadCoordinates(arrowCoordinates,arrowSize,angle){
    const arrowheadStartX = arrowCoordinates[2]- arrowSize * Math.cos(angle - Math.PI / 6);
    const arrowheadStartY = arrowCoordinates[3] - arrowSize * Math.sin(angle - Math.PI / 6);
    const arrowheadEndX = arrowCoordinates[2] - arrowSize * Math.cos(angle + Math.PI / 6);
    const arrowheadEndY = arrowCoordinates[3] - arrowSize * Math.sin(angle + Math.PI / 6);

    return [arrowheadStartX, arrowheadStartY, arrowheadEndX, arrowheadEndY];
}

export function drawArrowhead(graphics, arrowCoordinates, arrowSize, childWidth){
    graphics.beginPath();
    graphics.moveTo(arrowCoordinates[2], arrowCoordinates[3]);

    const angle = calculateArrowHeadAngle(arrowCoordinates,childWidth);

    const arrowHeadCoordinates = calculateArrowHeadCoordinates(arrowCoordinates,arrowSize,angle);

    graphics.lineTo(arrowHeadCoordinates[0], arrowHeadCoordinates[1]);
    graphics.lineTo(arrowHeadCoordinates[2], arrowHeadCoordinates[3]);
    graphics.fillStyle = "orange";
    graphics.fill();
    graphics.closePath();

    graphics.restore();

}

function childExists(child){
    return child;
}

function hasChildKeys(child) {
    return child.keys && child.keys.length > 0;
}

function getChildKeys(child){
    return child.keys.filter((key) => key.value != undefined);
}

function calculateChildWidth(child) {
    let childWidth = 0;

    child.keys.forEach((key) => {
        if (key.value != undefined) {
            childWidth += 30;
        }
    });

    return childWidth;
}

export function drawArrow(graphics,arrowCoordinates,arrowSize,childWidth){
    drawArrowLine(graphics,arrowCoordinates);
    drawArrowhead(graphics,arrowCoordinates,arrowSize,childWidth);
}

export function drawSplitFunction(graphics,arrowCoordinates,arrowSize,childWidth){
    drawArrow(graphics,arrowCoordinates,arrowSize,childWidth);
    let leftArrowCoordinates = [arrowCoordinates[0],arrowCoordinates[1]-10,arrowCoordinates[2]-15,arrowCoordinates[3]+10];
    drawArrow(graphics,leftArrowCoordinates,arrowSize,childWidth);
    let rightArrowCoordinates = [arrowCoordinates[0],arrowCoordinates[1]-10,arrowCoordinates[2]+15,arrowCoordinates[3]+10];
    drawArrow(graphics,rightArrowCoordinates,arrowSize,childWidth);
    
}

// draw floating levels if present