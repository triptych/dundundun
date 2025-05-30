// Pocket Dungeon - Character Stat Calculations
// Comprehensive stat calculation system for character attributes

/**
 * Character Stats Calculator
 * Handles all derived stat calculations from base attributes
 */
const CharacterStats = {

    /**
     * Calculate all derived stats for a player
     * This is the comprehensive stat calculation system
     * @param {Object} player - Player data with attributes
     * @returns {Object} All calculated derived stats
     */
    calculateAllStats(player) {
        const level = player.level || 1;
        const strength = player.strength || 10;
        const agility = player.agility || 10;
        const vitality = player.vitality || 10;

        // Base values that scale with level
        const baseAttackPower = 8 + Math.floor(level * 0.5);
        const baseCritChance = 3;
        const baseMaxHealth = 75 + (level * 3);

        // Primary derived stats
        const attackPower = Math.floor(baseAttackPower + (strength * 1.5));
        const critChance = Math.max(0, Math.min(50, baseCritChance + Math.floor(agility * 0.6))); // Cap at 50%
        const maxHealth = Math.floor(baseMaxHealth + (vitality * 4) + (level * 2));

        // Secondary derived stats
        const critMultiplier = 1.5 + (agility * 0.01); // Crit damage increases with agility
        const dodgeChance = Math.max(0, Math.min(25, Math.floor(agility * 0.3))); // Cap at 25%
        const damageReduction = Math.max(0, Math.min(20, Math.floor(vitality * 0.2))); // Cap at 20%

        // Combat efficiency stats
        const heavyAttackDamage = Math.floor(attackPower * 1.8); // Heavy attack does 180% damage
        const blockEfficiency = Math.max(30, Math.min(70, 40 + Math.floor(strength * 0.4))); // 30-70% damage reduction

        // Advanced calculations
        const expectedDPS = this.calculateExpectedDPS(attackPower, critChance, critMultiplier);
        const effectiveHealth = this.calculateEffectiveHealth(maxHealth, damageReduction, dodgeChance);

        return {
            // Primary stats
            attackPower,
            critChance,
            maxHealth,

            // Secondary stats
            critMultiplier: Math.round(critMultiplier * 100) / 100, // Round to 2 decimals
            dodgeChance,
            damageReduction,

            // Combat stats
            heavyAttackDamage,
            blockEfficiency,

            // Calculated efficiency metrics
            expectedDPS: Math.round(expectedDPS * 10) / 10, // Round to 1 decimal
            effectiveHealth: Math.floor(effectiveHealth),

            // Combat modifiers for easy access
            combatModifiers: {
                attackPowerBonus: Math.floor(strength * 1.5),
                critChanceBonus: Math.floor(agility * 0.6),
                healthBonus: vitality * 4,
                strengthMultiplier: 1 + (strength * 0.02), // 2% per point
                agilityMultiplier: 1 + (agility * 0.015), // 1.5% per point
                vitalityMultiplier: 1 + (vitality * 0.01) // 1% per point
            }
        };
    },

    /**
     * Calculate expected damage per second
     * @param {number} attackPower - Base attack power
     * @param {number} critChance - Critical hit chance percentage
     * @param {number} critMultiplier - Critical hit damage multiplier
     * @returns {number} Expected DPS
     */
    calculateExpectedDPS(attackPower, critChance, critMultiplier) {
        const critRate = critChance / 100;
        const normalDamage = attackPower * (1 - critRate);
        const critDamage = (attackPower * critMultiplier) * critRate;
        return normalDamage + critDamage;
    },

    /**
     * Calculate effective health considering damage reduction and dodge
     * @param {number} maxHealth - Maximum health
     * @param {number} damageReduction - Damage reduction percentage
     * @param {number} dodgeChance - Dodge chance percentage
     * @returns {number} Effective health
     */
    calculateEffectiveHealth(maxHealth, damageReduction, dodgeChance) {
        const damageMultiplier = 1 - (damageReduction / 100);
        const hitRate = 1 - (dodgeChance / 100);
        return maxHealth / (damageMultiplier * hitRate);
    },

    /**
     * Calculate damage for an attack including critical hits
     * @param {Object} attacker - Attacker with derived stats
     * @param {number} baseVariance - Random variance (0.8 to 1.2)
     * @returns {Object} Damage calculation result
     */
    calculateAttackDamage(attacker, baseVariance = 1.0) {
        const stats = attacker.derivedStats || this.calculateAllStats(attacker);
        const baseDamage = Math.floor(stats.attackPower * baseVariance);

        // Check for critical hit
        const critRoll = Math.random() * 100;
        const isCritical = critRoll < stats.critChance;

        const finalDamage = isCritical
            ? Math.floor(baseDamage * stats.critMultiplier)
            : baseDamage;

        return {
            damage: finalDamage,
            isCritical,
            baseDamage,
            critMultiplier: stats.critMultiplier
        };
    },

    /**
     * Calculate heavy attack damage
     * @param {Object} attacker - Attacker with derived stats
     * @param {number} baseVariance - Random variance
     * @returns {Object} Heavy attack damage result
     */
    calculateHeavyAttackDamage(attacker, baseVariance = 1.0) {
        const stats = attacker.derivedStats || this.calculateAllStats(attacker);
        const baseDamage = Math.floor(stats.heavyAttackDamage * baseVariance);

        // Heavy attacks have slightly higher crit chance
        const critRoll = Math.random() * 100;
        const enhancedCritChance = Math.min(75, stats.critChance + 10);
        const isCritical = critRoll < enhancedCritChance;

        const finalDamage = isCritical
            ? Math.floor(baseDamage * stats.critMultiplier)
            : baseDamage;

        return {
            damage: finalDamage,
            isCritical,
            baseDamage,
            critMultiplier: stats.critMultiplier,
            isHeavyAttack: true
        };
    },

    /**
     * Calculate damage reduction from blocking
     * @param {Object} defender - Defender with derived stats
     * @param {number} incomingDamage - Incoming damage amount
     * @returns {Object} Block calculation result
     */
    calculateBlockReduction(defender, incomingDamage) {
        const stats = defender.derivedStats || this.calculateAllStats(defender);
        const reductionPercent = stats.blockEfficiency;
        const blockedDamage = Math.floor(incomingDamage * (reductionPercent / 100));
        const finalDamage = Math.max(1, incomingDamage - blockedDamage);

        return {
            originalDamage: incomingDamage,
            blockedDamage,
            finalDamage,
            reductionPercent
        };
    },

    /**
     * Check if an attack is dodged
     * @param {Object} defender - Defender with derived stats
     * @returns {boolean} True if attack was dodged
     */
    checkDodge(defender) {
        const stats = defender.derivedStats || this.calculateAllStats(defender);
        const dodgeRoll = Math.random() * 100;
        return dodgeRoll < stats.dodgeChance;
    },

    /**
     * Get stat comparison between current and potential allocation
     * @param {Object} currentPlayer - Current player stats
     * @param {Object} tempAllocations - Temporary allocations to preview
     * @returns {Object} Stat comparison
     */
    getStatComparison(currentPlayer, tempAllocations = {}) {
        const current = this.calculateAllStats(currentPlayer);

        const projected = this.calculateAllStats({
            ...currentPlayer,
            strength: currentPlayer.strength + (tempAllocations.strength || 0),
            agility: currentPlayer.agility + (tempAllocations.agility || 0),
            vitality: currentPlayer.vitality + (tempAllocations.vitality || 0)
        });

        return {
            current,
            projected,
            differences: {
                attackPower: projected.attackPower - current.attackPower,
                critChance: projected.critChance - current.critChance,
                maxHealth: projected.maxHealth - current.maxHealth,
                expectedDPS: projected.expectedDPS - current.expectedDPS,
                effectiveHealth: projected.effectiveHealth - current.effectiveHealth,
                dodgeChance: projected.dodgeChance - current.dodgeChance,
                damageReduction: projected.damageReduction - current.damageReduction
            }
        };
    },

    /**
     * Validate stat balance and provide recommendations
     * @param {Object} player - Player data
     * @returns {Object} Balance analysis and recommendations
     */
    analyzeStatBalance(player) {
        const total = player.strength + player.agility + player.vitality;
        const strength = player.strength / total;
        const agility = player.agility / total;
        const vitality = player.vitality / total;

        const analysis = {
            distribution: {
                strength: Math.round(strength * 100),
                agility: Math.round(agility * 100),
                vitality: Math.round(vitality * 100)
            },
            buildType: 'balanced',
            recommendations: [],
            powerLevel: this.calculatePowerLevel(player)
        };

        // Determine build type
        if (strength > 0.5) {
            analysis.buildType = 'damage-focused';
        } else if (agility > 0.5) {
            analysis.buildType = 'critical-focused';
        } else if (vitality > 0.5) {
            analysis.buildType = 'tank-focused';
        } else if (strength > 0.35 && agility > 0.35) {
            analysis.buildType = 'berserker';
        } else if (vitality > 0.35 && strength > 0.35) {
            analysis.buildType = 'warrior';
        } else if (vitality > 0.35 && agility > 0.35) {
            analysis.buildType = 'ranger';
        }

        // Provide recommendations based on imbalances
        if (vitality < 0.2 && player.level > 5) {
            analysis.recommendations.push('Consider investing in Vitality for survivability');
        }
        if (agility < 0.15 && player.level > 8) {
            analysis.recommendations.push('Low Agility may limit critical hit potential');
        }
        if (strength < 0.15 && player.level > 8) {
            analysis.recommendations.push('Low Strength may result in insufficient damage');
        }

        // Power level recommendations
        if (analysis.powerLevel < 50 && player.level > 10) {
            analysis.recommendations.push('Consider redistributing stats for better efficiency');
        }

        return analysis;
    },

    /**
     * Calculate overall power level of character
     * @param {Object} player - Player data
     * @returns {number} Power level (0-100)
     */
    calculatePowerLevel(player) {
        const stats = this.calculateAllStats(player);

        // Normalize stats based on level expectations
        const expectedAttack = 15 + (player.level * 2);
        const expectedHealth = 120 + (player.level * 8);
        const expectedCrit = 8 + (player.level * 0.5);

        const attackRatio = Math.min(1.5, stats.attackPower / expectedAttack);
        const healthRatio = Math.min(1.5, stats.maxHealth / expectedHealth);
        const critRatio = Math.min(1.5, stats.critChance / expectedCrit);

        // Weight the components
        const powerLevel = (attackRatio * 0.4 + healthRatio * 0.4 + critRatio * 0.2) * 100;

        return Math.round(Math.max(0, Math.min(100, powerLevel)));
    },

    /**
     * Get optimal stat distribution recommendations for a level
     * @param {number} level - Character level
     * @param {string} buildType - Desired build type
     * @returns {Object} Recommended stat distribution
     */
    getOptimalDistribution(level, buildType = 'balanced') {
        const totalPoints = 30 + (level - 1) * 3; // Base 30 + 3 per level

        const distributions = {
            balanced: { strength: 0.35, agility: 0.32, vitality: 0.33 },
            damage: { strength: 0.50, agility: 0.25, vitality: 0.25 },
            critical: { strength: 0.25, agility: 0.50, vitality: 0.25 },
            tank: { strength: 0.25, agility: 0.25, vitality: 0.50 },
            berserker: { strength: 0.45, agility: 0.40, vitality: 0.15 },
            warrior: { strength: 0.40, agility: 0.20, vitality: 0.40 },
            ranger: { strength: 0.20, agility: 0.40, vitality: 0.40 }
        };

        const dist = distributions[buildType] || distributions.balanced;

        return {
            strength: Math.floor(totalPoints * dist.strength),
            agility: Math.floor(totalPoints * dist.agility),
            vitality: Math.floor(totalPoints * dist.vitality),
            buildType,
            totalPoints
        };
    },

    /**
     * Update player's derived stats in GameState
     * @param {Object} player - Player object to update
     */
    updatePlayerDerivedStats(player) {
        if (!player) return;

        player.derivedStats = this.calculateAllStats(player);

        // Also update maxHealth in player object if it increased
        if (player.derivedStats.maxHealth > player.maxHealth) {
            const healthIncrease = player.derivedStats.maxHealth - player.maxHealth;
            player.maxHealth = player.derivedStats.maxHealth;
            player.health = Math.min(player.health + healthIncrease, player.maxHealth);
        }

        // Update GameState if available
        if (typeof GameState !== 'undefined' && GameState.player === player) {
            GameState.emit('playerUpdate', player);
        }

        return player.derivedStats;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterStats;
}
