// Item System - Defines items, their properties, and interactions
const Items = {
    // Load equipment database from EquipmentSystem if available
    equipmentDatabase: typeof EquipmentSystem !== 'undefined' ? EquipmentSystem.equipmentDatabase : {},

    // Item type definitions
    types: {
        CONSUMABLE: 'consumable',
        WEAPON: 'weapon',
        ARMOR: 'armor',
        ACCESSORY: 'accessory',
        MATERIAL: 'material',
        TREASURE: 'treasure'
    },

    // Item rarity levels
    rarity: {
        COMMON: 'common',
        UNCOMMON: 'uncommon',
        RARE: 'rare',
        EPIC: 'epic',
        LEGENDARY: 'legendary'
    },

    // Item database with all available items
    database: {
        // Consumables
        'health_potion': {
            id: 'health_potion',
            name: 'Health Potion',
            type: 'consumable',
            rarity: 'common',
            description: 'Restores 50 health points',
            icon: '🧪',
            stackable: true,
            maxStack: 10,
            value: 25,
            effect: {
                type: 'heal',
                amount: 50
            }
        },
        'health_potion_greater': {
            id: 'health_potion_greater',
            name: 'Greater Health Potion',
            type: 'consumable',
            rarity: 'uncommon',
            description: 'Restores 100 health points',
            icon: '🧪',
            stackable: true,
            maxStack: 5,
            value: 60,
            effect: {
                type: 'heal',
                amount: 100
            }
        },
        'strength_boost': {
            id: 'strength_boost',
            name: 'Strength Elixir',
            type: 'consumable',
            rarity: 'uncommon',
            description: 'Temporarily increases strength by 5 for 3 turns',
            icon: '💪',
            stackable: true,
            maxStack: 3,
            value: 80,
            effect: {
                type: 'buff',
                stat: 'strength',
                amount: 5,
                duration: 3
            }
        },
        'agility_boost': {
            id: 'agility_boost',
            name: 'Agility Elixir',
            type: 'consumable',
            rarity: 'uncommon',
            description: 'Temporarily increases agility by 5 for 3 turns',
            icon: '🏃',
            stackable: true,
            maxStack: 3,
            value: 80,
            effect: {
                type: 'buff',
                stat: 'agility',
                amount: 5,
                duration: 3
            }
        },

        // Weapons
        'iron_sword': {
            id: 'iron_sword',
            name: 'Iron Sword',
            type: 'weapon',
            rarity: 'common',
            description: 'A sturdy iron sword. +8 Attack Power',
            icon: '⚔️',
            stackable: false,
            value: 150,
            stats: {
                attackPower: 8
            }
        },
        'steel_sword': {
            id: 'steel_sword',
            name: 'Steel Sword',
            type: 'weapon',
            rarity: 'uncommon',
            description: 'A sharp steel sword. +15 Attack Power',
            icon: '🗡️',
            stackable: false,
            value: 300,
            stats: {
                attackPower: 15
            }
        },
        'enchanted_blade': {
            id: 'enchanted_blade',
            name: 'Enchanted Blade',
            type: 'weapon',
            rarity: 'rare',
            description: 'A magically enhanced blade. +25 Attack Power, +10% Crit Chance',
            icon: '✨',
            stackable: false,
            value: 600,
            stats: {
                attackPower: 25,
                critChance: 10
            }
        },

        // Armor
        'leather_armor': {
            id: 'leather_armor',
            name: 'Leather Armor',
            type: 'armor',
            rarity: 'common',
            description: 'Basic leather armor. +20 Max Health',
            icon: '🦺',
            stackable: false,
            value: 100,
            stats: {
                maxHealth: 20
            }
        },
        'chainmail': {
            id: 'chainmail',
            name: 'Chainmail Armor',
            type: 'armor',
            rarity: 'uncommon',
            description: 'Sturdy chainmail protection. +40 Max Health',
            icon: '🛡️',
            stackable: false,
            value: 250,
            stats: {
                maxHealth: 40
            }
        },

        // Accessories
        'lucky_charm': {
            id: 'lucky_charm',
            name: 'Lucky Charm',
            type: 'accessory',
            rarity: 'uncommon',
            description: 'A mysterious charm that brings good fortune. +15% Crit Chance',
            icon: '🍀',
            stackable: false,
            value: 200,
            stats: {
                critChance: 15
            }
        },
        'ring_of_strength': {
            id: 'ring_of_strength',
            name: 'Ring of Strength',
            type: 'accessory',
            rarity: 'rare',
            description: 'Ancient ring imbued with power. +5 Strength',
            icon: '💍',
            stackable: false,
            value: 400,
            stats: {
                strength: 5
            }
        },

        // Materials/Treasures
        'gold_coin': {
            id: 'gold_coin',
            name: 'Gold Coin',
            type: 'treasure',
            rarity: 'common',
            description: 'A shiny gold coin',
            icon: '🪙',
            stackable: true,
            maxStack: 999,
            value: 1
        },
        'gem_ruby': {
            id: 'gem_ruby',
            name: 'Ruby Gem',
            type: 'treasure',
            rarity: 'rare',
            description: 'A precious ruby gemstone',
            icon: '💎',
            stackable: true,
            maxStack: 10,
            value: 500
        }
    },

    // Loot tables for different contexts
    lootTables: {
        treasure_room: {
            common: [
                { id: 'health_potion', weight: 20 },
                { id: 'gold_coin', weight: 30, quantityMin: 10, quantityMax: 50 },
                // Weapons
                { id: 'rusty_sword', weight: 10 },
                { id: 'wooden_axe', weight: 8 },
                { id: 'hunting_bow', weight: 8 },
                { id: 'apprentice_staff', weight: 6 },
                // Armor
                { id: 'cloth_armor', weight: 10 },
                { id: 'leather_vest', weight: 8 },
                // Accessories
                { id: 'copper_ring', weight: 5 },
                { id: 'health_amulet', weight: 5 }
            ],
            uncommon: [
                { id: 'health_potion_greater', weight: 15 },
                { id: 'strength_boost', weight: 10 },
                { id: 'agility_boost', weight: 10 },
                // Weapons
                { id: 'iron_sword', weight: 8 },
                { id: 'battle_axe', weight: 7 },
                { id: 'longbow', weight: 7 },
                { id: 'silver_blade', weight: 6 },
                // Armor
                { id: 'chainmail_shirt', weight: 8 },
                { id: 'scale_armor', weight: 7 },
                { id: 'ranger_garb', weight: 6 },
                // Accessories
                { id: 'silver_ring', weight: 8 },
                { id: 'protection_amulet', weight: 7 },
                { id: 'lucky_charm', weight: 6 }
            ],
            rare: [
                { id: 'gem_ruby', weight: 20 },
                // Weapons
                { id: 'berserker_axe', weight: 12 },
                { id: 'elven_bow', weight: 12 },
                { id: 'arcane_staff', weight: 10 },
                { id: 'enchanted_blade', weight: 10 },
                // Armor
                { id: 'dragon_scale', weight: 10 },
                { id: 'steel_plate', weight: 8 },
                // Accessories
                { id: 'golden_ring', weight: 10 },
                { id: 'ring_of_strength', weight: 8 }
            ],
            epic: [
                // Armor
                { id: 'titan_armor', weight: 30 },
                // Accessories
                { id: 'divine_amulet', weight: 30 },
                // Treasures
                { id: 'gem_ruby', weight: 40, quantityMin: 2, quantityMax: 5 }
            ]
        },
        monster_drop: {
            common: [
                { id: 'health_potion', weight: 40 },
                { id: 'gold_coin', weight: 40, quantityMin: 5, quantityMax: 20 },
                { id: 'cloth_armor', weight: 10 },
                { id: 'rusty_sword', weight: 10 }
            ],
            uncommon: [
                { id: 'health_potion_greater', weight: 30 },
                { id: 'strength_boost', weight: 20 },
                { id: 'agility_boost', weight: 20 },
                { id: 'copper_ring', weight: 15 },
                { id: 'health_amulet', weight: 15 }
            ],
            rare: [
                { id: 'iron_sword', weight: 20 },
                { id: 'leather_vest', weight: 20 },
                { id: 'silver_ring', weight: 20 },
                { id: 'gold_coin', weight: 40, quantityMin: 50, quantityMax: 100 }
            ]
        },
        boss_drop: {
            uncommon: [
                { id: 'health_potion_greater', weight: 20, quantityMin: 2, quantityMax: 3 },
                { id: 'iron_sword', weight: 15 },
                { id: 'chainmail_shirt', weight: 15 },
                { id: 'silver_ring', weight: 15 },
                { id: 'gold_coin', weight: 35, quantityMin: 100, quantityMax: 200 }
            ],
            rare: [
                { id: 'berserker_axe', weight: 15 },
                { id: 'elven_bow', weight: 15 },
                { id: 'dragon_scale', weight: 15 },
                { id: 'golden_ring', weight: 15 },
                { id: 'gem_ruby', weight: 20 },
                { id: 'gold_coin', weight: 20, quantityMin: 200, quantityMax: 500 }
            ],
            epic: [
                { id: 'titan_armor', weight: 25 },
                { id: 'divine_amulet', weight: 25 },
                { id: 'arcane_staff', weight: 25 },
                { id: 'gem_ruby', weight: 25, quantityMin: 3, quantityMax: 5 }
            ]
        }
    },

    /**
     * Get item definition by ID
     * @param {string} itemId - Item ID
     * @returns {Object|null} Item definition or null
     */
    getItem(itemId) {
        // Check both databases
        return this.database[itemId] || this.equipmentDatabase[itemId] || null;
    },

    /**
     * Create a new item instance
     * @param {string} itemId - Item ID
     * @param {number} quantity - Quantity (default 1)
     * @returns {Object|null} Item instance or null
     */
    createItem(itemId, quantity = 1) {
        const itemDef = this.getItem(itemId);
        if (!itemDef) return null;

        return {
            id: itemId,
            quantity: quantity,
            ...itemDef
        };
    },

    /**
     * Generate random loot from a loot table
     * @param {string} tableType - Type of loot table
     * @param {number} floor - Current floor for scaling
     * @returns {Array} Array of generated items
     */
    generateLoot(tableType, floor = 1) {
        const table = this.lootTables[tableType];
        if (!table) return [];

        const loot = [];

        // Determine rarity based on floor and random chance
        const rarityRoll = Math.random() * 100;
        let selectedRarity = 'common';

        if (floor >= 10 && rarityRoll < 2) { // 2% epic on floor 10+
            selectedRarity = 'epic';
        } else if (floor >= 5 && rarityRoll < 10) { // 10% rare on floor 5+
            selectedRarity = 'rare';
        } else if (floor >= 3 && rarityRoll < 25) { // 25% uncommon on floor 3+
            selectedRarity = 'uncommon';
        }

        const rarityTable = table[selectedRarity];
        if (!rarityTable || rarityTable.length === 0) return loot;

        // Calculate total weight
        const totalWeight = rarityTable.reduce((sum, item) => sum + item.weight, 0);

        // Select random item
        let roll = Math.random() * totalWeight;
        let selectedEntry = null;

        for (const entry of rarityTable) {
            roll -= entry.weight;
            if (roll <= 0) {
                selectedEntry = entry;
                break;
            }
        }

        if (selectedEntry) {
            const quantity = selectedEntry.quantityMin ?
                Math.floor(Math.random() * (selectedEntry.quantityMax - selectedEntry.quantityMin + 1)) + selectedEntry.quantityMin :
                1;

            const item = this.createItem(selectedEntry.id, quantity);
            if (item) {
                loot.push(item);
            }
        }

        return loot;
    },

    /**
     * Use an item (consume or equip)
     * @param {Object} item - Item to use
     * @param {number} slotIndex - Inventory slot index
     * @returns {boolean} True if item was used successfully
     */
    useItem(item, slotIndex) {
        if (!item) return false;

        switch (item.type) {
            case 'consumable':
                return this.useConsumable(item, slotIndex);
            case 'weapon':
            case 'armor':
            case 'accessory':
                return this.equipItem(item, slotIndex);
            default:
                console.log(`Cannot use item of type: ${item.type}`);
                return false;
        }
    },

    /**
     * Use a consumable item
     * @param {Object} item - Consumable item
     * @param {number} slotIndex - Inventory slot index
     * @returns {boolean} True if consumed successfully
     */
    useConsumable(item, slotIndex) {
        if (!item.effect) return false;

        let used = false;

        switch (item.effect.type) {
            case 'heal':
                const currentHealth = GameState.player.health;
                const maxHealth = GameState.player.maxHealth;

                if (currentHealth < maxHealth) {
                    const healAmount = Math.min(item.effect.amount, maxHealth - currentHealth);
                    GameState.updatePlayer({ health: currentHealth + healAmount });

                    if (typeof UI !== 'undefined' && UI.showNotification) {
                        UI.showNotification(`Healed ${healAmount} HP`, 1500, 'success');
                    }
                    used = true;
                } else {
                    if (typeof UI !== 'undefined' && UI.showNotification) {
                        UI.showNotification('Already at full health', 1500, 'warning');
                    }
                }
                break;

            case 'buff':
                // Apply temporary buff (this would need a buff system)
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification(`${item.name} used! +${item.effect.amount} ${item.effect.stat}`, 2000, 'info');
                }
                used = true;
                break;
        }

        if (used) {
            // Remove one from stack or remove item entirely
            this.consumeItemFromInventory(slotIndex);
        }

        return used;
    },

    /**
     * Equip an item
     * @param {Object} item - Equipment item
     * @param {number} slotIndex - Inventory slot index
     * @returns {boolean} True if equipped successfully
     */
    equipItem(item, slotIndex) {
        const equipSlot = item.type === 'weapon' ? 'weapon' :
                         item.type === 'armor' ? 'armor' : 'accessory';

        // Unequip current item if any
        const currentEquipped = GameState.player.equipment[equipSlot];
        if (currentEquipped) {
            // Add current equipped item back to inventory
            if (!GameState.addItem(currentEquipped)) {
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Inventory full! Cannot unequip current item', 2000, 'error');
                }
                return false;
            }
        }

        // Equip new item
        GameState.player.equipment[equipSlot] = { ...item };

        // Apply stat bonuses
        if (item.stats) {
            const updates = {};
            for (const [stat, value] of Object.entries(item.stats)) {
                if (stat === 'maxHealth') {
                    updates.maxHealth = GameState.player.maxHealth + value;
                    // Also heal if health increased
                    updates.health = Math.min(GameState.player.health + value, updates.maxHealth);
                } else if (GameState.player.hasOwnProperty(stat)) {
                    updates[stat] = GameState.player[stat] + value;
                }
            }
            if (Object.keys(updates).length > 0) {
                GameState.updatePlayer(updates);
            }
        }

        // Remove from inventory
        GameState.removeItem(slotIndex);

        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Equipped ${item.name}`, 1500, 'success');
        }

        return true;
    },

    /**
     * Drop an item from inventory
     * @param {number} slotIndex - Inventory slot index
     * @returns {boolean} True if dropped successfully
     */
    dropItem(slotIndex) {
        const item = GameState.inventory.items[slotIndex];
        if (!item) return false;

        // For now, just remove the item (could add ground items later)
        GameState.removeItem(slotIndex);

        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Dropped ${item.name}`, 1500, 'info');
        }

        return true;
    },

    /**
     * Consume one item from inventory stack
     * @param {number} slotIndex - Inventory slot index
     */
    consumeItemFromInventory(slotIndex) {
        const item = GameState.inventory.items[slotIndex];
        if (!item) return;

        if (item.stackable && item.quantity > 1) {
            // Reduce quantity
            item.quantity--;
            GameState.emit('inventoryUpdate', GameState.inventory);
        } else {
            // Remove item entirely
            GameState.removeItem(slotIndex);
        }
    },

    /**
     * Get item tooltip text
     * @param {Object} item - Item to get tooltip for
     * @returns {string} Tooltip text
     */
    getTooltip(item) {
        if (!item) return '';

        let tooltip = `${item.name}\n`;
        tooltip += `Rarity: ${item.rarity}\n`;
        tooltip += `${item.description}\n`;

        if (item.stats) {
            tooltip += '\nStats:\n';
            for (const [stat, value] of Object.entries(item.stats)) {
                const statName = stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                tooltip += `+${value} ${statName}\n`;
            }
        }

        if (item.stackable && item.quantity > 1) {
            tooltip += `\nQuantity: ${item.quantity}`;
        }

        tooltip += `\nValue: ${item.value} gold`;

        return tooltip;
    },

    /**
     * Get rarity color for UI
     * @param {string} rarity - Item rarity
     * @returns {string} CSS color
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800'
        };
        return colors[rarity] || colors.common;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Items;
}
