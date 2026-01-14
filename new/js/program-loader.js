// Program page loader - generates HTML from program data
class ProgramLoader {
    constructor() {
        this.programData = null;
        this.artistsFolder = window.CONFIG ? window.CONFIG.artistsInfoPath : 'artists/info/';
        this.programFile = 'program/program.json';
    }

    async loadProgramData() {
        try {
            const response = await fetch(this.programFile);
            if (!response.ok) {
                throw new Error('Failed to load program data');
            }
            this.programData = await response.json();
            return this.programData;
        } catch (error) {
            console.error('Error loading program data:', error);
            return null;
        }
    }

    async loadArtistInfo(artistId) {
        try {
            const response = await fetch(`${this.artistsFolder}${artistId}.json`);
            if (!response.ok) {
                console.warn(`Failed to load artist info: ${artistId}`);
                return null;
            }
            const data = await response.json();
            
            // Return the fields we need for the program + artist ID for linking
            return {
                id: artistId, 
                show: data.show || null,
                type: data.type || null,
                name: data.name || null,
                date: data.date || null,
                place: data.place || null,
                hour: data.hour || null
            };
        } catch (error) {
            console.error(`Error loading artist info ${artistId}:`, error);
            return null;
        }
    }
    async generateProgramHTML() {
        if (!this.programData) {
            await this.loadProgramData();
        }

        if (!this.programData) {
            return '<h1>PROGRAM</h1><p>Unable to load program information.</p>';
        }

        let html = '<h1>PROGRAM</h1>\n';
        html += '<p class="program-intro">Electric Spring Festival 2026 - Full Schedule</p>\n\n';

        // Iterate through each day
        for (const [dayKey, dayData] of Object.entries(this.programData)) {
            html += '<div class="program-day">\n';
            
            // Day header (Day + Date)
            html += '  <div class="program-day-header">\n';
            html += `    <h2>${this.formatDayTitle(dayKey)}</h2>\n`;
            html += `    <p class="program-date">${dayData.date}</p>\n`;
            html += '  </div>\n';

            if (dayData.artists && dayData.artists.length > 0) {
                // Load all artist info for this day in parallel
                const artistInfoPromises = dayData.artists.map(artistId => 
                    this.loadArtistInfo(artistId)
                );
                const artistsInfo = await Promise.all(artistInfoPromises);

                // Sort artists by hour if available
                const sortedArtists = artistsInfo
                    .filter(artist => artist !== null)
                    .sort((a, b) => {
                        if (!a.hour || !b.hour) return 0;
                        return a.hour.localeCompare(b.hour);
                    });

                // Performances container (indented)
                html += '  <div class="program-performances">\n';
            
                sortedArtists.forEach(artist => {
                    if(!artist.name) return;

                    html += '<div class="program-performance">\n';
                    
                    if (artist.hour) { // Time
                        html += `<div class="program-installation">${artist.type}\n`;
                        html += `<div class="program-time"> <span style="font-size: 0.5em;">h.</span> ${artist.hour}</div>\n`;
                        html += '</div>\n';
                    }
                    
                    html += '<div class="program-details">\n'; // Details
                    
                    // Artist name with link to artists page
                    html += `<h3><a href="#" class="artist-link" data-artist="${artist.id}">${artist.name}</a></h3>\n`;
                    
                    // Show title with link to events page
                    if (artist.show) {
                        html += `<p class="program-show"><a href="#" class="event-link" data-event="${artist.id}">"${artist.show}"</a></p>\n`;
                    }
                    
                    if (artist.place) {
                        html += `<p class="program-venue">${artist.place}</p>\n`;
                    }
                    
                    html += '</div>\n';
                    html += '</div>\n';
                });

                html += '  </div>\n';
            } else {
                html += '  <p class="program-no-events">No performances scheduled</p>\n';
            }

            html += '</div>\n\n';
        }

        return html;
    }   

    formatDayTitle(dayKey) {
        return dayKey.split(' ') // Convert "day 1" to "Day 1"
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async init() {
        return await this.generateProgramHTML();
    }
}

window.ProgramLoader = ProgramLoader;