// Pocket Dungeon - Main Game Controller
// Entry point and main game loop management


/**
 * Main game controller that orchestrates all game systems
 */
const Game = {
    // Game initialization state
    isInitialized: false,
    isRunning: false,

    // Game loop timing
    lastFrameTime: 0,
    deltaTime: 0,
    targetFPS: 60,
    frameInterval: 1000 / 60,

    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing Pocket Dungeon...');

        try {
            // Initialize canvas using Rendering module
            this.initCanvas();

            // Initialize all game systems
            await this.initSystems();

            // Set up movement listeners
            this.setupMovementListeners();

            // Set up the game loop
            this.setupGameLoop();

            // Mark as initialized
            this.isInitialized = true;

            console.log('Game initialization complete!');

            // Hide loading screen and show game
            if (typeof UI !== 'undefined') {
                UI.hideLoadingScreen();
            }

            // Check for saved game
            this.checkSavedGame();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleInitError(error);
        }
    },

    /**
     * Initialize canvas using the Rendering module
     */
    initCanvas() {
        if (typeof Rendering !== 'undefined') {
            Rendering.initCanvas();
            // Store references for compatibility
            this.canvas = Rendering.canvas;
            this.ctx = Rendering.ctx;
            this.viewport = Rendering.viewport;
        } else {
            throw new Error('Rendering module not available');
        }
    },

    /**
     * Initialize all game systems
     */
    async initSystems() {
        console.log('Initializing game systems...');

        // Initialize game state first
        if (typeof GameState !== 'undefined') {
            GameState.init();
        }

        // Initialize UI system
        if (typeof UI !== 'undefined') {
            UI.init();
        }

        if (typeof CharacterProgression !== 'undefined') {
            CharacterProgression.init();
        }

        // Set up event listeners between systems
        this.setupSystemEvents();

        console.log('Game systems initialized');
    },

    /**
     * Set up event listeners between game systems
     */
    setupSystemEvents() {
        if (typeof GameState === 'undefined') return;

        // Listen for movement commands from UI
        GameState.on('movement', (data) => this.handleMovement(data));

        // Listen for combat actions from UI
        GameState.on('combatAction', (data) => {
            console.log('Game received combatAction event:', data);
            this.handleCombatAction(data);
        });

        // Listen for inventory actions from UI
        GameState.on('inventoryAction', (data) => this.handleInventoryAction(data));

        // Listen for state changes to update game logic
        GameState.on('stateChange', (data) => this.handleStateChange(data));
    },

    /**
     * Set up movement listeners using Movement module
     */
    setupMovementListeners() {
        if (typeof Movement !== 'undefined' && typeof Animation !== 'undefined') {
            Movement.setupMovementListeners(Animation, () => {
                this.handleRoomEvents();
            });
        }
    },

    /**
     * Set up the main game loop
     */
    setupGameLoop() {
        const gameLoop = (currentTime) => {
            // Calculate delta time
            this.deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            // Update and render if game is running
            if (this.isRunning && !GameState.current.isPaused) {
                this.update(this.deltaTime);
                this.render();
            }

            // Continue the loop
            requestAnimationFrame(gameLoop);
        };

        // Start the game loop
        requestAnimationFrame(gameLoop);
        console.log('Game loop started');
    },

    /**
     * Main game update function
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Update cooldowns using Combat module
        if (typeof Combat !== 'undefined') {
            Combat.updateCooldowns(deltaTime);
        }

        // Update animations using Animation module
        if (typeof Animation !== 'undefined') {
            Animation.update(deltaTime);
        }

        // Handle auto-save using SaveSystem module
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.handleAutoSave(deltaTime);
        }
    },

    /**
     * Main game render function
     */
    render() {
        if (!this.ctx) return;

        // Render current game state
        if (GameState.current.screen === 'game') {
            this.renderDungeon();
        }
    },

    /**
     * Render the dungeon view using Rendering module
     */
    renderDungeon() {
        if (typeof Rendering !== 'undefined' && typeof Animation !== 'undefined') {
            Rendering.renderDungeon(Animation);
        }
    },

    /**
     * Handle viewport changes - delegate to Rendering module
     */
    handleViewportChange() {
        if (typeof Rendering !== 'undefined') {
            Rendering.handleViewportChange();

            // Force a render to update the display
            if (this.isRunning) {
                this.render();
            }
        }
    },

    /**
     * Handle visibility changes for optimization
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Reduce update frequency when tab is hidden
            this.targetFPS = 30;
            this.frameInterval = 1000 / 30;
            console.log('Tab hidden, reducing frame rate');
        } else {
            // Restore normal frame rate when tab is visible
            this.targetFPS = 60;
            this.frameInterval = 1000 / 60;
            console.log('Tab visible, restoring frame rate');

            // Force canvas recalculation in case window was resized while hidden
            setTimeout(() => {
                this.handleViewportChange();
            }, 100);
        }
    },

    /**
     * Get canvas coordinates from screen coordinates (for touch/click handling)
     */
    screenToCanvas(screenX, screenY) {
        if (typeof Rendering !== 'undefined') {
            return Rendering.screenToCanvas(screenX, screenY);
        }
        return { x: 0, y: 0 };
    },

    /**
     * Get screen coordinates from canvas coordinates
     */
    canvasToScreen(canvasX, canvasY) {
        if (typeof Rendering !== 'undefined') {
            return Rendering.canvasToScreen(canvasX, canvasY);
        }
        return { x: 0, y: 0 };
    },

    /**
     * Legacy resize method for backward compatibility
     */
    resizeCanvas() {
        this.handleViewportChange();
    },

    /**
     * Start the game
     */
    start() {
        console.log('Starting game...');
        this.isRunning = true;

        // Start a new game or continue existing
        if (GameState.current.isGameActive) {
            GameState.switchScreen('game');
        } else {
            this.startNewGame();
        }
    },

    /**
     * Start a new game
     */
    startNewGame() {
        console.log('Starting new game...');
        GameState.newGame();
    },

    /**
     * Pause the game
     */
    pause() {
        console.log('Game paused');
        GameState.setPaused(true);
    },

    /**
     * Resume the game
     */
    resume() {
        console.log('Game resumed');
        GameState.setPaused(false);
    },

    /**
     * Handle movement input using Movement module
     * @param {Object} data - Movement data
     */
    handleMovement(data) {
        if (typeof Movement !== 'undefined' && typeof Animation !== 'undefined') {
            Movement.handleMovement(data, Animation, () => {
                this.handleRoomEvents();
            });
        }
    },

    /**
     * Handle room events using Rooms module
     */
    handleRoomEvents() {
        if (typeof Rooms !== 'undefined') {
            Rooms.handleRoomEvents(
                (combatType) => this.triggerCombatFromModule(combatType),
                () => this.advanceToNextFloor()
            );
        }
    },

    /**
     * Trigger combat using Combat module
     * @param {string} combatType - Type of combat ('standard', 'boss', 'random')
     */
    triggerCombatFromModule(combatType) {
        if (typeof Combat !== 'undefined') {
            switch (combatType) {
                case 'boss':
                    Combat.triggerBossCombat();
                    break;
                case 'standard':
                case 'random':
                default:
                    Combat.triggerCombat();
                    break;
            }
        }
    },

    /**
     * Advance to the next floor using Rooms module
     */
    advanceToNextFloor() {
        if (typeof Rooms !== 'undefined') {
            Rooms.advanceToNextFloor();

            // Update render
            if (this.isRunning) {
                this.render();
            }
        }
    },

    /**
     * Handle combat actions using Combat module
     * @param {Object} data - Combat action data
     */
    handleCombatAction(data) {
        if (typeof Combat !== 'undefined') {
            Combat.handleCombatAction(data, (playerWon) => {
                this.onCombatEnd(playerWon);
            });
        }
    },

    /**
     * Handle combat end
     * @param {boolean} playerWon - Whether the player won
     */
    onCombatEnd(playerWon) {
        if (playerWon) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Victory!', 1500);
            }
        } else {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Defeat!', 1500);
            }

            // Handle player death after a delay
            setTimeout(() => {
                this.handlePlayerDeath();
            }, 2000);
        }
    },

    /**
     * Handle player death
     */
    handlePlayerDeath() {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Game Over! Starting new game...', 3000);
        }

        setTimeout(() => {
            this.startNewGame();
        }, 3000);
    },

    /**
     * Handle inventory actions
     * @param {Object} data - Inventory action data
     */
    handleInventoryAction(data) {
        const { type, slotIndex } = data;

        if (type === 'slotClick') {
            console.log(`Inventory slot ${slotIndex} clicked`);
            // Handle item usage, equipping, etc.
        }
    },

    /**
     * Handle game state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        switch (data.type) {
            case 'newGame':
                this.start();
                break;
            case 'levelUp':
                this.handleLevelUp(data.level);
                break;
        }
    },

    /**
     * Handle level up
     * @param {number} level - New player level
     */
    handleLevelUp(level) {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Level Up! You are now level ${level}!`, 3000);
        }
    },

    /**
     * Manually save game using SaveSystem module
     */
    manualSave() {
        if (typeof SaveSystem !== 'undefined') {
            return SaveSystem.manualSave();
        }
        return false;
    },

    /**
     * Check for saved game on startup using SaveSystem module
     */
    checkSavedGame() {
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.checkSavedGame(
                () => this.startNewGame(),
                () => this.start()
            );
        } else {
            // Fallback behavior
            if (GameState.current.isGameActive) {
                console.log('Continuing saved game');
                this.start();
            } else {
                console.log('No saved game found');
                setTimeout(() => {
                    this.startNewGame();
                }, 1000);
            }
        }
    },

    /**
     * Handle initialization errors
     * @param {Error} error - The error that occurred
     */
    handleInitError(error) {
        console.error('Game initialization failed:', error);

        // Show error message to user
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #1a1a1a;
                color: #e0e0e0;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 2rem;
            ">
                <h1 style="color: #ff6b6b; margin-bottom: 1rem;">Game Failed to Load</h1>
                <p style="margin-bottom: 2rem;">
                    An error occurred while initializing the game:<br>
                    <strong>${error.message}</strong>
                </p>
                <button onclick="location.reload()" style="
                    background: #d4af37;
                    color: #1a1a1a;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                ">Reload Page</button>
            </div>
        `;
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
