// ASCII generator Class
class ASCIIArtGenerator {
    constructor() {
        this.asciiOutput = document.getElementById('ascii-output');
        this.asciiChars = '@#+=:. '; // ASCII characters used (from darkest to lightest)
        this.artists = window.CONFIG.artists; 
        this.artistsImagesPath = window.CONFIG.artistsImagesPath;
        this.centerText = [
            'ELECTRIC',
            'SPRING',
            'FESTIVAL'
        ];
        this.date = '18-21 FEB 2026'; // Festival date
        
        this.charWidth = 7;  // pixels per character
        this.charHeight = 7; // pixels per character 

        this.updateViewportDimensions(); // Calculate viewport dimensions

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // ADD THIS: Click on ASCII background to regenerate
        this.asciiOutput.addEventListener('click', () => {
            this.handleResize(); // Reuses the debouncing logic
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
            }, 100); // 100 ms debouncing
        });
    }

    async generateBlendedASCII() {
        try {
            // Array of Promises: one for each artist
            const imagePromises = this.artists.map(artist => 
                this.loadImage(`${this.artistsImagesPath}${artist}.jpg`)
            );
            const images = await Promise.allSettled(imagePromises); //  return [{status: 'fulfilled', value: img}, {status: 'rejected', reason: error}, ...]
            // Filter out failed images
            const loadedImages = images.filter(result => result.status === 'fulfilled').map(result => result.value);
        
            if (loadedImages.length === 0) return; // return if no images
        
            const shuffled = [...loadedImages].sort(() => Math.random() - 0.5);     // random sorting
            const selectedImages = shuffled.slice(0, Math.min(2, shuffled.length)); // select first two
            const asciiDimensions = this.calculateASCIIDimensions(); // Calculate ASCII dimensions to fill viewport
            const imageData = await this.blendImagesAbstract(selectedImages, asciiDimensions); // Blend the 2 selected images
            const asciiArt = this.imageDataToASCII(imageData); // Convert blended image to ASCII with text in between
            // ADD GLITCH EFFECT
            // const glitchedAscii = this.applyGlitchEffect(asciiArt);
            this.asciiOutput.textContent = asciiArt; // Display result
            
        } catch (error) {
            console.error('Error generating ASCII:', error);
        }
    }

    calculateASCIIDimensions() { // how many characters fit in viewport
        const cols = Math.floor(window.innerWidth / this.charWidth);
        const rows = Math.floor(window.innerHeight / this.charHeight);
        return { width: cols, height: rows };
    }

    loadImage(path) { // load image and return a Promise
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${path}`));
            img.src = path; // start loading
        });
    }

    async blendImagesAbstract(images, dimensions) {
        if (images.length === 0) {
            throw new Error('No images to blend');
        }
    
        const canvas = document.createElement('canvas'); // Create canvas for blending
        const ctx = canvas.getContext('2d');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.fillStyle = '#ffffff'; // Start with white background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        images.forEach((img) => { // Blend images with subtle transformations
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = dimensions.width;
            tempCanvas.height = dimensions.height;
      
            // SUBTLE transformations -> keep image very recognizable
            const scale = 0.95 + Math.random() * 0.15; 
            const offsetX = (Math.random() - 0.5) * dimensions.width * 0.15; 
            const offsetY = (Math.random() - 0.5) * dimensions.height * 0.15;
            const rotation = (Math.random() - 0.5) * 0.2; 
      
            tempCtx.save(); // Apply transformations
            tempCtx.translate(dimensions.width / 2, dimensions.height / 2); // move to the center for rotation
            tempCtx.rotate(rotation);
            tempCtx.scale(scale, scale);
            tempCtx.translate(-dimensions.width / 2 + offsetX, -dimensions.height / 2 + offsetY); // back to corner
            tempCtx.drawImage(img, 0, 0, dimensions.width, dimensions.height); // Draw image
            tempCtx.restore();
      
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'normal';    // normal blending
            ctx.drawImage(tempCanvas, 0, 0);            // draw the temporary image in the general canvas
        });
    
        return ctx.getImageData(0, 0, canvas.width, canvas.height); // return final blended image data
    } 

    updateViewportDimensions() {
        const computedStyle = window.getComputedStyle(this.asciiOutput);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize;
        const charWidth = fontSize * 0.6;
        
        this.viewportCols = Math.ceil(window.innerWidth / charWidth);
        this.viewportRows = Math.ceil(window.innerHeight / lineHeight) + 30;
        
        // Calculate text dimensions (for title overlay)
        this.textLineHeight = Math.max(15, Math.floor(this.viewportRows * 0.06));
        this.textLineSpacing = Math.floor(this.textLineHeight * 0.1);
        this.textCharWidth = Math.floor(this.textLineHeight * 0.7);
        this.textCharSpacing = Math.floor(this.textCharWidth * 0.2);
        
        // Calculate date dimensions (for date overlay)
        this.dateLineHeight = Math.max(8, Math.floor(this.viewportRows * 0.03));
        this.dateCharWidth = Math.floor(this.dateLineHeight * 0.6);
        this.dateCharSpacing = Math.floor(this.dateCharWidth * 0.25);
    }

    imageDataToASCII(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        let ascii = '';

        const viewportCols = this.viewportCols;
        const viewportRows = this.viewportRows 
    
        for (let y = 0; y < viewportRows; y++) { // through rows
            let line = '';
            let lastChar = ' ';
      
            for (let x = 0; x < viewportCols; x++) { // through columns
                
                const imgY = y % height;    // repeat image if we go beyond its bounds
                const imgX = x % width;     

                // Check if the position should be text
                const isTextTitle = this.isPositionInText(x, y);
                const isTextDate = this.isPositionInTextDate(x, y);
            
                if (isTextTitle ) { // SOLID BLACK character for text
                    lastChar = '█';
                } else if (isTextDate){
                    lastChar = '█'; // DOTTED BLACK character for date
                } else {
                    // fetch pixel color and transform its luminance (greyscale) to ASCII
                    const offset = (imgY * width + imgX) * 4; // data are structured like [R,G,B,A,R,G,B,A,...] row by row
                    const r = imageData.data[offset];
                    const g = imageData.data[offset + 1];
                    const b = imageData.data[offset + 2];
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255; // from RGB to luminance
                    const charIndex = Math.floor((1 - brightness) * (this.asciiChars.length - 1)); // From brightness to ASCII 
                    lastChar = this.asciiChars[charIndex];
                }
                line += lastChar; 
            }
            ascii += line + '\n';
        }
        return ascii;
    }

    isPositionInText(x, y) {
        const totalHeight = (this.textLineHeight * 3) + (this.textLineSpacing * 2);
        const textStartY = Math.floor(this.viewportRows * 0.35 - totalHeight / 2);
        
        for (let i = 0; i < this.centerText.length; i++) {
            const lineY = textStartY + i * (this.textLineHeight + this.textLineSpacing);
            
            if (y >= lineY && y < lineY + this.textLineHeight) {
                const text = this.centerText[i];
                const textWidth = text.length * (this.textCharWidth + this.textCharSpacing);
                const textStartX = Math.floor(this.viewportCols / 2 - textWidth / 2);
                
                const charIndex = Math.floor((x - textStartX) / (this.textCharWidth + this.textCharSpacing));
                if (charIndex >= 0 && charIndex < text.length) {
                    const letter = text[charIndex];
                    const relativeX = (x - textStartX) % (this.textCharWidth + this.textCharSpacing);
                    const relativeY = y - lineY;
                
                    if (relativeX < this.textCharWidth && 
                        this.isPixelInLetter(letter, relativeX, relativeY, this.textCharWidth, this.textLineHeight)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isPositionInTextDate(x, y) {
        // Position date right after the title
        const titleTotalHeight = (this.textLineHeight * 3) + (this.textLineSpacing * 2);
        const titleStartY = Math.floor(this.viewportRows * 0.3 - titleTotalHeight / 2);
        const dateY = titleStartY + titleTotalHeight + Math.floor(this.textLineHeight * 0.4);
        
        if (y >= dateY && y < dateY + this.dateLineHeight) {
            const text = this.date;
            const textWidth = text.length * (this.dateCharWidth + this.dateCharSpacing);
            const textStartX = Math.floor(this.viewportCols / 2 - textWidth / 2);
            
            const charIndex = Math.floor((x - textStartX) / (this.dateCharWidth + this.dateCharSpacing));
            if (charIndex >= 0 && charIndex < text.length) {
                const letter = text[charIndex];
                const relativeX = (x - textStartX) % (this.dateCharWidth + this.dateCharSpacing);
                const relativeY = y - dateY;
            
                if (relativeX < this.dateCharWidth && 
                    this.isPixelInLetter(letter, relativeX, relativeY, this.dateCharWidth, this.dateLineHeight)) {
                    return true;
                }
            }
        }
        return false;
    }

    isPixelInLetter(letter, x, y, w, h) {
        const pattern = window.LETTER_PATTERNS[letter.toUpperCase()];
        return pattern ? pattern(x, y, w, h) : false; // true if pixel should be filled
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCIIArtGenerator();
});