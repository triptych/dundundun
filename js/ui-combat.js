// Dun Dun Dungeon - Combat UI Management
// Handles combat interface, actions, and updates

/**
 * Combat UI Manager for handling combat interface
 */
const UICombat = {
    /**
     * Initialize combat UI
     */
    init() {
        console.log('Initializing Combat UI...');
        this.setupEventListeners();
        console.log('Combat UI initialized');
    },

    /**
     * Set up combat event listeners
     */
    setupEventListeners() {
        // Combat buttons
        if (UICore.elements.attackBtn) {
            UICore.elements.attackBtn.addEventListener('click', () => this.handleCombatAction('attack'));
        }
        if (UICore.elements.heavyAttackBtn) {
            UICore.elements.heavyAttackBtn.addEventListener('click', () => this.handleCombatAction('heavyAttack'));
        }
        if (UICore.elements.blockBtn) {
            UICore.elements.blockBtn.addEventListener('click', () => this.handleCombatAction('block'));
        }
        if (UICore.elements.itemBtn) {
            UICore.elements.itemBtn.addEventListener('click', () => this.handleCombatAction('item'));
        }
        if (UICore.elements.escapeBtn) {
            UICore.elements.escapeBtn.addEventListener('click', () => this.handleCombatAction('escape'));
        }

        // Subscribe to combat updates
        if (typeof GameState !== 'undefined') {
            GameState.on('combatUpdate', (combat) => this.updateCombatUI(combat));
        }
    },

    /**
     * Handle combat action clicks
     * @param {string} action - Combat action to perform
     */
    handleCombatAction(action) {
        console.log('Combat action:', action);

        // Emit combat action event
        if (typeof GameState !== 'undefined') {
            GameState.emit('combatAction', { action });
        }
    },

    /**
     * Update combat UI
     * @param {Object} combat - Combat data
     */
    updateCombatUI(combat) {
        if (!UICore.elements.combatOverlay) return;

        if (combat.isActive) {
            UICore.elements.combatOverlay.classList.add('active');

            // Update player combat info
            if (typeof GameState !== 'undefined' && GameState.player) {
                const player = GameState.player;

                // Update player health bar
                if (UICore.elements.playerCombatHpFill && UICore.elements.playerCombatHpText) {
                    const playerHpPercent = (player.health / player.maxHealth) * 100;
                    UICore.elements.playerCombatHpFill.style.width = `${playerHpPercent}%`;
                    UICore.elements.playerCombatHpText.textContent = `${player.health}/${player.maxHealth}`;
                }

                // Update combat stats from Combat system
                if (typeof Combat !== 'undefined') {
                    const combatStats = Combat.getCombatStats();

                    if (UICore.elements.combatAttackPower) {
                        UICore.elements.combatAttackPower.textContent = combatStats.attackPower;
                    }

                    if (UICore.elements.combatCritChance) {
                        UICore.elements.combatCritChance.textContent = `${Math.round(combatStats.critChance)}%`;
                    }
                }

                // Update buffs/debuffs
                if (UICore.elements.combatBuffs) {
                    // Clear existing buffs
                    UICore.elements.combatBuffs.innerHTML = '';

                    // Add blocking buff if player blocked last turn
                    if (combat.lastAction === 'block') {
                        const blockBuff = document.createElement('div');
                        blockBuff.className = 'combat-buff blocking';
                        blockBuff.textContent = '🛡️ Blocking';
                        blockBuff.title = 'Damage reduced by 50%';
                        UICore.elements.combatBuffs.appendChild(blockBuff);
                    }
                }
            }

            // Update enemy combat info
            if (combat.enemy) {
                if (UICore.elements.enemyName) {
                    UICore.elements.enemyName.textContent = combat.enemy.name || 'Enemy';
                }

                if (UICore.elements.enemyHpFill && UICore.elements.enemyHpText) {
                    const hpPercent = (combat.enemy.health / combat.enemy.maxHealth) * 100;
                    UICore.elements.enemyHpFill.style.width = `${hpPercent}%`;
                    UICore.elements.enemyHpText.textContent = `${combat.enemy.health}/${combat.enemy.maxHealth}`;
                }
            }

            // Update combat log
            if (UICore.elements.combatLog && combat.log) {
                UICore.elements.combatLog.innerHTML = '';
                combat.log.forEach(entry => {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.textContent = entry;
                    UICore.elements.combatLog.appendChild(logEntry);
                });
                UICore.elements.combatLog.scrollTop = UICore.elements.combatLog.scrollHeight;
            }
        } else {
            UICore.elements.combatOverlay.classList.remove('active');

            // Clear enemy HP bar content when combat is not active
            if (UICore.elements.enemyName) {
                UICore.elements.enemyName.textContent = '';
            }
            if (UICore.elements.enemyHpFill) {
                UICore.elements.enemyHpFill.style.width = '0%';
            }
            if (UICore.elements.enemyHpText) {
                UICore.elements.enemyHpText.textContent = '';
            }

            // Clear focus from all combat buttons to prevent them from "sticking" visually
            const combatButtons = [
                UICore.elements.attackBtn,
                UICore.elements.heavyAttackBtn,
                UICore.elements.blockBtn,
                UICore.elements.itemBtn,
                UICore.elements.escapeBtn
            ];

            combatButtons.forEach(button => {
                if (button && document.activeElement === button) {
                    button.blur();
                }
            });
        }
    }
};

// Export for ES6 modules
export default UICombat;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.UICombat = UICombat;
}
