export function validateTree(logicTree, userDrawingTree){

    function areBTreesEqual(tree1, tree2) {

        
        function deepArrayCompare(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) {
                    return false;
                }
            }
            return true;
        }

        // Helper function for in-order traversal
        let isCorrect = true;
        if (tree2.freeNodes.length>0){
            isCorrect =false;
            return isCorrect;
        }
        tree1.levels.forEach((logicLevel,levelIndex) => {
            logicLevel.forEach((logicNode,nodeIndex) => {
                let logicKeyValues = [];
                let userKeyValues = [];
                let tempLogicKeys = logicNode.keys.filter((key) => key.value != undefined);
                let tempUserKeys = tree2.levels[levelIndex][nodeIndex].keys.filter((key) => key.value != undefined);
                tempLogicKeys.forEach(key => {
                    logicKeyValues.push(key.value);
                });
                tempUserKeys.forEach(key => {
                    userKeyValues.push(key.value);
                });
                 for (let keyIndex = 0; keyIndex < logicKeyValues.length; keyIndex++){
    
                 }
                if (!deepArrayCompare(logicKeyValues,userKeyValues)){
                    isCorrect = false;
                    console.log("USER  : ",userKeyValues);
                    console.log("LOGIC : ",logicKeyValues);
                }
            });
        });
        return isCorrect;
    
    }

    if (logicTree && userDrawingTree){
        var treeEqual = areBTreesEqual(logicTree, userDrawingTree);
        if (treeEqual){
            console.log("Your tree is correct");
        } else {
            console.log("Your tree is in-correct");
        }
    }

}


