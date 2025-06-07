// Rendering System - Canvas management, viewport, and drawing functionality
const Rendering = {
    // Canvas and rendering context
    canvas: null,
    ctx: null,

    // Viewport management
    viewport: {
        width: 0,
        height: 0,
        scale: 1,
        devicePixelRatio: 1,
        orientation: 'landscape',
        isRetina: false,
        screenWidth: 0,
        screenHeight: 0,
        deviceCategory: 'desktop'
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
        this.viewport.devicePixelRatio = window.devicePixelRatio || 1;
        this.viewport.orientation = this.getOrientation();
        this.viewport.isRetina = window.devicePixelRatio > 1;

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
        // This method can be used by the main game loop to adjust performance
        const isHidden = document.hidden;

        // Emit visibility change event
        if (typeof GameState !== 'undefined') {
            GameState.emit('visibilityChange', {
                hidden: isHidden,
                timestamp: Date.now()
            });
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
     * Main render function for the dungeon view
     */
    renderDungeon(animationSystem) {
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
        this.drawGrid(gridStartX, gridStartY, gridSize, gridCols, gridRows);

        // Draw rooms if dungeon grid exists
        if (GameState.dungeon.grid) {
            this.renderRooms(gridStartX, gridStartY, gridSize);
        }

        // Draw player
        this.renderPlayer(gridStartX, gridStartY, gridSize, animationSystem);

        // Draw floor info
        this.renderFloorInfo(centerX);

        // Draw movement animation debug info (can be removed later)
        if (animationSystem.movementAnimation.isAnimating) {
            this.renderDebugInfo(canvasHeight, animationSystem.movementAnimation);
        }
    },

    /**
     * Draw the grid background
     */
    drawGrid(gridStartX, gridStartY, gridSize, gridCols, gridRows) {
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
    },

    /**
     * Render rooms on the grid
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
            'stairs': '#4caf50',   // Green
            'store': '#ff9800',    // Orange
            'chest': '#8d6e63',    // Brown
            'campfire': '#ff5722', // Red-Orange
            'quest': '#3f51b5'     // Indigo
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
     * Render the player character
     */
    renderPlayer(gridStartX, gridStartY, gridSize, animationSystem) {
        // Calculate player render position
        let playerRenderX, playerRenderY;

        if (animationSystem.movementAnimation.isAnimating) {
            // Use animated position
            playerRenderX = gridStartX + (animationSystem.movementAnimation.currentPosition.x * gridSize) + gridSize / 2;
            playerRenderY = gridStartY + (animationSystem.movementAnimation.currentPosition.y * gridSize) + gridSize / 2;
        } else {
            // Use actual game state position
            const playerX = GameState.dungeon.playerPosition.x;
            const playerY = GameState.dungeon.playerPosition.y;
            playerRenderX = gridStartX + (playerX * gridSize) + gridSize / 2;
            playerRenderY = gridStartY + (playerY * gridSize) + gridSize / 2;
        }

        // Draw player as a cute little face
        const faceSize = 16;
        const radius = faceSize / 2;

        // Draw face background (head)
        this.ctx.fillStyle = '#ffdbac'; // Skin tone
        this.ctx.beginPath();
        this.ctx.arc(playerRenderX, playerRenderY, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw face border
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw eyes
        this.ctx.fillStyle = '#333';
        const eyeSize = 2;
        const eyeOffsetX = 3;
        const eyeOffsetY = -2;

        // Left eye
        this.ctx.fillRect(
            playerRenderX - eyeOffsetX - eyeSize/2,
            playerRenderY + eyeOffsetY - eyeSize/2,
            eyeSize,
            eyeSize
        );

        // Right eye
        this.ctx.fillRect(
            playerRenderX + eyeOffsetX - eyeSize/2,
            playerRenderY + eyeOffsetY - eyeSize/2,
            eyeSize,
            eyeSize
        );

        // Draw smile
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(playerRenderX, playerRenderY + 2, 4, 0, Math.PI);
        this.ctx.stroke();

        // Add a small highlight to make it more visible
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(playerRenderX - 2, playerRenderY - 3, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    },

    /**
     * Render floor information
     */
    renderFloorInfo(centerX) {
        this.ctx.fillStyle = '#888';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Floor ${GameState.player.floor}`, centerX, 30);
    },

    /**
     * Render debug information
     */
    renderDebugInfo(canvasHeight, movementAnimation) {
        this.ctx.fillStyle = '#aaa';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        const progress = Math.min(movementAnimation.elapsed / movementAnimation.duration, 1);
        this.ctx.fillText(`Animating: ${(progress * 100).toFixed(1)}%`, 10, canvasHeight - 20);
    },

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// Export for ES6 modules
export default Rendering;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.Rendering = Rendering;
}
