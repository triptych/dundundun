// Pocket Dungeon - Character Progression System
// Handles experience, leveling, and attribute point allocation

/**
 * Character Progression Manager
 */
const CharacterProgression = {
    // DOM element references
    elements: {},

    // Temporary attribute point allocation
    tempAllocations: {
        strength: 0,
        agility: 0,
        vitality: 0
    },

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

        // Attribute decrease buttons
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
            this.elements.playerStrength.textContent = player.strength + this.tempAllocations.strength;
        }
        if (this.elements.playerAgility) {
            this.elements.playerAgility.textContent = player.agility + this.tempAllocations.agility;
        }
        if (this.elements.playerVitality) {
            this.elements.playerVitality.textContent = player.vitality + this.tempAllocations.vitality;
        }

        // Update available points
        if (this.elements.availablePoints) {
            const totalAllocated = Object.values(this.tempAllocations).reduce((sum, val) => sum + val, 0);
            const remainingPoints = player.availablePoints - totalAllocated;
            this.elements.availablePoints.textContent = remainingPoints;
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
        // Calculate derived stats with temporary allocations
        const tempStr = player.strength + this.tempAllocations.strength;
        const tempAgi = player.agility + this.tempAllocations.agility;
        const tempVit = player.vitality + this.tempAllocations.vitality;

        // Attack Power (base 10 + strength * 1.5)
        const attackPower = Math.floor(10 + (tempStr * 1.5));
        if (this.elements.attackPower) {
            this.elements.attackPower.textContent = attackPower;
        }

        // Critical Chance (base 5% + agility * 0.5%)
        const critChance = Math.floor(5 + (tempAgi * 0.5));
        if (this.elements.critChance) {
            this.elements.critChance.textContent = `${critChance}%`;
        }

        // Max Health (base 80 + vitality * 4 + level * 5)
        const maxHealth = Math.floor(80 + (tempVit * 4) + (player.level * 5));
        if (this.elements.maxHealth) {
            this.elements.maxHealth.textContent = maxHealth;
        }
    },

    /**
     * Update attribute button states
     * @param {Object} player - Player data
     */
    updateAttributeButtons(player) {
        const totalAllocated = Object.values(this.tempAllocations).reduce((sum, val) => sum + val, 0);
        const remainingPoints = player.availablePoints - totalAllocated;

        // Update increase buttons
        const increaseButtons = [
            this.elements.strIncrease,
            this.elements.agiIncrease,
            this.elements.vitIncrease
        ];

        increaseButtons.forEach(btn => {
            if (btn) {
                btn.disabled = remainingPoints <= 0;
            }
        });

        // Update decrease buttons
        if (this.elements.strDecrease) {
            this.elements.strDecrease.disabled = this.tempAllocations.strength <= 0;
        }
        if (this.elements.agiDecrease) {
            this.elements.agiDecrease.disabled = this.tempAllocations.agility <= 0;
        }
        if (this.elements.vitDecrease) {
            this.elements.vitDecrease.disabled = this.tempAllocations.vitality <= 0;
        }
    },

    /**
     * Allocate attribute points
     * @param {string} attribute - Attribute name (strength, agility, vitality)
     * @param {number} amount - Amount to allocate (+1 or -1)
     */
    allocateAttribute(attribute, amount) {
        if (!GameState || !GameState.player) return;

        const player = GameState.player;
        const totalAllocated = Object.values(this.tempAllocations).reduce((sum, val) => sum + val, 0);
        const remainingPoints = player.availablePoints - totalAllocated;

        // Check constraints
        if (amount > 0) {
            // Can't allocate more than available points
            if (remainingPoints <= 0) return;
        } else {
            // Can't decrease below 0 temp allocation
            if (this.tempAllocations[attribute] <= 0) return;
        }

        // Apply allocation
        this.tempAllocations[attribute] += amount;

        // If we have pending allocations, commit them
        if (amount > 0 && this.getTotalTempAllocations() > 0) {
            this.commitAttributeAllocations();
        }

        // Update UI
        this.updateCharacterUI(player);

        // Add visual feedback
        this.showAttributeChangeEffect(attribute, amount);
    },

    /**
     * Get total temporary allocations
     * @returns {number} Total temp allocations
     */
    getTotalTempAllocations() {
        return Object.values(this.tempAllocations).reduce((sum, val) => sum + val, 0);
    },

    /**
     * Commit temporary attribute allocations to the game state
     */
    commitAttributeAllocations() {
        if (!GameState || !GameState.player) return;

        const player = GameState.player;
        const updates = {};

        // Apply allocations
        if (this.tempAllocations.strength > 0) {
            updates.strength = player.strength + this.tempAllocations.strength;
        }
        if (this.tempAllocations.agility > 0) {
            updates.agility = player.agility + this.tempAllocations.agility;
        }
        if (this.tempAllocations.vitality > 0) {
            updates.vitality = player.vitality + this.tempAllocations.vitality;
            // Update max health when vitality increases
            const healthIncrease = this.tempAllocations.vitality * 4;
            updates.maxHealth = player.maxHealth + healthIncrease;
            updates.health = Math.min(player.health + healthIncrease, updates.maxHealth);
        }

        // Deduct available points
        const totalUsed = this.getTotalTempAllocations();
        updates.availablePoints = player.availablePoints - totalUsed;

        // Apply updates to game state
        GameState.updatePlayer(updates);

        // Reset temporary allocations
        this.tempAllocations = { strength: 0, agility: 0, vitality: 0 };

        console.log('Attribute allocations committed:', updates);
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
`;
document.head.appendChild(progressionStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterProgression;
}
