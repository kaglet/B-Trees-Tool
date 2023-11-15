const contentSections = document.querySelectorAll('section');

const nav = document.querySelector('nav');

nav.addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        const sectionId = event.target.getAttribute('data-section-id');
        console.log('Clicked:', event.target);
        console.log('Section ID:', sectionId);
        
        event.preventDefault();
        
        contentSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }
});
