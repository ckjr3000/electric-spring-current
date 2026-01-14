// Events page loader - generates HTML from event data (alphabetically sorted)
class EventsLoader {
    constructor() {
        this.eventsData = [];
        this.artistsList = window.CONFIG ? window.CONFIG.artists : [];
        this.artistsFolder = window.CONFIG ? window.CONFIG.artistsInfoPath : 'artists/info/';
    }

    async loadEventData(artistId) {
        try {
            const response = await fetch(`${this.artistsFolder}${artistId}.json`);
            if (!response.ok) {
                console.warn(`Failed to load event: ${artistId}`);
                return null;
            }
            const data = await response.json();
            data.id = artistId;
            return data;
        } catch (error) {
            console.error(`Error loading event ${artistId}:`, error);
            return null;
        }
    }

    async loadAllEvents() {
        if (this.artistsList.length === 0) {
            console.error('No events found in config');
            return [];
        }

        const eventPromises = this.artistsList.map(artistId => this.loadEventData(artistId));
        const results = await Promise.allSettled(eventPromises);
        
        this.eventsData = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);

        // Sort alphabetically by show name or artist name
        this.eventsData.sort((a, b) => {
            const nameA = (a.show || a.name || '').toLowerCase();
            const nameB = (b.show || b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        return this.eventsData;
    }

    generateEventsHTML() {
        if (!this.eventsData || this.eventsData.length === 0) {
            return '<h1>EVENTS</h1><p>Unable to load event information.</p>';
        }

        let html = '<h1>EVENTS</h1>\n';
        html += '<p class="events-intro">All performances at Electric Spring Festival 2026</p>\n\n';

        this.eventsData.forEach((event) => {
            html += `<div class="event-entry" id="event-${event.id}">\n`;
            
            // Event header (Show name or Artist name)
            html += '  <div class="event-header">\n';
            if (event.show) {
                html += `    <h2>${event.show}</h2>\n`;
                html += `<div class="program-installation">${event.type}</div>\n`;
                html += `    <h3><a href="#" class="event-artist-name artist-link" data-artist="${event.id}">${event.name}</a></h3>\n`;

            } else {
                html += `    <h2>${event.name}</h2>\n`;
            }
            html += '  </div>\n';
            
            // Event info section
            html += '  <div class="event-info-section">\n';
            
            // Performance details box
            html += '    <div class="event-performance-details">\n';
            if (event.date) {
                html += `      <p><strong>Date:</strong> ${event.date}</p>\n`;
            }
            if (event.hour) {
                html += `      <p><strong>Time:</strong> ${event.hour}</p>\n`;
            }
            if (event.place) {
                html += `      <p><strong>Venue:</strong> ${event.place}</p>\n`;
            }
            html += '    </div>\n';
            
            // Description
            if (event.description) {
                html += `    <p class="event-description">${event.description}</p>\n`;
            }
            
            // Links
            if (event.link1 || event.link2) {
                html += '    <div class="event-links">\n';
                if (event.link1) {
                    html += `      <a href="${event.link1}" target="_blank" rel="noopener noreferrer">link</a>\n`;
                }
                if (event.link2) {
                    html += `      <a href="${event.link2}" target="_blank" rel="noopener noreferrer">link</a>\n`;
                }
                html += '    </div>\n';
            }
            
            html += '  </div>\n';
            html += '</div>\n\n';
        });

        return html;
    }

    async init() {
        await this.loadAllEvents();
        return this.generateEventsHTML();
    }
}

window.EventsLoader = EventsLoader;