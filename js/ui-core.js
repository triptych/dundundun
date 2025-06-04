// Dun Dun Dungeon - Core UI Management
// Handles DOM element caching, initialization, and basic UI operations

/**
 * Core UI Manager for basic operations and DOM management
 */
const UICore = {
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
     * Initialize the core UI system
     */
    init() {
        console.log('Initializing Core UI system...');

        // Cache DOM elements
        this.cacheElements();

        // Set up basic event listeners
        this.setupCoreEventListeners();

        // Subscribe to game state changes
        this.setupGameStateListeners();

        // Initialize panels
        this.initializePanels();

        console.log('Core UI system initialized');
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
            // Player combat info
            playerCombatHpFill: document.getElementById('player-combat-hp-fill'),
            playerCombatHpText: document.getElementById('player-combat-hp-text'),
            combatAttackPower: document.getElementById('combat-attack-power'),
            combatCritChance: document.getElementById('combat-crit-chance'),
            combatBuffs: document.getElementById('combat-buffs'),

            // Enemy combat info
            enemyName: document.getElementById('enemy-name'),
            enemyHpFill: document.getElementById('enemy-hp-fill'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            combatLog: document.getElementById('combat-log'),
            attackBtn: document.getElementById('attack-btn'),
            heavyAttackBtn: document.getElementById('heavy-attack-btn'),
            blockBtn: document.getElementById('block-btn'),
            itemBtn: document.getElementById('item-btn'),
            escapeBtn: document.getElementById('escape-btn'),

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
     * Set up core event listeners
     */
    setupCoreEventListeners() {
        // Movement buttons
        this.elements.moveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.handleMovement(direction);
            });
        });

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
            GameState.on('dungeonUpdate', (dungeon) => this.updateDungeonUI(dungeon));
        }
    },

    /**
     * Initialize panels and UI components
     */
    initializePanels() {
        // Set up initial UI state
        this.switchScreen('loading');
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
                if (typeof UINavigation !== 'undefined') {
                    UINavigation.switchTab('game');
                }
                break;
            case 'screenChange':
                this.switchScreen(data.to);
                break;
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
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UICore;
} else if (typeof window !== 'undefined') {
    window.UICore = UICore;
}
