//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BTREE AND BTREENODE LOGIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class BTreeNode {
    constructor(t, leaf) {
        this.t = t; // the degree of the tree
        this.keys = new Array(2 * t - 1); // this the arrya strong the keys for the node
        this.C = new Array(2 * t); // this array stores BtreeNodes (they are the children of the node)
        this.n = 0; // the number of keys in the node
        this.leaf = leaf; // boolean for if the node is a leaf
    }

    findKey(k) {
        let idx = 0;
        while (idx < this.n && this.keys[idx] < k) {
            idx++;
        }
        return idx;
    }

    remove(k) {
        const idx = this.findKey(k);

        if (idx < this.n && this.keys[idx] === k) {
            if (this.leaf) {
                this.removeFromLeaf(idx);
            } else {
                this.removeFromNonLeaf(idx);
            }
        } else {
            if (this.leaf) {
                console.log(`The key ${k} does not exist in the tree`);
                return;
            }

            const flag = idx === this.n;

            if (this.C[idx].n < this.t) {
                this.fill(idx);
            }

            if (flag && idx > this.n) {
                this.C[idx - 1].remove(k);
            } else {
                this.C[idx].remove(k);
            }
        }
    }

    removeFromLeaf(idx) {
        for (let i = idx + 1; i < this.n; i++) {
            this.keys[i - 1] = this.keys[i];
        }
        this.n--;
    }

    removeFromNonLeaf(idx) {
        const k = this.keys[idx];

        if (this.C[idx].n >= this.t) {
            const pred = this.getPred(idx);
            this.keys[idx] = pred;
            this.C[idx].remove(pred);
        } else if (this.C[idx + 1].n >= this.t) {
            const succ = this.getSucc(idx);
            this.keys[idx] = succ;
            this.C[idx + 1].remove(succ);
        } else {
            this.merge(idx);
            this.C[idx].remove(k);
        }
    }

    getPred(idx) {
        let cur = this.C[idx];
        while (!cur.leaf) {
            cur = cur.C[cur.n];
        }
        return cur.keys[cur.n - 1];
    }

    getSucc(idx) {
        let cur = this.C[idx + 1];
        while (!cur.leaf) {
            cur = cur.C[0];
        }
        return cur.keys[0];
    }

    fill(idx) {
        if (idx !== 0 && this.C[idx - 1].n >= this.t) {
            this.borrowFromPrev(idx);
        } else if (idx !== this.n && this.C[idx + 1].n >= this.t) {
            this.borrowFromNext(idx);
        } else {
            if (idx !== this.n) {
                this.merge(idx);
            } else {
                this.merge(idx - 1);
            }
        }
    }

    borrowFromPrev(idx) {
        const child = this.C[idx];
        const sibling = this.C[idx - 1];

        for (let i = child.n - 1; i >= 0; i--) {
            child.keys[i + 1] = child.keys[i];
        }

        if (!child.leaf) {
            for (let i = child.n; i >= 0; i--) {
                child.C[i + 1] = child.C[i];
            }
        }

        child.keys[0] = this.keys[idx - 1];

        if (!child.leaf) {
            child.C[0] = sibling.C[sibling.n];
        }

        this.keys[idx - 1] = sibling.keys[sibling.n - 1];

        child.n++;
        sibling.n--;
    }

    borrowFromNext(idx) {
        const child = this.C[idx];
        const sibling = this.C[idx + 1];

        child.keys[child.n] = this.keys[idx];

        if (!child.leaf) {
            child.C[child.n + 1] = sibling.C[0];
        }

        this.keys[idx] = sibling.keys[0];

        for (let i = 1; i < sibling.n; i++) {
            sibling.keys[i - 1] = sibling.keys[i];
        }

        if (!sibling.leaf) {
            for (let i = 1; i <= sibling.n; i++) {
                sibling.C[i - 1] = sibling.C[i];
            }
        }

        child.n++;
        sibling.n--;
    }

    merge(idx) {
        const child = this.C[idx];
        let sibling = this.C[idx + 1];
    
        child.keys[this.t - 1] = this.keys[idx];
    
        for (let i = 0; i < sibling.n; i++) {
            child.keys[i + this.t] = sibling.keys[i]; // Corrected this line
        }
    
        if (!child.leaf) {
            for (let i = 0; i <= sibling.n; i++) {
                child.C[i + this.t] = sibling.C[i];
            }
        }
    
        for (let i = idx + 1; i < this.n; i++) {
            this.keys[i - 1] = this.keys[i];
        }
    
        for (let i = idx + 2; i <= this.n; i++) {
            this.C[i - 1] = this.C[i];
        }
    
        child.n += sibling.n + 1;
        this.n--;
    
        sibling = null; // Free the memory occupied by sibling
    }
    

    traverse() {
        let i;
        for (i = 0; i < this.n; i++) {
            if (!this.leaf) {
                this.C[i].traverse();
            }
            
            // console.log(this.keys[i]);
        }
        for (let x = this.n; x < 2*this.t-1; x++) {
            this.keys[x]=undefined;
        }
         if (!this.leaf) {
            this.C[i].traverse();
        }
    }
      

    search(k) {
        let idx = 0;
        while (idx < this.n && k > this.keys[idx]) {
            idx++;
        }

        if (this.keys[idx] === k) {
            return this;
        }

        if (this.leaf) {
            return null;
        }

        return this.C[idx].search(k);
    }

    insertNonFull(k) {
        let i = this.n - 1;
    
        if (this.leaf) {
            while (i >= 0 && this.keys[i] > k) {
                this.keys[i + 1] = this.keys[i];
                i--;
            }
            this.keys[i + 1] = k;
            this.n++;
        } else {
            while (i >= 0 && this.keys[i] > k) {
                i--;
            }
    
            if (this.C[i + 1].n === 2 * this.t - 1) {
                this.splitChild(i + 1, this.C[i + 1]);
                if (this.keys[i + 1] < k) {
                    i++;
                }
            }
    
            this.C[i + 1].insertNonFull(k);
        }
    }

    //fix something somewhere here
    splitChild(x, y) {
        const z = new BTreeNode(y.t, y.leaf);
        z.n = this.t - 1;
    
        for (let j = 0; j < this.t - 1; j++) {
            z.keys[j] = y.keys[j + this.t];
        }
    
        if (!y.leaf) {
            for (let i = 0; i < this.t; i++) {
                z.C[i] = y.C[i + this.t];
            }
        }
    
        y.n = this.t - 1;
        
    
        for (let z = this.n; z >= x + 1; z--) {
            this.C[z + 1] = this.C[z];
        }
    
        this.C[x + 1] = z;
    
        for (let m = this.n - 1; m >= x; m--) {
            this.keys[m + 1] = this.keys[m];
        }
        //this here causes it
        this.keys[x] = y.keys[this.t - 1];
        this.n = this.n + 1;       
    }
    
    
}

