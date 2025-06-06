// Save System - Auto-save and manual save functionality
const SaveSystem = {
    // Auto-save configuration
    autoSaveTimer: 0,
    autoSaveInterval: 30000, // 30 seconds

    /**
     * Handle auto-save functionality
     * @param {number} deltaTime - Time since last frame
     */
    handleAutoSave(deltaTime) {
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

                return true;
            } else {
                this.handleSaveError('manual save');
                return false;
            }
        } catch (error) {
            console.error('Manual save error:', error);
            this.handleSaveError('manual save', error);
            return false;
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
            // Get storage info if Storage module is available
            if (typeof Storage !== 'undefined' && Storage.getStorageInfo) {
                const storageInfo = Storage.getStorageInfo();

                if (storageInfo && storageInfo.gameSize > 0) {
                    // Show warning to user
                    if (typeof UI !== 'undefined' && UI.showNotification) {
                        UI.showNotification('Storage full! Some older saves may be removed.', 5000, 'warning');
                    }

                    // Cleanup old save data if possible
                    this.cleanupOldSaves();
                }
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

            // Example cleanup operations:
            // 1. Remove old backup saves
            // 2. Clear cached data
            // 3. Compress save data

            console.log('Storage cleanup completed');

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Storage cleanup completed', 2000, 'info');
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    },

    /**
     * Check for saved game on startup
     * @param {Function} onNewGame - Callback for starting new game
     * @param {Function} onContinueGame - Callback for continuing saved game
     */
    checkSavedGame(onNewGame = null, onContinueGame = null) {
        try {
            if (GameState.current.isGameActive) {
                console.log('Continuing saved game');

                if (onContinueGame) {
                    onContinueGame();
                } else {
                    // Default behavior - switch to game screen
                    GameState.switchScreen('game');
                }
            } else {
                console.log('No saved game found');

                if (onNewGame) {
                    // Show tutorial or main menu
                    setTimeout(() => {
                        onNewGame();
                    }, 1000);
                } else {
                    // Default behavior - start new game after delay
                    setTimeout(() => {
                        GameState.newGame();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error checking saved game:', error);

            // Fallback to new game
            if (onNewGame) {
                onNewGame();
            } else {
                GameState.newGame();
            }
        }
    },

    /**
     * Create a backup save
     * @returns {boolean} True if backup was created successfully
     */
    createBackup() {
        try {
            const gameData = GameState.getGameData();
            const backupKey = `pocket_dungeon_backup_${Date.now()}`;

            localStorage.setItem(backupKey, JSON.stringify(gameData));
            console.log('Backup save created:', backupKey);

            // Clean up old backups (keep only last 3)
            this.cleanupOldBackups();

            return true;
        } catch (error) {
            console.error('Failed to create backup:', error);
            return false;
        }
    },

    /**
     * Clean up old backup saves
     */
    cleanupOldBackups() {
        try {
            const backupKeys = [];

            // Find all backup keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pocket_dungeon_backup_')) {
                    backupKeys.push({
                        key: key,
                        timestamp: parseInt(key.split('_').pop())
                    });
                }
            }

            // Sort by timestamp (newest first)
            backupKeys.sort((a, b) => b.timestamp - a.timestamp);

            // Remove old backups (keep only 3 most recent)
            if (backupKeys.length > 3) {
                for (let i = 3; i < backupKeys.length; i++) {
                    localStorage.removeItem(backupKeys[i].key);
                    console.log('Removed old backup:', backupKeys[i].key);
                }
            }
        } catch (error) {
            console.error('Failed to cleanup old backups:', error);
        }
    },

    /**
     * Restore from backup save
     * @param {string} backupKey - Key of backup to restore
     * @returns {boolean} True if restore was successful
     */
    restoreFromBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                console.error('Backup not found:', backupKey);
                return false;
            }

            const gameData = JSON.parse(backupData);
            const restoreSuccess = GameState.loadGameData(gameData);

            if (restoreSuccess) {
                console.log('Successfully restored from backup:', backupKey);

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Game restored from backup!', 2000, 'success');
                }

                return true;
            } else {
                console.error('Failed to load backup data');
                return false;
            }
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    },

    /**
     * Get list of available backups
     * @returns {Array} Array of backup info objects
     */
    getAvailableBackups() {
        const backups = [];

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pocket_dungeon_backup_')) {
                    const timestamp = parseInt(key.split('_').pop());
                    const date = new Date(timestamp);

                    backups.push({
                        key: key,
                        timestamp: timestamp,
                        date: date.toLocaleString(),
                        age: Date.now() - timestamp
                    });
                }
            }

            // Sort by timestamp (newest first)
            backups.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Failed to get backup list:', error);
        }

        return backups;
    },

    /**
     * Export save data as downloadable file
     * @returns {boolean} True if export was successful
     */
    exportSaveData() {
        try {
            const gameData = GameState.getGameData();
            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pocket_dungeon_save_${new Date().toISOString().split('T')[0]}.json`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL
            URL.revokeObjectURL(url);

            console.log('Save data exported successfully');

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Save data exported!', 2000, 'success');
            }

            return true;
        } catch (error) {
            console.error('Failed to export save data:', error);

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Export failed!', 2000, 'error');
            }

            return false;
        }
    },

    /**
     * Import save data from file
     * @param {File} file - File object containing save data
     * @returns {Promise<boolean>} Promise that resolves to true if import was successful
     */
    async importSaveData(file) {
        try {
            const text = await file.text();
            const gameData = JSON.parse(text);

            // Create backup before importing
            this.createBackup();

            const loadSuccess = GameState.loadGameData(gameData);

            if (loadSuccess) {
                console.log('Save data imported successfully');

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Save data imported!', 2000, 'success');
                }

                return true;
            } else {
                console.error('Failed to load imported data');

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Import failed - invalid data!', 2000, 'error');
                }

                return false;
            }
        } catch (error) {
            console.error('Failed to import save data:', error);

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Import failed!', 2000, 'error');
            }

            return false;
        }
    },

    /**
     * Reset auto-save timer
     */
    resetAutoSaveTimer() {
        this.autoSaveTimer = 0;
    },

    /**
     * Set auto-save interval
     * @param {number} interval - Interval in milliseconds
     */
    setAutoSaveInterval(interval) {
        this.autoSaveInterval = Math.max(10000, interval); // Minimum 10 seconds
        console.log(`Auto-save interval set to ${this.autoSaveInterval}ms`);
    }
};

// Export for ES6 modules
export default SaveSystem;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.SaveSystem = SaveSystem;
}
