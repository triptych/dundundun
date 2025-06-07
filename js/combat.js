// Combat System - Combat mechanics and battle actions
const Combat = {
    /**
     * Handle combat actions from player input
     * @param {Object} data - Combat action data
     * @param {Function} onCombatEnd - Callback for when combat ends
     */
    handleCombatAction(data, onCombatEnd = null) {
        const { action } = data;

        if (!GameState.combat.isActive || !GameState.combat.playerTurn) {
            return;
        }

        // Safety check: End combat if either participant has negative or zero HP
        if (this.shouldEndCombat()) {
            this.handleCombatEnd();
            return;
        }

        console.log(`Combat action: ${action}`);

        // Process combat action
        switch (action) {
            case 'attack':
                this.performAttack();
                break;
            case 'heavyAttack':
                this.performHeavyAttack();
                break;
            case 'block':
                this.performBlock();
                break;
            case 'item':
                this.useItem();
                break;
            case 'escape':
                this.attemptEscape(onCombatEnd);
                return; // Don't process enemy turn if escape successful
        }

        // End player turn
        GameState.combat.playerTurn = false;

        // Process enemy turn after a delay
        setTimeout(() => {
            this.processEnemyTurn(onCombatEnd);
        }, 1000);
    },

    /**
     * Calculate player's attack power based on strength
     * @returns {number} Attack power
     */
    calculateAttackPower() {
        return Math.floor(10 + (GameState.player.strength * 1.5));
    },

    /**
     * Calculate player's critical hit chance based on agility
     * @returns {number} Critical hit chance percentage
     */
    calculateCritChance() {
        return 5 + (GameState.player.agility * 0.5);
    },

    /**
     * Check if attack is a critical hit
     * @returns {boolean} True if critical hit
     */
    isCriticalHit() {
        const critChance = this.calculateCritChance();
        return Math.random() * 100 < critChance;
    },

    /**
     * Calculate damage reduction from vitality (toughness)
     * @param {number} incomingDamage - Raw incoming damage
     * @returns {number} Reduced damage
     */
    calculateDamageReduction(incomingDamage) {
        // Vitality provides damage reduction: 1 point = 2% reduction, max 50%
        const reductionPercent = Math.min(50, GameState.player.vitality * 2);
        const reduction = incomingDamage * (reductionPercent / 100);
        return Math.floor(incomingDamage - reduction);
    },

    /**
     * Perform a basic attack
     */
    performAttack() {
        if (!GameState.combat.enemy) return;

        // Calculate base damage using derived attack power
        const baseAttackPower = this.calculateAttackPower();
        const damage = baseAttackPower + Utils.randomInt(1, 6);

        // Check for critical hit based on agility
        const isCritical = this.isCriticalHit();

        let finalDamage = damage;
        let logMessage = `You deal ${damage} damage!`;

        if (isCritical) {
            finalDamage = Math.floor(damage * 1.5);
            logMessage = `Critical hit! You deal ${finalDamage} damage!`;
        }

        GameState.combat.enemy.health -= finalDamage;
        GameState.combat.log.push(logMessage);

        // Trigger enemy shake animation
        this.shakeElement('.enemy-info', isCritical);

        if (GameState.combat.enemy.health <= 0) {
            this.endCombat(true);
        } else {
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * Perform a heavy attack
     */
    performHeavyAttack() {
        if (GameState.combat.cooldowns.heavyAttack > 0) {
            GameState.combat.log.push('Heavy attack is on cooldown!');
            return;
        }

        if (!GameState.combat.enemy) return;

        // Heavy attack does more damage and has higher crit chance
        const baseAttackPower = this.calculateAttackPower();
        const damage = Math.floor(baseAttackPower * 1.5) + Utils.randomInt(2, 8);

        // Heavy attacks have +20% crit chance
        const baseCritChance = this.calculateCritChance();
        const enhancedCritChance = baseCritChance + 20;
        const isCritical = Math.random() * 100 < enhancedCritChance;

        let finalDamage = damage;
        let logMessage = `You deal ${damage} heavy damage!`;

        if (isCritical) {
            finalDamage = Math.floor(damage * 1.5);
            logMessage = `Critical heavy attack! You deal ${finalDamage} damage!`;
        }

        GameState.combat.enemy.health -= finalDamage;
        GameState.combat.cooldowns.heavyAttack = 3000; // 3 second cooldown

        GameState.combat.log.push(logMessage);

        // Trigger enemy shake animation (intense for heavy attacks)
        this.shakeElement('.enemy-info', true);

        if (GameState.combat.enemy.health <= 0) {
            this.endCombat(true);
        } else {
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * Perform a block action
     */
    performBlock() {
        GameState.combat.lastAction = 'block';
        GameState.combat.log.push('You prepare to block!');
        GameState.emit('combatUpdate', GameState.combat);
    },

    /**
     * Use an item in combat
     */
    useItem() {
        // Check if player has any usable items
        const usableItems = this.getUsableItems();

        if (usableItems.length === 0) {
            GameState.combat.log.push('No items available!');
            GameState.emit('combatUpdate', GameState.combat);
            return;
        }

        // For now, just use the first available healing item
        const item = usableItems[0];
        this.useHealthPotion(item);
    },

    /**
     * Get list of items usable in combat
     * @returns {Array} Array of usable items
     */
    getUsableItems() {
        // This is a placeholder - in a full implementation,
        // you'd check the player's inventory for healing potions, etc.
        return [];
    },

    /**
     * Use a health potion
     * @param {Object} item - The health potion item
     */
    useHealthPotion(item) {
        const healAmount = item.healAmount || 20;
        const oldHealth = GameState.player.health;
        const newHealth = Math.min(GameState.player.maxHealth, oldHealth + healAmount);
        const actualHeal = newHealth - oldHealth;

        GameState.updatePlayer({ health: newHealth });
        GameState.combat.log.push(`You heal for ${actualHeal} health!`);

        // Remove item from inventory (placeholder)
        // GameState.removeItem(item);

        GameState.emit('combatUpdate', GameState.combat);
    },

    /**
     * Attempt to escape from combat
     * @param {Function} onCombatEnd - Callback for when combat ends
     */
    attemptEscape(onCombatEnd = null) {
        // Calculate escape chance based on agility
        // Base 50% chance + 2% per agility point, capped at 95%
        const baseEscapeChance = 50;
        const agilityBonus = GameState.player.agility * 2;
        const escapeChance = Math.min(95, baseEscapeChance + agilityBonus);

        // Boss fights have reduced escape chance
        const isBoss = GameState.combat.enemy && GameState.combat.enemy.isBoss;
        const finalEscapeChance = isBoss ? Math.floor(escapeChance * 0.5) : escapeChance;

        const roll = Math.random() * 100;

        if (roll < finalEscapeChance) {
            // Escape successful - but at a cost
            // Calculate HP loss: 10-20% of current HP, minimum 1, maximum 25% of max HP
            const currentHp = GameState.player.health;
            const maxHp = GameState.player.maxHealth;
            const minLoss = Math.max(1, Math.floor(currentHp * 0.10));
            const maxLoss = Math.min(Math.floor(maxHp * 0.25), Math.floor(currentHp * 0.20));
            const hpLoss = Math.max(minLoss, Math.floor(Math.random() * (maxLoss - minLoss + 1)) + minLoss);

            // Ensure escape doesn't kill the player
            const newHp = Math.max(1, currentHp - hpLoss);
            GameState.updatePlayer({ health: newHp });

            GameState.combat.log.push(`You successfully escaped! (${Math.round(finalEscapeChance)}% chance)`);
            GameState.combat.log.push(`You lost ${hpLoss} HP while escaping.`);

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`Escaped successfully! Lost ${hpLoss} HP`, 2000, 'info');
            }

            // End combat directly without triggering death logic
            GameState.combat.isActive = false;
            GameState.combat.enemy = null;
            GameState.combat.log = [];

            GameState.switchScreen('game');
            GameState.emit('combatUpdate', GameState.combat);

            // Auto-save if enabled
            if (GameState.settings && GameState.settings.autoSave) {
                GameState.saveGameData();
            }

            // Don't call onCombatEnd for successful escapes - it's not a defeat
            // The combat just ended via escape, not victory or defeat
        } else {
            // Escape failed - take some damage from the failed attempt
            const currentHp = GameState.player.health;
            const failureDamage = Math.max(1, Math.floor(currentHp * 0.05)); // 5% current HP
            const newHp = Math.max(1, currentHp - failureDamage);
            GameState.updatePlayer({ health: newHp });

            GameState.combat.log.push(`Failed to escape! (${Math.round(finalEscapeChance)}% chance)`);
            GameState.combat.log.push(`You lost ${failureDamage} HP in the failed attempt.`);

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`Escape failed! Lost ${failureDamage} HP`, 1500, 'warning');
            }

            // End player turn and let enemy attack
            GameState.combat.playerTurn = false;
            GameState.emit('combatUpdate', GameState.combat);

            // Process enemy turn after a delay
            setTimeout(() => {
                this.processEnemyTurn(onCombatEnd);
            }, 1000);
        }
    },

    /**
     * Process enemy turn
     * @param {Function} onCombatEnd - Callback for when combat ends
     */
    processEnemyTurn(onCombatEnd = null) {
        if (!GameState.combat.isActive || !GameState.combat.enemy) return;

        // Safety check: End combat if either participant has negative or zero HP
        if (this.shouldEndCombat()) {
            this.handleCombatEnd();
            return;
        }

        const enemyDamage = GameState.combat.enemy.attack + Utils.randomInt(1, 4);
        let actualDamage = enemyDamage;

        // Reduce damage if player blocked
        if (GameState.combat.lastAction === 'block') {
            actualDamage = Math.floor(enemyDamage * 0.5);
            GameState.combat.log.push(`Enemy attacks for ${enemyDamage} damage, blocked for ${actualDamage}!`);
        } else {
            // Apply vitality-based damage reduction
            actualDamage = this.calculateDamageReduction(enemyDamage);

            if (actualDamage < enemyDamage) {
                const reduction = enemyDamage - actualDamage;
                GameState.combat.log.push(`Enemy attacks for ${enemyDamage} damage, reduced by ${reduction} (vitality)! You take ${actualDamage} damage.`);
            } else {
                GameState.combat.log.push(`Enemy attacks for ${actualDamage} damage!`);
            }
        }

        GameState.updatePlayer({ health: GameState.player.health - actualDamage });

        // Trigger player shake animation if damage was taken
        if (actualDamage > 0) {
            this.shakeElement('.player-combat-info', actualDamage >= 15); // Intense shake for high damage
        }

        // Reset for next turn - clear blocking state immediately after use
        GameState.combat.playerTurn = true;
        GameState.combat.lastAction = null;

        // Check if player died
        if (GameState.player.health <= 0) {
            this.endCombat(false, onCombatEnd);
        } else {
            GameState.emit('combatUpdate', GameState.combat);
        }
    },

    /**
     * End combat
     * @param {boolean} playerWon - Whether the player won
     * @param {Function} onCombatEnd - Callback for when combat ends
     */
    endCombat(playerWon, onCombatEnd = null) {
        if (playerWon) {
            // Award experience and gold
            if (GameState.combat.enemy) {
                const exp = GameState.combat.enemy.experience || 10;
                const gold = Math.floor(Math.random() * 20) + 5;

                GameState.addExperience(exp); // Use addExperience to handle level up
                GameState.updateInventory({
                    gold: GameState.inventory.gold + gold
                });

                GameState.combat.log.push(`Victory! Gained ${exp} experience and ${gold} gold!`);
            }

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Victory!', 1500);
            }
        } else {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Defeat!', 1500);
            }

            // Handle player death after a delay
            setTimeout(() => {
                this.handlePlayerDeath();
            }, 2000);
        }

        GameState.endCombat(playerWon);

        // Call completion callback if provided
        if (onCombatEnd) {
            onCombatEnd(playerWon);
        }
    },

    /**
     * Handle player death
     */
    handlePlayerDeath() {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Game Over! Starting new game...', 3000);
        }

        setTimeout(() => {
            // Reset to new game state
            GameState.newGame();
        }, 3000);
    },

    /**
     * Trigger a standard combat encounter
     * @param {Object} customEnemy - Optional custom enemy data
     */
    triggerCombat(customEnemy = null) {
        let enemy;

        if (customEnemy) {
            enemy = customEnemy;
        } else {
            const floor = GameState.dungeon.currentFloor;
            enemy = this.generateStandardEnemy(floor);
        }

        console.log(`Combat encounter: ${enemy.name}`);
        GameState.startCombat(enemy);
    },

    /**
     * Generate a standard enemy based on floor level
     * @param {number} floor - Current floor level
     * @returns {Object} Enemy data
     */
    generateStandardEnemy(floor) {
        const enemyTypes = [
            { name: 'Goblin', baseHealth: 25, baseAttack: 4 },
            { name: 'Orc', baseHealth: 35, baseAttack: 6 },
            { name: 'Skeleton', baseHealth: 20, baseAttack: 5 },
            { name: 'Spider', baseHealth: 15, baseAttack: 3 }
        ];

        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const floorMultiplier = 1 + (floor - 1) * 0.2; // 20% increase per floor

        return {
            name: enemyType.name,
            health: Math.floor(enemyType.baseHealth * floorMultiplier),
            maxHealth: Math.floor(enemyType.baseHealth * floorMultiplier),
            attack: Math.floor(enemyType.baseAttack * floorMultiplier),
            experience: Math.floor(10 * floorMultiplier)
        };
    },

    /**
     * Trigger boss combat
     * @param {Object} customBoss - Optional custom boss data
     */
    triggerBossCombat(customBoss = null) {
        let boss;

        if (customBoss) {
            boss = customBoss;
        } else {
            const floor = GameState.dungeon.currentFloor;
            boss = this.generateBoss(floor);
        }

        console.log(`Boss encounter: ${boss.name}`);
        GameState.startCombat(boss);
    },

    /**
     * Generate a boss enemy based on floor level
     * @param {number} floor - Current floor level
     * @returns {Object} Boss data
     */
    generateBoss(floor) {
        const bossTypes = [
            { name: 'Goblin King', baseHealth: 80, baseAttack: 12 },
            { name: 'Orc Warlord', baseHealth: 100, baseAttack: 15 },
            { name: 'Skeleton Lord', baseHealth: 90, baseAttack: 14 },
            { name: 'Giant Spider', baseHealth: 70, baseAttack: 10 }
        ];

        const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
        const floorMultiplier = 1 + (floor - 1) * 0.3; // 30% increase per floor

        return {
            name: `${bossType.name} (Floor ${floor})`,
            health: Math.floor(bossType.baseHealth * floorMultiplier),
            maxHealth: Math.floor(bossType.baseHealth * floorMultiplier),
            attack: Math.floor(bossType.baseAttack * floorMultiplier),
            experience: Math.floor(50 * floorMultiplier),
            isBoss: true
        };
    },

    /**
     * Update combat cooldowns
     * @param {number} deltaTime - Time since last frame
     */
    updateCooldowns(deltaTime) {
        if (GameState.combat.cooldowns.heavyAttack > 0) {
            GameState.combat.cooldowns.heavyAttack -= deltaTime;
            GameState.combat.cooldowns.heavyAttack = Math.max(0, GameState.combat.cooldowns.heavyAttack);
        }

        if (GameState.combat.cooldowns.block > 0) {
            GameState.combat.cooldowns.block -= deltaTime;
            GameState.combat.cooldowns.block = Math.max(0, GameState.combat.cooldowns.block);
        }
    },

    /**
     * Check if a combat action is available
     * @param {string} action - Action to check
     * @returns {boolean} True if action is available
     */
    isActionAvailable(action) {
        switch (action) {
            case 'attack':
                return true; // Always available
            case 'heavyAttack':
                return GameState.combat.cooldowns.heavyAttack <= 0;
            case 'block':
                return GameState.combat.cooldowns.block <= 0;
            case 'item':
                return this.getUsableItems().length > 0;
            default:
                return false;
        }
    },

    /**
     * Get cooldown remaining for an action
     * @param {string} action - Action to check
     * @returns {number} Cooldown remaining in milliseconds
     */
    getActionCooldown(action) {
        switch (action) {
            case 'heavyAttack':
                return Math.max(0, GameState.combat.cooldowns.heavyAttack);
            case 'block':
                return Math.max(0, GameState.combat.cooldowns.block);
            default:
                return 0;
        }
    },

    /**
     * Get current combat stats summary for display
     * @returns {Object} Combat stats summary
     */
    getCombatStats() {
        return {
            attackPower: this.calculateAttackPower(),
            critChance: this.calculateCritChance(),
            damageReduction: Math.min(50, GameState.player.vitality * 2)
        };
    },

    /**
     * Shake an element to indicate damage
     * @param {string} selector - CSS selector for the element to shake
     * @param {boolean} intense - Whether to use intense shake animation
     */
    shakeElement(selector, intense = false) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Remove any existing shake classes
        element.classList.remove('shake', 'shake-intense');

        // Add appropriate shake class
        const shakeClass = intense ? 'shake-intense' : 'shake';
        element.classList.add(shakeClass);

        // Remove the class after animation completes
        const animationDuration = intense ? 800 : 600; // Match CSS animation duration
        setTimeout(() => {
            element.classList.remove(shakeClass);
        }, animationDuration);
    },

    /**
     * Check if combat should end due to negative HP
     * @returns {boolean} True if combat should end
     */
    shouldEndCombat() {
        // Check if player is dead or has negative health
        if (GameState.player.health <= 0) {
            console.log('Combat should end: Player health is', GameState.player.health);
            return true;
        }

        // Check if enemy is dead or has negative health
        if (GameState.combat.enemy && GameState.combat.enemy.health <= 0) {
            console.log('Combat should end: Enemy health is', GameState.combat.enemy.health);
            return true;
        }

        return false;
    },

    /**
     * Handle combat end with appropriate outcome
     */
    handleCombatEnd() {
        console.log('Handling combat end due to safety check');

        // Determine outcome based on HP
        let playerWon = false;

        if (GameState.combat.enemy && GameState.combat.enemy.health <= 0) {
            playerWon = true;
            console.log('Player won - enemy defeated');
        } else if (GameState.player.health <= 0) {
            playerWon = false;
            console.log('Player lost - player defeated');
        } else {
            // Fallback - shouldn't happen but handle gracefully
            console.log('Combat ended for unknown reason, defaulting to player loss');
            playerWon = false;
        }

        // Force end combat
        this.endCombat(playerWon);
    }
};

// Export for ES6 modules
export default Combat;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.Combat = Combat;
}
