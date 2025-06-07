// Dun Dun Dungeon - Local Storage Management
// Handles saving and loading game data to/from browser localStorage

/**
 * Storage manager for handling game data persistence
 */
const Storage = {
    // Storage key prefix to avoid conflicts with other applications
    PREFIX: 'pocket_dungeon_',

    // Current save data version for migration purposes
    SAVE_VERSION: '1.0.0',

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @returns {boolean} True if save was successful
     */
    save(key, data) {
        try {
            const saveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                data: data
            };
            const serialized = JSON.stringify(saveData);
            localStorage.setItem(this.PREFIX + key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Loaded data or default value
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            if (!item) return defaultValue;

            const saveData = JSON.parse(item);

            // Check if save data needs migration
            if (saveData.version !== this.SAVE_VERSION) {
                console.warn('Save data version mismatch, attempting migration...');
                return this.migrateSaveData(saveData, defaultValue);
            }

            return saveData.data;
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if removal was successful
     */
    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    },

    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if key exists
     */
    exists(key) {
        return localStorage.getItem(this.PREFIX + key) !== null;
    },

    /**
     * Clear all game data from localStorage
     * @returns {boolean} True if clear was successful
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    },

    /**
     * Get all game storage keys
     * @returns {Array<string>} Array of storage keys
     */
    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(this.PREFIX))
            .map(key => key.substring(this.PREFIX.length));
    },

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            const totalKeys = Object.keys(localStorage).length;
            const gameKeys = this.getAllKeys();
            let totalSize = 0;
            let gameSize = 0;

            // Calculate total localStorage size
            for (let key in localStorage) {
                totalSize += localStorage[key].length;
                if (key.startsWith(this.PREFIX)) {
                    gameSize += localStorage[key].length;
                }
            }

            return {
                totalKeys,
                gameKeys: gameKeys.length,
                totalSize,
                gameSize,
                availableSpace: this.getAvailableSpace()
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    },

    /**
     * Estimate available localStorage space
     * @returns {number} Estimated available space in characters
     */
    getAvailableSpace() {
        try {
            const testKey = this.PREFIX + 'space_test';
            let size = 0;
            const increment = 1024; // 1KB chunks
            const maxAttempts = 10000; // Prevent infinite loop
            let attempts = 0;

            // Binary search for available space
            let low = 0;
            let high = 10 * 1024 * 1024; // Start with 10MB estimate
            let result = 0;

            while (low <= high && attempts < maxAttempts) {
                attempts++;
                const mid = Math.floor((low + high) / 2);
                const testData = 'x'.repeat(mid);

                try {
                    localStorage.setItem(testKey, testData);
                    localStorage.removeItem(testKey);
                    result = mid;
                    low = mid + 1;
                } catch {
                    high = mid - 1;
                }
            }

            return result;
        } catch (error) {
            console.error('Failed to get available space:', error);
            return 0;
        }
    },

    /**
     * Migrate save data from older versions
     * @param {Object} saveData - Old save data
     * @param {*} defaultValue - Default value to return if migration fails
     * @returns {*} Migrated data or default value
     */
    migrateSaveData(saveData, defaultValue) {
        try {
            // Future migration logic would go here
            // For now, just return the data as-is
            console.log('Migration not needed or failed, using existing data');
            return saveData.data || defaultValue;
        } catch (error) {
            console.error('Migration failed:', error);
            return defaultValue;
        }
    },

    /**
     * Export all game data for backup
     * @returns {Object|null} Exported game data
     */
    exportGameData() {
        try {
            const gameData = {};
            const keys = this.getAllKeys();

            keys.forEach(key => {
                const fullKey = this.PREFIX + key;
                const item = localStorage.getItem(fullKey);
                if (item) {
                    gameData[key] = JSON.parse(item);
                }
            });

            return {
                exportDate: new Date().toISOString(),
                version: this.SAVE_VERSION,
                data: gameData
            };
        } catch (error) {
            console.error('Failed to export game data:', error);
            return null;
        }
    },

    /**
     * Import game data from backup
     * @param {Object} importData - Data to import
     * @returns {boolean} True if import was successful
     */
    importGameData(importData) {
        try {
            if (!importData || !importData.data) {
                throw new Error('Invalid import data format');
            }

            // Clear existing game data
            this.clearAll();

            // Import new data
            Object.keys(importData.data).forEach(key => {
                const saveData = importData.data[key];
                const serialized = JSON.stringify(saveData);
                localStorage.setItem(this.PREFIX + key, serialized);
            });

            return true;
        } catch (error) {
            console.error('Failed to import game data:', error);
            return false;
        }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is supported
     */
    isAvailable() {
        try {
            const test = 'localStorage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Game-specific save functions
     */
    Game: {
        /**
         * Save complete game state
         * @param {Object} gameState - Current game state
         * @returns {boolean} Success status
         */
        saveState(gameState) {
            return Storage.save('game_state', gameState);
        },

        /**
         * Load complete game state
         * @returns {Object|null} Game state or null
         */
        loadState() {
            return Storage.load('game_state', null);
        },

        /**
         * Save player data
         * @param {Object} playerData - Player information
         * @returns {boolean} Success status
         */
        savePlayer(playerData) {
            return Storage.save('player', playerData);
        },

        /**
         * Load player data
         * @returns {Object|null} Player data or null
         */
        loadPlayer() {
            return Storage.load('player', null);
        },

        /**
         * Save game settings
         * @param {Object} settings - Game settings
         * @returns {boolean} Success status
         */
        saveSettings(settings) {
            return Storage.save('settings', settings);
        },

        /**
         * Load game settings
         * @returns {Object} Game settings with defaults
         */
        loadSettings() {
            return Storage.load('settings', {
                soundEnabled: true,
                musicEnabled: true,
                vibrationEnabled: true,
                autoSave: true,
                difficulty: 'normal',
                showTutorial: true
            });
        },

        /**
         * Save progress statistics
         * @param {Object} stats - Progress statistics
         * @returns {boolean} Success status
         */
        saveStats(stats) {
            return Storage.save('statistics', stats);
        },

        /**
         * Load progress statistics
         * @returns {Object} Statistics with defaults
         */
        loadStats() {
            return Storage.load('statistics', {
                gamesPlayed: 0,
                totalPlayTime: 0,
                highestFloor: 0,
                monstersDefeated: 0,
                itemsFound: 0,
                deathCount: 0,
                achievements: []
            });
        },

        /**
         * Save skill tree data
         * @param {Object} skillData - Skill tree progress
         * @returns {boolean} Success status
         */
        saveSkills(skillData) {
            return Storage.save('skills', skillData);
        },

        /**
         * Load skill tree data
         * @returns {Object|null} Skill data or null
         */
        loadSkills() {
            return Storage.load('skills', null);
        },

        /**
         * Save quest data
         * @param {Object} questData - Quest progress and completed quests
         * @returns {boolean} Success status
         */
        saveQuests(questData) {
            return Storage.save('quests', questData);
        },

        /**
         * Load quest data
         * @returns {Object} Quest data with defaults
         */
        loadQuests() {
            return Storage.load('quests', {
                activeQuests: [],
                completedQuests: [],
                questProgress: {}
            });
        }
    }
};

// Initialize storage availability check
Storage.available = Storage.isAvailable();

if (!Storage.available) {
    console.warn('localStorage is not available. Game progress will not be saved.');
}

// Export for ES6 modules
export default Storage;
