// Dun Dun Dungeon - Utility Functions
// Common utility functions used throughout the game

/**
 * Utility object containing common helper functions
 */
const Utils = {
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate a random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random float
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Choose a random element from an array
     * @param {Array} array - Array to choose from
     * @returns {*} Random element
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Check if two rectangles overlap
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if rectangles overlap
     */
    rectanglesOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Format a number as a string with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Capitalize the first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Generate a unique ID string
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== "object") return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === "object") {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
    },

    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle a function call
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if device supports touch
     * @returns {boolean} True if touch is supported
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Get viewport dimensions
     * @returns {Object} Viewport dimensions {width, height}
     */
    getViewportSize() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    },

    /**
     * Check if element is visible in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if element is visible
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const viewport = this.getViewportSize();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= viewport.height &&
            rect.right <= viewport.width
        );
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} element - Element or selector to scroll to
     * @param {number} duration - Animation duration in milliseconds
     */
    smoothScrollTo(element, duration = 500) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        const targetPosition = target.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation.bind(this));
    },

    /**
     * Easing function for smooth animations
     * @param {number} t - Current time
     * @param {number} b - Start value
     * @param {number} c - Change in value
     * @param {number} d - Duration
     * @returns {number} Eased value
     */
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
};

// Export for ES6 modules
export default Utils;
