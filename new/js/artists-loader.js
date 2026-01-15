// Artists page loader - shows only artist bios (alphabetically sorted)
class ArtistsLoader {
    constructor() {
        this.artistsData = [];
        this.artistsList = window.CONFIG ? window.CONFIG.artists : [];
        this.artistsFolder = window.CONFIG ? window.CONFIG.artistsInfoPath : 'artists/info/';
        this.artistsImagesPath = window.CONFIG ? window.CONFIG.artistsImagesPath : 'artists/images/';
    }

    async loadArtistData(artistId) {
        try {
            const response = await fetch(`${this.artistsFolder}${artistId}.json`);
            if (!response.ok) {
                console.warn(`Failed to load artist: ${artistId}`);
                return null;
            }
            const data = await response.json();
            data.id = artistId;
            data.imagePath = `${this.artistsImagesPath}${artistId}.jpg`;
            return data;
        } catch (error) {
            console.error(`Error loading artist ${artistId}:`, error);
            return null;
        }
    }

    async loadAllArtists() {
        if (this.artistsList.length === 0) {
            console.error('No artists found in config');
            return [];
        }

        const artistPromises = this.artistsList.map(artistId => this.loadArtistData(artistId));
        const results = await Promise.allSettled(artistPromises);
        
        this.artistsData = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);

        return this.artistsData;
    }

    generateArtistsHTML() {
        if (!this.artistsData || this.artistsData.length === 0) {
            return '<h1>ARTISTS</h1><p>Unable to load artist information.</p>';
        }

        let html = '<h1>ARTISTS</h1>\n';
        html += '<p class="artists-intro">Artists performing at Electric Spring Festival 2026</p>\n\n';

        this.artistsData.forEach((artist) => {

            if(!artist.name) return;
            
            html += `<div class="artist-entry" id="artist-${artist.id}">\n`;
            
            // Artist header (Name only)
            html += '  <div class="artist-header">\n';
            html += `    <h2>${artist.name}</h2>\n`;
            html += '  </div>\n';
            
            // Artist content section
            html += '  <div class="artist-info-section">\n';
            
            // Artist Image : if I want to add the artist images
            // if (artist.imagePath) {
            //     html += `    <div class="artist-image-container">\n`;
            //     html += `      <img src="${artist.imagePath}" alt="${artist.name}" class="artist-image" onerror="this.style.display='none'">\n`;
            //     html += `    </div>\n`;
            // }
            
            // Bio
            if (artist.bio) {
                html += `    <div class="artist-bio">\n`;
                html += `      <p>${artist.bio}</p>\n`;
                html += `    </div>\n`;
            }
            
            // Links
            if (artist.link1 || artist.link2) {
                html += '    <div class="artist-links">\n';
                if (artist.link1) {
                    html += `      <a href="${artist.link1}" target="_blank" rel="noopener noreferrer">link</a>\n`;
                }
                if (artist.link2) {
                    html += `      <a href="${artist.link2}" target="_blank" rel="noopener noreferrer">link</a>\n`;
                }
                html += '    </div>\n';
            }
            
            html += '  </div>\n';
            html += '</div>\n\n';
        });

        return html;
    }

    async init() {
        await this.loadAllArtists();
        return this.generateArtistsHTML();
    }
}

window.ArtistsLoader = ArtistsLoader;