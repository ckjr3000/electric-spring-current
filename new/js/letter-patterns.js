// Block letter patterns for ASCII text overlay
// Each pattern is a function that returns true if pixel (x,y) should be filled
const LETTER_PATTERNS = {
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
        const strokeWidth = w * 0.18;
        if (x < strokeWidth) return true;
        if (y < h * 0.18) return true;
        if (y >= h * 0.44 && y <= h * 0.56) return true;
        if (y < h * 0.5 && x >= w * 0.72 && x <= w * 0.88) return true;
        if (y >= h * 0.5) {
            const legStartX = w * 0.35;
            const legEndX = w * 0.82;
            const legY = h * 0.5;
            const diagCenterX = legStartX + ((y - legY) / (h - legY)) * (legEndX - legStartX);
            const diagWidth = strokeWidth * 1.2;
            if (x >= diagCenterX - diagWidth/2 && x <= diagCenterX + diagWidth/2) {
                return true;
            }
        }
        return false;
    },
    'I': (x, y, w, h) => {
        return y < h*0.15 || y > h*0.85 || (x >= w*0.45 && x <= w*0.55);
    },
    'S': (x, y, w, h) => {
        return y < h*0.15 || y > h*0.85 || (y >= h*0.45 && y <= h*0.55) ||
               (y < h*0.5 && x < w*0.2) || (y > h*0.5 && x > w*0.7);
    },
    'P': (x, y, w, h) => {
        return x < w*0.2 || y < h*0.15 || (y >= h*0.45 && y <= h*0.55) ||
               (y < h*0.55 && x > w*0.7 && x < w*0.85);
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
        const centerX = w * 0.5;
        const strokeWidth = w * 0.18;
        if (x < centerX) {
            const leftOuter = w * 0.1 + (y / h) * (centerX - w * 0.1);
            const leftInner = leftOuter + strokeWidth;
            if (x >= leftOuter && x <= leftInner) return true;
        }
        if (x >= centerX) {
            const rightOuter = w * 0.9 - (y / h) * (w * 0.9 - centerX);
            const rightInner = rightOuter - strokeWidth;
            if (x >= rightInner && x <= rightOuter) return true;
        }
        return false;
    },
    'B': (x, y, w, h) => {
        return x < w*0.2 || y < h*0.15 || y > h*0.85 || (y >= h*0.45 && y <= h*0.55) ||
               (y < h*0.5 && x > w*0.7) || (y > h*0.5 && x > w*0.7);
    },
    'U': (x, y, w, h) => {
        return x < w*0.2 || x > w*0.7 || y > h*0.85;
    },
    'H': (x, y, w, h) => {
        return x < w*0.2 || x > w*0.7 || (y >= h*0.45 && y <= h*0.55);
    },
    'D': (x, y, w, h) => {
        return x < w*0.2 || y < h*0.15 || y > h*0.85 || 
               (x > w*0.7 && y >= h*0.15 && y <= h*0.85);
    },
    'Y': (x, y, w, h) => {
        return (y < h*0.5 && (x < w*0.2 || x > w*0.7)) || 
               (y >= h*0.5 && x >= w*0.45 && x <= w*0.55);
    },
    '1': (x, y, w, h) => {
        return (x >= w*0.4 && x <= w*0.5) || y > h*0.85 || 
               (y < h*0.3 && x >= w*0.2 && x <= w*0.4);
    },
    '8': (x, y, w, h) => {
        return x < w*0.2 || x > w*0.7 || y < h*0.15 || y > h*0.85 || 
               (y >= h*0.45 && y <= h*0.55);
    },
    '2': (x, y, w, h) => {
        return y < h*0.15 || (y >= h*0.45 && y <= h*0.55) || y > h*0.85 ||
               (y < h*0.5 && x > w*0.7) || (y > h*0.5 && x < w*0.2);
    },
    '0': (x, y, w, h) => {
        return x < w*0.2 || x > w*0.7 || y < h*0.15 || y > h*0.85;
    },
    '6': (x, y, w, h) => {
        return x < w*0.2 || y < h*0.15 || y > h*0.85 || (y >= h*0.45 && y <= h*0.55) ||
               (y > h*0.5 && x > w*0.7);
    },
    '-': (x, y, w, h) => {
        return y >= h*0.45 && y <= h*0.55;
    },
    ' ': (x, y, w, h) => {
        return false;
    }
};

window.LETTER_PATTERNS = LETTER_PATTERNS;