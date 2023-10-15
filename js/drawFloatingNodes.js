import { drawNode } from "./drawTree.js";

export function drawFloatingNodes(floatingNodes, graphics) {
    floatingNodes.forEach(node => {
        drawNode(node.keys, graphics);
    });
}