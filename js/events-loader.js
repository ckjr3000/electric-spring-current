// Events page loader - generates HTML from event data (alphabetically sorted)
class EventsLoader {
    constructor() {
        this.eventsData = [];
        this.artistsList = window.CONFIG ? window.CONFIG.artists : [];
        this.artistsFolder = window.CONFIG ? window.CONFIG.artistsInfoPath : 'artists/info/';
        this.artistsImagesPath = window.CONFIG ? window.CONFIG.artistsImagesPath : 'artists/images/';
    }

    async loadEventData(artistId) {
        try {
            const response = await fetch(`${this.artistsFolder}${artistId}.json`);
            if (!response.ok) {
                console.warn(`Failed to load event: ${artistId}`);
                return null;
            }
            const data = await response.json();
            // if(artistId == "float2") artistId = "float1";
            data.id = artistId;
            data.imagePath = `${this.artistsImagesPath}${artistId}.jpg`;
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
        html += '<p class="events-intro">Live performances and installations at Electric Spring Festival 2026. </p>\n\n';
        html += '<p class="events-intro">As each evening\'s concert opens, the audience will walk in and take their seats to the accompaniment of a recorded piece by improvising musicians, Baleine, who are: Hannah Brady - woodwind and electronics; Manon McCoy - harp and electronics; Jez Matthews - synthesisers; and Will Shaw - percussion and electronics. The live performance was recorded, both directly from the desk by Emma Lambert and through a high-order ambisonic microphone by Peter Brooks and has been mixed and spatialised by Brooks for this playback on the Huddersfield Immersive Sound System (HISS) for Electric Spring 2026.</p>\n\n';

        this.eventsData.forEach((event) => {
            if(!event.name) return;

            html += `<div class="event-entry" id="event-${event.id}">\n`;
            
            // Event header (Show name or Artist name)
            html += '  <div class="event-header">\n';
            if (event.show) {
                html += `    <h2 class="program-show">${event.show}</h2>\n`;
                // html += `    <p><a href="#" class="artist-link" data-artist="${event.id}">${event.name}</a></p>\n`;
            }
            html += '  </div>\n';

            // Event info section
            html += '  <div class="event-info-section">\n';

            // Performance details box
            html += '    <div class="event-performance-details">\n';
            if (event.name && event.bio) { 
                html += `      <p><strong>Artist:</strong> <a href="#" class="artist-link" data-artist="${event.id}">${event.name}</a></p>\n`;
            }
             if (event.type) {
                html += `      <p><strong>Event type:</strong> ${event.type}</p>\n`;
            }
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

     if (event.imagePath) {
                html += `    <div class="artist-image-container">\n`;
                html += `      <img src="${event.imagePath}" alt="${event.name}" class="artist-image" onerror="this.style.display='none'">\n`;
                html += `    </div>\n`;
            }
            
            // Description
            if (event.description) {
                html += `    <p class="event-description">${event.description}</p>\n`;
            }

                                    // Artist Image
       
            
            // Links

            
            if (event.link1 || event.link2) {
                html += '    <div class="event-links">\n';
                if (event.link1 && event.type_link1) {
                    html += `      <a href="${event.link1}" target="_blank" rel="noopener noreferrer">${event.type_link1}</a>\n`;
                }
                if (event.link2 && event.type_link2) {
                    html += `      <a href="${event.link2}" target="_blank" rel="noopener noreferrer">${event.type_link2}</a>\n`;
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