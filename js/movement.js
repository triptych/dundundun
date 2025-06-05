// Movement System - Player movement handling and validation
const Movement = {
    /**
     * Handle movement input with enhanced room connectivity validation
     * @param {Object} data - Movement data containing direction
     * @param {Object} animationSystem - Reference to animation system
     * @param {Function} onMoveComplete - Callback when movement animation completes
     */
    handleMovement(data, animationSystem, onMoveComplete = null) {
        const { direction } = data;
        console.log(`Movement.handleMovement called with direction: ${direction}`);

        // Don't process movement if transitioning between levels
        if (GameState.current && GameState.current.isTransitioningLevel) {
            console.log('Movement blocked: level transition in progress');
            return false;
        }

        // Don't process movement if in combat
        if (GameState.combat.isActive) {
            console.log('Movement blocked: combat is active');
            return false;
        }

        // Don't process movement if already animating
        if (animationSystem && animationSystem.isAnimating()) {
            console.log('Movement blocked: animation in progress');
            return false;
        }

        // Don't process movement if no dungeon grid exists
        if (!GameState.dungeon.grid) {
            console.warn('No dungeon grid available for movement');
            return false;
        }

        console.log(`Player attempts to move ${direction}`);

        // Get current position from dungeon state
        const currentX = GameState.dungeon.playerPosition.x;
        const currentY = GameState.dungeon.playerPosition.y;

        // Calculate new position based on direction
        const newPosition = this.calculateNewPosition(currentX, currentY, direction);
        if (!newPosition) {
            console.warn(`Unknown movement direction: ${direction}`);
            return false;
        }

        const { newX, newY } = newPosition;

        // Check if move is valid before starting animation
        if (!this.canMoveTo(currentX, currentY, newX, newY)) {
            console.log(`Movement to (${newX}, ${newY}) blocked - no connection or invalid room`);
            this.showMovementBlockedFeedback();
            return false;
        }

        // Update game state immediately (for logic purposes)
        const moveSuccess = GameState.movePlayer(newX, newY);

        if (moveSuccess && animationSystem) {
            console.log(`Player moved to (${newX}, ${newY}) - starting animation`);

            // Start smooth movement animation with completion callback
            animationSystem.startMovementAnimation(currentX, currentY, newX, newY, () => {
                if (onMoveComplete) {
                    onMoveComplete();
                }
            });

            return true;
        }

        return moveSuccess;
    },

    /**
     * Calculate new position based on movement direction
     * @param {number} currentX - Current X position
     * @param {number} currentY - Current Y position
     * @param {string} direction - Movement direction
     * @returns {Object|null} New position {newX, newY} or null if invalid direction
     */
    calculateNewPosition(currentX, currentY, direction) {
        let newX = currentX;
        let newY = currentY;

        switch (direction.toLowerCase()) {
            case 'up':
            case 'north':
                newY = currentY - 1;
                break;
            case 'down':
            case 'south':
                newY = currentY + 1;
                break;
            case 'left':
            case 'west':
                newX = currentX - 1;
                break;
            case 'right':
            case 'east':
                newX = currentX + 1;
                break;
            default:
                return null;
        }

        return { newX, newY };
    },

    /**
     * Check if player can move to target position
     * @param {number} fromX - Current X position
     * @param {number} fromY - Current Y position
     * @param {number} toX - Target X position
     * @param {number} toY - Target Y position
     * @returns {boolean} True if movement is valid
     */
    canMoveTo(fromX, fromY, toX, toY) {
        if (!GameState.dungeon.grid) {
            return false;
        }

        // Check if target position is within grid bounds
        if (!this.isWithinBounds(toX, toY)) {
            return false;
        }

        // Check if rooms are connected
        return GameState.dungeon.grid.canMoveTo(fromX, fromY, toX, toY);
    },

    /**
     * Check if position is within dungeon grid bounds
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} True if within bounds
     */
    isWithinBounds(x, y) {
        if (!GameState.dungeon.grid) {
            return false;
        }

        const gridSize = GameState.dungeon.grid.size || { width: 5, height: 5 };
        return x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height;
    },

    /**
     * Show feedback when movement is blocked
     */
    showMovementBlockedFeedback() {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Cannot move in that direction', 1000, 'info');
        }
    },

    /**
     * Get valid movement directions from current position
     * @param {number} x - Current X position
     * @param {number} y - Current Y position
     * @returns {Array} Array of valid directions
     */
    getValidDirections(x, y) {
        const validDirections = [];
        const directions = [
            { dir: 'north', dx: 0, dy: -1 },
            { dir: 'south', dx: 0, dy: 1 },
            { dir: 'west', dx: -1, dy: 0 },
            { dir: 'east', dx: 1, dy: 0 }
        ];

        for (const direction of directions) {
            const newX = x + direction.dx;
            const newY = y + direction.dy;

            if (this.canMoveTo(x, y, newX, newY)) {
                validDirections.push(direction.dir);
            }
        }

        return validDirections;
    },

    /**
     * Get movement direction from key code
     * @param {string} keyCode - Key code from keyboard event
     * @returns {string|null} Movement direction or null
     */
    getDirectionFromKey(keyCode) {
        const keyMappings = {
            'ArrowUp': 'north',
            'ArrowDown': 'south',
            'ArrowLeft': 'west',
            'ArrowRight': 'east',
            'KeyW': 'north',
            'KeyS': 'south',
            'KeyA': 'west',
            'KeyD': 'east'
        };

        return keyMappings[keyCode] || null;
    },

    /**
     * Handle keyboard movement input
     * @param {KeyboardEvent} event - Keyboard event
     * @param {Object} animationSystem - Reference to animation system
     * @param {Function} onMoveComplete - Callback when movement completes
     * @returns {boolean} True if movement was processed
     */
    handleKeyboardMovement(event, animationSystem, onMoveComplete = null) {
        const direction = this.getDirectionFromKey(event.code);

        if (direction) {
            event.preventDefault();
            return this.handleMovement({ direction }, animationSystem, onMoveComplete);
        }

        return false;
    },

    /**
     * Handle touch/mouse movement input
     * @param {number} startX - Touch/click start X
     * @param {number} startY - Touch/click start Y
     * @param {number} endX - Touch/click end X
     * @param {number} endY - Touch/click end Y
     * @param {Object} animationSystem - Reference to animation system
     * @param {Function} onMoveComplete - Callback when movement completes
     * @returns {boolean} True if movement was processed
     */
    handleSwipeMovement(startX, startY, endX, endY, animationSystem, onMoveComplete = null) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30; // Minimum distance for swipe recognition

        // Check if swipe distance meets minimum threshold
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return false;
        }

        // Determine primary direction
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            direction = deltaX > 0 ? 'east' : 'west';
        } else {
            // Vertical swipe
            direction = deltaY > 0 ? 'south' : 'north';
        }

        return this.handleMovement({ direction }, animationSystem, onMoveComplete);
    },

    /**
     * Set up movement event listeners
     * @param {Object} animationSystem - Reference to animation system
     * @param {Function} onMoveComplete - Callback when movement completes
     */
    setupMovementListeners(animationSystem, onMoveComplete = null) {
        // Keyboard movement
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardMovement(event, animationSystem, onMoveComplete);
        });

        // Touch movement for mobile devices
        let touchStart = null;

        document.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStart = { x: touch.clientX, y: touch.clientY };
        });

        document.addEventListener('touchend', (event) => {
            if (!touchStart) return;

            const touch = event.changedTouches[0];
            const touchEnd = { x: touch.clientX, y: touch.clientY };

            this.handleSwipeMovement(
                touchStart.x, touchStart.y,
                touchEnd.x, touchEnd.y,
                animationSystem, onMoveComplete
            );

            touchStart = null;
        });

        console.log('Movement event listeners set up');
    },

    /**
     * Remove movement event listeners
     */
    removeMovementListeners() {
        // Note: In a full implementation, you'd store references to the event handlers
        // and remove them specifically. For now, this is a placeholder.
        console.log('Movement event listeners would be removed here');
    }
};

// Export for ES6 modules
export default Movement;
