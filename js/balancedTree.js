//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BTREE AND BTREENODE LOGIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//import { assignNodePositions } from "./assign-positions";
class BTreeKey {
    constructor() {
        this.value; 
        this.x;
        this.y;
    }
}



// A BTree node
class BTreeNode {
    constructor(t, leaf) {
        this.t = t; // Minimum degree (number of keys=2*t-1)
        this.keys = new Array(2 * t - 1); // this the array strong the BTreeKeys for the node
        for (let i = 0; i < (2 * t - 1); i++) {
            this.keys[i] = new BTreeKey(); // Initialize each key with value set to undefined
        }
    
        this.C = new Array(2 * t); // this array stores BtreeNodes (they are the children of the node)
        this.n = 0; // the number of keys in the node
        this.leaf = leaf; // boolean for if the node is a leaf, if not then false
        this.parent = null;

    }

    // A utility function that returns the index of the first key that is greater than or equal to k
    findKey(k) {
        let idx = 0;
        while (idx < this.n && this.keys[idx].value < k) {
            idx++;
        }
        return idx;
    }

    // A function to remove the idx-th key from this node - which is a leaf node
    removeFromLeaf(idx) {
        for (let i = idx + 1; i < this.n; ++i) {
            this.keys[i - 1].value = this.keys[i].value;
        }
        this.n--;
    }

    // A function to remove the idx-th key from this node - which is a non-leaf node
    removeFromNonLeaf(idx) {
        let k = this.keys[idx].value;

        if (this.C[idx].n >= this.t) {
            let pred = this.getPred(idx);
            this.keys[idx].value = pred;
            this.C[idx].remove(pred);
        } else if (this.C[idx + 1].n >= this.t) {
            let succ = this.getSucc(idx);
            this.keys[idx].value = succ;
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
        return cur.keys[cur.n - 1].value;
    }

    // A function to get successor of keys[idx]
    getSucc(idx) {
        let cur = this.C[idx + 1];
        while (!cur.leaf) {
            cur = cur.C[0];
        }
        return cur.keys[0].value;
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
            child.keys[i + 1].value = child.keys[i].value;
        }

        if (!child.leaf) {
            for (let i = child.n; i >= 0; --i) {
                child.C[i + 1] = child.C[i];
            }
        }

        child.keys[0].value = this.keys[idx - 1].value;

        if (!child.leaf) {
            child.C[0] = sibling.C[sibling.n];
        }

        this.keys[idx - 1].value = sibling.keys[sibling.n - 1].value;

        child.n++;
        sibling.n--;
    }

