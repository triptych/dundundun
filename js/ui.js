// Pocket Dungeon - User Interface Management
// Handles all UI interactions and updates

/**
 * UI Manager for handling user interface interactions and updates
 */
const UI = {
    // DOM element references
    elements: {},

    // Current active panel
    activePanel: null,

    // Animation states
    animations: {
        isTransitioning: false,
        queue: []
    },

    /**
     * Initialize the UI system
     */
    init() {
        console.log('Initializing UI system...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Subscribe to game state changes
        this.setupGameStateListeners();

        // Initialize panels
        this.initializePanels();

        console.log('UI system initialized');
    },

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            // Screens
            loadingScreen: document.getElementById('loading-screen'),
            gameScreen: document.getElementById('game-screen'),
            menuScreen: document.getElementById('menu-screen'),

            // Game canvas and container
            gameCanvas: document.getElementById('game-canvas'),
            dungeonView: document.getElementById('dungeon-view'),

            // Player stats
            playerHp: document.getElementById('player-hp'),
            currentFloor: document.getElementById('current-floor'),
            playerLevel: document.getElementById('player-level'),
            playerExp: document.getElementById('player-exp'),
            playerStrength: document.getElementById('player-strength'),
            playerAgility: document.getElementById('player-agility'),
            playerVitality: document.getElementById('player-vitality'),

            // Navigation
            menuBtn: document.getElementById('menu-btn'),
            navBtns: document.querySelectorAll('.nav-btn'),

            // Panels
            inventoryPanel: document.getElementById('inventory-panel'),
            characterPanel: document.getElementById('character-panel'),
            skillsPanel: document.getElementById('skills-panel'),

            // Inventory
            inventoryGrid: document.getElementById('inventory-grid'),
            inventoryCount: document.querySelector('.inventory-count'),

            // Movement controls
            moveBtns: document.querySelectorAll('.move-btn'),

            // Combat
            combatOverlay: document.getElementById('combat-overlay'),
            enemyName: document.getElementById('enemy-name'),
            enemyHpFill: document.getElementById('enemy-hp-fill'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            combatLog: document.getElementById('combat-log'),
            attackBtn: document.getElementById('attack-btn'),
            heavyAttackBtn: document.getElementById('heavy-attack-btn'),
            blockBtn: document.getElementById('block-btn'),
            itemBtn: document.getElementById('item-btn'),

            // Menu options
            newGameBtn: document.getElementById('new-game'),
            saveGameBtn: document.getElementById('save-game'),
            loadGameBtn: document.getElementById('load-game'),
            settingsBtn: document.getElementById('settings'),
            helpBtn: document.getElementById('help'),
            closeMenuBtn: document.getElementById('close-menu'),

            // Skills
            skillsTree: document.getElementById('skills-tree'),
            availableSkillPoints: document.getElementById('available-skill-points')
        };

        // Debug menu screen element
        console.log('Menu screen element found:', this.elements.menuScreen);
        console.log('Close menu button found:', this.elements.closeMenuBtn);
    },

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Menu button
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => this.toggleMenu());
        }

        // Navigation buttons
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Movement buttons
        this.elements.moveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.handleMovement(direction);
            });
        });

        // Combat buttons
        if (this.elements.attackBtn) {
            this.elements.attackBtn.addEventListener('click', () => this.handleCombatAction('attack'));
        }
        if (this.elements.heavyAttackBtn) {
            this.elements.heavyAttackBtn.addEventListener('click', () => this.handleCombatAction('heavyAttack'));
        }
        if (this.elements.blockBtn) {
            this.elements.blockBtn.addEventListener('click', () => this.handleCombatAction('block'));
        }
        if (this.elements.itemBtn) {
            this.elements.itemBtn.addEventListener('click', () => this.handleCombatAction('item'));
        }

        // Menu options
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => this.showNewGameConfirmation());
        }
        if (this.elements.saveGameBtn) {
            this.elements.saveGameBtn.addEventListener('click', () => this.saveGame());
        }
        if (this.elements.loadGameBtn) {
            this.elements.loadGameBtn.addEventListener('click', () => this.loadGame());
        }
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        }
        if (this.elements.closeMenuBtn) {
            console.log('Setting up close menu button listener');
            this.elements.closeMenuBtn.addEventListener('click', (e) => {
                console.log('Close menu button clicked', e);
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
            });
        } else {
            console.warn('Close menu button not found');
        }

        // Touch and click optimizations
        this.setupTouchOptimizations();
    },

    /**
     * Set up touch-specific optimizations
     */
    setupTouchOptimizations() {
        // Prevent default touch behaviors that might interfere with game
        document.addEventListener('touchstart', (e) => {
            // Prevent zoom on double tap for game elements
            if (e.target.closest('#app')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle touch feedback
        const touchElements = document.querySelectorAll('button, .move-btn, .nav-btn, .combat-btn');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.classList.add('touching');
            }, { passive: true });

            element.addEventListener('touchend', (e) => {
                element.classList.remove('touching');
            }, { passive: true });
        });
    },

    /**
     * Subscribe to game state changes
     */
    setupGameStateListeners() {
        if (typeof GameState !== 'undefined') {
            GameState.on('stateChange', (data) => this.handleStateChange(data));
            GameState.on('playerUpdate', (player) => this.updatePlayerUI(player));
            GameState.on('inventoryUpdate', (inventory) => this.updateInventoryUI(inventory));
            GameState.on('combatUpdate', (combat) => this.updateCombatUI(combat));
            GameState.on('dungeonUpdate', (dungeon) => this.updateDungeonUI(dungeon));
        }
    },

    /**
     * Initialize panels and UI components
     */
    initializePanels() {
        // Generate inventory slots
        this.generateInventorySlots();

        // Set up initial UI state
        this.switchScreen('loading');
    },

    /**
     * Generate inventory slot elements
     */
    generateInventorySlots() {
        if (!this.elements.inventoryGrid) return;

        this.elements.inventoryGrid.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotIndex = i;

            // Add click handler for inventory slots
            slot.addEventListener('click', () => this.handleInventorySlotClick(i));

            this.elements.inventoryGrid.appendChild(slot);
        }
    },

    /**
     * Switch between main screens
     * @param {string} screenName - Name of screen to show
     */
    switchScreen(screenName) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Update internal state
        if (typeof GameState !== 'undefined') {
            GameState.current.screen = screenName;
        }
    },

    /**
     * Switch between bottom navigation tabs
     * @param {string} tabName - Name of tab to activate
     */
    switchTab(tabName) {
        // Update navigation button states
        this.elements.navBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hide all panels
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => panel.classList.remove('active'));

        // Show target panel if not game tab
        if (tabName !== 'game') {
            const targetPanel = document.getElementById(`${tabName}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                this.activePanel = tabName;
            }
        } else {
            this.activePanel = null;
        }
    },

    /**
     * Toggle menu visibility
     */
    toggleMenu() {
        const menuScreen = this.elements.menuScreen;
        if (menuScreen) {
            console.log('Toggling menu, current classes:', menuScreen.className);
            menuScreen.classList.toggle('active');
            console.log('Menu toggled, new classes:', menuScreen.className);
        }
    },

    /**
     * Close menu
     */
    closeMenu() {
        console.log('closeMenu() called');
        const menuScreen = this.elements.menuScreen;
        if (menuScreen) {
            console.log('Menu screen found, current classes:', menuScreen.className);
            menuScreen.classList.remove('active');
            console.log('Menu closed, new classes:', menuScreen.className);
        } else {
            console.error('Menu screen not found in closeMenu()');
        }
    },

    /**
     * Handle movement button clicks
     * @param {string} direction - Direction to move
     */
    handleMovement(direction) {
        console.log('Movement:', direction);

        // Emit movement event
        if (typeof GameState !== 'undefined') {
            console.log('UI emitting movement event with data:', { direction });
            GameState.emit('movement', { direction });
        } else {
            console.error('GameState is undefined in UI.handleMovement');
        }
    },

    /**
     * Handle combat action clicks
     * @param {string} action - Combat action to perform
     */
    handleCombatAction(action) {
        console.log('Combat action:', action);

        // Emit combat action event
        if (typeof GameState !== 'undefined') {
            GameState.emit('combatAction', { action });
        }
    },

    /**
     * Handle inventory slot clicks
     * @param {number} slotIndex - Index of clicked slot
     */
    handleInventorySlotClick(slotIndex) {
        console.log('Inventory slot clicked:', slotIndex);

        // Emit inventory action event
        if (typeof GameState !== 'undefined') {
            GameState.emit('inventoryAction', { type: 'slotClick', slotIndex });
        }
    },

    /**
     * Handle game state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        switch (data.type) {
            case 'init':
                this.switchScreen('game');
                break;
            case 'newGame':
                this.switchScreen('game');
                this.switchTab('game');
                break;
            case 'screenChange':
                this.switchScreen(data.to);
                break;
        }
    },

    /**
     * Update player UI elements
     * @param {Object} player - Player data
     */
    updatePlayerUI(player) {
        if (this.elements.playerHp) {
            this.elements.playerHp.textContent = `${player.health}/${player.maxHealth}`;
        }
        if (this.elements.currentFloor) {
            this.elements.currentFloor.textContent = player.floor;
        }
        if (this.elements.playerLevel) {
            this.elements.playerLevel.textContent = player.level;
        }
        if (this.elements.playerExp) {
            this.elements.playerExp.textContent = `${player.experience}/${player.experienceToNext}`;
        }
        if (this.elements.playerStrength) {
            this.elements.playerStrength.textContent = player.strength;
        }
        if (this.elements.playerAgility) {
            this.elements.playerAgility.textContent = player.agility;
        }
        if (this.elements.playerVitality) {
            this.elements.playerVitality.textContent = player.vitality;
        }
        if (this.elements.availableSkillPoints) {
            this.elements.availableSkillPoints.textContent = player.availablePoints;
        }
    },

    /**
     * Update inventory UI
     * @param {Object} inventory - Inventory data
     */
    updateInventoryUI(inventory) {
        if (this.elements.inventoryCount) {
            this.elements.inventoryCount.textContent = `${inventory.items.length}/${inventory.maxSlots}`;
        }

        // Update inventory slots
        const slots = this.elements.inventoryGrid.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            const item = inventory.items[index];

            if (item) {
                slot.classList.add('occupied');
                slot.title = item.name || 'Item';
                // Here you would add item icon/image
            } else {
                slot.classList.remove('occupied');
                slot.title = '';
            }
        });
    },

    /**
     * Update combat UI
     * @param {Object} combat - Combat data
     */
    updateCombatUI(combat) {
        if (!this.elements.combatOverlay) return;

        if (combat.isActive) {
            this.elements.combatOverlay.classList.add('active');

            if (combat.enemy) {
                if (this.elements.enemyName) {
                    this.elements.enemyName.textContent = combat.enemy.name || 'Enemy';
                }

                if (this.elements.enemyHpFill && this.elements.enemyHpText) {
                    const hpPercent = (combat.enemy.health / combat.enemy.maxHealth) * 100;
                    this.elements.enemyHpFill.style.width = `${hpPercent}%`;
                    this.elements.enemyHpText.textContent = `${combat.enemy.health}/${combat.enemy.maxHealth}`;
                }
            }

            // Update combat log
            if (this.elements.combatLog && combat.log) {
                this.elements.combatLog.innerHTML = '';
                combat.log.forEach(entry => {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.textContent = entry;
                    this.elements.combatLog.appendChild(logEntry);
                });
                this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;
            }
        } else {
            this.elements.combatOverlay.classList.remove('active');

            // Clear focus from all combat buttons to prevent them from "sticking" visually
            const combatButtons = [
                this.elements.attackBtn,
                this.elements.heavyAttackBtn,
                this.elements.blockBtn,
                this.elements.itemBtn
            ];

            combatButtons.forEach(button => {
                if (button && document.activeElement === button) {
                    button.blur();
                }
            });
        }
    },

    /**
     * Update dungeon UI
     * @param {Object} dungeon - Dungeon data
     */
    updateDungeonUI(dungeon) {
        // Update floor indicator
        if (this.elements.currentFloor) {
            this.elements.currentFloor.textContent = dungeon.currentFloor;
        }
    },

    /**
     * Save game action
     */
    saveGame() {
        if (typeof Game !== 'undefined' && Game.manualSave) {
            Game.manualSave();
        } else if (typeof GameState !== 'undefined') {
            const success = GameState.saveGameData();
            this.showNotification(success ? 'Game saved!' : 'Failed to save game', 2000, success ? 'success' : 'error');
        }
        this.closeMenu();
    },

    /**
     * Load game action
     */
    loadGame() {
        if (typeof GameState !== 'undefined') {
            const success = GameState.loadGameData();
            this.showNotification(success ? 'Game loaded!' : 'Failed to load game', 2000, success ? 'success' : 'error');
        }
        this.closeMenu();
    },

    /**
     * Show settings (placeholder)
     */
    showSettings() {
        this.showNotification('Settings coming soon!');
        this.closeMenu();
    },

    /**
     * Show help (placeholder)
     */
    showHelp() {
        this.showNotification('Help coming soon!');
        this.closeMenu();
    },

    /**
     * Show a temporary notification
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     * @param {string} type - Type of notification (success, error, warning, info)
     */
    showNotification(message, duration = 2000, type = 'info') {
        // Define notification colors based on type
        const colors = {
            success: { bg: 'rgba(76, 175, 80, 0.9)', color: '#ffffff' },
            error: { bg: 'rgba(244, 67, 54, 0.9)', color: '#ffffff' },
            warning: { bg: 'rgba(255, 152, 0, 0.9)', color: '#1a1a1a' },
            info: { bg: 'rgba(212, 175, 55, 0.9)', color: '#1a1a1a' }
        };

        const typeColors = colors[type] || colors.info;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${typeColors.bg};
            color: ${typeColors.color};
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        // Remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    /**
     * Show a subtle save indicator for auto-saves
     */
    showSaveIndicator() {
        // Create save indicator element
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.innerHTML = '<span class="save-icon">💾</span> Saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #d4af37;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: bold;
            z-index: 8999;
            animation: saveIndicatorFade 2s ease;
            pointer-events: none;
        `;

        document.body.appendChild(indicator);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 2000);
    },

    /**
     * Show storage warning when space is low
     * @param {Object} storageInfo - Storage information
     */
    showStorageWarning(storageInfo) {
        const warningMessage = `Storage space low: ${Math.round(storageInfo.gameSize / 1024)}KB used. Some features may not save properly.`;
        this.showNotification(warningMessage, 5000, 'warning');
    },

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('active');
        }
    },

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('active');
        }
    },

    /**
     * Show new game confirmation dialog
     */
    showNewGameConfirmation() {
        // Create confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'confirmation-dialog';
        confirmDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.className = 'confirmation-content';
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #444;
            border-radius: 16px;
            padding: 2rem;
            max-width: 90%;
            width: 100%;
            max-width: 350px;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;

        dialogContent.innerHTML = `
            <h3 style="color: #d4af37; margin-bottom: 1rem; font-size: 1.25rem;">Start New Game?</h3>
            <p style="color: #e0e0e0; margin-bottom: 2rem; line-height: 1.4;">
                Are you sure you want to start a new game? This will reset all your progress and cannot be undone.
            </p>
            <div style="display: flex; gap: 1rem;">
                <button id="confirm-new-game" style="
                    flex: 1;
                    background: linear-gradient(135deg, #cc3333 0%, #aa2222 100%);
                    border: 2px solid #ff4444;
                    color: #ffffff;
                    padding: 0.75rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Yes, Start New Game</button>
                <button id="cancel-new-game" style="
                    flex: 1;
                    background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
                    border: 2px solid #555;
                    color: #e0e0e0;
                    padding: 0.75rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Cancel</button>
            </div>
        `;

        confirmDialog.appendChild(dialogContent);
        document.body.appendChild(confirmDialog);

        // Add hover effects
        const confirmBtn = confirmDialog.querySelector('#confirm-new-game');
        const cancelBtn = confirmDialog.querySelector('#cancel-new-game');

        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'translateY(-2px)';
            confirmBtn.style.boxShadow = '0 4px 8px rgba(255, 68, 68, 0.3)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = 'none';
        });

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.borderColor = '#d4af37';
            cancelBtn.style.background = 'linear-gradient(135deg, #4a4a3a 0%, #3a3a2a 100%)';
            cancelBtn.style.transform = 'translateY(-2px)';
            cancelBtn.style.boxShadow = '0 4px 8px rgba(212, 175, 55, 0.2)';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.borderColor = '#555';
            cancelBtn.style.background = 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)';
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.boxShadow = 'none';
        });

        // Handle button clicks
        confirmBtn.addEventListener('click', () => {
            this.confirmNewGame();
            document.body.removeChild(confirmDialog);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(confirmDialog);
        });

        // Close on outside click
        confirmDialog.addEventListener('click', (e) => {
            if (e.target === confirmDialog) {
                document.body.removeChild(confirmDialog);
            }
        });
    },

    /**
     * Confirm and start new game
     */
    confirmNewGame() {
        if (typeof GameState !== 'undefined') {
            GameState.newGame();
            this.showNotification('New game started!', 2000, 'success');
        }
        this.closeMenu();
    }
};

// Add CSS for notifications and save indicators
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }

    @keyframes saveIndicatorFade {
        0% {
            opacity: 0;
            transform: translateX(20px);
        }
        20% {
            opacity: 1;
            transform: translateX(0);
        }
        80% {
            opacity: 1;
            transform: translateX(0);
        }
        100% {
            opacity: 0;
            transform: translateX(20px);
        }
    }

    .touching {
        transform: scale(0.95) !important;
        transition: transform 0.1s ease !important;
    }

    .save-icon {
        margin-right: 0.25rem;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;
document.head.appendChild(notificationStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
