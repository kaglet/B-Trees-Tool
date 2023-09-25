function installMouseHandler(root) {

    var dragging = false;  // set to true when a drag action is in progress.
    var startX, startY;    // coordinates of mouse at start of drag.
    var prevX, prevY;      // previous mouse position during a drag.

    var colorChoice;  // Integer code for the selected color in the "colorChoide"
    // popup menu.  The value is assigned in doMouseDown.


    var toolChoice; // Integer code for the selected color in the "toolChoide"
    // popup menu. 

    function doMouseDown(evt) {
        // This function is called when the user presses a button on the mouse.
        // Only the main mouse button will start a drag.
        if (dragging) {
            return;  // if a drag is in progress, don't start another.
        }
        if (evt.button != 0) {
            return;  // don't respond unless the button is the main (left) mouse button.
        }
        var x, y;  // mouse position in canvas coordinates
        var r = canvas.getBoundingClientRect();
        x = Math.round(evt.clientX - r.left);  // translate mouse position from screen coords to canvas coords.
        y = Math.round(evt.clientY - r.top);   // round to integer values; some browsers would give non-integers.
        dragging = true;  // (this won't be the case for all mousedowns in all programs)
        if (dragging) {
            startX = prevX = x;
            startY = prevY = y;
            document.addEventListener("mousemove", doMouseMove, false);
            document.addEventListener("mouseup", doMouseUp, false);
        }

        graphics.clearRect(0, 0, canvas.width, canvas.height);
        drawNode(x,y,[5]);
        drawTree(root, canvas.width / 2, 30);
    
       
    }

    function doMouseMove(evt) {
        // This function is called when the user moves the mouse during a drag.
        if (!dragging) {
            return;  // (shouldn't be possible)
        }
        var x, y;  // mouse position in canvas coordinates
        var r = canvas.getBoundingClientRect();
        x = Math.round(evt.clientX - r.left);
        y = Math.round(evt.clientY - r.top);

        /*------------------------------------------------------------*/
        /* TODO: Add support for more drawing tools. */

        // function for drawing nodes
        graphics.clearRect(0, 0, canvas.width, canvas.height);
        drawNode(x,y,[5]);
        drawTree(root, canvas.width / 2, 30);
    
        


        // if (Math.abs(x - prevX) + Math.abs(y - prevY) < 3) {
        //     return;  // don't draw squares too close together
        // }

      



        /*------------------------------------------------------------*/

        prevX = x;  // update prevX,prevY to prepare for next call to doMouseMove
        prevY = y;
    }

    function doMouseUp(evt) {
        // This function is called when the user releases a mouse button during a drag.
        if (!dragging) {
            return;  // (shouldn't be possible)
        }
        dragging = false;
      //  document.removeEventListener("mousemove", doMouseMove, false);
      //  document.removeEventListener("mouseup", doMouseMove, false);
    }

    canvas.addEventListener("mousedown", doMouseDown, false);

} // end installMouseHandler








function drawGrid() {
    const gridSize = 60;
    const canvasWidth = 900;
    const canvasHeight = 800;

    for (let x = 0; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
            graphics.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

// Define the grid dimensions and block size
const gridSize = 60;
const canvasWidth = 1200;
const canvasHeight = 800;
const rows = canvasHeight / gridSize;
const cols = canvasWidth / gridSize;

var gridRow;
var gridCol;


// Initialize the grid with all blocks initially empty (false)
var grid = Array.from({ length: rows }, () => Array(cols).fill(false));
// Function to mark a block as filled at the given row and column
function fillBlock(row, col) {
        grid[row][col] = true; 
}

// Function to check if a block at the given row and column is filled
function isBlockFilled(row, col) {

    return grid[row][col];
}


function drawTree(node, x, y) {
 
    

    if (y == 30){
        grid = Array.from({ length: rows }, () => Array(cols).fill(false));
        installMouseHandler(node);
    
    }


    const canvasWidth = 1200;
    if (!node) return;

    const keys = node.keys.filter((key) => key !== undefined);
    const nodeWidth = keys.length * 60;
    const nodeSpacing = 40;
    const arrowSize = 15; // Size of the arrowhead

    if (x + nodeWidth > canvasWidth) {
        x = canvasWidth - nodeWidth / 2;
    } else if (x - nodeWidth / 2 < 0) {
        x = nodeWidth / 2;
    }

  

    // while (x % 30 != 0){
    //    x++;
    // }


    //  // Calculate row and column based on child's position
    //  var gridRow = Math.floor(y / gridSize);
    //  var gridCol1 = Math.floor(x / gridSize);
    //  var gridCol2 = Math.floor((x + nodeWidth) / gridSize);

    // while (isBlockFilled(gridRow, gridCol1) || isBlockFilled(gridRow, gridCol2)){
    //     console.log(gridCol1);
    //     console.log(gridCol2);
    //     x += 120;
    //     gridCol1 = Math.floor(x / gridSize);
    //     gridCol2 = Math.floor((x + nodeWidth) / gridSize);
    //     console.log(gridCol1);
    //     console.log(gridCol2);

    //  }


   // drawGrid(); // Draw the grid before drawing the tree

    drawNode(x, y, keys);

    if (!node.leaf) {
        const numChildren = node.C.length;
        const totalChildWidth = numChildren * (nodeWidth + nodeSpacing) - nodeSpacing;
        let startX = x - totalChildWidth / 2;

      

        const childXPositions = [];

        node.C.forEach((child, index) => {
            
            if (child != undefined) {

                

                const childWidth = child.keys.length * 60;
                var childX = startX + childWidth / 2;
                var childY = y + 120;

                while (childX % 30 != 0){
                    childX++;
                }

                //  // Calculate row and column based on child's position
                //  var gridRow = Math.floor(childY / gridSize);
                //  var gridCol1 = Math.floor(childX / gridSize);
                //  var gridCol2 = Math.floor((childX + nodeWidth) / gridSize);

                // while (isBlockFilled(gridRow, gridCol1) || isBlockFilled(gridRow, gridCol2)){
                //     console.log(gridRow);
                //     console.log(gridCol1);

                //     console.log(gridCol2);
                //     childX += 120;
                //     gridCol1 = Math.floor(childX / gridSize);
                //     gridCol2 = Math.floor((childX + nodeWidth) / gridSize)
   
                //  }
 
                //  // Mark the corresponding block in the grid as filled
                //  fillBlock(gridRow, gridCol);

                 

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
                //grid = Array.from({ length: rows }, () => Array(cols).fill(false));

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

    
    // while (x % 60 != 0){
    //     x++;
    // }

    //  // Calculate row and column based on child's position
    //  gridRow = Math.floor(x / gridSize);
    //  gridCol = Math.floor(y / gridSize);

    // while (isBlockFilled(gridRow, gridCol) == true){
    //     console.log(gridRow);
    //     console.log(gridCol);
    //     x += 120;
    //     y+=120;
    //     gridRow = Math.floor(x / gridSize);
    //     gridCol = Math.floor(y / gridSize);
   

    //  }

    // console.log(x);
    // console.log(y);

    // Calculate row and column based on key's position
//     const gridRow = Math.floor(y / gridSize);
//     gridCol = Math.floor(x / gridSize);

//     while (isBlockFilled(gridRow, gridCol)){
//       console.log(gridRow);
//       console.log(gridCol);
//       x += 120;
//       gridCol = Math.floor(x  / gridSize);

//    }



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

        
         // Mark the corresponding block in the grid as filled
       //  fillBlock(gridRow, gridCol);
        
        drawKey(keyX, keyY, key);
    });
}