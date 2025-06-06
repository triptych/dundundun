// Dun Dun Dungeon - Main UI Module
// Coordinates all UI sub-modules and provides unified interface

/**
 * Main UI Manager that coordinates all sub-modules
 */
const UI = {
    // Modules
    modules: {},

    // Module initialization status
    initialized: false,

    /**
     * Initialize the entire UI system
     */
    init() {
        console.log('Initializing Main UI system...');

        // Store references to all UI modules
        this.modules = {
            core: UICore,
            navigation: UINavigation,
            combat: UICombat,
            inventory: UIInventory,
            notifications: UINotifications,
            player: UIPlayer
        };

        // Initialize all modules in dependency order
        try {
            // Core module must be initialized first (handles DOM caching)
            this.modules.core.init();

            // Initialize other modules
            this.modules.notifications.init();
            this.modules.navigation.init();
            this.modules.combat.init();
            this.modules.inventory.init();
            this.modules.player.init();

            this.initialized = true;
            console.log('Main UI system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize UI system:', error);
            this.initialized = false;
        }
    },

    /**
     * Check if UI system is ready
     * @returns {boolean} True if all modules are initialized
     */
    isReady() {
        return this.initialized;
    },

    /**
     * Get a specific UI module
     * @param {string} moduleName - Name of the module (core, navigation, combat, etc.)
     * @returns {Object|null} The requested module or null if not found
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    },

    // Expose frequently used methods for backward compatibility

    /**
     * Switch between main screens
     * @param {string} screenName - Name of screen to show
     */
    switchScreen(screenName) {
        if (this.modules.core) {
            this.modules.core.switchScreen(screenName);
        }
    },

    /**
     * Switch between navigation tabs
     * @param {string} tabName - Name of tab to activate
     */
    switchTab(tabName) {
        if (this.modules.navigation) {
            this.modules.navigation.switchTab(tabName);
        }
    },

    /**
     * Toggle menu visibility
     */
    toggleMenu() {
        if (this.modules.navigation) {
            this.modules.navigation.toggleMenu();
        }
    },

    /**
     * Close menu
     */
    closeMenu() {
        if (this.modules.navigation) {
            this.modules.navigation.closeMenu();
        }
    },

    /**
     * Show notification
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     * @param {string} type - Type of notification
     */
    showNotification(message, duration = 2000, type = 'info') {
        if (this.modules.notifications) {
            this.modules.notifications.showNotification(message, duration, type);
        }
    },

    /**
     * Show save indicator
     */
    showSaveIndicator() {
        if (this.modules.notifications) {
            this.modules.notifications.showSaveIndicator();
        }
    },

    /**
     * Show storage warning
     * @param {Object} storageInfo - Storage information
     */
    showStorageWarning(storageInfo) {
        if (this.modules.notifications) {
            this.modules.notifications.showStorageWarning(storageInfo);
        }
    },

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.modules.core) {
            this.modules.core.hideLoadingScreen();
        }
    },

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        if (this.modules.core) {
            this.modules.core.showLoadingScreen();
        }
    },

    /**
     * Update player UI
     * @param {Object} player - Player data
     */
    updatePlayerUI(player) {
        if (this.modules.player) {
            this.modules.player.updatePlayerUI(player);
        }
    },

    /**
     * Update inventory UI
     * @param {Object} inventory - Inventory data
     */
    updateInventoryUI(inventory) {
        if (this.modules.inventory) {
            this.modules.inventory.updateInventoryUI(inventory);
        }
    },

    /**
     * Update combat UI
     * @param {Object} combat - Combat data
     */
    updateCombatUI(combat) {
        if (this.modules.combat) {
            this.modules.combat.updateCombatUI(combat);
        }
    },

    /**
     * Handle movement
     * @param {string} direction - Direction to move
     */
    handleMovement(direction) {
        if (this.modules.core) {
            this.modules.core.handleMovement(direction);
        }
    },

    /**
     * Handle combat action
     * @param {string} action - Combat action to perform
     */
    handleCombatAction(action) {
        if (this.modules.combat) {
            this.modules.combat.handleCombatAction(action);
        }
    },

    /**
     * Show new game confirmation
     */
    showNewGameConfirmation() {
        if (this.modules.navigation) {
            this.modules.navigation.showNewGameConfirmation();
        }
    },

    /**
     * Show level up effect
     * @param {number} newLevel - New player level
     */
    showLevelUp(newLevel) {
        if (this.modules.player) {
            this.modules.player.showLevelUp(newLevel);
        }
    },

    /**
     * Show equipment change effects
     * @param {Object} item - Equipment item
     * @param {boolean} equipped - Whether item was equipped
     */
    showEquipmentChange(item, equipped) {
        if (this.modules.player) {
            this.modules.player.showEquipmentChange(item, equipped);
        }
    },

    /**
     * Show stat increase notification
     * @param {string} statName - Name of the stat
     * @param {number} oldValue - Previous value
     * @param {number} newValue - New value
     */
    showStatIncrease(statName, oldValue, newValue) {
        if (this.modules.player) {
            this.modules.player.showStatIncrease(statName, oldValue, newValue);
        }
    },

    /**
     * Update equipment display
     * @param {Object} equipment - Player equipment
     */
    updateEquipmentDisplay(equipment) {
        if (this.modules.player) {
            this.modules.player.updateEquipmentDisplay(equipment);
        }
    },

    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Confirm callback
     * @param {Function} onCancel - Cancel callback
     * @param {Object} options - Dialog options
     */
    showConfirmation(title, message, onConfirm, onCancel, options) {
        if (this.modules.notifications) {
            return this.modules.notifications.showConfirmation(title, message, onConfirm, onCancel, options);
        }
    },

    /**
     * Show alert dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onOk - OK callback
     */
    showAlert(title, message, onOk) {
        if (this.modules.notifications) {
            this.modules.notifications.showAlert(title, message, onOk);
        }
    },

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message) {
        if (this.modules.notifications) {
            return this.modules.notifications.showLoading(message);
        }
    },

    /**
     * Access DOM elements (for backward compatibility)
     */
    get elements() {
        return this.modules.core ? this.modules.core.elements : {};
    },

    /**
     * Get active panel
     */
    get activePanel() {
        return this.modules.core ? this.modules.core.activePanel : null;
    },

    /**
     * Set active panel
     */
    set activePanel(panel) {
        if (this.modules.core) {
            this.modules.core.activePanel = panel;
        }
    },

    /**
     * Get animation states
     */
    get animations() {
        return this.modules.core ? this.modules.core.animations : { isTransitioning: false, queue: [] };
    },

    /**
     * Handle state changes (for backward compatibility)
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        if (this.modules.core) {
            this.modules.core.handleStateChange(data);
        }
    },

    /**
     * Generate inventory slots (for backward compatibility)
     */
    generateInventorySlots() {
        if (this.modules.inventory) {
            this.modules.inventory.generateInventorySlots();
        }
    },

    /**
     * Handle inventory slot click (for backward compatibility)
     * @param {number} slotIndex - Index of clicked slot
     */
    handleInventorySlotClick(slotIndex) {
        if (this.modules.inventory) {
            this.modules.inventory.handleInventorySlotClick(slotIndex);
        }
    },

    /**
     * Show item action menu (for backward compatibility)
     * @param {Object} item - Item to show actions for
     * @param {number} slotIndex - Inventory slot index
     */
    showItemActionMenu(item, slotIndex) {
        if (this.modules.inventory) {
            this.modules.inventory.showItemActionMenu(item, slotIndex);
        }
    },

    /**
     * Hide item action menu (for backward compatibility)
     */
    hideItemActionMenu() {
        if (this.modules.inventory) {
            this.modules.inventory.hideItemActionMenu();
        }
    },

    /**
     * Use item (for backward compatibility)
     * @param {Object} item - Item to use
     * @param {number} slotIndex - Inventory slot index
     */
    useItem(item, slotIndex) {
        if (this.modules.inventory) {
            this.modules.inventory.useItem(item, slotIndex);
        }
    },

    /**
     * Drop item (for backward compatibility)
     * @param {number} slotIndex - Inventory slot index
     */
    dropItem(slotIndex) {
        if (this.modules.inventory) {
            this.modules.inventory.dropItem(slotIndex);
        }
    },

    /**
     * Save game (for backward compatibility)
     */
    saveGame() {
        if (this.modules.navigation) {
            this.modules.navigation.saveGame();
        }
    },

    /**
     * Load game (for backward compatibility)
     */
    loadGame() {
        if (this.modules.navigation) {
            this.modules.navigation.loadGame();
        }
    },

    /**
     * Show settings (for backward compatibility)
     */
    showSettings() {
        if (this.modules.navigation) {
            this.modules.navigation.showSettings();
        }
    },

    /**
     * Show help (for backward compatibility)
     */
    showHelp() {
        if (this.modules.navigation) {
            this.modules.navigation.showHelp();
        }
    }
};

// Export for ES6 modules
export default UI;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.UI = UI;
}
