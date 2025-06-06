// Dun Dun Dungeon - Navigation UI Management
// Handles screen switching, tab navigation, and menu management

/**
 * Navigation UI Manager for tabs, menus, and screen transitions
 */
const UINavigation = {
    /**
     * Initialize navigation UI
     */
    init() {
        console.log('Initializing Navigation UI...');
        this.setupEventListeners();
        console.log('Navigation UI initialized');
    },

    /**
     * Set up navigation event listeners
     */
    setupEventListeners() {
        // Menu button
        if (UICore.elements.menuBtn) {
            UICore.elements.menuBtn.addEventListener('click', () => this.toggleMenu());
        }

        // Navigation buttons
        UICore.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Menu options
        if (UICore.elements.newGameBtn) {
            UICore.elements.newGameBtn.addEventListener('click', () => this.showNewGameConfirmation());
        }
        if (UICore.elements.saveGameBtn) {
            UICore.elements.saveGameBtn.addEventListener('click', () => this.saveGame());
        }
        if (UICore.elements.loadGameBtn) {
            UICore.elements.loadGameBtn.addEventListener('click', () => this.loadGame());
        }
        if (UICore.elements.settingsBtn) {
            UICore.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (UICore.elements.helpBtn) {
            UICore.elements.helpBtn.addEventListener('click', () => this.showHelp());
        }
        if (UICore.elements.closeMenuBtn) {
            console.log('Setting up close menu button listener');
            UICore.elements.closeMenuBtn.addEventListener('click', (e) => {
                console.log('Close menu button clicked', e);
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
            });
        } else {
            console.warn('Close menu button not found');
        }
    },

    /**
     * Switch between bottom navigation tabs
     * @param {string} tabName - Name of tab to activate
     */
    switchTab(tabName) {
        // Update navigation button states
        UICore.elements.navBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hide all panels
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => panel.classList.remove('active'));

        // Get action panel element
        const actionPanel = document.querySelector('.action-panel');

        // Show target panel if not game tab
        if (tabName !== 'game') {
            const targetPanel = document.getElementById(`${tabName}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                UICore.activePanel = tabName;
            }
            // Hide action panel when other tabs are active
            if (actionPanel) {
                actionPanel.style.display = 'none';
            }
        } else {
            UICore.activePanel = null;
            // Show action panel when game tab is active
            if (actionPanel) {
                actionPanel.style.display = 'block';
            }
        }
    },

    /**
     * Toggle menu visibility
     */
    toggleMenu() {
        const menuScreen = UICore.elements.menuScreen;
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
        const menuScreen = UICore.elements.menuScreen;
        if (menuScreen) {
            console.log('Menu screen found, current classes:', menuScreen.className);
            menuScreen.classList.remove('active');
            console.log('Menu closed, new classes:', menuScreen.className);
        } else {
            console.error('Menu screen not found in closeMenu()');
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
            if (typeof UINotifications !== 'undefined') {
                UINotifications.showNotification(success ? 'Game saved!' : 'Failed to save game', 2000, success ? 'success' : 'error');
            }
        }
        this.closeMenu();
    },

    /**
     * Load game action
     */
    loadGame() {
        if (typeof GameState !== 'undefined') {
            const success = GameState.loadGameData();
            if (typeof UINotifications !== 'undefined') {
                UINotifications.showNotification(success ? 'Game loaded!' : 'Failed to load game', 2000, success ? 'success' : 'error');
            }
        }
        this.closeMenu();
    },

    /**
     * Show settings (placeholder)
     */
    showSettings() {
        if (typeof UINotifications !== 'undefined') {
            UINotifications.showNotification('Settings coming soon!');
        }
        this.closeMenu();
    },

    /**
     * Show help (placeholder)
     */
    showHelp() {
        if (typeof UINotifications !== 'undefined') {
            UINotifications.showNotification('Help coming soon!');
        }
        this.closeMenu();
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
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #d4af37;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            color: #e0e0e0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            max-width: 400px;
        `;

        dialogContent.innerHTML = `
            <h2 style="margin: 0 0 1rem 0; color: #d4af37;">Start New Game?</h2>
            <p style="margin: 0 0 2rem 0; line-height: 1.4;">This will overwrite your current save data. Are you sure you want to continue?</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="confirm-new-game" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #d4af37;
                    border-radius: 6px;
                    background: #d4af37;
                    color: #1a1a1a;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Yes, Start New Game</button>
                <button id="cancel-new-game" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #666;
                    border-radius: 6px;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Cancel</button>
            </div>
        `;

        confirmDialog.appendChild(dialogContent);
        document.body.appendChild(confirmDialog);

        // Add event listeners
        const confirmBtn = confirmDialog.querySelector('#confirm-new-game');
        const cancelBtn = confirmDialog.querySelector('#cancel-new-game');

        confirmBtn.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && Game.newGame) {
                Game.newGame();
            } else if (typeof GameState !== 'undefined') {
                GameState.newGame();

            }
            document.body.removeChild(confirmDialog);
            this.closeMenu();
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
    }
};

// Export for ES6 modules
export default UINavigation;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.UINavigation = UINavigation;
}
