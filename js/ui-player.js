// Dun Dun Dungeon - Player UI Management
// Handles player stats display and updates

/**
 * Player UI Manager for handling player stats and information display
 */
const UIPlayer = {
    /**
     * Initialize player UI
     */
    init() {
        console.log('Initializing Player UI...');
        this.setupEventListeners();
        console.log('Player UI initialized');
    },

    /**
     * Set up player UI event listeners
     */
    setupEventListeners() {
        // Subscribe to player updates
        if (typeof GameState !== 'undefined') {
            GameState.on('playerUpdate', (player) => this.updatePlayerUI(player));
        }
    },

    /**
     * Update player UI elements
     * @param {Object} player - Player data
     */
    updatePlayerUI(player) {
        if (UICore.elements.playerHp) {
            UICore.elements.playerHp.textContent = `${player.health}/${player.maxHealth}`;
        }
        if (UICore.elements.currentFloor) {
            UICore.elements.currentFloor.textContent = player.floor;
        }
        if (UICore.elements.playerLevel) {
            UICore.elements.playerLevel.textContent = player.level;
        }
        if (UICore.elements.playerExp) {
            UICore.elements.playerExp.textContent = `${player.experience}/${player.experienceToNext}`;
        }
        if (UICore.elements.playerStrength) {
            UICore.elements.playerStrength.textContent = player.strength;
        }
        if (UICore.elements.playerAgility) {
            UICore.elements.playerAgility.textContent = player.agility;
        }
        if (UICore.elements.playerVitality) {
            UICore.elements.playerVitality.textContent = player.vitality;
        }
        if (UICore.elements.availableSkillPoints) {
            UICore.elements.availableSkillPoints.textContent = player.availablePoints;
        }

        // Update health bar visual representation if it exists
        this.updateHealthBar(player);

        // Update experience bar visual representation if it exists
        this.updateExperienceBar(player);
    },

    /**
     * Update health bar visual representation
     * @param {Object} player - Player data
     */
    updateHealthBar(player) {
        const healthBar = document.querySelector('.health-bar-fill');
        if (healthBar) {
            const healthPercent = (player.health / player.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;

            // Change color based on health percentage
            if (healthPercent > 60) {
                healthBar.style.backgroundColor = '#4caf50'; // Green
            } else if (healthPercent > 30) {
                healthBar.style.backgroundColor = '#ff9800'; // Orange
            } else {
                healthBar.style.backgroundColor = '#f44336'; // Red
            }
        }
    },

    /**
     * Update experience bar visual representation
     * @param {Object} player - Player data
     */
    updateExperienceBar(player) {
        const expBar = document.querySelector('.experience-bar-fill');
        if (expBar) {
            const expPercent = (player.experience / player.experienceToNext) * 100;
            expBar.style.width = `${expPercent}%`;
        }
    },

    /**
     * Show level up animation and notification
     * @param {number} newLevel - New player level
     */
    showLevelUp(newLevel) {
        // Show level up notification
        if (typeof UINotifications !== 'undefined') {
            UINotifications.showNotification(`Level Up! You are now level ${newLevel}!`, 3000, 'success');
        }

        // Create level up animation effect
        this.createLevelUpEffect();
    },

    /**
     * Create visual level up effect
     */
    createLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = '⭐ LEVEL UP! ⭐';
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: #d4af37;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            z-index: 9999;
            animation: levelUpPulse 2s ease;
            pointer-events: none;
        `;

        // Add animation CSS if it doesn't exist
        if (!document.querySelector('#level-up-animation')) {
            const style = document.createElement('style');
            style.id = 'level-up-animation';
            style.textContent = `
                @keyframes levelUpPulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    20% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    80% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(effect);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 2000);
    },

    /**
     * Show stat increase notification
     * @param {string} statName - Name of the stat that increased
     * @param {number} oldValue - Previous stat value
     * @param {number} newValue - New stat value
     */
    showStatIncrease(statName, oldValue, newValue) {
        const increase = newValue - oldValue;
        if (increase > 0) {
            if (typeof UINotifications !== 'undefined') {
                UINotifications.showNotification(`${statName} increased by ${increase}!`, 2000, 'info');
            }
        }
    },

    /**
     * Show equipment change effects
     * @param {Object} item - Equipment item
     * @param {boolean} equipped - Whether item was equipped (true) or unequipped (false)
     */
    showEquipmentChange(item, equipped) {
        if (!item.stats) return;

        const action = equipped ? 'equipped' : 'unequipped';
        const message = `${action.charAt(0).toUpperCase() + action.slice(1)} ${item.name}`;

        if (typeof UINotifications !== 'undefined') {
            UINotifications.showNotification(message, 1500, 'info');
        }

        // Show stat changes
        if (equipped && item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                if (value > 0) {
                    this.showStatBoost(stat, value);
                }
            }
        }
    },

    /**
     * Show temporary stat boost indicator
     * @param {string} statName - Name of the stat
     * @param {number} boost - Boost amount
     */
    showStatBoost(statName, boost) {
        const indicator = document.createElement('div');
        indicator.className = 'stat-boost-indicator';
        indicator.textContent = `+${boost} ${statName}`;
        indicator.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.8);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: bold;
            z-index: 9999;
            animation: statBoostFloat 2s ease;
            pointer-events: none;
        `;

        // Add animation CSS if it doesn't exist
        if (!document.querySelector('#stat-boost-animation')) {
            const style = document.createElement('style');
            style.id = 'stat-boost-animation';
            style.textContent = `
                @keyframes statBoostFloat {
                    0% {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-50%) translateY(-50px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 2000);
    },

    /**
     * Update character panel equipment display
     * @param {Object} equipment - Player equipment object
     */
    updateEquipmentDisplay(equipment) {
        for (const [slotType, item] of Object.entries(equipment)) {
            const slot = document.querySelector(`[data-slot="${slotType}"]`);
            if (slot) {
                if (item) {
                    slot.classList.add('equipped');
                    slot.innerHTML = `
                        <div class="equipment-icon">${item.icon || '⚔️'}</div>
                        <div class="equipment-name">${item.name}</div>
                    `;

                    // Set rarity border color if available
                    if (typeof Items !== 'undefined' && item.rarity) {
                        slot.style.borderColor = Items.getRarityColor(item.rarity);
                    }
                } else {
                    slot.classList.remove('equipped');
                    slot.innerHTML = `<div class="equipment-placeholder">Empty</div>`;
                    slot.style.borderColor = '#333';
                }
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIPlayer;
} else if (typeof window !== 'undefined') {
    window.UIPlayer = UIPlayer;
}
