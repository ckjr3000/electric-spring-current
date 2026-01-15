// ASCII generator Class - Image Blending Only (No Text Overlay)
class ASCIIArtGenerator {
    constructor() {
        this.asciiOutput = document.getElementById('ascii-output');
        this.asciiChars = '@#+=:.'; // ASCII characters used (from darkest to lightest)
        this.artists = window.CONFIG.artists; 
        this.artistsImagesPath = window.CONFIG.artistsImagesPath;
        
        this.charWidth = 7;  // pixels per character
        this.charHeight = 7; // pixels per character 

        this.updateViewportDimensions();

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        this.asciiOutput.addEventListener('click', () => {
            this.handleResize();
        });

        this.generateBlendedASCII();
    }

    handleResize() {
        return new Promise((resolve) => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(async () => {
                this.updateViewportDimensions();
                await this.generateBlendedASCII();
                resolve();
            }, 100);
        });
    }

    async generateBlendedASCII() {
        try {
            const imagePromises = this.artists.map(artist => 
                this.loadImage(`${this.artistsImagesPath}${artist}.jpg`)
            );
            const images = await Promise.allSettled(imagePromises);
            const loadedImages = images.filter(result => result.status === 'fulfilled').map(result => result.value);
        
            if (loadedImages.length === 0) return;
        
            const shuffled = [...loadedImages].sort(() => Math.random() - 0.5);
            const selectedImages = shuffled.slice(0, Math.min(2, shuffled.length));
            const asciiDimensions = this.calculateASCIIDimensions();
            const imageData = await this.blendImagesAbstract(selectedImages, asciiDimensions);
            const asciiArt = this.imageDataToASCII(imageData);
            this.asciiOutput.textContent = asciiArt;
            
        } catch (error) {
            console.error('Error generating ASCII:', error);
        }
    }

    calculateASCIIDimensions() {
        const cols = Math.floor(window.innerWidth / this.charWidth);
        const rows = Math.floor(window.innerHeight / this.charHeight);
        return { width: cols, height: rows };
    }

    loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${path}`));
            img.src = path;
        });
    }

    async blendImagesAbstract(images, dimensions) {
        if (images.length === 0) {
            throw new Error('No images to blend');
        }
    
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        images.forEach((img) => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = dimensions.width;
            tempCanvas.height = dimensions.height;
      
            const scale = 0.95 + Math.random() * 0.15; 
            const offsetX = (Math.random() - 0.5) * dimensions.width * 0.15; 
            const offsetY = (Math.random() - 0.5) * dimensions.height * 0.15;
            const rotation = (Math.random() - 0.5) * 0.2; 
      
            tempCtx.save();
            tempCtx.translate(dimensions.width / 2, dimensions.height / 2);
            tempCtx.rotate(rotation);
            tempCtx.scale(scale, scale);
            tempCtx.translate(-dimensions.width / 2 + offsetX, -dimensions.height / 2 + offsetY);
            tempCtx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
            tempCtx.restore();
      
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'normal';
            ctx.drawImage(tempCanvas, 0, 0);
        });
    
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    } 

    updateViewportDimensions() {
        const computedStyle = window.getComputedStyle(this.asciiOutput);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize;
        
        const charWidth = fontSize * 0.6;
        
        this.viewportCols = Math.floor(window.innerWidth / charWidth);
        this.viewportRows = Math.floor(window.innerHeight / lineHeight);
    }

    imageDataToASCII(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        let ascii = '';

        const viewportCols = this.viewportCols;
        const viewportRows = this.viewportRows;
    
        for (let y = 0; y < viewportRows; y++) {
            let line = '';
      
            for (let x = 0; x < viewportCols; x++) {
                const imgY = y % height;
                const imgX = x % width;

                const offset = (imgY * width + imgX) * 4;
                const r = imageData.data[offset];
                const g = imageData.data[offset + 1];
                const b = imageData.data[offset + 2];
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const charIndex = Math.floor((1 - brightness) * (this.asciiChars.length - 1));
                line += this.asciiChars[charIndex];
            }
            ascii += line + '\n';
        }
        return ascii;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCIIArtGenerator();
});