// Dun Dun Dungeon - User Interface Management (Legacy Compatibility Layer)
// This file provides backward compatibility while using the new modular UI system

// Import all UI modules
import UICore from './ui-core.js';
import UINavigation from './ui-navigation.js';
import UICombat from './ui-combat.js';
import UIInventory from './ui-inventory.js';
import UINotifications from './ui-notifications.js';
import UIPlayer from './ui-player.js';
import UI from './ui-main.js';

// Make modules globally available for compatibility
window.UICore = UICore;
window.UINavigation = UINavigation;
window.UICombat = UICombat;
window.UIInventory = UIInventory;
window.UINotifications = UINotifications;
window.UIPlayer = UIPlayer;
window.UI = UI;

console.log('UI legacy compatibility layer loaded with ES6 modules');

// Initialize UI system when this module is loaded
if (typeof UI !== 'undefined' && UI.init) {
    // UI initialization will be handled by main.js or individual modules
    console.log('UI modules are ready for initialization');
} else {
    console.error('UI main module not properly loaded!');
}

// Export for ES6 modules
export default UI;
export { UICore, UINavigation, UICombat, UIInventory, UINotifications, UIPlayer };