    // A function to borrow a key from the C[idx+1] and place it in C[idx]
    borrowFromNext(idx) {
        let child = this.C[idx];
        let sibling = this.C[idx + 1];

        child.keys[child.n].value = this.keys[idx].value;

        if (!child.leaf) {
            child.C[child.n + 1] = sibling.C[0];
        }

        this.keys[idx].value = sibling.keys[0].value;

        for (let i = 1; i < sibling.n; ++i) {
            sibling.keys[i - 1].value = sibling.keys[i].value;
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

        child.keys[this.t - 1].value = this.keys[idx].value;

        for (let i = 0; i < sibling.n; ++i) {
            child.keys[i + this.t].value = sibling.keys[i].value;
        }

        if (!child.leaf) {
            for (let i = 0; i <= sibling.n; ++i) {
                child.C[i + this.t] = sibling.C[i];
            }
        }

        for (let i = idx + 1; i < this.n; ++i) {
            this.keys[i - 1].value = this.keys[i].value;
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

        if (idx < this.n && this.keys[idx].value === k) {
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
    traverse(levels, depth, nodeCountPerLevel) {
        depth++;
        // if uninitialized for the first time, initialize it, and next time just increment it at that level
        if (nodeCountPerLevel[depth] === undefined) {
            nodeCountPerLevel[depth] = 0;
        }

        // recursion is executed linearly so levels can be updated linearly its not in parallel
        let i;
        for (i = 0; i < this.n + 1; i++) {
            if (!this.leaf) {
                this.C[i].parent = this;

                if (levels[depth] === undefined) {
                    levels.push([]);
                }
                levels[depth][nodeCountPerLevel[depth]] = this.C[i];
                // increment number of nodes at this depth
                nodeCountPerLevel[depth]++;

                this.C[i].traverse(levels, depth, nodeCountPerLevel);
            }
        }
        // Set all keys where there theoretically aren't meant to be any to be undefined
        for (let x = this.n; x < 2 * this.t - 1; x++) {
            // no longer set the value to undefined but the whole key
            this.keys[x] = undefined;
        }

        // Set all children where there theoretically aren't meant to be any to be undefined
        for (let y = this.n + 1; y < 2 * this.t; y++) {
            this.C[y] = undefined;
        }
    }

    // Function to search key k in subtree rooted with this node
    search(k) {
        let idx = 0;
        while (idx < this.n && k > this.keys[idx].value) {
            idx++;
        }

        if (this.keys[idx].value === k) {
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
            while (i >= 0 && this.keys[i].value > k) {
                this.keys[i + 1].value = this.keys[i].value;
                i--;
            }
            this.keys[i + 1].value =  k;
            this.n++;
        } else {
            while (i >= 0 && this.keys[i].value > k) {
                i--;
            }

            if (this.C[i + 1].n === 2 * this.t - 1) {
                this.splitChild(i + 1, this.C[i + 1]);
                if (this.keys[i + 1].value < k) {
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
            z.keys[j].value = y.keys[j + this.t].value;
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
            this.keys[m + 1].value = this.keys[m].value;
        }
        //this here causes it
        this.keys[x].value = y.keys[this.t - 1].value;
        this.n = this.n + 1;
    }


}

// A BTree 
export class BTree {
    constructor(t) {
        this.root = null; // The BTreenode that is the root node
        this.t = t; // Minimum degree (number of keys=2*t-1)
        this.levels = [[]];
    }

    assignNodePositions() {
        // TODO: Within this function do the following:
        // Loop through this.levels for this tree's levels
        // If a new node is encountered then loop through its keys, assigning them such that they are spaced them all together in a group
        // Go to next node. Make sure it's key group is spaced apart from the key group in the previous node. 
        // Knowing when we encounter a new node, we can easily space nodes apart per level, preventing overlap
        /* 
        Since the size of different arrays is known; like getting the size of the levels array at a depth 
        gives the number of nodes at that depth. Or getting the size of the node.key array gives the number of keys in that node. 
        Given these convenient known sizes, we can divide them on the canvas space however we wish.
        */
        // const ySpacing = 120;
        // const keySpacing = 30;
        // const canvasWidth = 900;
    
        // for (let i = 0; i < this.levels.length; i++) {
        //     const numNodes = this.levels[i].length;
        //     const totalKeyWidth = numNodes * 60 + (numNodes - 1) * keySpacing;
        //     let startX = (canvasWidth - totalKeyWidth) / 2;
    
        //     for (let j = 0; j < numNodes; j++) {
        //         const currNode = this.levels[i][j];
        //         const numKeys = currNode.keys.length;
    
        //         for (let k = 0; k < numKeys; k++) {
        //             const keyX = startX + j * keySpacing + k * 60;
        //             const keyY = i * ySpacing;
    
        //             // Assign x and y values to the BTreeKey
        //             currNode.keys[k].x = keyX - 250;
        //             currNode.keys[k].y = keyY;
        //         }
    
        //         startX += numKeys * 60 + keySpacing;
        //     }
        // }
        const ySpacing = 120;
        const keySpacing = 30;
        const canvasWidth = 900;
        
        // loop over each level
        for (let i = 0; i < this.levels.length; i++) {
            const numNodes = this.levels[i].length;
            const totalKeyWidth = numNodes * 60 + (numNodes - 1) * keySpacing;
            const availableWidth = canvasWidth - totalKeyWidth;
            const nodeSpacing = availableWidth / (numNodes + 1); // Add 1 for space before the first node
            const startX = nodeSpacing; // Start from the first node position
    
            let accumulatedNodeWidth = 0;
            
            // loop over each node in level
            for (let j = 0; j < numNodes; j++) {
                const currNode = this.levels[i][j];
                const currKeys = currNode.keys.filter((key) => key !== undefined); //DOESNT WORK WTF!!!
                const numKeys = currKeys.length;
                
                // loop over each key in node
                for (let k = 0; k < numKeys; k++) {
                    const keyX = startX + accumulatedNodeWidth + k * 60;
                    const keyY = i * ySpacing;
    
                    // Assign x and y values to the BTreeKey
                    console.log(k);
                    currNode.keys[k].x = keyX;
                    currNode.keys[k].y = keyY;
                }
    
                accumulatedNodeWidth += nodeSpacing + nodeSpacing;
            }
        }
        
    }

    // Calls the insert on the root node and performs some checks to keep to the conditions of the tree
    insert(k) {
        if (!this.root) {
            this.root = new BTreeNode(this.t, true);
            this.root.keys[0].value = k;
            this.root.n = 1;
        } else {
            if (this.root.n === 2 * this.t - 1) {
                const s = new BTreeNode(this.t, false);
                s.C[0] = this.root;
                s.splitChild(0, this.root);

                let i = 0;
                if (s.keys[0].value < k) {
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
    // Calling traverse on the method of the tree calls traverse on the methods of the nodes 
    traverse() {
        if (this.root) {
            // Levels is updated with each traverse of tree and is a property of the tree
            // It is an alternate representation of the tree, a visual representation as opposed to a logical one
            // It has the same nodes as the logical representation of the tree so we can easily pop this node when we delete it from the tree
            // Or just call traverse to refresh levels and update it with traverse
            let depth = 0;
            this.levels = [[]];
            let nodeCountPerLevel = [];
            nodeCountPerLevel[depth] = 0;
            this.levels[depth][0] = this.root;
            nodeCountPerLevel[depth] = 1;
            this.root.traverse(this.levels, depth, nodeCountPerLevel);
            this.assignNodePositions();
        }
    }
}

// export default BTree;







