// import {graphics} from './main.js';

function drawTree(node, x, y) {
    const canvasWidth = 1200;
    if (!node) return;

    const keys = node.keys.filter((key) => key !== undefined);
    const nodeWidth = keys.length * 60; //one rectangle made fro each node, so the rectangles length is adjusted to 
    const nodeSpacing = 40; //dist between nodes

    // make sure it doesnt print outside of canvas
    if (x + nodeWidth / 2 > canvasWidth) {      //maybe rather make the nodes smaller
        x = canvasWidth - nodeWidth / 2;
    } else if (x - nodeWidth / 2 < 0) {
        x = nodeWidth / 2;
    }

    drawNode(x, y, keys);
    //draws the tree in the console
    console.log(keys);

    if (!node.leaf) {
        const numChildren = node.C.length;
        const totalChildWidth = numChildren * (nodeWidth + nodeSpacing) - nodeSpacing;
        let startX = x - totalChildWidth / 2;

        // if (startX + totalChildWidth > canvasWidth) {
        //     startX = canvasWidth - totalChildWidth;
        // } else if (startX < 0) {
        //     startX = 0;
        // }

        const childXPositions = [];

        node.C.forEach((child, index) => {
            // this if fixes the undefined error
            if (child!=undefined){
                const childWidth = child.keys.length * 60;
                const childX = startX + childWidth / 2;
                const childY = y + 150; // Adjust as needed
    
                childXPositions.push(childX);
    
                drawTree(child, childX, childY);
                
                startX += childWidth + nodeSpacing;
            }
        });

        // for (let i = 1; i < childXPositions.length; i++) {
        //     const prevX = childXPositions[i - 1];
        //     const currX = childXPositions[i];
        //     if (currX - prevX < nodeWidth + nodeSpacing) {
        //         childXPositions[i] = prevX + nodeWidth + nodeSpacing;
        //     }
        // }
        
        // // Redraw child nodes with adjusted positions
        // for (let i = 0; i < node.C.length; i++) {
        //     const child = node.C[i];
        //     drawTree(child, childXPositions[i], y + 150);
        // }
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
        const keyX = x + (index - validKeys.length / 2) * keySpacing;   //calcs each key x and y value
        const keyY = y;
        
        drawKey(keyX, keyY, key);
    });
}

// export default drawTree;