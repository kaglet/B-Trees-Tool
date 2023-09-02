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
            console.log(this.keys[i]);
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
    splitChild(i, y) {
        const z = new BTreeNode(y.t, y.leaf);
        z.n = this.t - 1;
    
        for (let j = 0; j < this.t - 1; j++) {
            z.keys[j] = y.keys[j + this.t];
            y.keys[j + this.t] = undefined;            

        }
    
        if (!y.leaf) {
            for (let j = 0; j < this.t; j++) {
                z.C[j] = y.C[j + this.t];
            }
        }
    
        y.n = this.t - 1;
        
    
        for (let j = this.n; j >= i + 1; j--) {
            this.C[j + 1] = this.C[j];
        }
    
        this.C[i + 1] = z;
    
        for (let j = this.n - 1; j >= i; j--) {
            this.keys[j + 1] = this.keys[j];
        }
        //this here causes it
        this.keys[i] = y.keys[this.t - 1];
        y.keys[this.t - 1] = undefined;
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




