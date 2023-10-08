let graphics;

export function drawTree(node, canvas) {
    graphics = canvas.getContext("2d");
    let canvasWidth = canvas.width;
    if (!node) return;

    const keys = node.keys;
    // const keys = node.keys.filter((key) => key.value !== undefined);
    const nodeWidth = keys.length * 60;
    const nodeSpacing = 40;
    const arrowSize = 15; // Size of the arrowhead

    drawNode(keys, graphics);

    if (!node.leaf) {
        const numChildren = node.C.length;

        const childXPositions = [];

        node.C.forEach((child, index) => {
            if (child && child.keys && child.keys.length > 0) {
                const childKeys = child.keys.filter((key) => key.value != undefined);
                let childWidth = 0;

                // Calculate childWidth using the length of child.keys with values
                child.keys.forEach((key) => {
                    if (key.value != undefined) {
                        childWidth += 30;
                    }
                });

                const childX = child.keys[0].x - 30;
                const childY = child.keys[0].y - 30;

                // Determine if the child is less than or greater than the key
                const childKeyValue = childKeys[0] ? childKeys[0].value : undefined;
                const keyToCompare = keys[index] ? keys[index].value : undefined;
                const isLessThanKey = childKeyValue !== undefined && keyToCompare !== undefined
                    ? childKeyValue < keyToCompare
                    : false;


                // Calculate the arrow starting point
                /* boat anchor
                const arrowStartX = isLessThanKey
                    ? keys[0].x - nodeWidth / 2 + (index + 1) * 60 + (node.t - 2) * 60
                    : keys[0].x + nodeWidth / 2 - (keys.length - index - 1) * 60 + (node.t - 2) * 60;
                */
               //arrowCoordinates = [startX,startY,endX,endY]
                const arrowCoordinates = calculateArrowCoordinates(isLessThanKey,keys,nodeWidth,index,node,childX,childWidth,childY);
                drawArrowLine(graphics,arrowCoordinates);

                // graphics.save();
                // graphics.beginPath();
                // graphics.moveTo(arrowStartX, keys[0].y + 30); // Arrow starts from the appropriate side of the key
                // graphics.lineTo(childX + childWidth, childY);
                // graphics.lineWidth = 3;
                // graphics.strokeStyle = "orange";
                // graphics.stroke();
                // graphics.closePath();



                graphics.beginPath();
                graphics.moveTo(childX + childWidth, childY);

                // Calculate the angle between the arrow line and the horizontal axis
                const angle = Math.atan2(childY - (keys[0].y + 30), childX + childWidth - arrowCoordinates[0]);

                // Calculate the coordinates of the arrowhead
                const arrowheadX1 = (childX + childWidth) - arrowSize * Math.cos(angle - Math.PI / 6);
                const arrowheadY1 = childY - arrowSize * Math.sin(angle - Math.PI / 6);
                const arrowheadX2 = (childX + childWidth) - arrowSize * Math.cos(angle + Math.PI / 6);
                const arrowheadY2 = childY - arrowSize * Math.sin(angle + Math.PI / 6);

                // Draw the arrowhead triangle
                graphics.lineTo(arrowheadX1, arrowheadY1);
                graphics.lineTo(arrowheadX2, arrowheadY2);
                graphics.fillStyle = "orange";
                graphics.fill();
                graphics.closePath();

                graphics.restore();

                childXPositions.push(childX);

                drawTree(child, canvas);
            }
        });

    }

}


function drawKey(x, y, key, graphics = graphics) {
    const keySize = 60; //size of blue square -- hopefull make into draggable
    graphics.fillStyle = "lightblue";

    graphics.strokeStyle = "black";
    graphics.lineWidth = 2;
    graphics.strokeRect(x, y, keySize, keySize);

    graphics.fillRect(x, y, keySize, keySize);  //fills blue small rect

    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    graphics.fillText(key, x + 30, y + 30);  //drawing key text, numbers
}

export function drawNode(keys, graphics) {
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

    validKeys.forEach((key, index) => {
        drawKey(key.x - 30, key.y - 30, key.value, graphics);
    });
}

function calculateArrowStartX(isLessThanKey, keys, nodeWidth, index, node) {
    if (isLessThanKey) {
        return keys[0].x - nodeWidth / 2 + (index + 1) * 60 + (node.t - 2) * 60;
    } else {
        return keys[0].x + nodeWidth / 2 - (keys.length - index - 1) * 60 + (node.t - 2) * 60;
    }
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

function calculateArrowCoordinates(isLessThanKey, keys, nodeWidth, index, node, childX, childWidth, childY){
    const arrowStartX = calculateArrowStartX(isLessThanKey, keys, nodeWidth, index, node);
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

function drawArrow(){

}
