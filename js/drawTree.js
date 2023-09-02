// Function to draw a single key in a square
function drawKey(x, y, key) {
    const keySize = 60; // Adjust as needed
    graphics.strokeRect(x - keySize / 2, y - keySize / 2, keySize, keySize);
    graphics.fillText(key, x - 5, y + 5); // Adjust position for text within the square
}

// Function to draw a rectangular node with keys as squares
function drawNode(x, y, keys) {
    const nodeHeight = 60; 
    let validKeys = [];
    keys.forEach((key, index) => {
        if (key!=undefined){
           validKeys.push(key);
        } 
    });
    const nodeWidth = keys.validKeys*60; 
    const keySpacing = 60;

    graphics.strokeRect(x - nodeHeight, y - nodeHeight / 2, nodeWidth, nodeHeight);

    const startX = x - nodeHeight / 2;

    validKeys.forEach((key, index) => {
        drawKey(startX + index * keySpacing, y, key);
    });
}

function drawTree(node, x, y) {
    if (node) {
        drawNode(x, y, node.keys);

        if (!node.leaf) {
            const childY = y + 200; // Adjust as needed
            const numChildren = node.C.length;

            node.C.forEach((child, index) => {
                let childX;
                if (index>0){

                    childX = x - (numChildren / 2) * 60 + (node.C[index-1].keys.length) * index * 60+30;
                } else{
                   childX = x - (numChildren / 2) * 60;
                }
                drawTree(child, childX, childY);
            });
        }
    }
}

//module.exports = { drawKey, drawNode, drawTree };