const navLinks = document.querySelectorAll('nav ul li a');
const contentSections = document.querySelectorAll('section');

function handleNavClick(event) {
    event.preventDefault();
    const sectionId = event.target.getAttribute('data-section-id');
    
    contentSections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});