class BTree {
    constructor(t) {
        this.root = null; // a BtreeNode that stores the root node
        this.t = t; // this is the degree of the tree
    }

    insert(k) {
        if (!this.root) {
            this.root = new BTreeNode(this.t, true);
            this.root.keys[0] = k;
            this.root.n = 1;
        } else {            
            if (this.root.n === 2 * this.t - 1) {
                const s = new BTreeNode(this.t, false);
                s.C[0] = this.root;
                s.splitChild(0, this.root);

                let i = 0;
                if (s.keys[0] < k) {
                    i++;
                }
                s.C[i].insertNonFull(k);

                this.root = s;
            } else {
                this.root.insertNonFull(k);
            }
        }
    }

    remove(k) {
        if (!this.root) {
            console.log("The tree is empty");
            return;
        }

        this.root.remove(k);

        if (this.root.n === 0) {
            const tmp = this.root;
            if (this.root.leaf) {
                this.root = null;
            } else {
                this.root = this.root.C[0];
            }

            tmp = null; // Free the memory occupied by the old root
        }
    }

    traverse() {
        if (this.root) {
            this.root.traverse();
        }
    } 
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// USER INPUT AND INITIALISATION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var frameNumber = 0;

var canvas;
var rootNode;
var graphics;
const t = new BTree(2); // 2 is the max degree

function init() {

    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}

