// Equipment and Loot Integration - Ensures all systems work together
// This file handles the integration between equipment, loot, and existing systems

/**
 * Equipment Integration Helper
 */
const EquipmentIntegration = {
    /**
     * Initialize equipment integration
     */
    init() {
        console.log('Initializing equipment integration...');

        // Ensure UI updates when player changes
        if (typeof GameState !== 'undefined') {
            GameState.on('playerUpdate', (player) => {
                this.updateEquipmentDisplay(player.equipment);
            });
        }

        // Set up equipment listeners if UI is available
        if (typeof UI !== 'undefined' && typeof UI.setupEquipmentListeners === 'function') {
            UI.setupEquipmentListeners();
        }

        console.log('Equipment integration initialized');
    },

    /**
     * Update equipment display
     * @param {Object} equipment - Player equipment
     */
    updateEquipmentDisplay(equipment) {
        if (!equipment) return;

        // Update weapon slot
        const weaponSlot = document.getElementById('equipped-weapon');
        if (weaponSlot) {
            this.updateEquipmentSlot(weaponSlot, equipment.weapon, '⚔️', 'No weapon equipped');
        }

        // Update armor slot
        const armorSlot = document.getElementById('equipped-armor');
        if (armorSlot) {
            this.updateEquipmentSlot(armorSlot, equipment.armor, '🛡️', 'No armor equipped');
        }

        // Update accessory slot
        const accessorySlot = document.getElementById('equipped-accessory');
        if (accessorySlot) {
            this.updateEquipmentSlot(accessorySlot, equipment.accessory, '💍', 'No accessory equipped');
        }
    },

    /**
     * Update a single equipment slot
     * @param {HTMLElement} slotElement - The slot element to update
     * @param {Object} item - The equipped item (or null)
     * @param {string} emptyIcon - Icon to show when empty
     * @param {string} emptyTooltip - Tooltip for empty slot
     */
    updateEquipmentSlot(slotElement, item, emptyIcon, emptyTooltip) {
        if (item) {
            const rarityColor = typeof Items !== 'undefined' ? Items.getRarityColor(item.rarity) : '#fff';
            const weaponType = this.getWeaponType(item);

            slotElement.innerHTML = `
                <div class="equipped-item" style="color: ${rarityColor};">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-name">${item.name}</div>
                    ${weaponType ? `<div class="item-type">${weaponType}</div>` : ''}
                </div>
            `;
            slotElement.title = typeof Items !== 'undefined' ? Items.getTooltip(item) : item.name;
        } else {
            slotElement.innerHTML = `<div class="empty-slot">${emptyIcon}</div>`;
            slotElement.title = emptyTooltip;
        }
    },

    /**
     * Extract weapon type from item name or description
     * @param {Object} item - The item to analyze
     * @returns {string} Weapon type or empty string
     */
    getWeaponType(item) {
        if (!item || item.type !== 'weapon') return '';

        const name = item.name.toLowerCase();
        const description = (item.description || '').toLowerCase();

        // Extract weapon type from name
        if (name.includes('sword')) return 'Sword';
        if (name.includes('blade')) return 'Blade';
        if (name.includes('axe')) return 'Axe';
        if (name.includes('mace')) return 'Mace';
        if (name.includes('hammer')) return 'Hammer';
        if (name.includes('dagger')) return 'Dagger';
        if (name.includes('spear')) return 'Spear';
        if (name.includes('bow')) return 'Bow';
        if (name.includes('staff')) return 'Staff';
        if (name.includes('wand')) return 'Wand';

        // Check description as fallback
        if (description.includes('sword')) return 'Sword';
        if (description.includes('blade')) return 'Blade';
        if (description.includes('axe')) return 'Axe';
        if (description.includes('mace')) return 'Mace';
        if (description.includes('hammer')) return 'Hammer';
        if (description.includes('dagger')) return 'Dagger';
        if (description.includes('spear')) return 'Spear';
        if (description.includes('bow')) return 'Bow';
        if (description.includes('staff')) return 'Staff';
        if (description.includes('wand')) return 'Wand';

        // Default for weapons without specific type
        return 'Weapon';
    },

    /**
     * Enhance combat system with loot generation
     */
    enhanceCombatWithLoot() {
        // Override combat end to include loot
        if (typeof Combat !== 'undefined' && Combat.endCombat) {
            const originalEndCombat = Combat.endCombat;

            Combat.endCombat = function(playerWon, onCombatEnd = null) {
                if (playerWon && typeof LootSystem !== 'undefined' && GameState.combat.enemy) {
                    // Award experience first
                    if (GameState.combat.enemy) {
                        const exp = GameState.combat.enemy.experience || 10;
                        GameState.addExperience(exp);
                        GameState.combat.log.push(`Victory! Gained ${exp} experience!`);
                    }

                    // Generate loot
                    const enemy = GameState.combat.enemy;
                    const floor = GameState.dungeon.currentFloor;

                    // Add type property for loot calculation
                    if (enemy.isBoss) {
                        enemy.type = 'boss';
                    }

                    const loot = LootSystem.generateMonsterLoot(enemy, floor);
                    LootSystem.awardLoot(loot, 'Monster');

                    // Call original method but skip the old loot generation
                    const modifiedPlayerWon = playerWon;
                    GameState.endCombat(modifiedPlayerWon);

                    if (typeof UI !== 'undefined' && UI.showNotification) {
                        UI.showNotification('Victory!', 1500);
                    }
                } else {
                    // Call original method for losses
                    originalEndCombat.call(this, playerWon, onCombatEnd);
                }

                // Call completion callback if provided
                if (onCombatEnd) {
                    onCombatEnd(playerWon);
                }
            };
        }
    },

    /**
     * Enhance rooms system with loot integration
     */
    enhanceRoomsWithLoot() {
        // Override treasure room handling
        if (typeof Rooms !== 'undefined' && Rooms.handleTreasureRoom) {
            const originalHandleTreasureRoom = Rooms.handleTreasureRoom;

            Rooms.handleTreasureRoom = function() {
                console.log('Found treasure!');

                // Use LootSystem for treasure generation
                if (typeof LootSystem !== 'undefined') {
                    const floor = GameState.dungeon.currentFloor;
                    const loot = LootSystem.generateTreasureLoot(floor);
                    LootSystem.awardLoot(loot, 'Treasure');
                } else {
                    // Fallback to original method
                    originalHandleTreasureRoom.call(this);
                    return;
                }

                // Mark room as cleared
                GameState.dungeon.currentRoom.isCleared = true;
            };
        }
    },

    /**
     * Apply equipment stat bonuses to combat calculations
     */
    enhanceCombatStats() {
        if (typeof Combat !== 'undefined') {
            // Override attack power calculation to include equipment
            const originalCalculateAttackPower = Combat.calculateAttackPower;

            Combat.calculateAttackPower = function() {
                let attackPower = Math.floor(10 + (GameState.player.strength * 1.5));

                // Add weapon bonus
                if (GameState.player.equipment.weapon && GameState.player.equipment.weapon.stats) {
                    attackPower += GameState.player.equipment.weapon.stats.attackPower || 0;
                }

                // Add accessory bonus
                if (GameState.player.equipment.accessory && GameState.player.equipment.accessory.stats) {
                    attackPower += GameState.player.equipment.accessory.stats.attackPower || 0;
                }

                return attackPower;
            };

            // Override crit chance calculation to include equipment
            const originalCalculateCritChance = Combat.calculateCritChance;

            Combat.calculateCritChance = function() {
                let critChance = 5 + (GameState.player.agility * 0.5);

                // Add weapon bonus
                if (GameState.player.equipment.weapon && GameState.player.equipment.weapon.stats) {
                    critChance += GameState.player.equipment.weapon.stats.critChance || 0;
                }

                // Add accessory bonus
                if (GameState.player.equipment.accessory && GameState.player.equipment.accessory.stats) {
                    critChance += GameState.player.equipment.accessory.stats.critChance || 0;
                }

                return critChance;
            };
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        EquipmentIntegration.init();
        EquipmentIntegration.enhanceCombatWithLoot();
        EquipmentIntegration.enhanceRoomsWithLoot();
        EquipmentIntegration.enhanceCombatStats();
    }, 100);
});

// Export for ES6 modules
export default EquipmentIntegration;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.EquipmentIntegration = EquipmentIntegration;
}
