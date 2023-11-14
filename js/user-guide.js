const navLinks = document.querySelectorAll('nav ul li a');

const contentSections = document.querySelectorAll('section');

function handleNavClick(event) {
    event.preventDefault();
    
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    const sectionId = event.target.getAttribute('data-section-id');
    const sectionToShow = document.getElementById(sectionId);
    
    if (sectionToShow) {
        sectionToShow.classList.add('active');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});
