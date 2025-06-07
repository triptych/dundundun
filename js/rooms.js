// Room System - Room events and floor management
const Rooms = {
    /**
     * Handle room events when player enters a new room
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     * @param {Function} onFloorAdvance - Callback when advancing to next floor
     */
    handleRoomEvents(onCombatTriggered = null, onFloorAdvance = null) {
        const currentRoom = GameState.dungeon.currentRoom;
        if (!currentRoom) return;

        // Only trigger events for newly explored rooms or uncleared rooms
        if (!currentRoom.isExplored) {
            console.log(`Entering new ${currentRoom.type} room at (${currentRoom.x}, ${currentRoom.y})`);
        }

        // Handle room type specific events
        switch (currentRoom.type) {
            case 'monster':
                if (!currentRoom.isCleared) {
                    this.handleMonsterRoom(onCombatTriggered);
                }
                break;
            case 'treasure':
                if (!currentRoom.isCleared) {
                    this.handleTreasureRoom();
                }
                break;
            case 'boss':
                if (!currentRoom.isCleared) {
                    this.handleBossRoom(onCombatTriggered);
                }
                break;
            case 'stairs':
                this.handleStairsRoom(onFloorAdvance);
                break;
            case 'start':
                this.handleStartRoom();
                break;
            case 'store':
                this.handleStoreRoom();
                break;
            case 'chest':
                if (!currentRoom.isCleared) {
                    this.handleChestRoom(onCombatTriggered);
                }
                break;
            case 'campfire':
                this.handleCampfireRoom();
                break;
            case 'quest':
                if (!currentRoom.isCleared) {
                    this.handleQuestRoom();
                }
                break;
            case 'empty':
                this.handleEmptyRoom(onCombatTriggered);
                break;
            default:
                console.warn(`Unknown room type: ${currentRoom.type}`);
        }
    },

    /**
     * Handle monster room encounters
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     */
    handleMonsterRoom(onCombatTriggered = null) {
        console.log('Monster room encounter!');

        if (onCombatTriggered) {
            onCombatTriggered('standard');
        } else if (typeof Combat !== 'undefined') {
            Combat.triggerCombat();
        }
    },

    /**
     * Handle treasure room events
     */
    handleTreasureRoom() {
        console.log('Found treasure!');

        // Generate treasure based on floor level
        const floor = GameState.dungeon.currentFloor;
        const treasureGold = Math.floor(Math.random() * 50) + (floor * 10);

        // Generate items using the Items system
        let generatedItems = [];
        let itemsMessage = '';

        if (typeof Items !== 'undefined') {
            generatedItems = Items.generateLoot('treasure_room', floor);

            if (generatedItems.length > 0) {
                let itemsAdded = 0;

                for (const item of generatedItems) {
                    if (GameState.addItem(item)) {
                        itemsAdded++;
                        console.log(`Added item to inventory: ${item.name} x${item.quantity}`);
                    } else {
                        console.log(`Inventory full, could not add: ${item.name}`);
                        if (typeof UI !== 'undefined' && UI.showNotification) {
                            UI.showNotification('Inventory full! Some items were lost.', 2000, 'warning');
                        }
                        break;
                    }
                }

                if (itemsAdded > 0) {
                    const itemNames = generatedItems.slice(0, itemsAdded).map(item =>
                        item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name
                    ).join(', ');
                    itemsMessage = ` and found: ${itemNames}`;
                }
            }
        } else {
            // Fallback if Items system not available
            console.warn('Items system not available, using fallback treasure generation');

            // Chance for special items (fallback)
            const hasSpecialItem = Math.random() < 0.3; // 30% chance

            if (hasSpecialItem) {
                const items = ['Health Potion', 'Strength Boost', 'Lucky Charm'];
                const item = items[Math.floor(Math.random() * items.length)];
                itemsMessage = ` and a ${item}`;
                console.log(`Found special item: ${item}`);
            }
        }

        // Award gold
        GameState.updateInventory({ gold: GameState.inventory.gold + treasureGold });

        // Mark room as cleared
        GameState.dungeon.currentRoom.isCleared = true;

        // Show notification
        const message = `Found ${treasureGold} gold${itemsMessage}!`;
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(message, 3000, 'success');
        }

        console.log(`Treasure room cleared: ${message}`);
    },

    /**
     * Handle boss room encounters
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     */
    handleBossRoom(onCombatTriggered = null) {
        console.log('Boss room encounter!');

        if (onCombatTriggered) {
            onCombatTriggered('boss');
        } else if (typeof Combat !== 'undefined') {
            Combat.triggerBossCombat();
        }
    },

    /**
     * Handle stairs room events
     * @param {Function} onFloorAdvance - Callback when advancing to next floor
     */
    handleStairsRoom(onFloorAdvance = null) {
        console.log('Found stairs to next floor');

        // Set level transition flag to disable movement
        if (typeof GameState !== 'undefined') {
            GameState.current.isTransitioningLevel = true;
            console.log('Level transition flag set to true - movement disabled');
        }

        // Show option to advance to next floor
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Stairs to next floor found! (Auto-advancing in 2 seconds)', 3000, 'info');

            // Auto-advance after a delay
            setTimeout(() => {
                if (onFloorAdvance) {
                    onFloorAdvance();
                } else {
                    this.advanceToNextFloor();
                }
            }, 2000);
        }
    },

    /**
     * Handle start room (safe room)
     */
    handleStartRoom() {
        console.log('In start room - safe area');

        // Heal player slightly in start room
        if (GameState.player.health < GameState.player.maxHealth) {
            const healAmount = Math.floor(GameState.player.maxHealth * 0.1); // 10% heal
            const newHealth = Math.min(GameState.player.maxHealth, GameState.player.health + healAmount);

            if (newHealth > GameState.player.health) {
                GameState.updatePlayer({ health: newHealth });

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification(`Restored ${newHealth - GameState.player.health} health`, 1500, 'success');
                }
            }
        }
    },

    /**
     * Handle store room events
     */
    handleStoreRoom() {
        console.log('Found a merchant store!');

        // Show store notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Merchant Store found! Click to open shop', 3000, 'info');
        }

        // Open store interface if Store system is available
        if (typeof Store !== 'undefined') {
            Store.openStore();
        } else {
            console.warn('Store system not available');
        }
    },

    /**
     * Handle chest room events (random chance for loot, gold, or combat)
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     */
    handleChestRoom(onCombatTriggered = null) {
        console.log('Found a mysterious chest!');

        const floor = GameState.dungeon.currentFloor;
        const random = Math.random();

        if (random < 0.4) {
            // 40% chance for good loot
            const gold = Math.floor(Math.random() * 30) + (floor * 8);

            // Generate items using the Items system
            let generatedItems = [];
            let itemsMessage = '';

            if (typeof Items !== 'undefined') {
                generatedItems = Items.generateLoot('chest', floor);

                if (generatedItems.length > 0) {
                    let itemsAdded = 0;

                    for (const item of generatedItems) {
                        if (GameState.addItem(item)) {
                            itemsAdded++;
                            console.log(`Added item to inventory: ${item.name} x${item.quantity}`);
                        } else {
                            console.log(`Inventory full, could not add: ${item.name}`);
                            if (typeof UI !== 'undefined' && UI.showNotification) {
                                UI.showNotification('Inventory full! Some items were lost.', 2000, 'warning');
                            }
                            break;
                        }
                    }

                    if (itemsAdded > 0) {
                        const itemNames = generatedItems.slice(0, itemsAdded).map(item =>
                            item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name
                        ).join(', ');
                        itemsMessage = ` and found: ${itemNames}`;
                    }
                }
            }

            GameState.updateInventory({ gold: GameState.inventory.gold + gold });

            const message = `Chest contained ${gold} gold${itemsMessage}!`;
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(message, 3000, 'success');
            }
        } else if (random < 0.7) {
            // 30% chance for just gold
            const gold = Math.floor(Math.random() * 20) + (floor * 5);
            GameState.updateInventory({ gold: GameState.inventory.gold + gold });

            const message = `Chest contained ${gold} gold!`;
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(message, 2000, 'success');
            }
        } else {
            // 30% chance for trap/combat
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('The chest was trapped! A guardian emerges!', 2000, 'warning');
            }

            if (onCombatTriggered) {
                onCombatTriggered('chest_guardian');
            } else if (typeof Combat !== 'undefined') {
                Combat.triggerCombat();
            }
            return; // Don't mark as cleared if combat is triggered
        }

        // Mark room as cleared
        GameState.dungeon.currentRoom.isCleared = true;
    },

    /**
     * Handle campfire room events (healing room)
     */
    handleCampfireRoom() {
        console.log('Found a warm campfire!');

        // Allow player to heal at campfire
        if (GameState.player.health < GameState.player.maxHealth) {
            const healAmount = Math.floor(GameState.player.maxHealth * 0.5); // 50% heal
            const newHealth = Math.min(GameState.player.maxHealth, GameState.player.health + healAmount);
            const actualHealing = newHealth - GameState.player.health;

            if (actualHealing > 0) {
                GameState.updatePlayer({ health: newHealth });

                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification(`Rested by the campfire and restored ${actualHealing} health`, 3000, 'success');
                }
            } else {
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('You are already at full health', 2000, 'info');
                }
            }
        } else {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('The warm campfire provides comfort, but you are already at full health', 2000, 'info');
            }
        }

        // Campfire rooms can be used multiple times (don't mark as cleared)
    },

    /**
     * Handle quest room events
     */
    handleQuestRoom() {
        console.log('Found a quest room!');

        const floor = GameState.dungeon.currentFloor;

        // Simple quest: choose between risk/reward options
        const questOptions = [
            {
                name: 'Ancient Artifact',
                description: 'An ancient artifact glows with mysterious energy. Touch it?',
                riskChance: 0.3,
                goodReward: { gold: floor * 15, exp: floor * 5 },
                badResult: { damage: Math.floor(GameState.player.maxHealth * 0.2) }
            },
            {
                name: 'Mysterious Potion',
                description: 'A bubbling potion sits on a pedestal. Drink it?',
                riskChance: 0.4,
                goodReward: { healthBoost: Math.floor(GameState.player.maxHealth * 0.3) },
                badResult: { damage: Math.floor(GameState.player.maxHealth * 0.15) }
            },
            {
                name: 'Strange Shrine',
                description: 'A shrine asks for an offering. Give 50 gold?',
                riskChance: 0.2,
                cost: 50,
                goodReward: { gold: floor * 20, exp: floor * 8 },
                badResult: { goldLoss: 50 }
            }
        ];

        const quest = questOptions[Math.floor(Math.random() * questOptions.length)];

        // Auto-accept quest for now (could be expanded with UI choices)
        if (quest.cost && GameState.inventory.gold < quest.cost) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`${quest.description} Not enough gold!`, 3000, 'warning');
            }
            return;
        }

        const isSuccess = Math.random() > quest.riskChance;

        if (isSuccess) {
            // Good outcome
            let message = `${quest.name}: Success! `;

            if (quest.cost) {
                GameState.updateInventory({ gold: GameState.inventory.gold - quest.cost });
                message += `Paid ${quest.cost} gold and `;
            }

            if (quest.goodReward.gold) {
                GameState.updateInventory({ gold: GameState.inventory.gold + quest.goodReward.gold });
                message += `gained ${quest.goodReward.gold} gold `;
            }

            if (quest.goodReward.exp) {
                GameState.addExperience(quest.goodReward.exp);
                message += `and ${quest.goodReward.exp} experience `;
            }

            if (quest.goodReward.healthBoost) {
                const newHealth = Math.min(GameState.player.maxHealth, GameState.player.health + quest.goodReward.healthBoost);
                const actualHealing = newHealth - GameState.player.health;
                GameState.updatePlayer({ health: newHealth });
                message += `and restored ${actualHealing} health `;
            }

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(message + '!', 4000, 'success');
            }
        } else {
            // Bad outcome
            let message = `${quest.name}: Failed! `;

            if (quest.cost) {
                GameState.updateInventory({ gold: GameState.inventory.gold - quest.cost });
                message += `Lost ${quest.cost} gold `;
            }

            if (quest.badResult.damage) {
                const newHealth = Math.max(1, GameState.player.health - quest.badResult.damage);
                GameState.updatePlayer({ health: newHealth });
                message += `and took ${quest.badResult.damage} damage `;
            }

            if (quest.badResult.goldLoss && GameState.inventory.gold >= quest.badResult.goldLoss) {
                GameState.updateInventory({ gold: GameState.inventory.gold - quest.badResult.goldLoss });
                message += `and lost ${quest.badResult.goldLoss} gold `;
            }

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(message + '!', 4000, 'warning');
            }
        }

        // Mark room as cleared
        GameState.dungeon.currentRoom.isCleared = true;
    },

    /**
     * Handle empty room events
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     */
    handleEmptyRoom(onCombatTriggered = null) {
        console.log('Empty room');

        // Check for random encounters in empty rooms (lower chance)
        this.checkForRandomEncounters(onCombatTriggered);
    },

    /**
     * Check for random encounters in empty rooms
     * @param {Function} onCombatTriggered - Callback when combat is triggered
     */
    checkForRandomEncounters(onCombatTriggered = null) {
        // Lower chance for random encounters (10%)
        if (Math.random() < 0.1) {
            console.log('Random encounter in empty room!');

            if (onCombatTriggered) {
                onCombatTriggered('random');
            } else if (typeof Combat !== 'undefined') {
                Combat.triggerCombat();
            }
        }
    },

    /**
     * Advance to the next floor
     */
    advanceToNextFloor() {
        const nextFloor = GameState.dungeon.currentFloor + 1;
        console.log(`Advancing to floor ${nextFloor}`);

        // Generate new floor
        GameState.generateNewFloor(nextFloor);
        GameState.updatePlayer({ floor: nextFloor });

        // Clear level transition flag to re-enable movement
        if (typeof GameState !== 'undefined') {
            GameState.current.isTransitioningLevel = false;
            console.log('Level transition flag cleared - movement re-enabled');
        }

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Welcome to Floor ${nextFloor}!`, 2000, 'success');
        }

        console.log(`Advanced to floor ${nextFloor}`);
    },

    /**
     * Get room type description for UI
     * @param {string} roomType - Type of room
     * @returns {string} Human-readable description
     */
    getRoomDescription(roomType) {
        const descriptions = {
            'start': 'Starting Room (Safe)',
            'empty': 'Empty Room',
            'monster': 'Monster Lair',
            'treasure': 'Treasure Chamber',
            'boss': 'Boss Arena',
            'stairs': 'Stairs to Next Floor',
            'store': 'Merchant Store',
            'chest': 'Mysterious Chest',
            'campfire': 'Healing Campfire',
            'quest': 'Quest Room'
        };

        return descriptions[roomType] || 'Unknown Room';
    },

    /**
     * Get room color for UI representation
     * @param {string} roomType - Type of room
     * @param {boolean} isExplored - Whether room has been explored
     * @param {boolean} isCleared - Whether room has been cleared
     * @returns {string} CSS color code
     */
    getRoomColor(roomType, isExplored = false, isCleared = false) {
        if (!isExplored) return '#222'; // Unexplored

        const baseColors = {
            'start': '#4a9eff',    // Blue
            'empty': '#666',       // Gray
            'monster': '#ff6b6b',  // Red
            'treasure': '#ffd93d', // Gold
            'boss': '#9c27b0',     // Purple
            'stairs': '#4caf50',   // Green
            'store': '#ff9800',    // Orange
            'chest': '#8d6e63',    // Brown
            'campfire': '#ff5722', // Red-Orange
            'quest': '#3f51b5'     // Indigo
        };

        let color = baseColors[roomType] || '#666';

        // Darken color if room is cleared
        if (isCleared && roomType !== 'start' && roomType !== 'stairs' && roomType !== 'campfire') {
            // Convert to darker shade (campfire rooms don't get darkened since they can be reused)
            const hex = color.replace('#', '');
            const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 60);
            const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 60);
            const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 60);
            color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        return color;
    },

    /**
     * Check if room has special properties
     * @param {Object} room - Room object
     * @returns {Object} Object with special property flags
     */
    getRoomProperties(room) {
        return {
            isSafe: room.type === 'start' || room.type === 'campfire',
            hasEnemies: room.type === 'monster' || room.type === 'boss' || (room.type === 'chest' && !room.isCleared),
            hasTreasure: room.type === 'treasure' || room.type === 'chest',
            isExit: room.type === 'stairs',
            canHeal: room.type === 'start' || room.type === 'campfire',
            hasQuest: room.type === 'quest',
            hasStore: room.type === 'store',
            canReuse: room.type === 'campfire' || room.type === 'store',
            isCleared: room.isCleared || false,
            isExplored: room.isExplored || false
        };
    },

    /**
     * Generate room based on floor and position
     * @param {number} floor - Current floor number
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Generation options
     * @returns {Object} Generated room data
     */
    generateRoom(floor, x, y, options = {}) {
        const {
            forceType = null,
            treasureChance = 0.15,
            monsterChance = 0.4,
            bossChance = 0.1
        } = options;

        if (forceType) {
            return {
                x, y, type: forceType,
                isExplored: false,
                isCleared: forceType === 'start' || forceType === 'stairs'
            };
        }

        // Generate room type based on probabilities
        const random = Math.random();
        let roomType = 'empty';

        if (random < treasureChance) {
            roomType = 'treasure';
        } else if (random < treasureChance + monsterChance) {
            roomType = 'monster';
        } else if (random < treasureChance + monsterChance + bossChance) {
            roomType = 'boss';
        }

        return {
            x, y, type: roomType,
            isExplored: false,
            isCleared: false
        };
    }
};

// Export for ES6 modules
export default Rooms;
