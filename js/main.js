// Main entry point for Pocket Dungeon game
// Imports all modules and initializes the game

import Utils from './utils.js';
import Storage from './storage.js';
import EquipmentSystem from './equipment-system.js';
import Items from './items.js';
import LootSystem from './loot-system.js';

// Make modules globally available for compatibility
window.Utils = Utils;
window.Storage = Storage;
window.EquipmentSystem = EquipmentSystem;
window.Items = Items;
window.LootSystem = LootSystem;

// UI legacy compatibility layer
console.log('UI legacy compatibility layer loaded');

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Dun Dun Dungeon...');

    // Initialize game systems in the correct order
    try {
        // Storage and utilities are already available

        // Game will be initialized by existing scripts
        console.log('Main modules loaded successfully');
    } catch (error) {
        console.error('Failed to initialize game modules:', error);
    }
});

// Export main modules for other scripts
export {
    Utils,
    Storage,
    EquipmentSystem,
    Items,
    LootSystem
};
