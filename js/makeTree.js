function snapToGrid(x, y) {
    return {
        x: Math.round(x / 50) * 50,
        y: Math.round(y / 50) * 50,
    };
}

function makeTree(node, x, y) {
    const keys = node.keys.filter((key) => key !== undefined);
    drawNode(x, y, keys)
    const canvas2 = document.getElementById('canvas');
    const graphics2 = canvas2.getContext("2d"); 
    
    canvas2.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX - canvas2.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas2.getBoundingClientRect().top;

        const offsetX = mouseX - x;
        const offsetY = mouseY - y;
        let isDragging = true;

        

        function onMouseMove(e) {
            if (isDragging) {
                const newX =
                    e.clientX - canvas2.getBoundingClientRect().left - offsetX;
                const newY =
                    e.clientY - canvas2.getBoundingClientRect().top - offsetY;
                x = newX;
                y = newY;
                graphics2.clearRect(0, 0, canvas2.width, canvas2.height);
                drawNode(x, y, keys);
            }
        }

        function onMouseUp() {
            isDragging = false;
            canvas2.removeEventListener('mousemove', onMouseMove);
            canvas2.removeEventListener('mouseup', onMouseUp);
            const snappedPos = snapToGrid(x, y);
            x = snappedPos.x;
            y = snappedPos.y;
            graphics2.clearRect(0, 0, canvas2.width, canvas2.height);
            drawNode(x, y, keys);
        }

        canvas2.addEventListener('mousemove', onMouseMove);
        canvas2.addEventListener('mouseup', onMouseUp);

    })
}



// function drawKey(x, y, key) {
//     const keySize = 30; //size of blue square -- hopefully make into draggable
//     graphics.fillStyle = "lightblue";
    
//     graphics.fillRect(x + keySize / 2, y - keySize / 2, keySize, keySize);  //fills blue small rect
    
//     graphics.fillStyle = "black";
//     graphics.font = "14px Arial";
//     graphics.textAlign = "center";
//     graphics.textBaseline = "middle";
//     graphics.fillText(key, x+ keySize, y);  //drawing key text, numbers
// }

// function drawNode(x, y, keys) {
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
//         const keyX = x + (index - validKeys.length / 2) * keySpacing;   //calcs each key x and y value
//         const keyY = y;
        
//         drawKey(keyX, keyY, key);
//     });
// }