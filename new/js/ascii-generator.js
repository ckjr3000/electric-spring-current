// ASCII generator Class - Simple Random Fill with Block Letters
class ASCIIArtGenerator {
    constructor() {
        this.asciiOutput = document.getElementById('ascii-output');
        this.asciiChars = '@#+=:.'; // ASCII characters for background
        
        this.updateViewportDimensions();

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        this.asciiOutput.addEventListener('click', () => {
            this.handleResize();
        });

        this.generateASCII();
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateViewportDimensions();
            this.generateASCII();
        }, 100);
    }

    updateViewportDimensions() {
        const computedStyle = window.getComputedStyle(this.asciiOutput);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize;
        
        // Measure actual character dimensions
        const measureElement = document.createElement('span');
        measureElement.style.font = computedStyle.font;
        measureElement.style.fontSize = computedStyle.fontSize;
        measureElement.style.fontFamily = computedStyle.fontFamily;
        measureElement.style.visibility = 'hidden';
        measureElement.style.position = 'absolute';
        measureElement.style.whiteSpace = 'pre';
        measureElement.textContent = '█';
        document.body.appendChild(measureElement);
        
        const rect = measureElement.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;
        
        document.body.removeChild(measureElement);
        
        this.cols = Math.floor(window.innerWidth / this.charWidth);
        this.rows = Math.floor(window.innerHeight / this.charHeight);
        
        // Letter sizing
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            this.charsPerLetter = 10; // Width of each letter
            this.letterSpacing = 2;   // Space between letters
            this.linesPerLetter = 8;
            this.lineSpacing = 3;     // Space between words (ELECTRIC, SPRING, FESTIVAL)
        } else {
            this.charsPerLetter = 13; // Width of each letter
            this.letterSpacing = 3;   // Space between letters
            this.linesPerLetter = 15;
            this.lineSpacing = 4;     // Space between words
        }
    }

    generateASCII() {
        const title = [
            'ELECTRIC',
            'SPRING',
            'FESTIVAL'
        ];
        
        // Calculate total title height
        const totalTitleHeight = (this.linesPerLetter * title.length) + (this.lineSpacing * (title.length - 1));
        const titleStartRow = Math.floor((this.rows - totalTitleHeight) / 2);
        
        let output = '';
        
        for (let row = 0; row < this.rows; row++) {
            let line = '';
            
            for (let col = 0; col < this.cols; col++) {
                let char = this.getRandomChar();
                
                // Check if we're in any title line
                for (let i = 0; i < title.length; i++) {
                    const lineStartRow = titleStartRow + (i * (this.linesPerLetter + this.lineSpacing));
                    const lineEndRow = lineStartRow + this.linesPerLetter;
                    
                    if (row >= lineStartRow && row < lineEndRow) {
                        const titleText = title[i];
                        // Calculate width including spacing between letters
                        const titleWidth = (titleText.length * this.charsPerLetter) + ((titleText.length - 1) * this.letterSpacing);
                        const titleStartCol = Math.floor((this.cols - titleWidth) / 2);
                        
                        if (col >= titleStartCol && col < titleStartCol + titleWidth) {
                            // Calculate which letter and position within that letter
                            const posInTitle = col - titleStartCol;
                            const letterWithSpacing = this.charsPerLetter + this.letterSpacing;
                            const charIndex = Math.floor(posInTitle / letterWithSpacing);
                            const posInLetter = posInTitle % letterWithSpacing;
                            
                            // Only render if we're within the letter area (not in spacing)
                            if (charIndex < titleText.length && posInLetter < this.charsPerLetter) {
                                const relativeX = posInLetter;
                                const relativeY = row - lineStartRow;
                                
                                if (this.isPixelInLetter(titleText[charIndex], relativeX, relativeY, this.charsPerLetter, this.linesPerLetter)) {
                                    char = '█';
                                }
                            }
                        }
                    }
                }
                
                line += char;
            }
            
            output += line + '\n';
        }
        
        this.asciiOutput.textContent = output;
    }

    isPixelInLetter(letter, x, y, w, h) {
        const pattern = window.LETTER_PATTERNS[letter.toUpperCase()];
        return pattern ? pattern(x, y, w, h) : false;
    }

    getRandomChar() {
        return this.asciiChars[Math.floor(Math.random() * this.asciiChars.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ASCIIArtGenerator();
});