// Dun Dun Dungeon - User Interface Management (Legacy Compatibility Layer)
// This file provides backward compatibility while using the new modular UI system

// Import all UI modules (they register themselves globally)
// The modules are: UICore, UINavigation, UICombat, UIInventory, UINotifications, UIPlayer

// Re-export the main UI object for backward compatibility
// The UI object is now defined in ui-main.js and coordinates all modules

// This file exists primarily for backward compatibility
// New code should use the modular UI system directly

console.log('UI legacy compatibility layer loaded');

// Ensure UI is available globally (it should be loaded from ui-main.js)
if (typeof UI === 'undefined') {
    console.error('UI main module not loaded! Make sure ui-main.js is included before ui.js');
}
