class userTreeKey {
    constructor() {
        this.topRightCorner; 
        this.topLeftCorner; 
        this.bottomRightCorner; 
        this.bottomLeftCorner; 
        this.value;  //value of the key
    }
}

class userTreeNode {
    constructor() {; 
        this.keys = new Array(); // stores userTreeKeys
        this.C = new Array(); // stores userTreeNodes
        this.n = 0; // number of keys
        this.parent = null; // number of keys
        this.topRightCorner; 
        this.topLeftCorner; 
        this.bottomRightCorner; 
        this.bottomLeftCorner; 
    }
}

class userTree {
    constructor() {
        this.root = null; // The userTreeNode that is the root node
    }
}

