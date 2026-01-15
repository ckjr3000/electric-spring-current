// ASCII generator Class - Fixed Character Width Measurement (No Date)
class ASCIIArtGenerator {
    constructor() {
        this.asciiOutput = document.getElementById('ascii-output');
        this.asciiChars = '@#+=.'; // ASCII characters used (from darkest to lightest)
        this.artists = window.CONFIG.artists; 
        this.artistsImagesPath = window.CONFIG.artistsImagesPath;
        this.centerText = [
            'ELECTRIC',
            'SPRING',
            'FESTIVAL'
        ];
        
        // These will be measured dynamically
        this.charWidth = 7;
        this.charHeight = 7;

        this.updateViewportDimensions(); // Calculate viewport dimensions

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Click on ASCII background to regenerate
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
        
        // CRITICAL FIX: Measure actual character width
        // Create a temporary element to measure the actual rendered width of a character
        const measureElement = document.createElement('span');
        measureElement.style.font = computedStyle.font;
        measureElement.style.fontSize = computedStyle.fontSize;
        measureElement.style.fontFamily = computedStyle.fontFamily;
        measureElement.style.visibility = 'hidden';
        measureElement.style.position = 'absolute';
        measureElement.style.whiteSpace = 'pre';
        measureElement.textContent = '█'; // Use the solid block character we use for text
        document.body.appendChild(measureElement);
        
        const actualCharWidth = measureElement.getBoundingClientRect().width;
        const actualCharHeight = measureElement.getBoundingClientRect().height;
        
        document.body.removeChild(measureElement);
        
        // Use measured values
        this.charWidth = actualCharWidth > 0 ? actualCharWidth : fontSize * 0.6;
        this.charHeight = actualCharHeight > 0 ? actualCharHeight : lineHeight;
        
        this.viewportCols = Math.floor(window.innerWidth / this.charWidth);
        this.viewportRows = Math.floor(window.innerHeight / this.charHeight);
        
        // Detect mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // MOBILE: Use measured character dimensions
            const baseSize = Math.floor(window.innerWidth / 22);
            
            this.textLineHeight = Math.max(8, baseSize);
            this.textLineSpacing = Math.floor(this.textLineHeight * 0.08);
            this.textCharWidth = Math.floor(this.textLineHeight * 0.6);
            this.textCharSpacing = Math.floor(this.textCharWidth * 0.1);
        } else {
            // DESKTOP: Original calculations
            this.textLineHeight = Math.max(15, Math.floor(this.viewportRows * 0.06));
            this.textLineSpacing = Math.floor(this.textLineHeight * 0.1);
            this.textCharWidth = Math.floor(this.textLineHeight * 0.7);
            this.textCharSpacing = Math.floor(this.textCharWidth * 0.2);
        }
        
        console.log('Character measurement:', {
            actualCharWidth: actualCharWidth,
            actualCharHeight: actualCharHeight,
            charWidth: this.charWidth,
            charHeight: this.charHeight,
            viewportCols: this.viewportCols,
            viewportRows: this.viewportRows,
            isMobile: isMobile
        });
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

                // Check if the position should be text (title only)
                const isTextTitle = this.isPositionInText(x, y);
            
                if (isTextTitle) {
                    line += '█';
                } else {
                    const offset = (imgY * width + imgX) * 4;
                    const r = imageData.data[offset];
                    const g = imageData.data[offset + 1];
                    const b = imageData.data[offset + 2];
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const charIndex = Math.floor((1 - brightness) * (this.asciiChars.length - 1));
                    line += this.asciiChars[charIndex];
                }
            }
            ascii += line + '\n';
        }
        return ascii;
    }

    isPositionInText(x, y) {
        const isMobile = window.innerWidth <= 768;
        const totalHeight = (this.textLineHeight * 3) + (this.textLineSpacing * 2);
        
        // Center text vertically
        const verticalPos = 0.5;
        const textStartY = Math.floor(this.viewportRows * verticalPos - totalHeight / 2);
        
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

    isPixelInLetter(letter, x, y, w, h) {
        const pattern = window.LETTER_PATTERNS[letter.toUpperCase()];
        return pattern ? pattern(x, y, w, h) : false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCIIArtGenerator();
});