//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BTREE AND BTREENODE LOGIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A BTree node
class BTreeNode {
    constructor(t, leaf) {
        this.t = t; // Minimum degree (number of keys=2*t-1)
        this.keys = new Array(2 * t - 1); // this the array strong the keys for the node
        this.C = new Array(2 * t); // this array stores BtreeNodes (they are the children of the node)
        this.n = 0; // the number of keys in the node
        this.leaf = leaf; // boolean for if the node is a leaf, if not then false
    }

    // A utility function that returns the index of the first key that is greater than or equal to k
    findKey(k) {
        let idx = 0;
        while (idx < this.n && this.keys[idx] < k) {
            idx++;
        }
        return idx;
    }

    // A function to remove the idx-th key from this node - which is a leaf node
    removeFromLeaf(idx) {
        for (let i = idx + 1; i < this.n; ++i) {
            this.keys[i - 1] = this.keys[i];
        }
        this.n--;
    }

    // A function to remove the idx-th key from this node - which is a non-leaf node
    removeFromNonLeaf(idx) {
        let k = this.keys[idx];

        if (this.C[idx].n >= this.t) {
            let pred = this.getPred(idx);
            this.keys[idx] = pred;
            this.C[idx].remove(pred);
        } else if (this.C[idx + 1].n >= this.t) {
            let succ = this.getSucc(idx);
            this.keys[idx] = succ;
            this.C[idx + 1].remove(succ);
        } else {
            this.merge(idx);
            this.C[idx].remove(k);
        }
    }

    // A function to get predecessor of keys[idx]
    getPred(idx) {
        let cur = this.C[idx];
        while (!cur.leaf) {
            cur = cur.C[cur.n];
        }
        return cur.keys[cur.n - 1];
    }

    // A function to get successor of keys[idx]
    getSucc(idx) {
        let cur = this.C[idx + 1];
        while (!cur.leaf) {
            cur = cur.C[0];
        }
        return cur.keys[0];
    }

    
    // A function to fill child C[idx] which has less than t-1 keys
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

