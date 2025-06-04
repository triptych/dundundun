// Dun Dun Dungeon - Equipment System Foundation
// Comprehensive equipment system with weapon types, armor types, and comparison

/**
 * Equipment System Manager
 */
const EquipmentSystem = {
    // Equipment slot types
    slots: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        ACCESSORY: 'accessory'
    },

    // Weapon types with their characteristics
    weaponTypes: {
        SWORD: {
            name: 'Sword',
            description: 'Balanced weapons with moderate damage and speed',
            baseStats: {
                attackPower: 1.0,
                critChance: 0.05,
                attackSpeed: 1.0
            },
            icons: ['⚔️', '🗡️']
        },
        AXE: {
            name: 'Axe',
            description: 'Heavy weapons with high damage but slower speed',
            baseStats: {
                attackPower: 1.3,
                critChance: 0.0,
                attackSpeed: 0.8
            },
            icons: ['🪓']
        },
        BOW: {
            name: 'Bow',
            description: 'Ranged weapons with high critical chance',
            baseStats: {
                attackPower: 0.9,
                critChance: 0.15,
                attackSpeed: 1.1
            },
            icons: ['🏹']
        },
        STAFF: {
            name: 'Staff',
            description: 'Magical weapons that enhance abilities',
            baseStats: {
                attackPower: 0.8,
                critChance: 0.1,
                attackSpeed: 1.0,
                magicPower: 1.2
            },
            icons: ['🔮', '🪄']
        }
    },

    // Armor types with their characteristics
    armorTypes: {
        LIGHT: {
            name: 'Light Armor',
            description: 'Lightweight protection that doesn\'t hinder agility',
            baseStats: {
                defense: 0.8,
                maxHealth: 0.9,
                dodgeChance: 0.1,
                moveSpeed: 1.0
            },
            materials: ['Leather', 'Cloth', 'Hide']
        },
        MEDIUM: {
            name: 'Medium Armor',
            description: 'Balanced protection with moderate mobility',
            baseStats: {
                defense: 1.0,
                maxHealth: 1.0,
                dodgeChance: 0.05,
                moveSpeed: 0.95
            },
            materials: ['Chainmail', 'Scale', 'Reinforced Leather']
        },
        HEAVY: {
            name: 'Heavy Armor',
            description: 'Maximum protection at the cost of mobility',
            baseStats: {
                defense: 1.3,
                maxHealth: 1.2,
                dodgeChance: 0.0,
                moveSpeed: 0.85
            },
            materials: ['Plate', 'Full Plate', 'Enchanted Metal']
        }
    },

    // Accessory types
    accessoryTypes: {
        RING: {
            name: 'Ring',
            description: 'Magical rings that enhance various attributes',
            possibleStats: ['strength', 'agility', 'vitality', 'attackPower', 'critChance', 'maxHealth']
        },
        AMULET: {
            name: 'Amulet',
            description: 'Powerful amulets with defensive properties',
            possibleStats: ['maxHealth', 'defense', 'vitality', 'magicResist', 'healthRegen']
        }
    },

    // Equipment database expansion
    equipmentDatabase: {
        // SWORDS
        'rusty_sword': {
            id: 'rusty_sword',
            name: 'Rusty Sword',
            type: 'weapon',
            weaponType: 'SWORD',
            rarity: 'common',
            level: 1,
            description: 'An old sword covered in rust. +5 Attack Power',
            icon: '⚔️',
            stats: {
                attackPower: 5
            },
            value: 50
        },
        'iron_sword': {
            id: 'iron_sword',
            name: 'Iron Sword',
            type: 'weapon',
            weaponType: 'SWORD',
            rarity: 'common',
            level: 5,
            description: 'A sturdy iron sword. +10 Attack Power',
            icon: '⚔️',
            stats: {
                attackPower: 10
            },
            value: 150
        },
        'silver_blade': {
            id: 'silver_blade',
            name: 'Silver Blade',
            type: 'weapon',
            weaponType: 'SWORD',
            rarity: 'uncommon',
            level: 10,
            description: 'A gleaming silver sword. +18 Attack Power, +5% Crit',
            icon: '🗡️',
            stats: {
                attackPower: 18,
                critChance: 5
            },
            value: 350
        },

        // AXES
        'wooden_axe': {
            id: 'wooden_axe',
            name: 'Wooden Axe',
            type: 'weapon',
            weaponType: 'AXE',
            rarity: 'common',
            level: 1,
            description: 'A simple wooden axe. +7 Attack Power',
            icon: '🪓',
            stats: {
                attackPower: 7
            },
            value: 60
        },
        'battle_axe': {
            id: 'battle_axe',
            name: 'Battle Axe',
            type: 'weapon',
            weaponType: 'AXE',
            rarity: 'uncommon',
            level: 8,
            description: 'A fearsome battle axe. +22 Attack Power',
            icon: '🪓',
            stats: {
                attackPower: 22
            },
            value: 400
        },
        'berserker_axe': {
            id: 'berserker_axe',
            name: 'Berserker\'s Axe',
            type: 'weapon',
            weaponType: 'AXE',
            rarity: 'rare',
            level: 15,
            description: 'A massive axe of fury. +35 Attack Power, +3 Strength',
            icon: '🪓',
            stats: {
                attackPower: 35,
                strength: 3
            },
            value: 800
        },

        // BOWS
        'hunting_bow': {
            id: 'hunting_bow',
            name: 'Hunting Bow',
            type: 'weapon',
            weaponType: 'BOW',
            rarity: 'common',
            level: 1,
            description: 'A simple hunting bow. +6 Attack Power, +10% Crit',
            icon: '🏹',
            stats: {
                attackPower: 6,
                critChance: 10
            },
            value: 70
        },
        'longbow': {
            id: 'longbow',
            name: 'Longbow',
            type: 'weapon',
            weaponType: 'BOW',
            rarity: 'uncommon',
            level: 7,
            description: 'A powerful longbow. +14 Attack Power, +15% Crit',
            icon: '🏹',
            stats: {
                attackPower: 14,
                critChance: 15
            },
            value: 380
        },
        'elven_bow': {
            id: 'elven_bow',
            name: 'Elven Bow',
            type: 'weapon',
            weaponType: 'BOW',
            rarity: 'rare',
            level: 12,
            description: 'An elegant elven bow. +20 Attack Power, +25% Crit, +3 Agility',
            icon: '🏹',
            stats: {
                attackPower: 20,
                critChance: 25,
                agility: 3
            },
            value: 750
        },

        // STAVES
        'apprentice_staff': {
            id: 'apprentice_staff',
            name: 'Apprentice Staff',
            type: 'weapon',
            weaponType: 'STAFF',
            rarity: 'common',
            level: 1,
            description: 'A basic magical staff. +4 Attack Power, +10 Max Health',
            icon: '🔮',
            stats: {
                attackPower: 4,
                maxHealth: 10
            },
            value: 80
        },
        'mystic_staff': {
            id: 'mystic_staff',
            name: 'Mystic Staff',
            type: 'weapon',
            weaponType: 'STAFF',
            rarity: 'uncommon',
            level: 9,
            description: 'A staff of mystical power. +12 Attack Power, +20 Max Health, +2 Vitality',
            icon: '🪄',
            stats: {
                attackPower: 12,
                maxHealth: 20,
                vitality: 2
            },
            value: 420
        },
        'arcane_staff': {
            id: 'arcane_staff',
            name: 'Arcane Staff',
            type: 'weapon',
            weaponType: 'STAFF',
            rarity: 'rare',
            level: 14,
            description: 'A staff of pure arcane energy. +18 Attack Power, +40 Max Health, +5 All Stats',
            icon: '🔮',
            stats: {
                attackPower: 18,
                maxHealth: 40,
                strength: 5,
                agility: 5,
                vitality: 5
            },
            value: 900
        },

        // LIGHT ARMOR
        'cloth_armor': {
            id: 'cloth_armor',
            name: 'Cloth Armor',
            type: 'armor',
            armorType: 'LIGHT',
            rarity: 'common',
            level: 1,
            description: 'Simple cloth protection. +15 Max Health',
            icon: '👕',
            stats: {
                maxHealth: 15
            },
            value: 40
        },
        'leather_vest': {
            id: 'leather_vest',
            name: 'Leather Vest',
            type: 'armor',
            armorType: 'LIGHT',
            rarity: 'common',
            level: 5,
            description: 'Light leather armor. +25 Max Health, +5% Dodge',
            icon: '🦺',
            stats: {
                maxHealth: 25,
                dodgeChance: 5
            },
            value: 120
        },
        'ranger_garb': {
            id: 'ranger_garb',
            name: 'Ranger\'s Garb',
            type: 'armor',
            armorType: 'LIGHT',
            rarity: 'uncommon',
            level: 10,
            description: 'Nimble ranger armor. +35 Max Health, +10% Dodge, +2 Agility',
            icon: '🦺',
            stats: {
                maxHealth: 35,
                dodgeChance: 10,
                agility: 2
            },
            value: 350
        },

        // MEDIUM ARMOR
        'chainmail_shirt': {
            id: 'chainmail_shirt',
            name: 'Chainmail Shirt',
            type: 'armor',
            armorType: 'MEDIUM',
            rarity: 'common',
            level: 3,
            description: 'Basic chainmail protection. +30 Max Health',
            icon: '🛡️',
            stats: {
                maxHealth: 30
            },
            value: 150
        },
        'scale_armor': {
            id: 'scale_armor',
            name: 'Scale Armor',
            type: 'armor',
            armorType: 'MEDIUM',
            rarity: 'uncommon',
            level: 8,
            description: 'Protective scale mail. +45 Max Health, +5% Damage Reduction',
            icon: '🛡️',
            stats: {
                maxHealth: 45,
                damageReduction: 5
            },
            value: 380
        },
        'dragon_scale': {
            id: 'dragon_scale',
            name: 'Dragon Scale Armor',
            type: 'armor',
            armorType: 'MEDIUM',
            rarity: 'rare',
            level: 13,
            description: 'Armor made from dragon scales. +60 Max Health, +10% Damage Reduction, +3 All Stats',
            icon: '🛡️',
            stats: {
                maxHealth: 60,
                damageReduction: 10,
                strength: 3,
                agility: 3,
                vitality: 3
            },
            value: 850
        },

        // HEAVY ARMOR
        'iron_plate': {
            id: 'iron_plate',
            name: 'Iron Plate Armor',
            type: 'armor',
            armorType: 'HEAVY',
            rarity: 'common',
            level: 5,
            description: 'Heavy iron plates. +50 Max Health, +10% Damage Reduction',
            icon: '⚔️',
            stats: {
                maxHealth: 50,
                damageReduction: 10
            },
            value: 200
        },
        'steel_plate': {
            id: 'steel_plate',
            name: 'Steel Plate Armor',
            type: 'armor',
            armorType: 'HEAVY',
            rarity: 'uncommon',
            level: 10,
            description: 'Sturdy steel plate armor. +70 Max Health, +15% Damage Reduction, +2 Vitality',
            icon: '⚔️',
            stats: {
                maxHealth: 70,
                damageReduction: 15,
                vitality: 2
            },
            value: 450
        },
        'titan_armor': {
            id: 'titan_armor',
            name: 'Titan\'s Armor',
            type: 'armor',
            armorType: 'HEAVY',
            rarity: 'epic',
            level: 15,
            description: 'Legendary titan armor. +100 Max Health, +20% Damage Reduction, +5 Strength, +5 Vitality',
            icon: '⚔️',
            stats: {
                maxHealth: 100,
                damageReduction: 20,
                strength: 5,
                vitality: 5
            },
            value: 1200
        },

        // RINGS
        'copper_ring': {
            id: 'copper_ring',
            name: 'Copper Ring',
            type: 'accessory',
            accessoryType: 'RING',
            rarity: 'common',
            level: 1,
            description: 'A simple copper ring. +1 Strength',
            icon: '💍',
            stats: {
                strength: 1
            },
            value: 50
        },
        'silver_ring': {
            id: 'silver_ring',
            name: 'Silver Ring',
            type: 'accessory',
            accessoryType: 'RING',
            rarity: 'uncommon',
            level: 5,
            description: 'A polished silver ring. +2 Agility, +5% Crit',
            icon: '💍',
            stats: {
                agility: 2,
                critChance: 5
            },
            value: 200
        },
        'golden_ring': {
            id: 'golden_ring',
            name: 'Golden Ring',
            type: 'accessory',
            accessoryType: 'RING',
            rarity: 'rare',
            level: 10,
            description: 'A magnificent golden ring. +3 All Stats, +10 Attack Power',
            icon: '💍',
            stats: {
                strength: 3,
                agility: 3,
                vitality: 3,
                attackPower: 10
            },
            value: 600
        },

        // AMULETS
        'health_amulet': {
            id: 'health_amulet',
            name: 'Amulet of Health',
            type: 'accessory',
            accessoryType: 'AMULET',
            rarity: 'common',
            level: 2,
            description: 'An amulet that enhances vitality. +20 Max Health',
            icon: '📿',
            stats: {
                maxHealth: 20
            },
            value: 80
        },
        'protection_amulet': {
            id: 'protection_amulet',
            name: 'Amulet of Protection',
            type: 'accessory',
            accessoryType: 'AMULET',
            rarity: 'uncommon',
            level: 7,
            description: 'A protective amulet. +30 Max Health, +5% Damage Reduction',
            icon: '📿',
            stats: {
                maxHealth: 30,
                damageReduction: 5
            },
            value: 300
        },
        'divine_amulet': {
            id: 'divine_amulet',
            name: 'Divine Amulet',
            type: 'accessory',
            accessoryType: 'AMULET',
            rarity: 'epic',
            level: 12,
            description: 'A blessed amulet of divine power. +50 Max Health, +10% Damage Reduction, +5 Vitality',
            icon: '📿',
            stats: {
                maxHealth: 50,
                damageReduction: 10,
                vitality: 5
            },
            value: 800
        }
    },

    /**
     * Get equipment by ID
     * @param {string} equipmentId - Equipment ID
     * @returns {Object|null} Equipment definition or null
     */
    getEquipment(equipmentId) {
        return this.equipmentDatabase[equipmentId] || null;
    },

    /**
     * Get all equipment of a specific type
     * @param {string} type - Equipment type (weapon, armor, accessory)
     * @returns {Array} Array of equipment
     */
    getEquipmentByType(type) {
        return Object.values(this.equipmentDatabase).filter(eq => eq.type === type);
    },

    /**
     * Get equipment by weapon type
     * @param {string} weaponType - Weapon type (SWORD, AXE, BOW, STAFF)
     * @returns {Array} Array of weapons
     */
    getWeaponsByType(weaponType) {
        return Object.values(this.equipmentDatabase).filter(
            eq => eq.type === 'weapon' && eq.weaponType === weaponType
        );
    },

    /**
     * Get equipment by armor type
     * @param {string} armorType - Armor type (LIGHT, MEDIUM, HEAVY)
     * @returns {Array} Array of armor
     */
    getArmorByType(armorType) {
        return Object.values(this.equipmentDatabase).filter(
            eq => eq.type === 'armor' && eq.armorType === armorType
        );
    },

    /**
     * Compare two pieces of equipment
     * @param {Object} equipment1 - First equipment
     * @param {Object} equipment2 - Second equipment (or null for unequipped)
     * @returns {Object} Comparison results
     */
    compareEquipment(equipment1, equipment2) {
        const comparison = {
            canCompare: false,
            isBetter: false,
            isWorse: false,
            differences: {},
            summary: []
        };

        // Can't compare if first equipment is null
        if (!equipment1) return comparison;

        // Can only compare same type equipment
        if (equipment2 && equipment1.type !== equipment2.type) {
            comparison.summary.push('Cannot compare different equipment types');
            return comparison;
        }

        comparison.canCompare = true;

        // Get stats from both equipment
        const stats1 = equipment1.stats || {};
        const stats2 = equipment2?.stats || {};

        // Get all unique stat keys
        const allStats = new Set([...Object.keys(stats1), ...Object.keys(stats2)]);

        let betterCount = 0;
        let worseCount = 0;

        // Compare each stat
        for (const stat of allStats) {
            const value1 = stats1[stat] || 0;
            const value2 = stats2[stat] || 0;
            const diff = value1 - value2;

            if (diff !== 0) {
                comparison.differences[stat] = {
                    current: value2,
                    new: value1,
                    difference: diff,
                    isBetter: diff > 0
                };

                if (diff > 0) {
                    betterCount++;
                    comparison.summary.push(`+${diff} ${this.getStatDisplayName(stat)}`);
                } else {
                    worseCount++;
                    comparison.summary.push(`${diff} ${this.getStatDisplayName(stat)}`);
                }
            }
        }

        // Determine overall comparison
        comparison.isBetter = betterCount > worseCount;
        comparison.isWorse = worseCount > betterCount;

        // Add level comparison
        if (equipment1.level && equipment2?.level) {
            const levelDiff = equipment1.level - equipment2.level;
            if (levelDiff > 0) {
                comparison.summary.unshift(`${levelDiff} levels higher`);
            } else if (levelDiff < 0) {
                comparison.summary.unshift(`${Math.abs(levelDiff)} levels lower`);
            }
        }

        // Add rarity comparison
        if (equipment1.rarity !== equipment2?.rarity) {
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const rarity1Index = rarityOrder.indexOf(equipment1.rarity);
            const rarity2Index = rarityOrder.indexOf(equipment2?.rarity || 'common');

            if (rarity1Index > rarity2Index) {
                comparison.summary.unshift(`Higher rarity (${equipment1.rarity})`);
            } else if (rarity1Index < rarity2Index) {
                comparison.summary.unshift(`Lower rarity (${equipment1.rarity})`);
            }
        }

        return comparison;
    },

    /**
     * Get display name for a stat
     * @param {string} stat - Stat key
     * @returns {string} Display name
     */
    getStatDisplayName(stat) {
        const statNames = {
            attackPower: 'Attack Power',
            critChance: 'Critical Chance',
            maxHealth: 'Max Health',
            strength: 'Strength',
            agility: 'Agility',
            vitality: 'Vitality',
            damageReduction: 'Damage Reduction',
            dodgeChance: 'Dodge Chance',
            magicPower: 'Magic Power',
            defense: 'Defense',
            moveSpeed: 'Move Speed',
            healthRegen: 'Health Regen',
            magicResist: 'Magic Resist'
        };
        return statNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
    },

    /**
     * Calculate equipment score for sorting/comparison
     * @param {Object} equipment - Equipment to score
     * @returns {number} Equipment score
     */
    calculateEquipmentScore(equipment) {
        if (!equipment || !equipment.stats) return 0;

        let score = 0;

        // Weight different stats differently
        const statWeights = {
            attackPower: 1.5,
            critChance: 1.2,
            maxHealth: 1.0,
            strength: 2.0,
            agility: 2.0,
            vitality: 2.0,
            damageReduction: 1.8,
            dodgeChance: 1.3
        };

        for (const [stat, value] of Object.entries(equipment.stats)) {
            const weight = statWeights[stat] || 1.0;
            score += value * weight;
        }

        // Factor in rarity
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        score *= rarityMultipliers[equipment.rarity] || 1.0;

        // Factor in level requirement
        score += (equipment.level || 1) * 2;

        return Math.round(score);
    },

    /**
     * Get equipment suitable for a specific level range
     * @param {number} playerLevel - Player's current level
     * @param {string} type - Equipment type filter (optional)
     * @returns {Array} Suitable equipment
     */
    getEquipmentForLevel(playerLevel, type = null) {
        return Object.values(this.equipmentDatabase).filter(eq => {
            const levelReq = eq.level || 1;
            const levelRange = 5; // Equipment within 5 levels

            const levelMatch = levelReq <= playerLevel && levelReq >= playerLevel - levelRange;
            const typeMatch = !type || eq.type === type;

            return levelMatch && typeMatch;
        });
    },

    /**
     * Generate random equipment based on parameters
     * @param {Object} params - Generation parameters
     * @returns {Object} Generated equipment
     */
    generateRandomEquipment(params = {}) {
        const {
            type = null,
            rarity = 'common',
            level = 1,
            weaponType = null,
            armorType = null
        } = params;

        // Filter equipment based on parameters
        let candidates = Object.values(this.equipmentDatabase).filter(eq => {
            if (type && eq.type !== type) return false;
            if (rarity && eq.rarity !== rarity) return false;
            if (level && Math.abs((eq.level || 1) - level) > 3) return false;
            if (weaponType && eq.weaponType !== weaponType) return false;
            if (armorType && eq.armorType !== armorType) return false;
            return true;
        });

        if (candidates.length === 0) {
            // Fallback to any equipment of the correct type
            candidates = Object.values(this.equipmentDatabase).filter(
                eq => !type || eq.type === type
            );
        }

        if (candidates.length === 0) return null;

        // Select random equipment
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        // Create a copy with potential random modifiers
        return {
            ...selected,
            id: `${selected.id}_${Date.now()}`, // Unique instance ID
            baseId: selected.id // Reference to original
        };
    }
};

// Export for ES6 modules
export default EquipmentSystem;
