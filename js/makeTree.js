function snapToGrid(x, y) {
    return {
        x: Math.round(x / 50) * 50,
        y: Math.round(y / 50) * 50,
    };
}

function makeTree(node, x, y) {
    const keys = node.keys.filter((key) => key !== undefined);
    drawNode(x, y, keys)
    const canvas2 = document.getElementById('canvas');
    const graphics2 = canvas2.getContext("2d"); 
    
    canvas2.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX - canvas2.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas2.getBoundingClientRect().top;

        const offsetX = mouseX - x;
        const offsetY = mouseY - y;
        let isDragging = true;

        

        function onMouseMove(e) {
            if (isDragging) {
                const newX =
                    e.clientX - canvas2.getBoundingClientRect().left - offsetX;
                const newY =
                    e.clientY - canvas2.getBoundingClientRect().top - offsetY;
                x = newX;
                y = newY;
                graphics2.clearRect(0, 0, canvas2.width, canvas2.height);
                drawNode(x, y, keys);
            }
        }

        function onMouseUp() {
            isDragging = false;
            canvas2.removeEventListener('mousemove', onMouseMove);
            canvas2.removeEventListener('mouseup', onMouseUp);
            const snappedPos = snapToGrid(x, y);
            x = snappedPos.x;
            y = snappedPos.y;
            graphics2.clearRect(0, 0, canvas2.width, canvas2.height);
            drawNode(x, y, keys);
        }

        canvas2.addEventListener('mousemove', onMouseMove);
        canvas2.addEventListener('mouseup', onMouseUp);

    })
}