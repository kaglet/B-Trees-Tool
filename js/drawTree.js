function drawTree(node, x, y) {
    const canvasWidth = 1200;
    if (!node) return;

    const keys = node.keys.filter((key) => key !== undefined);
    const nodeWidth = keys.length * 60;
    const nodeSpacing = 40;
    const arrowSize = 15; // Size of the arrowhead

    if (x + nodeWidth / 2 > canvasWidth) {
        x = canvasWidth - nodeWidth / 2;
    } else if (x - nodeWidth / 2 < 0) {
        x = nodeWidth / 2;
    }

    drawNode(x, y, keys);
    console.log(keys);

    if (!node.leaf) {
        const numChildren = node.C.length;
        const totalChildWidth = numChildren * (nodeWidth + nodeSpacing) - nodeSpacing;
        let startX = x - totalChildWidth / 2;

        const childXPositions = [];

        node.C.forEach((child, index) => {
            if (child != undefined) {
                const childWidth = child.keys.length * 60;
                const childX = startX + childWidth / 2;
                const childY = y + 150;

                const angle = Math.atan2(childY - (y + 30), childX - x);

                // Determine if the child is less than or greater than the key
                const isLessThanKey = child.keys[0] < keys[index];

                // Calculate the arrow starting point
                const arrowStartX = isLessThanKey ? x - nodeWidth / 2 + index * 60 : x + nodeWidth / 2 - (keys.length - index) * 60;

                graphics.save();
                graphics.beginPath();
                graphics.moveTo(arrowStartX, y + 30); // Arrow starts from the appropriate side of the key
                graphics.lineTo(childX, childY - 30);
                graphics.lineWidth = 3;
                graphics.strokeStyle = "orange";
                graphics.stroke();
                graphics.closePath();

                graphics.beginPath();
                graphics.moveTo(childX, childY - 30);
                graphics.lineTo(
                    childX - arrowSize * Math.cos(angle - Math.PI / 6),
                    childY - 30 - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                graphics.lineTo(
                    childX - arrowSize * Math.cos(angle + Math.PI / 6),
                    childY - 30 - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                graphics.fillStyle = "orange";
                graphics.fill();
                graphics.closePath();

                graphics.restore();

                childXPositions.push(childX);

                drawTree(child, childX, childY);

                startX += childWidth + nodeSpacing;
            }
        });
    }
}

function drawKey(x, y, key) {
    const keySize = 30; //size of blue square -- hopefull make into draggable
    graphics.fillStyle = "lightblue";
    
    graphics.fillRect(x + keySize / 2, y - keySize / 2, keySize, keySize);  //fills blue small rect
    
    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    graphics.fillText(key, x+ keySize, y);  //drawing key text, numbers
}

function drawNode(x, y, keys) {
    const nodeHeight = 60;
    const validKeys = keys.filter((key) => key !== undefined);  //tking away undefined from array
    const nodeWidth = validKeys.length * 60;    //the whole node width (black outlined rects)
    const keySpacing = 60;  //how far apart the keys are spaced

    // draw the node rectangle
    graphics.strokeRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);

    // draw keys in the node
    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    
    validKeys.forEach((key, index) => {
        
        var keyX = x + (index - validKeys.length / 2) * keySpacing;   //calcs each key x and y value
    
        const keyY = y;
        
        drawKey(keyX, keyY, key);
    });
}