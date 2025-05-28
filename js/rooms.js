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

        // Chance for special items
        const hasSpecialItem = Math.random() < 0.3; // 30% chance
        let specialItemMessage = '';

        if (hasSpecialItem) {
            const items = ['Health Potion', 'Strength Boost', 'Lucky Charm'];
            const item = items[Math.floor(Math.random() * items.length)];
            specialItemMessage = ` and a ${item}`;

            // Add item to inventory (placeholder for actual item system)
            console.log(`Found special item: ${item}`);
        }

        // Award treasure
        GameState.updateInventory({ gold: GameState.inventory.gold + treasureGold });

        // Mark room as cleared
        GameState.dungeon.currentRoom.isCleared = true;

        // Show notification
        const message = `Found ${treasureGold} gold${specialItemMessage}!`;
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(message, 2000, 'success');
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
            'stairs': 'Stairs to Next Floor'
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
            'stairs': '#4caf50'    // Green
        };

        let color = baseColors[roomType] || '#666';

        // Darken color if room is cleared
        if (isCleared && roomType !== 'start' && roomType !== 'stairs') {
            // Convert to darker shade
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
            isSafe: room.type === 'start',
            hasEnemies: room.type === 'monster' || room.type === 'boss',
            hasTreasure: room.type === 'treasure',
            isExit: room.type === 'stairs',
            canHeal: room.type === 'start',
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Rooms;
}
