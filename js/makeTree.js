import { drawNode } from "./drawTree.js";

export function makeTree(node, x, y, canvas) {
    const keys = node.keys.filter((key) => key !== undefined);
    const graphics = canvas.getContext("2d"); 
    drawNode(x, y, keys, graphics);
    
    canvas.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        const offsetX = mouseX - x;
        const offsetY = mouseY - y;
        let isDragging = true;

        function onMouseMove(e) {
            if (isDragging) {
                const newX =
                    e.clientX - canvas.getBoundingClientRect().left - offsetX;
                const newY =
                    e.clientY - canvas.getBoundingClientRect().top - offsetY;
                x = newX;
                y = newY;
                graphics.clearRect(0, 0, canvas.width, canvas.height);
                drawNode(x, y, keys);
            }
        }

        function onMouseUp() {
            isDragging = false;
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            const snappedPos = snapToGrid(x, y);
            x = snappedPos.x;
            y = snappedPos.y;
            graphics.clearRect(0, 0, canvas.width, canvas.height);
            drawNode(x, y, keys);
        }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
    })
}

function snapToGrid(x, y) {
    return {
        x: Math.round(x / 50) * 50,
        y: Math.round(y / 50) * 50,
    };
}