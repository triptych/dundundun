// Dun Dun Dungeon - Equipment Upgrade System
// Handles upgrading equipment using materials and gold

/**
 * Equipment Upgrade System
 */
const EquipmentUpgrade = {
    // Upgrade materials
    materials: {
        UPGRADE_STONE: {
            id: 'upgrade_stone',
            name: 'Upgrade Stone',
            description: 'A magical stone used to enhance equipment',
            icon: '💎',
            rarity: 'uncommon'
        },
        RARE_ESSENCE: {
            id: 'rare_essence',
            name: 'Rare Essence',
            description: 'Concentrated magical essence for advanced upgrades',
            icon: '✨',
            rarity: 'rare'
        },
        LEGENDARY_CRYSTAL: {
            id: 'legendary_crystal',
            name: 'Legendary Crystal',
            description: 'A powerful crystal containing ancient magic',
            icon: '🔮',
            rarity: 'legendary'
        }
    },

    // Upgrade tiers and requirements
    upgradeTiers: {
        1: { maxLevel: 3, material: 'upgrade_stone', materialCount: 1, goldCost: 50 },
        2: { maxLevel: 5, material: 'upgrade_stone', materialCount: 2, goldCost: 100 },
        3: { maxLevel: 7, material: 'rare_essence', materialCount: 1, goldCost: 200 },
        4: { maxLevel: 9, material: 'rare_essence', materialCount: 2, goldCost: 400 },
        5: { maxLevel: 10, material: 'legendary_crystal', materialCount: 1, goldCost: 800 }
    },

    // Stat increase per upgrade level
    statIncreases: {
        weapon: {
            attackPower: { base: 2, scaling: 0.15 }, // +2 base + 15% of current
            critChance: { base: 1, scaling: 0 } // +1% per level
        },
        armor: {
            maxHealth: { base: 5, scaling: 0.1 }, // +5 base + 10% of current
            damageReduction: { base: 1, scaling: 0 } // +1% per level
        },
        accessory: {
            // Varies by accessory type
            default: { base: 1, scaling: 0.1 }
        }
    },

    /**
     * Initialize the upgrade system
     */
    init() {
        console.log('Initializing Equipment Upgrade system...');

        // Add upgrade materials to item database
        this.registerUpgradeMaterials();

        console.log('Equipment Upgrade system initialized');
    },

    /**
     * Register upgrade materials in the item system
     */
    registerUpgradeMaterials() {
        if (typeof Items === 'undefined' || !Items.database) return;

        // Add upgrade materials to item database
        Object.values(this.materials).forEach(material => {
            Items.database[material.id] = {
                ...material,
                type: 'material',
                stackable: true,
                maxStack: 99,
                value: material.rarity === 'legendary' ? 500 :
                       material.rarity === 'rare' ? 200 : 100
            };
        });

        // Add materials to loot tables
        this.addMaterialsToLootTables();
    },

    /**
     * Add upgrade materials to existing loot tables
     */
    addMaterialsToLootTables() {
        if (typeof Items === 'undefined' || !Items.lootTables) return;

        // Add to treasure room loot
        if (Items.lootTables.treasure_room) {
            Items.lootTables.treasure_room.uncommon.push(
                { id: 'upgrade_stone', weight: 10 }
            );
            Items.lootTables.treasure_room.rare.push(
                { id: 'rare_essence', weight: 8 }
            );
            if (!Items.lootTables.treasure_room.legendary) {
                Items.lootTables.treasure_room.legendary = [];
            }
            Items.lootTables.treasure_room.legendary.push(
                { id: 'legendary_crystal', weight: 5 }
            );
        }

        // Add to boss drops
        if (Items.lootTables.boss_drop) {
            Items.lootTables.boss_drop.uncommon.push(
                { id: 'upgrade_stone', weight: 15, quantityMin: 1, quantityMax: 2 }
            );
            Items.lootTables.boss_drop.rare.push(
                { id: 'rare_essence', weight: 10 }
            );
            Items.lootTables.boss_drop.epic.push(
                { id: 'rare_essence', weight: 15, quantityMin: 1, quantityMax: 2 },
                { id: 'legendary_crystal', weight: 5 }
            );
        }
    },

    /**
     * Check if an equipment can be upgraded
     * @param {Object} equipment - Equipment to check
     * @returns {Object} Upgrade eligibility and requirements
     */
    canUpgrade(equipment) {
        const result = {
            canUpgrade: false,
            reason: '',
            requirements: null,
            currentLevel: 0,
            maxLevel: 10
        };

        // Check if equipment exists
        if (!equipment) {
            result.reason = 'No equipment selected';
            return result;
        }

        // Check if equipment type is upgradeable
        if (!['weapon', 'armor', 'accessory'].includes(equipment.type)) {
            result.reason = 'This item cannot be upgraded';
            return result;
        }

        // Get current upgrade level
        const currentLevel = equipment.upgradeLevel || 0;
        result.currentLevel = currentLevel;

        // Check if max level reached
        if (currentLevel >= 10) {
            result.reason = 'Maximum upgrade level reached';
            return result;
        }

        // Get upgrade requirements
        const tier = this.getUpgradeTier(currentLevel + 1);
        if (!tier) {
            result.reason = 'No upgrade path available';
            return result;
        }

        result.requirements = {
            material: tier.material,
            materialCount: tier.materialCount,
            goldCost: tier.goldCost
        };

        // Check if player has required materials
        const hasRequirements = this.checkUpgradeRequirements(result.requirements);

        if (!hasRequirements.hasMaterials) {
            result.reason = `Need ${result.requirements.materialCount}x ${this.materials[tier.material.toUpperCase()].name}`;
            return result;
        }

        if (!hasRequirements.hasGold) {
            result.reason = `Need ${result.requirements.goldCost} gold`;
            return result;
        }

        // Can upgrade!
        result.canUpgrade = true;
        result.reason = 'Ready to upgrade';
        return result;
    },

    /**
     * Get upgrade tier for a specific level
     * @param {number} level - Target upgrade level
     * @returns {Object} Upgrade tier requirements
     */
    getUpgradeTier(level) {
        for (const [tier, data] of Object.entries(this.upgradeTiers)) {
            if (level <= data.maxLevel) {
                return data;
            }
        }
        return null;
    },

    /**
     * Check if player has upgrade requirements
     * @param {Object} requirements - Required materials and gold
     * @returns {Object} Has materials and gold
     */
    checkUpgradeRequirements(requirements) {
        const result = {
            hasMaterials: false,
            hasGold: false
        };

        if (!GameState || !GameState.inventory) return result;

        // Check gold
        result.hasGold = (GameState.inventory.gold || 0) >= requirements.goldCost;

        // Check materials
        const materialCount = this.getPlayerMaterialCount(requirements.material);
        result.hasMaterials = materialCount >= requirements.materialCount;

        return result;
    },

    /**
     * Get player's material count
     * @param {string} materialId - Material ID to count
     * @returns {number} Material count
     */
    getPlayerMaterialCount(materialId) {
        if (!GameState || !GameState.inventory || !GameState.inventory.items) return 0;

        let count = 0;
        GameState.inventory.items.forEach(item => {
            if (item && item.id === materialId) {
                count += item.quantity || 1;
            }
        });

        return count;
    },

    /**
     * Upgrade equipment
     * @param {Object} equipment - Equipment to upgrade
     * @param {number} slotIndex - Equipment's inventory slot (if from inventory)
     * @returns {Object} Upgrade result
     */
    upgradeEquipment(equipment, slotIndex = null) {
        const upgradeCheck = this.canUpgrade(equipment);

        if (!upgradeCheck.canUpgrade) {
            return {
                success: false,
                message: upgradeCheck.reason
            };
        }

        const requirements = upgradeCheck.requirements;
        const newLevel = (equipment.upgradeLevel || 0) + 1;

        // Consume materials and gold
        this.consumeUpgradeMaterials(requirements);

        // Apply upgrade
        equipment.upgradeLevel = newLevel;
        equipment.name = this.getUpgradedName(equipment, newLevel);

        // Enhance stats
        this.enhanceEquipmentStats(equipment, newLevel);

        // Update equipment in inventory or equipped slot
        if (slotIndex !== null) {
            // Equipment is in inventory
            GameState.inventory.items[slotIndex] = equipment;
        } else {
            // Equipment is equipped - find which slot
            for (const [slot, equipped] of Object.entries(GameState.player.equipment)) {
                if (equipped && equipped.id === equipment.id) {
                    GameState.player.equipment[slot] = equipment;
                    break;
                }
            }
        }

        // Emit updates
        GameState.emit('inventoryUpdate', GameState.inventory);
        GameState.emit('playerUpdate', GameState.player);

        // Show success notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`${equipment.name} upgraded to +${newLevel}!`, 2000, 'success');
        }

        return {
            success: true,
            message: `Successfully upgraded to +${newLevel}`,
            newLevel: newLevel
        };
    },

    /**
     * Consume upgrade materials from inventory
     * @param {Object} requirements - Required materials and gold
     */
    consumeUpgradeMaterials(requirements) {
        if (!GameState || !GameState.inventory) return;

        // Consume gold
        GameState.inventory.gold -= requirements.goldCost;

        // Consume materials
        let materialsNeeded = requirements.materialCount;

        for (let i = 0; i < GameState.inventory.items.length && materialsNeeded > 0; i++) {
            const item = GameState.inventory.items[i];
            if (item && item.id === requirements.material) {
                const toConsume = Math.min(item.quantity || 1, materialsNeeded);

                if (item.quantity > toConsume) {
                    item.quantity -= toConsume;
                } else {
                    GameState.inventory.items[i] = null;
                }

                materialsNeeded -= toConsume;
            }
        }
    },

    /**
     * Get upgraded equipment name
     * @param {Object} equipment - Equipment being upgraded
     * @param {number} level - New upgrade level
     * @returns {string} Upgraded name
     */
    getUpgradedName(equipment, level) {
        const baseName = equipment.name.replace(/\s*\+\d+$/, ''); // Remove existing +X
        return `${baseName} +${level}`;
    },

    /**
     * Enhance equipment stats based on upgrade level
     * @param {Object} equipment - Equipment to enhance
     * @param {number} level - Upgrade level
     */
    enhanceEquipmentStats(equipment, level) {
        if (!equipment.stats) equipment.stats = {};

        const statConfig = this.statIncreases[equipment.type] || this.statIncreases.accessory;

        // Apply stat increases based on equipment type
        switch (equipment.type) {
            case 'weapon':
                this.enhanceStat(equipment, 'attackPower', level, statConfig.attackPower);
                if (equipment.weaponType === 'BOW' || equipment.weaponType === 'SWORD') {
                    this.enhanceStat(equipment, 'critChance', level, statConfig.critChance);
                }
                break;

            case 'armor':
                this.enhanceStat(equipment, 'maxHealth', level, statConfig.maxHealth);
                if (equipment.armorType === 'HEAVY' || equipment.armorType === 'MEDIUM') {
                    this.enhanceStat(equipment, 'damageReduction', level, statConfig.damageReduction);
                }
                break;

            case 'accessory':
                // Enhance primary stat
                const primaryStat = Object.keys(equipment.stats)[0];
                if (primaryStat) {
                    this.enhanceStat(equipment, primaryStat, level, statConfig.default);
                }
                break;
        }

        // Update description
        this.updateEquipmentDescription(equipment);
    },

    /**
     * Enhance a specific stat
     * @param {Object} equipment - Equipment to enhance
     * @param {string} statName - Stat to enhance
     * @param {number} level - Upgrade level
     * @param {Object} config - Stat enhancement config
     */
    enhanceStat(equipment, statName, level, config) {
        if (!equipment.baseStats) {
            equipment.baseStats = { ...equipment.stats };
        }

        const baseStat = equipment.baseStats[statName] || 0;
        const increase = config.base * level + Math.floor(baseStat * config.scaling * level);

        equipment.stats[statName] = baseStat + increase;
    },

    /**
     * Update equipment description with upgrade info
     * @param {Object} equipment - Equipment to update
     */
    updateEquipmentDescription(equipment) {
        const baseDesc = equipment.description.replace(/\s*\(.*\)$/, ''); // Remove existing upgrade info
        const upgradeInfo = [];

        // Add stat info
        for (const [stat, value] of Object.entries(equipment.stats)) {
            const statName = EquipmentSystem ? EquipmentSystem.getStatDisplayName(stat) : stat;
            upgradeInfo.push(`+${value} ${statName}`);
        }

        equipment.description = `${baseDesc} (${upgradeInfo.join(', ')})`;
    },

    /**
     * Preview upgrade results
     * @param {Object} equipment - Equipment to preview upgrade for
     * @returns {Object} Preview of upgraded stats
     */
    previewUpgrade(equipment) {
        const canUpgradeResult = this.canUpgrade(equipment);

        if (!canUpgradeResult.canUpgrade) {
            return null;
        }

        // Create a copy to preview changes
        const preview = JSON.parse(JSON.stringify(equipment));
        const newLevel = (equipment.upgradeLevel || 0) + 1;

        preview.upgradeLevel = newLevel;
        preview.name = this.getUpgradedName(preview, newLevel);
        this.enhanceEquipmentStats(preview, newLevel);

        return {
            current: equipment,
            upgraded: preview,
            requirements: canUpgradeResult.requirements,
            statChanges: this.compareStats(equipment.stats, preview.stats)
        };
    },

    /**
     * Compare stats between current and upgraded equipment
     * @param {Object} currentStats - Current equipment stats
     * @param {Object} upgradedStats - Upgraded equipment stats
     * @returns {Object} Stat differences
     */
    compareStats(currentStats, upgradedStats) {
        const changes = {};

        for (const [stat, value] of Object.entries(upgradedStats)) {
            const currentValue = currentStats[stat] || 0;
            const difference = value - currentValue;

            if (difference > 0) {
                changes[stat] = {
                    current: currentValue,
                    upgraded: value,
                    increase: difference
                };
            }
        }

        return changes;
    },

    /**
     * Get upgrade cost preview
     * @param {Object} equipment - Equipment to check
     * @returns {Object} Upgrade costs
     */
    getUpgradeCost(equipment) {
        const canUpgradeResult = this.canUpgrade(equipment);

        if (!canUpgradeResult.requirements) {
            return null;
        }

        const material = this.materials[canUpgradeResult.requirements.material.toUpperCase()];

        return {
            material: {
                name: material.name,
                icon: material.icon,
                required: canUpgradeResult.requirements.materialCount,
                available: this.getPlayerMaterialCount(canUpgradeResult.requirements.material)
            },
            gold: {
                required: canUpgradeResult.requirements.goldCost,
                available: GameState.inventory.gold || 0
            },
            canAfford: canUpgradeResult.canUpgrade
        };
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        EquipmentUpgrade.init();
    }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentUpgrade;
}
