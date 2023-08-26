// A BTree
class Btree
{
	// Constructor (Initializes tree as empty)
	constructor(t)
	{
		this.root = null;
		this.t = t;
	}
	
	// function to traverse the tree
	traverse()
	{
		if (this.root != null)
			this.root.traverse();
		document.write("<br>");
	}
	
	// function to search a key in this tree
	search(k)
	{
		if (this.root == null)
			return null;
		else
			return this.root.search(k);
	}
	
}

// A BTree node
class BTreeNode
{
	// Constructor
	constructor(t,leaf)
	{
		this.t = t;
		this.leaf = leaf;
		this.keys = new Array(2 * t - 1);
		this.C = new Array(2 * t);
		this.n = 0;
	}
	// A function to traverse all nodes in a subtree rooted with this node
	traverse()
	{
		// There are n keys and n+1 children, traverse through n keys
		// and first n children
		let i = 0;
		for (i = 0; i < this.n; i++) {

			// If this is not leaf, then before printing key[i],
			// traverse the subtree rooted with child C[i].
			if (this.leaf == false) {
				C[i].traverse();
			}
			document.write(keys[i] + " ");
		}

		// Print the subtree rooted with last child
		if (leaf == false)
			C[i].traverse();
	}
	
	// A function to search a key in the subtree rooted with this node.
	search(k) // returns NULL if k is not present.
	{
	
		// Find the first key greater than or equal to k
		let i = 0;
		while (i < n && k > keys[i])
			i++;

		// If the found key is equal to k, return this node
		if (keys[i] == k)
			return this;

		// If the key is not found here and this is a leaf node
		if (leaf == true)
			return null;

		// Go to the appropriate child
		return C[i].search(k);
	}
}

// This code is contributed by patel2127
var canvas;
var rootNode;
var graphics;

function init() {
	try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvasholder").innerHTML = "An error occurred while initializing graphics.";
	}

	// Sample initialization
	rootNode = new BTreeNode(2, true);
	rootNode.keys = [5, 10];
	drawNode(100, 100, rootNode.keys); 
}

// Function to draw a single key in a square
function drawKey(x, y, key) {
    const keySize = 60; // Adjust as needed
    graphics.strokeRect(x - keySize / 2, y - keySize / 2, keySize, keySize);
    graphics.fillText(key, x - 5, y + 5); // Adjust position for text within the square
}

// Function to draw a rectangular node with keys as squares
function drawNode(x, y, keys) {
    const nodeHeight = 60; 
    const nodeWidth = keys.length*60; 
    const keySpacing = 60;

    graphics.strokeRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);

    const startX = x - nodeHeight / 2;

    keys.forEach((key, index) => {
        drawKey(startX + index * keySpacing, y, key);
    });
}