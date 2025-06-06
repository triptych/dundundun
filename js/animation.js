// Animation System - Movement animations and easing functions
const Animation = {
    // Movement animation state
    movementAnimation: {
        isAnimating: false,
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        duration: 300, // Animation duration in milliseconds
        elapsed: 0,
        easing: 'easeOutQuart' // Animation easing function
    },

    /**
     * Update movement animation
     * @param {number} deltaTime - Time since last frame
     */
    updateMovementAnimation(deltaTime) {
        if (!this.movementAnimation.isAnimating) return;

        this.movementAnimation.elapsed += deltaTime;
        const progress = Math.min(this.movementAnimation.elapsed / this.movementAnimation.duration, 1);

        // Apply easing function
        const easedProgress = this.applyEasing(progress, this.movementAnimation.easing);

        // Interpolate between start and end positions
        this.movementAnimation.currentPosition.x = this.lerp(
            this.movementAnimation.startPosition.x,
            this.movementAnimation.endPosition.x,
            easedProgress
        );
        this.movementAnimation.currentPosition.y = this.lerp(
            this.movementAnimation.startPosition.y,
            this.movementAnimation.endPosition.y,
            easedProgress
        );

        // Check if animation is complete
        if (progress >= 1) {
            this.completeMovementAnimation();
        }
    },

    /**
     * Start a movement animation
     * @param {number} fromX - Starting X position
     * @param {number} fromY - Starting Y position
     * @param {number} toX - Target X position
     * @param {number} toY - Target Y position
     * @param {Function} onComplete - Optional callback when animation completes
     */
    startMovementAnimation(fromX, fromY, toX, toY, onComplete = null) {
        this.movementAnimation.isAnimating = true;
        this.movementAnimation.startPosition = { x: fromX, y: fromY };
        this.movementAnimation.endPosition = { x: toX, y: toY };
        this.movementAnimation.currentPosition = { x: fromX, y: fromY };
        this.movementAnimation.elapsed = 0;
        this.movementAnimation.onComplete = onComplete;

        console.log(`Starting movement animation from (${fromX}, ${fromY}) to (${toX}, ${toY})`);
    },

    /**
     * Complete the movement animation
     */
    completeMovementAnimation() {
        this.movementAnimation.isAnimating = false;
        this.movementAnimation.currentPosition = { ...this.movementAnimation.endPosition };

        console.log('Movement animation completed');

        // Call completion callback if provided
        if (this.movementAnimation.onComplete) {
            this.movementAnimation.onComplete();
            this.movementAnimation.onComplete = null;
        }
    },

    /**
     * Stop any active animations
     */
    stopAnimations() {
        if (this.movementAnimation.isAnimating) {
            this.movementAnimation.isAnimating = false;
            this.movementAnimation.currentPosition = { ...this.movementAnimation.endPosition };
        }
    },

    /**
     * Check if any animations are currently active
     * @returns {boolean} True if animations are active
     */
    isAnimating() {
        return this.movementAnimation.isAnimating;
    },

    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} progress - Progress (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, progress) {
        return start + (end - start) * progress;
    },

    /**
     * Apply easing function to progress
     * @param {number} progress - Linear progress (0-1)
     * @param {string} easingType - Type of easing to apply
     * @returns {number} Eased progress (0-1)
     */
    applyEasing(progress, easingType) {
        switch (easingType) {
            case 'linear':
                return progress;
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return 1 - (1 - progress) * (1 - progress);
            case 'easeInOutQuad':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case 'easeOutQuart':
                return 1 - Math.pow(1 - progress, 4);
            case 'easeInOutCubic':
                return progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            case 'easeOutBack':
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
            case 'easeInBounce':
                return 1 - this.applyEasing(1 - progress, 'easeOutBounce');
            case 'easeOutBounce':
                const n1 = 7.5625;
                const d1 = 2.75;
                if (progress < 1 / d1) {
                    return n1 * progress * progress;
                } else if (progress < 2 / d1) {
                    return n1 * (progress -= 1.5 / d1) * progress + 0.75;
                } else if (progress < 2.5 / d1) {
                    return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
                } else {
                    return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
                }
            case 'easeInElastic':
                const c4 = (2 * Math.PI) / 3;
                return progress === 0
                    ? 0
                    : progress === 1
                    ? 1
                    : -Math.pow(2, 10 * progress - 10) * Math.sin((progress * 10 - 10.75) * c4);
            case 'easeOutElastic':
                const c5 = (2 * Math.PI) / 3;
                return progress === 0
                    ? 0
                    : progress === 1
                    ? 1
                    : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c5) + 1;
            default:
                return progress; // Default to linear
        }
    },

    /**
     * Set animation duration
     * @param {number} duration - Duration in milliseconds
     */
    setAnimationDuration(duration) {
        this.movementAnimation.duration = Math.max(100, duration); // Minimum 100ms
    },

    /**
     * Set animation easing type
     * @param {string} easingType - Type of easing to use
     */
    setEasingType(easingType) {
        this.movementAnimation.easing = easingType;
    },

    /**
     * Get current animation progress (0-1)
     * @returns {number} Animation progress
     */
    getAnimationProgress() {
        if (!this.movementAnimation.isAnimating) return 0;
        return Math.min(this.movementAnimation.elapsed / this.movementAnimation.duration, 1);
    },

    /**
     * Get current animation position
     * @returns {Object} Current position {x, y}
     */
    getCurrentPosition() {
        return { ...this.movementAnimation.currentPosition };
    },

    /**
     * Update all animations
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        this.updateMovementAnimation(deltaTime);
    }
};

// Export for ES6 modules
export default Animation;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.Animation = Animation;
}
