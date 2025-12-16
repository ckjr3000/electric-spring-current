class ASCIIArtGenerator {

    constructor() {
        this.asciiOutput = document.getElementById('ascii-output');
        this.asciiChars = '@#+=:. '; // ASCII characters from darkest to lightest
        this.artists = [   // Available artists
            'alb',
            'monna',
            'tree'
        ];
        this.negativeText = [ // Text to appear in negative
            'ELECTRIC',
            'SPRING',
            'FESTIVAL'
        ];
        this.charWidth = 7;  // pixels per character
        this.charHeight = 7; // pixels per character 
        window.addEventListener('resize', () => { // Add resize
            this.handleResize();
        });
        this.init();
    }

    async init() {
        await this.generateBlendedASCII();
    }

    handleResize() { // Debounce resize to avoid too many calls
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.generateBlendedASCII();
        }, 100);
    }

    async generateBlendedASCII() {
        try {
            // wait for Promises to complete and returns images
            const imagePromises = this.artists.map(artistId => this.loadImage(`artists/images/${artistId}.jpg`));
            const images = await Promise.allSettled(imagePromises);
            const loadedImages = images .filter(result => result.status === 'fulfilled').map(result => result.value);
        
            if (loadedImages.length === 0) {
                this.applyRandomGradient();
                this.displayError();
                return;
            }
        
            const shuffled = [...loadedImages].sort(() => Math.random() - 0.5); // select 2 random images to blend
            const selectedImages = shuffled.slice(0, Math.min(2, shuffled.length));
            const asciiDimensions = this.calculateASCIIDimensions(); // Calculate ASCII dimensions to fill viewport
            const imageData = await this.blendImagesAbstract(selectedImages, asciiDimensions); // Blend the 2 selected images
            const colors = this.extractColorsFromImageData(imageData);  // Extract colors for background
            this.applyBackgroundGradient(colors);
            const asciiArt = this.imageDataToASCII(imageData); // Convert blended image to ASCII with negative text
            this.displayASCII(asciiArt);    // Display result
            this.positionDateOverlay();     // Position the floating date overlay
        
            } catch (error) {
                console.error('Error generating ASCII:', error);
                this.applyRandomGradient();
                this.displayError();
            }
    }

    calculateASCIIDimensions() { // Calculate how many characters fit in viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const cols = Math.floor(viewportWidth / this.charWidth);
        const rows = Math.floor(viewportHeight / this.charHeight);
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

    async imageToCanvas(img, dimensions) {
        const canvas = document.createElement('canvas'); // Create canvas
        const ctx = canvas.getContext('2d');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height); // Draw image scaled to fit canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = 5; // Contrast multiplier
        const factor = (259 * (contrast + 1)) / (259 - contrast);
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // R
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // G
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // B
        }
        ctx.putImageData(imageData, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height); // Get the adjusted image data
    }

    positionDateOverlay() { // Create or get the date overlay div
        let dateDiv = document.getElementById('date-overlay');
        if (!dateDiv) {
            dateDiv = document.createElement('div');
            dateDiv.id = 'date-overlay';
           dateDiv.innerHTML = '<div>18-21 February 2026</div><div>Huddersfield</div>';
            document.body.appendChild(dateDiv);
        }
        
        const randomX = Math.random() * 80 + 10; // 10% to 90% of width
        const randomY = Math.random() * 80 + 10; // 10% to 90% of height
        dateDiv.style.left = randomX + '%';
        dateDiv.style.top = randomY + '%';
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
    
        images.forEach((img, index) => { // Blend images with subtle transformations
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = dimensions.width;
            tempCanvas.height = dimensions.height;
      
            // SUBTLE transformations - keep images very recognizable
            const scale = 0.95 + Math.random() * 0.15; // 0.95 to 1.1 - minimal variation
            const offsetX = (Math.random() - 0.5) * dimensions.width * 0.15; // ±15% offset
            const offsetY = (Math.random() - 0.5) * dimensions.height * 0.15;
            const rotation = (Math.random() - 0.5) * 0.2; // ±6 degrees
      
            tempCtx.save(); // Apply transformations
            tempCtx.translate(dimensions.width / 2, dimensions.height / 2);
            tempCtx.rotate(rotation);
            tempCtx.scale(scale, scale);
            tempCtx.translate(-dimensions.width / 2 + offsetX, -dimensions.height / 2 + offsetY);
            tempCtx.drawImage(img, 0, 0, dimensions.width, dimensions.height); // Draw image
            tempCtx.restore();
      
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'normal';
            ctx.drawImage(tempCanvas, 0, 0);
        });
    
        ctx.globalAlpha = 1; // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
        return ctx.getImageData(0, 0, canvas.width, canvas.height); // Get the final blended image data
    } 

    imageDataToASCII(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        let ascii = '';

        const computedStyle = window.getComputedStyle(this.asciiOutput);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize;
        const charWidth = fontSize * 0.6; // Approximate character width (monospace is typically 0.6 of font size)
    
        // Calculate columns and rows needed - add extra to guarantee coverage
        const viewportCols = Math.ceil(window.innerWidth / charWidth) + 20;
        const viewportRows = Math.ceil(window.innerHeight / lineHeight) + 30; // Extra rows
    
        for (let y = 0; y < viewportRows; y++) {
            let line = '';
            let lastChar = ' ';
      
            for (let x = 0; x < viewportCols; x++) {
                // Use modulo to repeat the image if we go beyond its bounds
                const imgY = y % height;
                const imgX = x % width;
            
                if (imgY < height && imgX < width) {
                    const offset = (imgY * width + imgX) * 4;
                    const r = imageData.data[offset];
                    const g = imageData.data[offset + 1];
                    const b = imageData.data[offset + 2];
            
                    // Check if this position should be text - pass viewport dimensions
                    const isText = this.isPositionInText(x, y, viewportCols, viewportRows);
            
                    if (isText) {
                        // Show SOLID BLACK character for text (make it visible)
                        lastChar = '█';
                        line += lastChar;
                    } else {
                        // Convert RGB to grayscale (luminance) for background
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                
                        // Map brightness to ASCII character
                        const charIndex = Math.floor((1 - brightness) * (this.asciiChars.length - 1));
                        lastChar = this.asciiChars[charIndex];
                        line += lastChar;
                    }
                } else {
                    line += lastChar; // Fallback - repeat last character
                }
            }
            ascii += line + '\n';
        }
        return ascii;
    }
  
    isPositionInText(x, y, viewportCols, viewportRows) {
        // Direct viewport percentage - text takes significant portion of screen
        const screenHeight = viewportRows;
        const screenWidth = viewportCols;
    
        // Smaller text - reduced from 8% to 6% of screen height
        const textLineHeight = Math.max(15, Math.floor(screenHeight * 0.06)); // Each line is 6% of screen height
        const lineSpacing = Math.floor(textLineHeight * 0.5);
        const charWidth = Math.floor(textLineHeight * 0.7);
        const charSpacing = Math.floor(charWidth * 0.25);
        
        const totalHeight = (textLineHeight * 3) + (lineSpacing * 2);
        // Position higher - at 35% from top instead of centered (50%)
        const textStartY = Math.floor(screenHeight * 0.35 - totalHeight / 2);
        
        for (let i = 0; i < this.negativeText.length; i++) {
            const lineY = textStartY + i * (textLineHeight + lineSpacing);
            
            if (y >= lineY && y < lineY + textLineHeight) {
                const text = this.negativeText[i];
                const textWidth = text.length * (charWidth + charSpacing);
                const textStartX = Math.floor(screenWidth / 2 - textWidth / 2);
                
                const charIndex = Math.floor((x - textStartX) / (charWidth + charSpacing));
                if (charIndex >= 0 && charIndex < text.length) {
                    const letter = text[charIndex];
                    const relativeX = (x - textStartX) % (charWidth + charSpacing);
                    const relativeY = y - lineY;
                
                    if (relativeX < charWidth && this.isPixelInLetter(letter, relativeX, relativeY, charWidth, textLineHeight)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isPixelInLetter(letter, x, y, w, h) {
        // Create simple block letter patterns
        const patterns = {
            'E': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || y > h*0.85 || (y >= h*0.45 && y <= h*0.55 && x < w*0.7);
            },
            'L': (x, y, w, h) => {
                return x < w*0.2 || y > h*0.85;
            },
            'C': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || y > h*0.85;
            },
            'T': (x, y, w, h) => {
                return y < h*0.15 || (x >= w*0.45 && x <= w*0.55);
            },
            'R': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || (y >= h*0.45 && y <= h*0.55) || 
                    (y < h*0.5 && x > w*0.7) || (y >= h*0.5 && x > w*0.7 && (x-y+h*0.5) > w*0.5);
            },
            'I': (x, y, w, h) => {
                return y < h*0.15 || y > h*0.85 || (x >= w*0.45 && x <= w*0.55);
            },
            'S': (x, y, w, h) => {
                return y < h*0.15 || y > h*0.85 || (y >= h*0.45 && y <= h*0.55) ||
                    (y < h*0.5 && x < w*0.2) || (y > h*0.5 && x > w*0.7);
            },
            'P': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || (y >= h*0.45 && y <= h*0.55 && x < w*0.7) ||
                    (y < h*0.5 && x > w*0.7);
            },
            'N': (x, y, w, h) => {
                return x < w*0.2 || x > w*0.7 || (x-y > -h*0.1 && x-y < h*0.1);
            },
            'G': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || y > h*0.85 || 
                    (y >= h*0.5 && x > w*0.5 && x > w*0.7);
            },
            'F': (x, y, w, h) => {
                return x < w*0.2 || y < h*0.15 || (y >= h*0.45 && y <= h*0.55 && x < w*0.65);
            },
            'A': (x, y, w, h) => {
                return x < w*0.2 || x > w*0.7 || y < h*0.15 || (y >= h*0.45 && y <= h*0.55);
            },
            'V': (x, y, w, h) => {
                return (y < h*0.7 && (x < w*0.2 || x > w*0.7)) || 
                    (y >= h*0.7 && x >= w*0.45 && x <= w*0.55);
            },
            ' ': (x, y, w, h) => {
                return false; // Empty space
            }
        };
        
        const pattern = patterns[letter];
        return pattern ? pattern(x, y, w, h) : false;
    }

    extractColorsFromImageData(imageData) {
        const colors = [];
        const samplePoints = [
            { x: 0.2, y: 0.2 },
            { x: 0.8, y: 0.2 },
            { x: 0.5, y: 0.5 },
            { x: 0.2, y: 0.8 },
            { x: 0.8, y: 0.8 }
        ];
    
        samplePoints.forEach(point => {
            const x = Math.floor(imageData.width * point.x);
            const y = Math.floor(imageData.height * point.y);
            const offset = (y * imageData.width + x) * 4;
      
            colors.push({
                r: imageData.data[offset],
                g: imageData.data[offset + 1],
                b: imageData.data[offset + 2]
            });
        });
        return colors;
    }

    applyBackgroundGradient(colors) {

        const color1 = { r: 255, g: 255, b: 0 };
        const color2 = { r: 255, g: 255, b: 0 };
        // const color2 = colors[colors.length - 1]; // Sample color from the image
    
        const gradient = `linear-gradient(135deg, 
            rgb(${color1.r}, ${color1.g}, ${color1.b}) 0%, 
            rgb(${color2.r}, ${color2.g}, ${color2.b}) 100%)`;
    
        document.body.style.background = gradient;
    }

    applyRandomGradient() {
        const color1 = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
        const color2 = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
    
        this.applyBackgroundGradient([color1, color2]);
    }

    displayASCII(asciiArt) {
        this.asciiOutput.textContent = asciiArt;
    }

    displayError() {
        this.asciiOutput.textContent = ` ERROR`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCIIArtGenerator();
});