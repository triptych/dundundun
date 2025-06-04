// Loot System - Handles loot generation for dungeons and monster defeats
// Integrates with the Items system to provide rewards
import Items from './items.js';

/**
 * Loot System for generating rewards from various sources
 */
const LootSystem = {
    /**
     * Generate loot when defeating a monster
     * @param {Object} enemy - The defeated enemy
     * @param {number} floor - Current dungeon floor
     * @returns {Array} Array of generated items
     */
    generateMonsterLoot(enemy, floor = 1) {
        const loot = [];

        // Base chance for loot drops
        const lootChance = 0.7; // 70% chance for monster to drop something

        if (Math.random() > lootChance) {
            console.log('No loot dropped from monster');
            return loot;
        }

        // Generate loot using Items system
        const monsterLoot = Items.generateLoot('monster_drop', floor);
        loot.push(...monsterLoot);

        // Additional gold reward based on enemy and floor
        const goldAmount = this.calculateGoldReward(enemy, floor);
        if (goldAmount > 0) {
            const goldItem = Items.createItem('gold_coin', goldAmount);
            if (goldItem) {
                loot.push(goldItem);
            }
        }

        // Boss enemies have higher chance for rare items
        if (enemy && enemy.type === 'boss') {
            const bonusLoot = this.generateBossLoot(floor);
            loot.push(...bonusLoot);
        }

        console.log(`Generated ${loot.length} loot items from monster:`, loot);
        return loot;
    },

    /**
     * Generate loot from treasure rooms
     * @param {number} floor - Current dungeon floor
     * @returns {Array} Array of generated items
     */
    generateTreasureLoot(floor = 1) {
        const loot = [];

        // Treasure rooms always give loot
        // Generate 1-3 items from treasure table
        const itemCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < itemCount; i++) {
            const treasureLoot = Items.generateLoot('treasure_room', floor);
            loot.push(...treasureLoot);
        }

        // Always include gold in treasure rooms
        const goldAmount = this.calculateTreasureGold(floor);
        if (goldAmount > 0) {
            const goldItem = Items.createItem('gold_coin', goldAmount);
            if (goldItem) {
                loot.push(goldItem);
            }
        }

        console.log(`Generated ${loot.length} treasure items:`, loot);
        return loot;
    },

    /**
     * Generate special loot for boss enemies
     * @param {number} floor - Current dungeon floor
     * @returns {Array} Array of generated bonus items
     */
    generateBossLoot(floor = 1) {
        const loot = [];

        // Bosses have guaranteed rare+ item chance
        // Force rare rarity for boss drops
        const rarityRoll = Math.random();
        let forcedRarity = 'rare';

        if (floor >= 10 && rarityRoll < 0.15) { // 15% legendary on floor 10+
            forcedRarity = 'legendary';
        } else if (floor >= 7 && rarityRoll < 0.25) { // 25% epic on floor 7+
            forcedRarity = 'epic';
        }

        // Generate boss-specific loot table
        const bossLootTable = this.getBossLootTable(forcedRarity);
        if (bossLootTable.length > 0) {
            const selectedItem = bossLootTable[Math.floor(Math.random() * bossLootTable.length)];
            const item = Items.createItem(selectedItem.id, selectedItem.quantity || 1);
            if (item) {
                loot.push(item);
            }
        }

        return loot;
    },

    /**
     * Get boss-specific loot table based on rarity
     * @param {string} rarity - Forced rarity level
     * @returns {Array} Boss loot table
     */
    getBossLootTable(rarity) {
        const tables = {
            rare: [
                { id: 'enchanted_blade', quantity: 1 },
                { id: 'ring_of_strength', quantity: 1 },
                { id: 'gem_ruby', quantity: 1 }
            ],
            epic: [
                { id: 'enchanted_blade', quantity: 1 },
                { id: 'ring_of_strength', quantity: 1 }
            ],
            legendary: [
                { id: 'enchanted_blade', quantity: 1 },
                { id: 'ring_of_strength', quantity: 1 }
            ]
        };

        return tables[rarity] || tables.rare;
    },

    /**
     * Calculate gold reward from defeating monsters
     * @param {Object} enemy - The defeated enemy
     * @param {number} floor - Current dungeon floor
     * @returns {number} Gold amount
     */
    calculateGoldReward(enemy, floor) {
        let baseGold = 5 + floor * 2; // Base: 5 + 2 per floor

        // Enemy type multipliers
        if (enemy) {
            switch (enemy.type) {
                case 'boss':
                    baseGold *= 3;
                    break;
                case 'elite':
                    baseGold *= 1.5;
                    break;
                default:
                    baseGold *= 1;
            }
        }

        // Add some randomness (±25%)
        const variance = baseGold * 0.25;
        const finalGold = Math.floor(baseGold + (Math.random() * variance * 2 - variance));

        return Math.max(1, finalGold);
    },

    /**
     * Calculate gold amount from treasure rooms
     * @param {number} floor - Current dungeon floor
     * @returns {number} Gold amount
     */
    calculateTreasureGold(floor) {
        const baseGold = 15 + floor * 5; // Base: 15 + 5 per floor
        const variance = baseGold * 0.3; // ±30% variance
        const finalGold = Math.floor(baseGold + (Math.random() * variance * 2 - variance));

        return Math.max(5, finalGold);
    },

    /**
     * Award loot to player and show notifications
     * @param {Array} loot - Array of loot items
     * @param {string} source - Source of loot (e.g., 'Monster', 'Treasure')
     */
    awardLoot(loot, source = 'Unknown') {
        if (!loot || loot.length === 0) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('No loot found', 1500, 'info');
            }
            return;
        }

        let goldGained = 0;
        const itemsGained = [];

        loot.forEach(item => {
            if (item.id === 'gold_coin') {
                goldGained += item.quantity;
                // Add gold to player inventory
                if (typeof GameState !== 'undefined') {
                    GameState.inventory.gold += item.quantity;
                }
            } else {
                // Try to add item to inventory
                if (typeof GameState !== 'undefined') {
                    const added = GameState.addItem(item);
                    if (added) {
                        itemsGained.push(item);
                    } else {
                        // Inventory full - show notification
                        if (typeof UI !== 'undefined' && UI.showNotification) {
                            UI.showNotification(`Inventory full! Lost ${item.name}`, 2000, 'warning');
                        }
                    }
                }
            }
        });

        // Show loot notifications
        this.showLootNotifications(goldGained, itemsGained, source);

        // Update UI
        if (typeof GameState !== 'undefined') {
            GameState.emit('inventoryUpdate', GameState.inventory);
        }
    },

    /**
     * Show notifications for gained loot
     * @param {number} goldGained - Amount of gold gained
     * @param {Array} itemsGained - Array of items gained
     * @param {string} source - Source of loot
     */
    showLootNotifications(goldGained, itemsGained, source) {
        if (typeof UI === 'undefined' || !UI.showNotification) return;

        // Show gold notification
        if (goldGained > 0) {
            UI.showNotification(`+${goldGained} Gold`, 1500, 'success');
        }

        // Show item notifications
        itemsGained.forEach((item, index) => {
            setTimeout(() => {
                const rarity = item.rarity || 'common';
                const notificationType = rarity === 'common' ? 'info' : 'success';
                const message = item.quantity > 1 ?
                    `Found ${item.quantity}x ${item.name}` :
                    `Found ${item.name}`;

                UI.showNotification(message, 2000, notificationType);
            }, index * 500); // Stagger notifications
        });

        // Summary notification for multiple items
        if (itemsGained.length > 1) {
            setTimeout(() => {
                UI.showNotification(`${source} loot: ${itemsGained.length} items gained`, 2000, 'info');
            }, itemsGained.length * 500 + 500);
        }
    },

    /**
     * Generate starter equipment for new players
     * @returns {Object} Starter equipment
     */
    generateStarterEquipment() {
        const equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        // Give starting weapon
        equipment.weapon = Items.createItem('iron_sword');

        return equipment;
    },

    /**
     * Check and trigger loot events based on room type
     * @param {Object} room - Current room
     * @param {number} floor - Current floor
     */
    handleRoomLoot(room, floor) {
        if (!room || room.isCleared) return;

        switch (room.type) {
            case 'treasure':
                const treasureLoot = this.generateTreasureLoot(floor);
                this.awardLoot(treasureLoot, 'Treasure');
                break;

            default:
                // No automatic loot for other room types
                break;
        }
    }
};

// Export for ES6 modules
export default LootSystem;
