// Dun Dun Dungeon - Character Progression System
// Handles experience, leveling, and attribute point allocation

/**
 * Character Progression Manager
 */
const CharacterProgression = {
    // DOM element references
    elements: {},

    /**
     * Initialize the character progression system
     */
    init() {
        console.log('Initializing Character Progression system...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Subscribe to game state changes
        this.setupGameStateListeners();

        console.log('Character Progression system initialized');
    },

    /**
     * Cache DOM elements for character progression
     */
    cacheElements() {
        this.elements = {
            // Player stats display
            headerLevel: document.getElementById('header-level'),
            playerLevel: document.getElementById('player-level'),
            playerExp: document.getElementById('player-exp'),
            expFill: document.getElementById('exp-fill'),
            playerStrength: document.getElementById('player-strength'),
            playerAgility: document.getElementById('player-agility'),
            playerVitality: document.getElementById('player-vitality'),

            // Character progression
            availablePoints: document.getElementById('available-points'),
            availablePointsDisplay: document.getElementById('available-points-display'),
            attackPower: document.getElementById('attack-power'),
            critChance: document.getElementById('crit-chance'),
            maxHealth: document.getElementById('max-health'),

            // Attribute buttons
            strIncrease: document.getElementById('str-increase'),
            strDecrease: document.getElementById('str-decrease'),
            agiIncrease: document.getElementById('agi-increase'),
            agiDecrease: document.getElementById('agi-decrease'),
            vitIncrease: document.getElementById('vit-increase'),
            vitDecrease: document.getElementById('vit-decrease'),

            // Level up overlay
            levelUpOverlay: document.getElementById('level-up-overlay'),
            newLevelDisplay: document.getElementById('new-level-display'),
            healthIncreaseDisplay: document.getElementById('health-increase'),
            levelUpContinue: document.getElementById('level-up-continue')
        };
    },

    /**
     * Set up event listeners for character progression
     */
    setupEventListeners() {
        // Attribute increase buttons
        if (this.elements.strIncrease) {
            this.elements.strIncrease.addEventListener('click', () => this.allocateAttribute('strength', 1));
        }
        if (this.elements.agiIncrease) {
            this.elements.agiIncrease.addEventListener('click', () => this.allocateAttribute('agility', 1));
        }
        if (this.elements.vitIncrease) {
            this.elements.vitIncrease.addEventListener('click', () => this.allocateAttribute('vitality', 1));
        }

        // Attribute decrease buttons (disabled for now)
        if (this.elements.strDecrease) {
            this.elements.strDecrease.addEventListener('click', () => this.allocateAttribute('strength', -1));
        }
        if (this.elements.agiDecrease) {
            this.elements.agiDecrease.addEventListener('click', () => this.allocateAttribute('agility', -1));
        }
        if (this.elements.vitDecrease) {
            this.elements.vitDecrease.addEventListener('click', () => this.allocateAttribute('vitality', -1));
        }

        // Level up continue button
        if (this.elements.levelUpContinue) {
            this.elements.levelUpContinue.addEventListener('click', () => this.closeLevelUpNotification());
        }
    },

    /**
     * Subscribe to game state changes
     */
    setupGameStateListeners() {
        if (typeof GameState !== 'undefined') {
            GameState.on('playerUpdate', (player) => this.updateCharacterUI(player));
            GameState.on('stateChange', (data) => this.handleStateChange(data));
        }
    },

    /**
     * Handle game state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        if (data.type === 'levelUp') {
            this.showLevelUpNotification(data.level);
        }
    },

    /**
     * Update character progression UI
     * @param {Object} player - Player data
     */
    updateCharacterUI(player) {
        console.log('Updating character UI with player data:', player);

        // Update level displays
        if (this.elements.headerLevel) {
            this.elements.headerLevel.textContent = player.level;
        }
        if (this.elements.playerLevel) {
            this.elements.playerLevel.textContent = player.level;
        }

        // Update experience
        if (this.elements.playerExp) {
            this.elements.playerExp.textContent = `${player.experience}/${player.experienceToNext}`;
        }

        // Update experience bar
        if (this.elements.expFill) {
            const expPercent = (player.experience / player.experienceToNext) * 100;
            this.elements.expFill.style.width = `${expPercent}%`;
        }

        // Update attribute values
        if (this.elements.playerStrength) {
            this.elements.playerStrength.textContent = player.strength;
        }
        if (this.elements.playerAgility) {
            this.elements.playerAgility.textContent = player.agility;
        }
        if (this.elements.playerVitality) {
            this.elements.playerVitality.textContent = player.vitality;
        }

        // Update available points
        if (this.elements.availablePoints) {
            this.elements.availablePoints.textContent = player.availablePoints;
        }

        // Update derived stats
        this.updateDerivedStats(player);

        // Update button states
        this.updateAttributeButtons(player);

        // Show/hide available points display
        if (this.elements.availablePointsDisplay) {
            this.elements.availablePointsDisplay.style.display =
                player.availablePoints > 0 ? 'flex' : 'none';
        }
    },

    /**
     * Update derived combat stats
     * @param {Object} player - Player data
     */
    updateDerivedStats(player) {
        // Attack Power (base 10 + strength * 1.5)
        const attackPower = Math.floor(10 + (player.strength * 1.5));
        if (this.elements.attackPower) {
            this.elements.attackPower.textContent = attackPower;
        }

        // Critical Chance (base 5% + agility * 0.5%)
        const critChance = Math.floor(5 + (player.agility * 0.5));
        if (this.elements.critChance) {
            this.elements.critChance.textContent = `${critChance}%`;
        }

        // Max Health (base 80 + vitality * 4 + level * 5)
        const maxHealth = Math.floor(80 + (player.vitality * 4) + (player.level * 5));
        if (this.elements.maxHealth) {
            this.elements.maxHealth.textContent = maxHealth;
        }
    },

    /**
     * Update attribute button states
     * @param {Object} player - Player data
     */
    updateAttributeButtons(player) {
        console.log('Updating button states. Available points:', player.availablePoints);

        // Update increase buttons - enable if player has available points
        const increaseButtons = [
            this.elements.strIncrease,
            this.elements.agiIncrease,
            this.elements.vitIncrease
        ];

        increaseButtons.forEach(btn => {
            if (btn) {
                const shouldDisable = player.availablePoints <= 0;
                btn.disabled = shouldDisable;
                console.log(`Button ${btn.id} disabled: ${shouldDisable}, available points: ${player.availablePoints}`);
            }
        });

        // Decrease buttons are always disabled for now (no undo functionality)
        if (this.elements.strDecrease) {
            this.elements.strDecrease.disabled = true;
        }
        if (this.elements.agiDecrease) {
            this.elements.agiDecrease.disabled = true;
        }
        if (this.elements.vitDecrease) {
            this.elements.vitDecrease.disabled = true;
        }
    },

    /**
     * Allocate attribute points
     * @param {string} attribute - Attribute name (strength, agility, vitality)
     * @param {number} amount - Amount to allocate (+1 or -1)
     */
    allocateAttribute(attribute, amount) {
        console.log(`Allocating ${amount} point(s) to ${attribute}`);

        if (!GameState || !GameState.player) {
            console.error('GameState or player not available');
            return;
        }

        const player = GameState.player;
        console.log(`Current player state: level ${player.level}, available points: ${player.availablePoints}, ${attribute}: ${player[attribute]}`);

        // Check constraints
        if (amount > 0) {
            // Can't allocate more than available points
            if (player.availablePoints <= 0) {
                console.log('No available points to allocate');
                return;
            }
        } else {
            // For decrease, we don't support undoing allocations yet
            console.log('Decrease not supported yet');
            return;
        }

        // Prepare updates
        const updates = {
            availablePoints: player.availablePoints - 1
        };

        updates[attribute] = player[attribute] + 1;

        // Update max health if vitality increased
        if (attribute === 'vitality') {
            const healthIncrease = 4;
            updates.maxHealth = player.maxHealth + healthIncrease;
            updates.health = Math.min(player.health + healthIncrease, updates.maxHealth);
        }

        console.log('Applying updates:', updates);

        // Apply updates to game state
        GameState.updatePlayer(updates);

        // Add visual feedback
        this.showAttributeChangeEffect(attribute, amount);

        console.log(`Successfully allocated 1 point to ${attribute}. Remaining points: ${updates.availablePoints}`);
    },

    /**
     * Show visual feedback for attribute changes
     * @param {string} attribute - Attribute that changed
     * @param {number} amount - Amount of change
     */
    showAttributeChangeEffect(attribute, amount) {
        const attributeElements = {
            strength: this.elements.playerStrength,
            agility: this.elements.playerAgility,
            vitality: this.elements.playerVitality
        };

        const element = attributeElements[attribute];
        if (!element) return;

        // Add visual effect class
        element.classList.add(amount > 0 ? 'stat-increase' : 'stat-decrease');

        // Remove class after animation
        setTimeout(() => {
            element.classList.remove('stat-increase', 'stat-decrease');
        }, 300);
    },

    /**
     * Show level up notification
     * @param {number} newLevel - New player level
     */
    showLevelUpNotification(newLevel) {
        if (!this.elements.levelUpOverlay) return;

        // Update level display
        if (this.elements.newLevelDisplay) {
            this.elements.newLevelDisplay.textContent = `Level ${newLevel}`;
        }

        // Calculate health increase (5 base + vitality * 2)
        const player = GameState.player;
        const healthIncrease = 5 + (player.vitality * 2);
        if (this.elements.healthIncreaseDisplay) {
            this.elements.healthIncreaseDisplay.textContent = `+${healthIncrease} Max Health`;
        }

        // Show overlay
        this.elements.levelUpOverlay.classList.add('active');

        // Auto-close after 5 seconds if not manually closed
        setTimeout(() => {
            if (this.elements.levelUpOverlay.classList.contains('active')) {
                this.closeLevelUpNotification();
            }
        }, 5000);
    },

    /**
     * Close level up notification
     */
    closeLevelUpNotification() {
        if (this.elements.levelUpOverlay) {
            this.elements.levelUpOverlay.classList.remove('active');
        }
    },

    /**
     * Add experience points with proper level up handling
     * @param {number} exp - Experience points to add
     */
    addExperience(exp) {
        if (!GameState || !GameState.player) return;

        // Add experience through GameState which handles level up
        GameState.addExperience(exp);
    },

    /**
     * Calculate experience needed for next level
     * @param {number} level - Current level
     * @returns {number} Experience needed for next level
     */
    calculateExpToNext(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    },

    /**
     * Calculate attribute cost (could be used for future features)
     * @param {number} currentValue - Current attribute value
     * @returns {number} Cost to increase attribute
     */
    calculateAttributeCost(currentValue) {
        // Linear cost for now, could be exponential later
        return 1;
    },

    /**
     * Get attribute bonuses for display
     * @param {Object} player - Player data
     * @returns {Object} Attribute bonuses
     */
    getAttributeBonuses(player) {
        return {
            strength: {
                attackPower: Math.floor(player.strength * 1.5),
                description: 'Increases attack power'
            },
            agility: {
                critChance: Math.floor(player.agility * 0.5),
                description: 'Increases critical hit chance'
            },
            vitality: {
                health: player.vitality * 4,
                description: 'Increases maximum health'
            }
        };
    }
};

// Add CSS for attribute change animations
const progressionStyles = document.createElement('style');
progressionStyles.textContent = `
    .stat-increase {
        color: #51cf66 !important;
        animation: statIncrease 0.3s ease;
    }

    .stat-decrease {
        color: #ff6b6b !important;
        animation: statDecrease 0.3s ease;
    }

    @keyframes statIncrease {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes statDecrease {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.8);
        }
        100% {
            transform: scale(1);
        }
    }

    .attribute-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }

    .attribute-btn:not(:disabled) {
        opacity: 1;
        cursor: pointer;
        pointer-events: auto;
    }
`;
document.head.appendChild(progressionStyles);

// Export for ES6 modules
export default CharacterProgression;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.CharacterProgression = CharacterProgression;
}
