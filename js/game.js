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

    // Movement animation system
    movementAnimation: {
        isAnimating: false,
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        duration: 300, // Animation duration in milliseconds
        elapsed: 0,
        easing: 'easeOutQuart' // Animation easing function
    },

    // Canvas and rendering context
    canvas: null,
    ctx: null,

    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing Pocket Dungeon...');

        try {
            // Initialize canvas
            this.initCanvas();

            // Initialize all game systems
            await this.initSystems();

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
     * Initialize canvas and rendering context with responsive viewport system
     */
    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Initialize viewport system
        this.viewport = {
            width: 0,
            height: 0,
            scale: 1,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: this.getOrientation(),
            isRetina: window.devicePixelRatio > 1
        };

        // Set up canvas properties for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;

        // Initialize responsive canvas system
        this.setupResponsiveCanvas();

        // Handle viewport changes
        this.setupViewportListeners();

        console.log('Responsive canvas system initialized');
    },

    /**
     * Set up responsive canvas system with proper scaling
     */
    setupResponsiveCanvas() {
        const container = this.canvas.parentElement;

        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Define base game resolution (internal rendering size)
        const baseWidth = 320;
        const baseHeight = 320;

        // Calculate optimal canvas size for current viewport
        this.calculateOptimalCanvasSize(containerWidth, containerHeight, baseWidth, baseHeight);

        // Apply the calculated dimensions
        this.applyCanvasDimensions();

        // Update viewport information
        this.updateViewportInfo();
    },

    /**
     * Calculate optimal canvas size based on container and device capabilities
     */
    calculateOptimalCanvasSize(containerWidth, containerHeight, baseWidth, baseHeight) {
        const padding = 20; // Minimum padding around canvas
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;

        // Calculate scale factors for width and height
        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / baseHeight;

        // Use the smaller scale to maintain aspect ratio
        let scale = Math.min(scaleX, scaleY);

        // Adjust scale based on device characteristics
        if (Utils.isTouchDevice()) {
            // On touch devices, ensure minimum touch target size
            const minScale = 0.8;
            scale = Math.max(scale, minScale);
        }

        // Apply device pixel ratio for high-DPI displays
        const displayScale = scale * this.viewport.devicePixelRatio;

        // Calculate final dimensions
        this.viewport.scale = scale;
        this.viewport.width = Math.floor(baseWidth * scale);
        this.viewport.height = Math.floor(baseHeight * scale);

        // Set internal canvas resolution (for crisp rendering)
        this.canvas.width = Math.floor(baseWidth * this.viewport.devicePixelRatio);
        this.canvas.height = Math.floor(baseHeight * this.viewport.devicePixelRatio);

        // Scale context for high-DPI rendering
        this.ctx.scale(this.viewport.devicePixelRatio, this.viewport.devicePixelRatio);
    },

    /**
     * Apply calculated dimensions to canvas
     */
    applyCanvasDimensions() {
        // Set display size (CSS pixels)
        this.canvas.style.width = `${this.viewport.width}px`;
        this.canvas.style.height = `${this.viewport.height}px`;

        // Center the canvas in its container
        this.canvas.style.margin = 'auto';
        this.canvas.style.display = 'block';

        // Ensure crisp pixel rendering
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = '-webkit-crisp-edges';
    },

    /**
     * Update viewport information for responsive behavior
     */
    updateViewportInfo() {
        const viewport = Utils.getViewportSize();

        this.viewport.orientation = this.getOrientation();
        this.viewport.screenWidth = viewport.width;
        this.viewport.screenHeight = viewport.height;

        // Determine device category for optimizations
        this.viewport.deviceCategory = this.getDeviceCategory(viewport.width, viewport.height);

        // Log viewport info for debugging
        console.log('Viewport updated:', {
            canvasSize: `${this.viewport.width}x${this.viewport.height}`,
            internalSize: `${this.canvas.width}x${this.canvas.height}`,
            scale: this.viewport.scale.toFixed(2),
            devicePixelRatio: this.viewport.devicePixelRatio,
            orientation: this.viewport.orientation,
            category: this.viewport.deviceCategory
        });
    },

    /**
     * Set up event listeners for viewport changes
     */
    setupViewportListeners() {
        // Debounced resize handler to prevent excessive recalculations
        const debouncedResize = Utils.debounce(() => {
            this.handleViewportChange();
        }, 150);

        // Handle window resize
        window.addEventListener('resize', debouncedResize);

        // Handle orientation change (mobile devices)
        window.addEventListener('orientationchange', () => {
            // Wait for orientation change to complete
            setTimeout(() => {
                this.handleViewportChange();
            }, 200);
        });

        // Handle device pixel ratio changes (zoom, external monitor changes)
        if ('devicePixelRatio' in window) {
            const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            mediaQuery.addEventListener('change', () => {
                this.viewport.devicePixelRatio = window.devicePixelRatio || 1;
                this.handleViewportChange();
            });
        }

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', debouncedResize);
        document.addEventListener('webkitfullscreenchange', debouncedResize);

        // Handle visibility changes (optimize when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    },

    /**
     * Handle viewport changes (resize, orientation, etc.)
     */
    handleViewportChange() {
        console.log('Viewport change detected, recalculating canvas...');

        // Update device pixel ratio
        this.viewport.devicePixelRatio = window.devicePixelRatio || 1;

        // Recalculate and apply new canvas dimensions
        this.setupResponsiveCanvas();

        // Force a render to update the display
        if (this.isRunning) {
            this.render();
        }

        // Emit viewport change event for other systems
        if (typeof GameState !== 'undefined') {
            GameState.emit('viewportChange', {
                viewport: this.viewport,
                timestamp: Date.now()
            });
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
     * Get current screen orientation
     */
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        }

        // Fallback for older browsers
        const viewport = Utils.getViewportSize();
        return viewport.height > viewport.width ? 'portrait' : 'landscape';
    },

    /**
     * Determine device category for optimization
     */
    getDeviceCategory(width, height) {
        const diagonal = Math.sqrt(width * width + height * height);

        if (diagonal < 500) return 'small-phone';
        if (diagonal < 700) return 'phone';
        if (diagonal < 1000) return 'tablet';
        return 'desktop';
    },

    /**
     * Get canvas coordinates from screen coordinates (for touch/click handling)
     */
    screenToCanvas(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY
        };
    },

    /**
     * Get screen coordinates from canvas coordinates
     */
    canvasToScreen(canvasX, canvasY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;

        return {
            x: rect.left + (canvasX * scaleX),
            y: rect.top + (canvasY * scaleY)
        };
    },

    /**
     * Legacy resize method for backward compatibility
     */
    resizeCanvas() {
        this.handleViewportChange();
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
        GameState.on('combatAction', (data) => this.handleCombatAction(data));

        // Listen for inventory actions from UI
        GameState.on('inventoryAction', (data) => this.handleInventoryAction(data));

        // Listen for state changes to update game logic
        GameState.on('stateChange', (data) => this.handleStateChange(data));
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
        // Update cooldowns
        this.updateCooldowns(deltaTime);

        // Update any active animations or transitions
        this.updateAnimations(deltaTime);

        // Auto-save periodically
        this.handleAutoSave(deltaTime);
    },

    /**
     * Main game render function
     */
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current game state
        if (GameState.current.screen === 'game') {
            this.renderDungeon();
        }
    },

    /**
     * Render the dungeon view
     */
    renderDungeon() {
        // Clear canvas first
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Get canvas dimensions
        const canvasWidth = this.canvas.width / this.viewport.devicePixelRatio;
        const canvasHeight = this.canvas.height / this.viewport.devicePixelRatio;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Grid settings for visual representation
        const gridSize = 40; // Size of each grid cell in pixels
        const gridCols = 5;
        const gridRows = 5;
        const gridStartX = centerX - (gridCols * gridSize) / 2;
        const gridStartY = centerY - (gridRows * gridSize) / 2;

        // Draw grid background
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= gridCols; x++) {
            const lineX = gridStartX + x * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, gridStartY);
            this.ctx.lineTo(lineX, gridStartY + gridRows * gridSize);
            this.ctx.stroke();
        }

        for (let y = 0; y <= gridRows; y++) {
            const lineY = gridStartY + y * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(gridStartX, lineY);
            this.ctx.lineTo(gridStartX + gridCols * gridSize, lineY);
            this.ctx.stroke();
        }

        // Draw rooms if dungeon grid exists
        if (GameState.dungeon.grid) {
            this.renderRooms(gridStartX, gridStartY, gridSize);
        }

        // Calculate player render position
        let playerRenderX, playerRenderY;

        if (this.movementAnimation.isAnimating) {
            // Use animated position
            playerRenderX = gridStartX + (this.movementAnimation.currentPosition.x * gridSize) + gridSize / 2;
            playerRenderY = gridStartY + (this.movementAnimation.currentPosition.y * gridSize) + gridSize / 2;
        } else {
            // Use actual game state position
            const playerX = GameState.dungeon.playerPosition.x;
            const playerY = GameState.dungeon.playerPosition.y;
            playerRenderX = gridStartX + (playerX * gridSize) + gridSize / 2;
            playerRenderY = gridStartY + (playerY * gridSize) + gridSize / 2;
        }

        // Draw player
        this.ctx.fillStyle = '#d4af37';
        const playerSize = 12;
        this.ctx.fillRect(
            playerRenderX - playerSize / 2,
            playerRenderY - playerSize / 2,
            playerSize,
            playerSize
        );

        // Draw player border for visibility
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            playerRenderX - playerSize / 2,
            playerRenderY - playerSize / 2,
            playerSize,
            playerSize
        );

        // Draw floor info
        this.ctx.fillStyle = '#888';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Floor ${GameState.player.floor}`, centerX, 30);

        // Draw movement animation debug info (can be removed later)
        if (this.movementAnimation.isAnimating) {
            this.ctx.fillStyle = '#aaa';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            const progress = Math.min(this.movementAnimation.elapsed / this.movementAnimation.duration, 1);
            this.ctx.fillText(`Animating: ${(progress * 100).toFixed(1)}%`, 10, canvasHeight - 20);
        }
    },

    /**
     * Render rooms on the grid
     * @param {number} gridStartX - Grid start X position
     * @param {number} gridStartY - Grid start Y position
     * @param {number} gridSize - Size of each grid cell
     */
    renderRooms(gridStartX, gridStartY, gridSize) {
        const grid = GameState.dungeon.grid;
        if (!grid) return;

        // Room type colors
        const roomColors = {
            'start': '#4a9eff',    // Blue
            'empty': '#666',       // Gray
            'monster': '#ff6b6b',  // Red
            'treasure': '#ffd93d', // Gold
            'boss': '#9c27b0',     // Purple
            'stairs': '#4caf50'    // Green
        };

        // Draw each room
        for (const room of grid.getAllRooms()) {
            const roomX = gridStartX + room.x * gridSize;
            const roomY = gridStartY + room.y * gridSize;

            // Room background
            this.ctx.fillStyle = room.isExplored ? roomColors[room.type] || '#666' : '#222';
            this.ctx.fillRect(roomX + 2, roomY + 2, gridSize - 4, gridSize - 4);

            // Room border
            this.ctx.strokeStyle = room.isExplored ? '#fff' : '#444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(roomX + 2, roomY + 2, gridSize - 4, gridSize - 4);

            // Draw connections if room is explored
            if (room.isExplored) {
                this.drawRoomConnections(room, roomX, roomY, gridSize);
            }

            // Mark cleared rooms
            if (room.isCleared) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(roomX + gridSize - 8, roomY + 2, 6, 6);
            }
        }
    },

    /**
     * Draw connections between rooms
     * @param {Room} room - Room to draw connections for
     * @param {number} roomX - Room X position on canvas
     * @param {number} roomY - Room Y position on canvas
     * @param {number} gridSize - Size of each grid cell
     */
    drawRoomConnections(room, roomX, roomY, gridSize) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;

        const centerX = roomX + gridSize / 2;
        const centerY = roomY + gridSize / 2;
        const connectionLength = gridSize / 3;

        // Draw connection lines
        if (room.hasConnection('north')) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX, centerY - connectionLength);
            this.ctx.stroke();
        }
        if (room.hasConnection('south')) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX, centerY + connectionLength);
            this.ctx.stroke();
        }
        if (room.hasConnection('east')) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX + connectionLength, centerY);
            this.ctx.stroke();
        }
        if (room.hasConnection('west')) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX - connectionLength, centerY);
            this.ctx.stroke();
        }
    },

    /**
     * Update cooldowns
     * @param {number} deltaTime - Time since last frame
     */
    updateCooldowns(deltaTime) {
        if (GameState.combat.cooldowns.heavyAttack > 0) {
            GameState.combat.cooldowns.heavyAttack -= deltaTime;
        }
        if (GameState.combat.cooldowns.block > 0) {
            GameState.combat.cooldowns.block -= deltaTime;
        }
    },

    /**
     * Update animations
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimations(deltaTime) {
        this.updateMovementAnimation(deltaTime);
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
     */
    startMovementAnimation(fromX, fromY, toX, toY) {
        this.movementAnimation.isAnimating = true;
        this.movementAnimation.startPosition = { x: fromX, y: fromY };
        this.movementAnimation.endPosition = { x: toX, y: toY };
        this.movementAnimation.currentPosition = { x: fromX, y: fromY };
        this.movementAnimation.elapsed = 0;

        console.log(`Starting movement animation from (${fromX}, ${fromY}) to (${toX}, ${toY})`);
    },

    /**
     * Complete the movement animation
     */
    completeMovementAnimation() {
        this.movementAnimation.isAnimating = false;
        this.movementAnimation.currentPosition = { ...this.movementAnimation.endPosition };

        console.log('Movement animation completed');

        // Trigger any post-movement events
        this.handleRoomEvents();
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
            default:
                return progress; // Default to linear
        }
    },

    /**
     * Handle auto-save
     * @param {number} deltaTime - Time since last frame
     */
    handleAutoSave(deltaTime) {
        // Initialize auto-save timer if not exists
        if (!this.autoSaveTimer) {
            this.autoSaveTimer = 0;
            this.autoSaveInterval = 30000; // 30 seconds
        }

        // Auto-save every 30 seconds if enabled and game is active
        if (GameState.settings.autoSave && GameState.current.isGameActive) {
            this.autoSaveTimer += deltaTime;

            if (this.autoSaveTimer >= this.autoSaveInterval) {
                this.performAutoSave();
                this.autoSaveTimer = 0;
            }
        }
    },

    /**
     * Perform auto-save operation
     */
    performAutoSave() {
        try {
            const saveSuccess = GameState.saveGameData();
            if (saveSuccess) {
                console.log('Auto-save completed successfully');

                // Show subtle notification
                if (typeof UI !== 'undefined' && UI.showSaveIndicator) {
                    UI.showSaveIndicator();
                }
            } else {
                console.warn('Auto-save failed');
                this.handleSaveError('auto-save');
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            this.handleSaveError('auto-save', error);
        }
    },

    /**
     * Handle save errors with user feedback
     * @param {string} saveType - Type of save operation that failed
     * @param {Error} error - Optional error object
     */
    handleSaveError(saveType, error = null) {
        const errorMessage = error ? error.message : 'Unknown error';
        console.error(`${saveType} failed:`, errorMessage);

        // Show user notification about save failure
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Save failed: ${errorMessage}`, 3000, 'error');
        }

        // Attempt to free up storage space if quota exceeded
        if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
            this.handleStorageQuotaExceeded();
        }
    },

    /**
     * Handle storage quota exceeded
     */
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup...');

        try {
            // Get storage info
            const storageInfo = Storage.getStorageInfo();

            if (storageInfo && storageInfo.gameSize > 0) {
                // Show warning to user
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Storage full! Some older saves may be removed.', 5000, 'warning');
                }

                // Cleanup old save data if possible
                this.cleanupOldSaves();
            }
        } catch (cleanupError) {
            console.error('Storage cleanup failed:', cleanupError);
        }
    },

    /**
     * Cleanup old save data to free space
     */
    cleanupOldSaves() {
        try {
            // This is a placeholder for future save cleanup logic
            // Could implement removal of old backups, statistics, etc.
            console.log('Storage cleanup completed');
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    },

    /**
     * Manually save game with user feedback
     */
    manualSave() {
        try {
            const saveSuccess = GameState.saveGameData();
            if (saveSuccess) {
                console.log('Manual save completed successfully');

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Game saved!', 2000, 'success');
                }
            } else {
                this.handleSaveError('manual save');
            }
        } catch (error) {
            console.error('Manual save error:', error);
            this.handleSaveError('manual save', error);
        }
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
     * Handle movement input with enhanced room connectivity validation
     * @param {Object} data - Movement data
     */
    handleMovement(data) {
        const { direction } = data;
        console.log(`Game.handleMovement called with direction: ${direction}`);

        // Don't process movement if in combat
        if (GameState.combat.isActive) {
            return;
        }

        // Don't process movement if already animating
        if (this.movementAnimation.isAnimating) {
            return;
        }

        // Don't process movement if no dungeon grid exists
        if (!GameState.dungeon.grid) {
            console.warn('No dungeon grid available for movement');
            return;
        }

        console.log(`Player attempts to move ${direction}`);

        // Get current position from dungeon state
        const currentX = GameState.dungeon.playerPosition.x;
        const currentY = GameState.dungeon.playerPosition.y;

        // Calculate new position based on direction
        let newX = currentX;
        let newY = currentY;

        switch (direction) {
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
                console.warn(`Unknown movement direction: ${direction}`);
                return;
        }

        // Check if move is valid before starting animation
        if (!GameState.dungeon.grid.canMoveTo(currentX, currentY, newX, newY)) {
            console.log(`Movement to (${newX}, ${newY}) blocked - no connection or invalid room`);

            // Show feedback to player about invalid movement
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Cannot move in that direction', 1000, 'info');
            }
            return;
        }

        // Update game state immediately (for logic purposes)
        const moveSuccess = GameState.movePlayer(newX, newY);

        if (moveSuccess) {
            console.log(`Player moved to (${newX}, ${newY}) - starting animation`);

            // Start smooth movement animation
            this.startMovementAnimation(currentX, currentY, newX, newY);

            // Note: handleRoomEvents() will be called when animation completes
        }
    },

    /**
     * Handle room events when player enters a new room
     */
    handleRoomEvents() {
        const currentRoom = GameState.dungeon.currentRoom;
        if (!currentRoom) return;

        // Only trigger events for newly explored rooms or uncleaered rooms
        if (!currentRoom.isExplored) {
            console.log(`Entering new ${currentRoom.type} room at (${currentRoom.x}, ${currentRoom.y})`);
        }

        // Handle room type specific events
        switch (currentRoom.type) {
            case 'monster':
                if (!currentRoom.isCleared) {
                    this.triggerCombat();
                }
                break;
            case 'treasure':
                if (!currentRoom.isCleared) {
                    this.handleTreasureRoom();
                }
                break;
            case 'boss':
                if (!currentRoom.isCleared) {
                    this.triggerBossCombat();
                }
                break;
            case 'stairs':
                this.handleStairsRoom();
                break;
            case 'start':
                // Safe room, no events
                break;
            case 'empty':
                // Check for random encounters in empty rooms
                this.checkForRandomEncounters();
                break;
        }
    },

    /**
     * Handle treasure room events
     */
    handleTreasureRoom() {
        console.log('Found treasure!');

        // Generate treasure based on floor level
        const treasureGold = Math.floor(Math.random() * 50) + (GameState.dungeon.currentFloor * 10);
        GameState.updateInventory({ gold: GameState.inventory.gold + treasureGold });

        // Mark room as cleared
        GameState.dungeon.currentRoom.isCleared = true;

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Found ${treasureGold} gold!`, 2000, 'success');
        }
    },

    /**
     * Handle stairs room events
     */
    handleStairsRoom() {
        console.log('Found stairs to next floor');

        // Show option to advance to next floor
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Stairs to next floor found! (Auto-advancing in 2 seconds)', 3000, 'info');

            // Auto-advance after a delay
            setTimeout(() => {
                this.advanceToNextFloor();
            }, 2000);
        }
    },

    /**
     * Advance to the next floor
     */
    advanceToNextFloor() {
        const nextFloor = GameState.dungeon.currentFloor + 1;
        console.log(`Advancing to floor ${nextFloor}`);

        // Generate new floor
        GameState.generateNewFloor(nextFloor);
        GameState.updatePlayer({ floor: nextFloor });

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Welcome to Floor ${nextFloor}!`, 2000, 'success');
        }

        // Update render
        if (this.isRunning) {
            this.render();
        }
    },

    /**
     * Trigger boss combat
     */
    triggerBossCombat() {
        const floor = GameState.dungeon.currentFloor;
        const boss = {
            name: `Floor ${floor} Boss`,
            health: 50 + (floor * 20),
            maxHealth: 50 + (floor * 20),
            attack: 8 + Math.floor(floor * 1.5),
            experience: 50 + (floor * 25)
        };

        console.log('Boss encounter!');
        GameState.startCombat(boss);
    },

    /**
     * Check for random encounters in empty rooms
     */
    checkForRandomEncounters() {
        // Lower chance for random encounters (10%)
        if (Math.random() < 0.1) {
            this.triggerCombat();
        }
    },

    /**
     * Handle combat actions
     * @param {Object} data - Combat action data
     */
    handleCombatAction(data) {
        const { action } = data;

        if (!GameState.combat.isActive || !GameState.combat.playerTurn) {
            return;
        }

        console.log(`Combat action: ${action}`);

        // Process combat action
        switch (action) {
            case 'attack':
                this.performAttack();
                break;
            case 'heavyAttack':
                this.performHeavyAttack();
                break;
            case 'block':
                this.performBlock();
                break;
            case 'item':
                this.useItem();
                break;
        }

        // End player turn
        GameState.combat.playerTurn = false;

        // Process enemy turn after a delay
        setTimeout(() => {
            this.processEnemyTurn();
        }, 1000);
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
     * Check for random encounters (legacy method for compatibility)
     */
    checkForEncounters() {
        // 20% chance of encounter
        if (Math.random() < 0.2) {
            this.triggerCombat();
        }
    },

    /**
     * Trigger a combat encounter
     */
    triggerCombat() {
        const floor = GameState.dungeon.currentFloor;
        const enemy = {
            name: 'Goblin',
            health: 30 + (floor * 5),
            maxHealth: 30 + (floor * 5),
            attack: 5 + Math.floor(floor * 0.5),
            experience: 10 + (floor * 3)
        };

        GameState.startCombat(enemy);
    },

    /**
     * Perform a basic attack
     */
    performAttack() {
        if (!GameState.combat.enemy) return;

        const damage = GameState.player.strength + Utils.randomInt(1, 6);
        GameState.combat.enemy.health -= damage;

        GameState.combat.log.push(`You deal ${damage} damage!`);

        if (GameState.combat.enemy.health <= 0) {
            this.endCombat(true);
        } else {
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * Perform a heavy attack
     */
    performHeavyAttack() {
        if (GameState.combat.cooldowns.heavyAttack > 0) {
            GameState.combat.log.push('Heavy attack is on cooldown!');
            return;
        }

        if (!GameState.combat.enemy) return;

        const damage = (GameState.player.strength * 1.5) + Utils.randomInt(2, 8);
        GameState.combat.enemy.health -= damage;
        GameState.combat.cooldowns.heavyAttack = 3000; // 3 second cooldown

        GameState.combat.log.push(`You deal ${damage} heavy damage!`);

        if (GameState.combat.enemy.health <= 0) {
            this.endCombat(true);
        } else {
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * Perform a block action
     */
    performBlock() {
        GameState.combat.lastAction = 'block';
        GameState.combat.log.push('You prepare to block!');
        GameState.emit('combatUpdate', GameState.combat);
    },

    /**
     * Use an item in combat
     */
    useItem() {
        GameState.combat.log.push('No items available!');
        GameState.emit('combatUpdate', GameState.combat);
    },

    /**
     * Process enemy turn
     */
    processEnemyTurn() {
        if (!GameState.combat.isActive || !GameState.combat.enemy) return;

        const enemyDamage = GameState.combat.enemy.attack + Utils.randomInt(1, 4);
        let actualDamage = enemyDamage;

        // Reduce damage if player blocked
        if (GameState.combat.lastAction === 'block') {
            actualDamage = Math.floor(enemyDamage * 0.5);
            GameState.combat.log.push(`Enemy attacks for ${enemyDamage} damage, blocked for ${actualDamage}!`);
        } else {
            GameState.combat.log.push(`Enemy attacks for ${actualDamage} damage!`);
        }

        GameState.updatePlayer({ health: GameState.player.health - actualDamage });

        // Check if player died
        if (GameState.player.health <= 0) {
            this.endCombat(false);
        } else {
            // Reset for next turn
            GameState.combat.playerTurn = true;
            GameState.combat.lastAction = null;
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * End combat
     * @param {boolean} playerWon - Whether the player won
     */
    endCombat(playerWon) {
        if (playerWon) {
            UI.showNotification('Victory!', 1500);
        } else {
            UI.showNotification('Defeat!', 1500);
            // Handle player death (restart, etc.)
            setTimeout(() => {
                this.handlePlayerDeath();
            }, 2000);
        }

        GameState.endCombat(playerWon);
    },

    /**
     * Handle player death
     */
    handlePlayerDeath() {
        UI.showNotification('Game Over! Starting new game...', 3000);
        setTimeout(() => {
            this.startNewGame();
        }, 3000);
    },

    /**
     * Handle level up
     * @param {number} level - New player level
     */
    handleLevelUp(level) {
        UI.showNotification(`Level Up! You are now level ${level}!`, 3000);
    },

    /**
     * Check for saved game on startup
     */
    checkSavedGame() {
        if (GameState.current.isGameActive) {
            console.log('Continuing saved game');
            this.start();
        } else {
            console.log('No saved game found');
            // Show tutorial or main menu here
            setTimeout(() => {
                this.startNewGame();
            }, 1000);
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
