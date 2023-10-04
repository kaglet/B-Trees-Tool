let graphics;

export function drawTree(node, canvas) {
    graphics = canvas.getContext("2d"); 
    const canvasWidth = canvas.width;
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
            if (child != undefined) {
              //  const childKeys = child.keys.filter((key) => key.value !== undefined);
               // const childWidth = child.keys.length * 60;
               // const childX = child.keys[0].x - 30;
              //  const childY = child.keys[0].y - 30;

                const angle = Math.atan2(childY - (y + 30), childX - x);
                
                // TODO: Figure out the following: This causes a bug where keys[index] is undefined since keys ends at index 0, but index 3 is referenced for example
                // Determine if the child is less than or greater than the key
                const isLessThanKey = childKeys[0].value < keys[index].value;


                // // Calculate the arrow starting point
                // const arrowStartX = isLessThanKey ? keys[0].x - nodeWidth / 2 + index * 60 : keys[0].x + nodeWidth / 2 - (keys.length - index) * 60;

                // graphics.save();
                // graphics.beginPath();
                // graphics.moveTo(arrowStartX, keys[0].y + 30); // Arrow starts from the appropriate side of the key
                // graphics.lineTo(childX, childY - 30);
                // graphics.lineWidth = 3;
                // graphics.strokeStyle = "orange";
                // graphics.stroke();
                // graphics.closePath();

                // graphics.beginPath();
                // graphics.moveTo(childX, childY - 30);
                // graphics.lineTo(
                //     childX - arrowSize * Math.cos(angle - Math.PI / 6),
                //     childY - 30 - arrowSize * Math.sin(angle - Math.PI / 6)
                // );
                // graphics.lineTo(
                //     childX - arrowSize * Math.cos(angle + Math.PI / 6),
                //     childY - 30 - arrowSize * Math.sin(angle + Math.PI / 6)
                // );
                // graphics.fillStyle = "orange";
                // graphics.fill();
                // graphics.closePath();

               // graphics.restore();

            //    childXPositions.push(childX);

                drawTree(child, canvas);

            }
        });
    }
}


function drawKey(x, y, key, graphics = graphics) {
    const keySize = 30; //size of blue square -- hopefull make into draggable
    graphics.fillStyle = "lightblue";
    
    graphics.fillRect(x, y, keySize, keySize);  //fills blue small rect
    
    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    graphics.fillText(key, x + 15, y + 15);  //drawing key text, numbers
}

export function drawNode(keys, graphics) {
    const nodeHeight = 60;
   // const validKeys = keys;
    const validKeys = keys.filter((key) => key.x !== undefined);  //tking away undefined from array
    const nodeWidth = validKeys.length * 60;    //the whole node width (black outlined rects)

    // draw the node rectangle
    graphics.strokeRect(validKeys[0].x - 30, validKeys[0].y - 30, nodeWidth, nodeHeight);

    // draw keys in the node
    graphics.fillStyle = "black";
    graphics.font = "14px Arial";
    graphics.textAlign = "center";
    graphics.textBaseline = "middle";
    
    validKeys.forEach((key, index) => {
        drawKey(key.x - 15, key.y -15, key.value, graphics);
    });
}

// let graphics;

// export function drawTree(node, x, y, canvas) {
//     graphics = canvas.getContext("2d"); 
//     const canvasWidth = canvas.width;
//     if (!node) return;

//     const keys = node.keys.filter((key) => key !== undefined);
//     const nodeWidth = keys.length * 60;
//     const nodeSpacing = 40;
//     const arrowSize = 15; // Size of the arrowhead

//     if (x + nodeWidth / 2 > canvasWidth) {
//         x = canvasWidth - nodeWidth / 2;
//     } else if (x - nodeWidth / 2 < 0) {
//         x = nodeWidth / 2;
//     }

//     drawNode(x, y, keys, graphics);

//     if (!node.leaf) {
//         const numChildren = node.C.length;
//         const totalChildWidth = numChildren * (nodeWidth + nodeSpacing) - nodeSpacing;
//         let startX = x - totalChildWidth / 2;

//         const childXPositions = [];

//         node.C.forEach((child, index) => {
//             if (child != undefined) {
//                 const childWidth = child.keys.length * 60;
//                 const childX = startX + childWidth / 2;
//                 const childY = y + 150;

//                 const angle = Math.atan2(childY - (y + 30), childX - x);

//                 // Determine if the child is less than or greater than the key
//                 const isLessThanKey = child.keys[0] < keys[index];

//                 // Calculate the arrow starting point
//                 const arrowStartX = isLessThanKey ? x - nodeWidth / 2 + index * 60 : x + nodeWidth / 2 - (keys.length - index) * 60;

//                 graphics.save();
//                 graphics.beginPath();
//                 graphics.moveTo(arrowStartX, y + 30); // Arrow starts from the appropriate side of the key
//                 graphics.lineTo(childX, childY - 30);
//                 graphics.lineWidth = 3;
//                 graphics.strokeStyle = "orange";
//                 graphics.stroke();
//                 graphics.closePath();

//                 graphics.beginPath();
//                 graphics.moveTo(childX, childY - 30);
//                 graphics.lineTo(
//                     childX - arrowSize * Math.cos(angle - Math.PI / 6),
//                     childY - 30 - arrowSize * Math.sin(angle - Math.PI / 6)
//                 );
//                 graphics.lineTo(
//                     childX - arrowSize * Math.cos(angle + Math.PI / 6),
//                     childY - 30 - arrowSize * Math.sin(angle + Math.PI / 6)
//                 );
//                 graphics.fillStyle = "orange";
//                 graphics.fill();
//                 graphics.closePath();

//                 graphics.restore();

//                 childXPositions.push(childX);

//                 drawTree(child, childX, childY, canvas);

//                 startX += childWidth + nodeSpacing;
//             }
//         });
//     }
// }


// function drawKey(x, y, key, graphics = graphics) {
//     const keySize = 30; //size of blue square -- hopefull make into draggable
//     graphics.fillStyle = "lightblue";
    
//     graphics.fillRect(x + keySize / 2, y - keySize / 2, keySize, keySize);  //fills blue small rect
    
//     graphics.fillStyle = "black";
//     graphics.font = "14px Arial";
//     graphics.textAlign = "center";
//     graphics.textBaseline = "middle";
//     graphics.fillText(key, x+ keySize, y);  //drawing key text, numbers
// }

// export function drawNode(x, y, keys, graphics) {
//     const nodeHeight = 60;
//     const validKeys = keys.filter((key) => key !== undefined);  //tking away undefined from array
//     const nodeWidth = validKeys.length * 60;    //the whole node width (black outlined rects)
//     const keySpacing = 60;  //how far apart the keys are spaced

//     // draw the node rectangle
//     graphics.strokeRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);

//     // draw keys in the node
//     graphics.fillStyle = "black";
//     graphics.font = "14px Arial";
//     graphics.textAlign = "center";
//     graphics.textBaseline = "middle";
    
//     validKeys.forEach((key, index) => {
        
//         var keyX = x + (index - validKeys.length / 2) * keySpacing;   //calcs each key x and y value
    
//         const keyY = y;

        
//         // Mark the corresponding block in the grid as filled
//         //  fillBlock(gridRow, gridCol);
        
//         drawKey(keyX, keyY, key, graphics);
//     });
// }