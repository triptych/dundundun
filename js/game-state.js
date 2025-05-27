// Pocket Dungeon - Game State Management
// Centralized state management for the entire game

/**
 * Game state manager that handles all game data and state transitions
 */
const GameState = {
    // Current game state
    current: {
        screen: 'loading', // loading, game, menu, inventory, character, skills, combat
        isInitialized: false,
        isPaused: false,
        isGameActive: false
    },

    // Player state
    player: {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        strength: 10,
        agility: 10,
        vitality: 10,
        availablePoints: 0,
        x: 0, // Grid position
        y: 0, // Grid position
        floor: 1,
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        }
    },

    // Dungeon state
    dungeon: {
        currentFloor: 1,
        rooms: [],
        playerPosition: { x: 0, y: 0 },
        exploredRooms: [],
        currentRoom: null,
        theme: 'crypt' // crypt, cave, forest
    },

    // Inventory state
    inventory: {
        items: [],
        maxSlots: 20,
        gold: 0
    },

    // Combat state
    combat: {
        isActive: false,
        enemy: null,
        playerTurn: true,
        cooldowns: {
            heavyAttack: 0,
            block: 0
        },
        lastAction: null,
        log: []
    },

    // Game settings
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        autoSave: true,
        difficulty: 'normal',
        showTutorial: true
    },

    // Statistics
    stats: {
        gamesPlayed: 0,
        totalPlayTime: 0,
        sessionStartTime: null,
        highestFloor: 0,
        monstersDefeated: 0,
        itemsFound: 0,
        deathCount: 0,
        achievements: []
    },

    // Event listeners for state changes
    listeners: {
        stateChange: [],
        playerUpdate: [],
        inventoryUpdate: [],
        combatUpdate: [],
        dungeonUpdate: []
    },

    /**
     * Initialize the game state
     */
    init() {
        console.log('Initializing game state...');

        // Load saved data
        this.loadGameData();

        // Set session start time
        this.stats.sessionStartTime = Date.now();

        // Mark as initialized
        this.current.isInitialized = true;

        this.emit('stateChange', { type: 'init', state: this.current });
    },

    /**
     * Start a new game
     */
    newGame() {
        console.log('Starting new game...');

        // Reset player to defaults
        this.player = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            health: 100,
            maxHealth: 100,
            strength: 10,
            agility: 10,
            vitality: 10,
            availablePoints: 0,
            x: 0,
            y: 0,
            floor: 1,
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            }
        };

        // Reset dungeon
        this.dungeon = {
            currentFloor: 1,
            rooms: [],
            playerPosition: { x: 0, y: 0 },
            exploredRooms: [],
            currentRoom: null,
            theme: 'crypt'
        };

        // Reset inventory
        this.inventory = {
            items: [],
            maxSlots: 20,
            gold: 0
        };

        // Reset combat
        this.combat = {
            isActive: false,
            enemy: null,
            playerTurn: true,
            cooldowns: {
                heavyAttack: 0,
                block: 0
            },
            lastAction: null,
            log: []
        };

        // Update stats
        this.stats.gamesPlayed++;
        this.stats.sessionStartTime = Date.now();

        // Set game as active
        this.current.isGameActive = true;
        this.current.screen = 'game';

        this.emit('stateChange', { type: 'newGame', state: this.current });
        this.emit('playerUpdate', this.player);
        this.emit('inventoryUpdate', this.inventory);
        this.emit('dungeonUpdate', this.dungeon);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Switch to a different screen
     * @param {string} screenName - Name of the screen to switch to
     */
    switchScreen(screenName) {
        const previousScreen = this.current.screen;
        this.current.screen = screenName;

        this.emit('stateChange', {
            type: 'screenChange',
            from: previousScreen,
            to: screenName,
            state: this.current
        });
    },

    /**
     * Pause/unpause the game
     * @param {boolean} paused - Whether to pause or unpause
     */
    setPaused(paused) {
        this.current.isPaused = paused;
        this.emit('stateChange', { type: 'pause', paused, state: this.current });
    },

    /**
     * Update player stats
     * @param {Object} updates - Object containing stat updates
     */
    updatePlayer(updates) {
        Object.assign(this.player, updates);

        // Clamp health to max health
        if (this.player.health > this.player.maxHealth) {
            this.player.health = this.player.maxHealth;
        }

        this.emit('playerUpdate', this.player);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Add experience points to player
     * @param {number} exp - Experience points to add
     */
    addExperience(exp) {
        this.player.experience += exp;

        // Check for level up
        while (this.player.experience >= this.player.experienceToNext) {
            this.levelUp();
        }

        this.emit('playerUpdate', this.player);
    },

    /**
     * Handle player level up
     */
    levelUp() {
        this.player.experience -= this.player.experienceToNext;
        this.player.level++;
        this.player.availablePoints += 3; // 3 attribute points per level

        // Increase health and experience requirement
        const healthIncrease = 5 + this.player.vitality * 2;
        this.player.maxHealth += healthIncrease;
        this.player.health = this.player.maxHealth; // Full heal on level up

        this.player.experienceToNext = Math.floor(this.player.experienceToNext * 1.2);

        this.emit('playerUpdate', this.player);
        this.emit('stateChange', { type: 'levelUp', level: this.player.level });
    },

    /**
     * Update inventory
     * @param {Object} updates - Inventory updates
     */
    updateInventory(updates) {
        Object.assign(this.inventory, updates);
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Add item to inventory
     * @param {Object} item - Item to add
     * @returns {boolean} True if item was added successfully
     */
    addItem(item) {
        if (this.inventory.items.length >= this.inventory.maxSlots) {
            return false; // Inventory full
        }

        this.inventory.items.push(item);
        this.stats.itemsFound++;
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        return true;
    },

    /**
     * Remove item from inventory
     * @param {number} index - Index of item to remove
     * @returns {Object|null} Removed item or null
     */
    removeItem(index) {
        if (index < 0 || index >= this.inventory.items.length) {
            return null;
        }

        const item = this.inventory.items.splice(index, 1)[0];
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        return item;
    },

    /**
     * Start combat with an enemy
     * @param {Object} enemy - Enemy to fight
     */
    startCombat(enemy) {
        this.combat.isActive = true;
        this.combat.enemy = enemy;
        this.combat.playerTurn = true;
        this.combat.log = ['Combat started!'];

        this.switchScreen('combat');
        this.emit('combatUpdate', this.combat);
    },

    /**
     * End combat
     * @param {boolean} playerWon - Whether the player won
     */
    endCombat(playerWon) {
        if (playerWon) {
            // Give experience and loot
            this.addExperience(this.combat.enemy.experience || 10);
            this.stats.monstersDefeated++;
        } else {
            // Handle player death
            this.stats.deathCount++;
        }

        this.combat.isActive = false;
        this.combat.enemy = null;
        this.combat.log = [];

        this.switchScreen('game');
        this.emit('combatUpdate', this.combat);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Update dungeon state
     * @param {Object} updates - Dungeon updates
     */
    updateDungeon(updates) {
        Object.assign(this.dungeon, updates);

        // Update highest floor stat
        if (this.dungeon.currentFloor > this.stats.highestFloor) {
            this.stats.highestFloor = this.dungeon.currentFloor;
        }

        this.emit('dungeonUpdate', this.dungeon);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Update game settings
     * @param {Object} updates - Settings updates
     */
    updateSettings(updates) {
        Object.assign(this.settings, updates);

        // Save settings immediately
        if (typeof Storage !== 'undefined' && Storage.available) {
            Storage.Game.saveSettings(this.settings);
        }

        this.emit('stateChange', { type: 'settingsUpdate', settings: this.settings });
    },

    /**
     * Save all game data to localStorage
     */
    saveGameData() {
        if (typeof Storage === 'undefined' || !Storage.available) {
            console.warn('Cannot save game data: localStorage not available');
            return false;
        }

        try {
            // Calculate total play time
            if (this.stats.sessionStartTime) {
                const sessionTime = Date.now() - this.stats.sessionStartTime;
                this.stats.totalPlayTime += sessionTime;
                this.stats.sessionStartTime = Date.now(); // Reset for next session
            }

            // Save all game state
            const gameState = {
                player: this.player,
                dungeon: this.dungeon,
                inventory: this.inventory,
                combat: this.combat,
                current: this.current
            };

            Storage.Game.saveState(gameState);
            Storage.Game.saveSettings(this.settings);
            Storage.Game.saveStats(this.stats);

            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    },

    /**
     * Load all game data from localStorage
     */
    loadGameData() {
        if (typeof Storage === 'undefined' || !Storage.available) {
            console.warn('Cannot load game data: localStorage not available');
            return false;
        }

        try {
            // Load settings first
            this.settings = Storage.Game.loadSettings();

            // Load statistics
            const savedStats = Storage.Game.loadStats();
            if (savedStats) {
                Object.assign(this.stats, savedStats);
            }

            // Load game state if it exists
            const savedState = Storage.Game.loadState();
            if (savedState) {
                if (savedState.player) Object.assign(this.player, savedState.player);
                if (savedState.dungeon) Object.assign(this.dungeon, savedState.dungeon);
                if (savedState.inventory) Object.assign(this.inventory, savedState.inventory);
                if (savedState.combat) Object.assign(this.combat, savedState.combat);
                if (savedState.current) Object.assign(this.current, savedState.current);

                this.current.isGameActive = true;
            }

            return true;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return false;
        }
    },

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    },

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    },

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    },

    /**
     * Get current game statistics
     * @returns {Object} Current game stats
     */
    getStats() {
        // Update session time
        if (this.stats.sessionStartTime) {
            const sessionTime = Date.now() - this.stats.sessionStartTime;
            return {
                ...this.stats,
                currentSessionTime: sessionTime,
                totalPlayTime: this.stats.totalPlayTime + sessionTime
            };
        }
        return this.stats;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
