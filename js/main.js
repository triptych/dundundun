// Main entry point for Pocket Dungeon game
// Imports all modules and initializes the game

// Core game modules
import Utils from './utils.js';
import Storage from './storage.js';
import EquipmentSystem from './equipment-system.js';
import Items from './items.js';
import LootSystem from './loot-system.js';
import GameState, { RoomTypes, Room, DungeonGrid } from './game-state.js';
import Movement from './movement.js';
import Rooms from './rooms.js';
import Store from './store.js';

// UI modules
import UICore from './ui-core.js';
import UINavigation from './ui-navigation.js';
import UICombat from './ui-combat.js';
import UIInventory from './ui-inventory.js';
import UINotifications from './ui-notifications.js';
import UIPlayer from './ui-player.js';
import UI from './ui-main.js';

// Advanced systems
import InventorySystem from './inventory-system.js';
import EquipmentIntegration from './equipment-integration.js';
import EquipmentUpgrade from './equipment-upgrade.js';

// Other game systems
import Rendering from './rendering.js';
import Animation from './animation.js';
import Combat from './combat.js';
import CharacterProgression from './character-progression.js';
import SaveSystem from './save-system.js';
import Game from './game.js';

// Make core modules globally available for compatibility
window.Utils = Utils;
window.Storage = Storage;
window.EquipmentSystem = EquipmentSystem;
window.Items = Items;
window.LootSystem = LootSystem;
window.GameState = GameState;
window.RoomTypes = RoomTypes;
window.Room = Room;
window.DungeonGrid = DungeonGrid;
window.Movement = Movement;
window.Rooms = Rooms;
window.Store = Store;

// Make UI modules globally available for compatibility
window.UICore = UICore;
window.UINavigation = UINavigation;
window.UICombat = UICombat;
window.UIInventory = UIInventory;
window.UINotifications = UINotifications;
window.UIPlayer = UIPlayer;
window.UI = UI;

// Make advanced systems globally available for compatibility
window.InventorySystem = InventorySystem;
window.EquipmentIntegration = EquipmentIntegration;
window.EquipmentUpgrade = EquipmentUpgrade;

// Make other game systems globally available for compatibility
window.Rendering = Rendering;
window.Animation = Animation;
window.Combat = Combat;
window.CharacterProgression = CharacterProgression;
window.SaveSystem = SaveSystem;
window.Game = Game;

console.log('All modules loaded and available globally');

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
