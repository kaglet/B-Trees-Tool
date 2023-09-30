// import { assignNodePositions } from "./assign-positions.js";

let frameNumber = 0;

let canvas;
let rootNode;
let graphics;
let tree;

let createTreeStarted = true;
let randomTreeStarted = true;

function init() {
    try {
		canvas = document.getElementById("canvas");
		graphics = canvas.getContext("2d");
	} catch(e) {
		document.getElementById("canvas").innerHTML = "An error occurred while initializing graphics.";
	}    
}


let insertValue;
function insertKeyCreate() {
    if (!createTreeStarted  || !randomTreeStarted) {
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
            //drawTree(tree.root, canvas.width / 2, 30);
            makeTree(tree.root, canvas.width / 2, 30);

            document.getElementById("insert").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

// user input and remove that value from the tree
let removeValue;
function removeKeyCreate() {
    if (!createTreeStarted || !randomTreeStarted) {
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
                    // assignNodePositions(tree.root);
                    document.getElementById("delete").focus();
                    document.getElementById("error-message").innerHTML  = "";

                }
            } catch(e) {
                console.log(e);
            }
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log("The Tree:");
            //drawTree(tree.root, canvas.width / 2, 30);
            makeTree(tree.root, canvas.width / 2, 30);

            document.getElementById("delete").value = null;
        } catch(e) {
            console.log(e);
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Please enter a max degree and select 'Custom Tree'";
    }
}

let maxDegree;
function createTree() {
    if (randomTreeStarted) {
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
                        console.log(document.getElementById("insert-delete-section").style.display)
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
            console.log(document.getElementById("insert-delete-section").style.display)
            if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
                document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
            } else {
                document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
            }
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Cancel Random Tree Creation before new Custom Tree";
    }

}

let NumKeys;
function randomTree() {
    if (createTreeStarted) {
        if (randomTreeStarted) {
            try {
                maxDegree = document.getElementById("max-degree").value;
                NumKeys = document.getElementById("num-keys").value;
                //ensure a traverse is called after a removal to allow for cleaning tree
                try{
                    if (maxDegree === ""){
                        console.log("Enter a max degree value");
                        document.getElementById("error-message").innerHTML  = "Enter a max degree value before randomizing a tree";
                    } else  if (NumKeys === ""){
                        console.log("Enter a num keys value");
                        document.getElementById("error-message").innerHTML  = "Enter a num keys value before randomizing a tree";
                    } else {
                        document.getElementById("error-message").innerHTML  = "";
                        // randomise here
                        tree = new BTree(parseInt(maxDegree));
                        generateRandomTree();
                        document.getElementById("random-tree-btn").innerHTML  = "Cancel";
                        document.getElementById("insert").focus();
                        randomTreeStarted= false;
                        console.log(document.getElementById("insert-delete-section").style.display)
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
                document.getElementById("num-keys").value = null;
            } catch(e) {
                console.log(e);
            }
        } else {
            console.log("Tree Randomization Canceled");
            graphics.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            document.getElementById("random-tree-btn").innerHTML  = "Randomize Tree";
            document.getElementById("max-degree").focus();
            randomTreeStarted= true;
            console.log(document.getElementById("insert-delete-section").style.display)
            if (document.getElementById("insert-delete-section").style.display === "none" || document.getElementById("insert-delete-section").style.display === "") {
                document.getElementById("insert-delete-section").style.display = "inline"; // Show the section
            } else {
                document.getElementById("insert-delete-section").style.display = "none"; // Hide the section
            }
        }
    } else {
        document.getElementById("error-message").innerHTML  = "Cancel Custom Tree Creation before new Random Tree";
    }
}

let offsetX = 0;
function MoveCanvas(move) {
    if (!createTreeStarted || !randomTreeStarted) {
        if (move == 'l') {
            // Move canvas's graphics to the left
            offsetX -= 30;
        } else if (move == 'r') {
            // Move canvas's graphics to the right
            offsetX += 30;
        } else {
            // Reset canvas's graphics
            offsetX = 0;
        }

        graphics.clearRect(0, 0, canvas.width, canvas.height);
        graphics.setTransform(1, 0, 0, 1, offsetX, 0);
        //drawTree(tree.root, canvas.width / 2 - 60, 50);
        makeTree(tree.root, canvas.width / 2 - 60, 50);
        graphics.setTransform(1, 0, 0, 1, 0, 0);
    }
}

function generateRandomTree() {
    const seed = new Date().getTime().toString();
    console.log(seed);
    // Math.seed(seed);

    for (let i = 0; i < parseInt(NumKeys); i++) {
        const key = Math.floor(Math.random() * 100); 
        tree.insert(parseInt(key));
        tree.traverse();
    }

    graphics.clearRect(0, 0, canvas.width, canvas.height); 
    console.log("The Tree:");
    drawTree(tree.root, canvas.width / 2 - 60, 50);
    console.log(tree);
}

function generateRandomQuestion() {
    const question = Math.floor(Math.random() * 3);
    let key;

    if (question == 0 ){
        //insert
        key = Math.floor(Math.random() * 100); 
        tree.insert(parseInt(key));
        tree.traverse();
        console.log("Insert: ", key)
        document.getElementById("question").innerHTML  = "Insert: "+  key;
    } else if (question==1){
        //delete
        key = Math.floor(Math.random() * 100); 
        while (tree.root.search(key)==null){
            key = Math.floor(Math.random() * 100); 
        }
        tree.remove(key);
        tree.traverse();
        console.log("Delete: ", key)
        document.getElementById("question").innerHTML  = "Delete: "+ key;
    } else if (question==2){
        //search
        key = Math.floor(Math.random() * 100); 
        console.log("Search: ", key)
        document.getElementById("question").innerHTML  = "Search: "+ key;

    }
    graphics.clearRect(0, 0, canvas.width, canvas.height); 
    console.log("The Tree:");
    drawTree(tree.root, canvas.width / 2 - 60, 50);

}

let userTree;
//userTree = SOME KIND OF CONVERSION of tree

function saveTree() {
    document.getElementById("parameters-container").style.display = "none";
    document.getElementById("parameters-container-q").style.display = "flex";
    document.getElementById("custom-tree-btn").style.display = "none";
    document.getElementById("validate-button").style.display = "flex";
    document.getElementById("save-button").style.display = "none";
    document.getElementById("insert-delete-section").style.display = "none";
}


  





