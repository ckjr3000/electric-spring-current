// Navigation system for loading external HTML pages
class PageLoader {
        constructor() {
        this.pageContainer = document.getElementById('page-container');
        this.pageContentInner = document.getElementById('page-content-inner');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentPage = null;

        this.artistsLoader = new ArtistsLoader();
        this.programLoader = new ProgramLoader();
        this.eventsLoader = new EventsLoader();  // ADD THIS
        this.aboutLoader = new AboutLoader();
        
        this.init();
    }

    init() {
        // Add click handlers to navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = link.getAttribute('data-page');
                this.loadPage(pageName);
            });
        });

        // Close when clicking outside content
        this.pageContainer.addEventListener('click', (e) => {
            if (e.target === this.pageContainer) {
                this.closePage();
            }
        });
    }

    setActiveNavLink(pageName) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        this.currentPage = pageName;
    }

    async loadPage(pageName) {
        try {
            
            this.pageContentInner.innerHTML = '<p>Loading...</p>';
            this.pageContainer.classList.add('active');
            
            this.setActiveNavLink(pageName);

            // Artists page - only bios
            if (pageName === 'artists') {
                const artistsHTML = await this.artistsLoader.init();
                this.pageContentInner.innerHTML = artistsHTML;
                return;
            }

            // Program page - schedule by day/time
            // Program page - schedule by day/time
            if (pageName === 'program') {
                const programHTML = await this.programLoader.init();
                this.pageContentInner.innerHTML = programHTML;
                this.addArtistLinkHandlers();  // Links artist names to Artists page
                this.addEventLinkHandlers();   // Links show titles to Events page
                return;
            }

            // Events page - all events alphabetically with descriptions
            if (pageName === 'events') {
                const eventsHTML = await this.eventsLoader.init();
                this.pageContentInner.innerHTML = eventsHTML;
                return;
            }

            // About page
            if (pageName === 'about') {
                const aboutHTML = await this.aboutLoader.init();
                this.pageContentInner.innerHTML = aboutHTML;
                return;
            }

            throw new Error(`Unknown page: ${pageName}`);

        } catch (error) {
            console.error('Error loading page:', error);
            this.pageContentInner.innerHTML = `
                <h1>Error</h1>
                <p>Sorry, the page could not be loaded.</p>
                <p>${error.message}</p>
            `;
        }
    }
    addEventLinkHandlers() {
        // Find all event links in the current page
        const eventLinks = this.pageContentInner.querySelectorAll('.event-link');
        
        eventLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const eventId = link.getAttribute('data-event');
                
                await this.loadPage('events'); // Load the events page
                
                // Jump directly to the specific event
                setTimeout(() => {
                    const eventElement = document.getElementById(`event-${eventId}`);
                    if (eventElement) {
                        eventElement.scrollIntoView({ block: 'start' });
                        // Highlight the event briefly
                        eventElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                        setTimeout(() => {
                            eventElement.style.backgroundColor = '';
                        }, 2000);
                    }
                }, 100);
            });
        });
    }

    addArtistLinkHandlers() {
        // Find all artist links in the current page
        const artistLinks = this.pageContentInner.querySelectorAll('.artist-link');
        
        artistLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const artistId = link.getAttribute('data-artist');
                
                await this.loadPage('artists'); // Load the artists page
                
                // Scroll to the specific artist
                setTimeout(() => {
                    const artistElement = document.getElementById(`artist-${artistId}`);
                    if (artistElement) {
                        artistElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            });
        });
    }

    closePage() {
        this.pageContainer.classList.remove('active');
        
        // ADD THESE 4 LINES:
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        this.currentPage = null;

        setTimeout(() => {
            if (!this.pageContainer.classList.contains('active')) {
                this.pageContentInner.innerHTML = '';
            }
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PageLoader();
});