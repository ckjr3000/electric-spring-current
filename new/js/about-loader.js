// About page loader - generates HTML from "about" text file
class AboutLoader {
    constructor() {
        this.aboutText = null;
        this.aboutFile = 'data/about.txt';
    }

    async loadAboutText() {
        try {
            const response = await fetch(this.aboutFile);
            if (!response.ok) {
                throw new Error('Failed to load about text');
            }
            this.aboutText = await response.text();
            return this.aboutText;
        } catch (error) {
            console.error('Error loading about text:', error);
            return null;
        }
    }

    async generateAboutHTML() {
        if (!this.aboutText) {
            await this.loadAboutText();
        }

        if (!this.aboutText) {
            return '<h1>ABOUT</h1><p>Unable to load about information.</p>';
        }

        let html = '<h1>ABOUT</h1>\n\n';
        html += '<div class="about-content">\n';
        
        // Split text by double newlines (paragraphs)
        const paragraphs = this.aboutText.split('\n\n').filter(p => p.trim());
        
        paragraphs.forEach((paragraph) => {
            const trimmed = paragraph.trim();
            if (trimmed) {
                html += `  <p class="about-section">${trimmed}</p>\n`;
            }
        });
        
        html += '</div>\n';

        return html;
    }

    async init() {
        return await this.generateAboutHTML();
    }
}

window.AboutLoader = AboutLoader; // Make it available globally