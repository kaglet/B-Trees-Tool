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

var canvas;
var rootNode;
var graphics;
let tree = new BTree(2); // 2 is the max degree

function init() {

    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}

	// A B-Tree with minimum degree 3
    tree.insert(100);
    tree.traverse();
    tree.insert(200);
    tree.traverse();
    tree.insert(300);
    tree.traverse();

    tree.insert(150);
    tree.traverse();
    tree.insert(250);
    tree.traverse();
    tree.insert(350);
    tree.traverse();

    tree.insert(50);
    tree.traverse();
    tree.insert(275);
    tree.traverse();
    tree.insert(380);
    tree.traverse();

    // console.log("Traversal of the constructed tree is:");
    // tree.traverse();

    console.log("The Tree:");
    graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawTree(tree.root, canvas.width / 2 - 60, 50);

    
}

// user input and insert that value into the tree
var insertValue;
function insertKey() {
    try {
		insertValue = document.getElementById("insertKeyValue").value;
        //ensure a traverse is called after an insert to allow for cleaning tree
        try{
            if (insertValue === ""){
                console.log("Enter a number");
            } else {
                tree.insert(parseInt(insertValue));
                tree.traverse();
            }
        } catch(e) {
            console.log(e);
        }
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        console.log("The Tree:");
        drawTree(tree.root, canvas.width / 2 - 60, 50);
        document.getElementById("insertKeyValue").value = null;
	} catch(e) {
        console.log(e);
	}
}

// user input and remove that value from the tree
var removeValue;
function removeKey() {
    try {
		removeValue = document.getElementById("removeKeyValue").value;
        //ensure a traverse is called after a removal to allow for cleaning tree
        try{
            if (removeValue === ""){
                console.log("Enter a number");
            } else {
                tree.remove(parseInt(removeValue));
                tree.traverse();
            }
        } catch(e) {
            console.log(e);
        }
        graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        console.log("The Tree:");
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
        console.log(node.keys);

        if (!node.leaf) {
            const childY = y + 200; // Adjust as needed
            const numChildren = node.C.length;

            node.C.forEach((child, index) => {
                if (child!=undefined){
                    let childX;
                    if (index>0){
    
                        childX = x - (numChildren / 2) * 60 + (node.C[index-1].keys.length) * index * 60+30;
                    } else{
                       childX = x - (numChildren / 2) * 60;
                    }
                    drawTree(child, childX, childY);
                }
            });
        }
    }
}