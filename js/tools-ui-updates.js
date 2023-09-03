let insert_delete_section = document.createElement('section');
let custom_tree_btn = document.querySelector('.custom-tree-btn');
let canvas = document.getElementById('canvas');
let canvas_container = document.querySelector('.canvas-container');

insert_delete_section.classList.add('insert-delete-container');
insert_delete_section.innerHTML = "";

custom_tree_btn.addEventListener('click', () =>{
    canvas_container.insertBefore(insert_delete_section, canvas);
});