    // A function to borrow a key from C[idx-1] and insert it into C[idx]
    borrowFromPrev(idx) {
        let child = this.C[idx];
        let sibling = this.C[idx - 1];

        for (let i = child.n - 1; i >= 0; --i) {
            child.keys[i + 1] = child.keys[i];
        }

        if (!child.leaf) {
            for (let i = child.n; i >= 0; --i) {
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

    // A function to borrow a key from the C[idx+1] and place it in C[idx]
    borrowFromNext(idx) {
        let child = this.C[idx];
        let sibling = this.C[idx + 1];

        child.keys[child.n] = this.keys[idx];

        if (!child.leaf) {
            child.C[child.n + 1] = sibling.C[0];
        }

        this.keys[idx] = sibling.keys[0];

        for (let i = 1; i < sibling.n; ++i) {
            sibling.keys[i - 1] = sibling.keys[i];
        }

        if (!sibling.leaf) {
            for (let i = 1; i <= sibling.n; ++i) {
                sibling.C[i - 1] = sibling.C[i];
            }
        }

        child.n++;
        sibling.n--;
    }

    // A function to merge C[idx] with C[idx+1], C[idx+1] is freed after merging
    merge(idx) {
        let child = this.C[idx];
        let sibling = this.C[idx + 1];
    
        child.keys[this.t - 1] = this.keys[idx];
    
        for (let i = 0; i < sibling.n; ++i) {
            child.keys[i + this.t] = sibling.keys[i]; 
        }
    
        if (!child.leaf) {
            for (let i = 0; i <= sibling.n; ++i) {
                child.C[i + this.t] = sibling.C[i];
            }
        }
    
        for (let i = idx + 1; i < this.n; ++i) {
            this.keys[i - 1] = this.keys[i];
        }
    
        for (let i = idx + 2; i <= this.n; ++i) {
            this.C[i - 1] = this.C[i];
        }
    
        child.n += sibling.n + 1;
        this.n--;
    
        sibling = null; 
    }

    // A function to remove the key k from the sub-tree rooted with this node
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
                document.getElementById("error-message").innerHTML  = "The key does not exist in the tree";
                return;
            }

            let flag = idx === this.n;

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
    
    // Function to traverse all nodes in a subtree rooted with this node
    traverse() {
        let i;
        for (i = 0; i < this.n; i++) {
            if (!this.leaf) {
                this.C[i].traverse();
            }
        }
        // Added - set all keys where there theoretically arent meant to be any to be undefined
        for (let x = this.n; x < 2*this.t-1; x++) {
            this.keys[x]=undefined;
        }

        // Added - set all children where there theoretically arent meant to be any to be undefined
        for (let y = this.n+1; y < 2*this.t; y++) {
            this.C[y]=undefined;
        }

         if (!this.leaf) {
            this.C[i].traverse();
        }
    }
      
    // Function to search key k in subtree rooted with this node
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
    
    // A utility function to insert a new key in this node
    // The assumption is, the node must be non-full when this function is called
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

    // A utility function to split the child y of this node
    // Note that y must be full when this function is called
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

// A BTree 
class BTree {
    constructor(t) {
        this.root = null; // The BTreenode that is the root node
        this.t = t; // Minimum degree (number of keys=2*t-1)
    }

    // Calls the insert on the root node and performs some checks to keep to the conditions of the tree
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

    // Calls the removal on the root node and performs some validation checks
    remove(k) {

        if (!this.root) {
            console.log("The tree is empty");
            return;
        }

        this.root.remove(k);

        if (this.root.n === 0) {
            let tmp = this.root;
            if (this.root.leaf) {
                this.root = null;
            } else {
                this.root = this.root.C[0];
            }

            tmp = null;
        }
    }

    // Calls the traversal on the root node, it is recursive so will go to all nodes
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
var tree;
var createTreeStarted = true;


function init() {

    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
        document.getElementById("max-degree").focus();
        document.getElementById("insert-delete-section").style.display = "none";
	} catch(e) {
		document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
	}

	// // A B-Tree with minimum degree 3
    // tree.insert(100);
    // tree.traverse();
    // tree.insert(200);
    // tree.traverse();
    // tree.insert(300);
    // tree.traverse();

    // tree.insert(150);
    // tree.traverse();
    // tree.insert(250);
    // tree.traverse();
    // tree.insert(350);
    // tree.traverse();

    // tree.insert(50);
    // tree.traverse();
    // tree.insert(275);
    // tree.traverse();
    // tree.insert(380);
    // tree.traverse();

    // console.log("Traversal of the constructed tree is:");
    // tree.traverse();

    // console.log("The Tree:");
    // graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    // drawTree(tree.root, canvas.width / 2 - 60, 50);

    
}

// user input and insert that value into the tree
var insertValue;
function insertKey() {
    if (!createTreeStarted) {
        document.getElementById("error-message").innerHTML  = "";
        try {
            insertValue = document.getElementById("insert").value;
            //ensure a traverse is called after an insert to allow for cleaning tree
            try{
                if (insertValue === ""){
                    console.log("Enter a number");
                    document.getElementById("error-message").innerHTML  = "Please enter a key to insert";
                } else {
                    tree.insert(parseInt(insertValue));
                    tree.traverse();
                    document.getElementById("insert").focus();
                    document.getElementById("error-message").innerHTML  = "";
                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            drawTree(tree.root, canvas.width / 2 - 60, 50);
            document.getElementById("insert").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

// user input and remove that value from the tree
var removeValue;
function removeKey() {
    if (!createTreeStarted) {
        document.getElementById("error-message").innerHTML  = "";
        try {
            removeValue = document.getElementById("delete").value;
            //ensure a traverse is called after a removal to allow for cleaning tree
            try{
                if (removeValue === ""){
                    console.log("Enter a number");
                    document.getElementById("error-message").innerHTML  = "Please enter a key to remove";
                } else {
                    tree.remove(parseInt(removeValue));
                    tree.traverse();
                    document.getElementById("delete").focus();
                    document.getElementById("error-message").innerHTML  = "";

                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            drawTree(tree.root, canvas.width / 2 - 60, 50);
            document.getElementById("delete").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

var maxDegree;
function createTree() {
    if (createTreeStarted) {
        try {
            maxDegree = document.getElementById("max-degree").value;
            //ensure a traverse is called after a removal to allow for cleaning tree
            try{
                if (maxDegree === ""){
                    console.log("Enter a max degree value");
                    document.getElementById("error-message").innerHTML  = "Enter a max degree value before creating a tree";
                } else {
                    document.getElementById("error-message").innerHTML  = "";
                    tree = new BTree(parseInt(maxDegree));
                    document.getElementById("custom-tree-btn").innerHTML  = "Cancel";
		            document.getElementById("insert").focus();
                    createTreeStarted= false;
                    if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
                        document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
                    } else {
                        document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
                    }
                }
            } catch(e) {
                console.log(e);
            }
            document.getElementById("max-degree").value = null;
        } catch(e) {
            console.log(e);
        }
        
    } else {
        console.log("Tree Creation Canceled");
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        document.getElementById("custom-tree-btn").innerHTML  = "Custom tree";
        document.getElementById("max-degree").focus();
        createTreeStarted= true;
        if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
            document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
        } else {
            document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
        }
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