	 // A B-Tree with minimum degree 3
    tree.insert(10);
    tree.traverse();
    tree.insert(20);
    tree.traverse();
    tree.insert(30);
    tree.traverse();
    tree.insert(2);
    tree.traverse();
    tree.insert(5);
    tree.traverse();
    tree.insert(3);
    tree.traverse();
    tree.insert(12);
    tree.traverse();
    tree.insert(33);
    tree.traverse();
    tree.insert(4);
    tree.traverse();
    tree.insert(1);
    tree.traverse();
    tree.insert(6);
    tree.traverse();




    // console.log(tree.root.keys);
    // console.log(tree.root.C[0].keys);
    // console.log(tree.root.C[1].keys);
    // console.log(tree.root.C[2].keys);
    // console.log(tree.root.C[0].C[0].keys);
    // console.log(tree.root.C[0].C[1].keys);
    // console.log(tree.root.C[1].C[0].keys);
    // console.log(tree.root.C[1].C[1].keys);





    // console.log("Traversal of the constructed tree is:");
    // tree.traverse();

    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawTree(tree.root, canvas.width / 2 - 60, 50);

    
}

// user input and insert that value into the tree
var insertValue;
function insertKey() {
    try {
		insertValue = document.getElementById("insertKeyValue").value;
        tree.insert(insertValue);
        tree.traverse();
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawTree(tree.root, canvas.width / 2 - 60, 50);
        document.getElementById("insertKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}

// user input and remove that value from the tree
var removalValue;
function removeKey() {
    try {
		removalValue = document.getElementById("removeKeyValue").value;
        tree.remove(removalValue);
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawTree(tree.root, canvas.width / 2 - 60, 50);
        document.getElementById("removeKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DRAWING THE TREE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Function to draw a single key in a square
// function drawKey(x, y, key) {
//     const keySize = 60; // Adjust as needed
//     graphics.strokeRect(x - keySize / 2, y - keySize / 2, keySize, keySize);
//     graphics.fillText(key, x - 5, y + 5); // Adjust position for text within the square
// }

// // Function to draw a rectangular node with keys as squares
// function drawNode(x, y, keys) {
//     const nodeHeight = 60; 
//     let validKeys = [];
//     keys.forEach((key, index) => {
//         if (key!=undefined){
//            validKeys.push(key);
//         } 
//     });
//     const nodeWidth = keys.validKeys*60; 
//     const nodeSpacing = 60;
//     const keySpacing = 60;

//     //graphics.strokeRect(x - nodeHeight, y - nodeHeight / 2, nodeWidth, nodeHeight);

//     const startX = x - nodeHeight / 2 + nodeSpacing;

//     validKeys.forEach((key, index) => {
//         drawKey(startX + index * keySpacing, y, key);
//     });
// }

// function drawTree(node, x, y) {
//     if (node) {
//         drawNode(x, y, node.keys);

//         if (!node.leaf) {
//             const childY = y + 150; // Adjust as needed
//             const numChildren = node.C.length;

//             node.C.forEach((child, index) => {
//                 let childX;
//                 if (index>0){

//                     childX = x - (numChildren / 2) * 60 + (node.C[index-1].keys.length) * index * 60 + 50;
//                 } else{
//                    childX = x - (numChildren / 2) * 60;
//                 }
//                 drawTree(child, childX, childY);
//             });
//             x = x+ 30;
//         }
//     }
// }

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
            const childWidth = child.keys.length * 60;
            const childX = startX + childWidth / 2;
            const childY = y + 150; // Adjust as needed

            childXPositions.push(childX);

            drawTree(child, childX, childY);
            
            startX += childWidth + nodeSpacing;
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





