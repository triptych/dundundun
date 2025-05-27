// Pocket Dungeon - Game State Management
// Centralized state management for the entire game

/**
 * Room types for dungeon generation
 */
const RoomTypes = {
    EMPTY: 'empty',
    MONSTER: 'monster',
    TREASURE: 'treasure',
    BOSS: 'boss',
    STAIRS: 'stairs',
    START: 'start'
};

/**
 * Room class representing a single room in the dungeon grid
 */
class Room {
    constructor(x, y, type = RoomTypes.EMPTY) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isExplored = false;
        this.isCleared = false;
        this.hasPlayer = false;
        this.connections = {
            north: false,
            south: false,
            east: false,
            west: false
        };
        this.data = {}; // Additional room-specific data (enemy, loot, etc.)
    }

    /**
     * Check if this room connects to another room
     * @param {string} direction - Direction to check (north, south, east, west)
     * @returns {boolean} True if connected in that direction
     */
    hasConnection(direction) {
        return this.connections[direction] || false;
    }

    /**
     * Set connection in a direction
     * @param {string} direction - Direction to connect
     * @param {boolean} connected - Whether to connect or disconnect
     */
    setConnection(direction, connected = true) {
        if (this.connections.hasOwnProperty(direction)) {
            this.connections[direction] = connected;
        }
    }

    /**
     * Get adjacent coordinates for a direction
     * @param {string} direction - Direction to get coordinates for
     * @returns {Object|null} {x, y} coordinates or null if invalid direction
     */
    getAdjacentCoords(direction) {
        const directions = {
            north: { x: this.x, y: this.y - 1 },
            south: { x: this.x, y: this.y + 1 },
            east: { x: this.x + 1, y: this.y },
            west: { x: this.x - 1, y: this.y }
        };
        return directions[direction] || null;
    }

    /**
     * Get all adjacent coordinates that have connections
     * @returns {Array} Array of {x, y, direction} objects
     */
    getConnectedAdjacent() {
        const adjacent = [];
        for (const [direction, connected] of Object.entries(this.connections)) {
            if (connected) {
                const coords = this.getAdjacentCoords(direction);
                if (coords) {
                    adjacent.push({ ...coords, direction });
                }
            }
        }
        return adjacent;
    }
}

/**
 * DungeonGrid class managing the room layout for a floor
 */
class DungeonGrid {
    constructor(floor = 1, seed = Math.random()) {
        this.floor = floor;
        this.seed = seed;
        this.width = 5; // Grid width (can be expanded)
        this.height = 5; // Grid height (can be expanded)
        this.rooms = new Map(); // Map of "x,y" -> Room
        this.roomCount = 0;
        this.startPosition = { x: 2, y: 2 }; // Center of 5x5 grid
        this.stairsPosition = null;
        this.bossPosition = null;
    }

    /**
     * Get coordinate key for room map
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} Coordinate key
     */
    getCoordKey(x, y) {
        return `${x},${y}`;
    }

    /**
     * Check if coordinates are within grid bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if within bounds
     */
    isValidCoordinate(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Get room at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Room|null} Room at coordinates or null
     */
    getRoom(x, y) {
        if (!this.isValidCoordinate(x, y)) return null;
        return this.rooms.get(this.getCoordKey(x, y)) || null;
    }

    /**
     * Set room at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Room} room - Room to place
     */
    setRoom(x, y, room) {
        if (!this.isValidCoordinate(x, y)) return;
        const key = this.getCoordKey(x, y);
        this.rooms.set(key, room);
    }

    /**
     * Create a new room at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} type - Room type
     * @returns {Room} Created room
     */
    createRoom(x, y, type = RoomTypes.EMPTY) {
        const room = new Room(x, y, type);
        this.setRoom(x, y, room);
        this.roomCount++;
        return room;
    }

    /**
     * Connect two adjacent rooms
     * @param {number} x1 - First room X
     * @param {number} y1 - First room Y
     * @param {number} x2 - Second room X
     * @param {number} y2 - Second room Y
     * @returns {boolean} True if connection was made
     */
    connectRooms(x1, y1, x2, y2) {
        const room1 = this.getRoom(x1, y1);
        const room2 = this.getRoom(x2, y2);

        if (!room1 || !room2) return false;

        // Determine direction from room1 to room2
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Only allow adjacent connections
        if (Math.abs(dx) + Math.abs(dy) !== 1) return false;

        let direction1, direction2;
        if (dx === 1) { direction1 = 'east'; direction2 = 'west'; }
        else if (dx === -1) { direction1 = 'west'; direction2 = 'east'; }
        else if (dy === 1) { direction1 = 'south'; direction2 = 'north'; }
        else if (dy === -1) { direction1 = 'north'; direction2 = 'south'; }

        // Set bidirectional connection
        room1.setConnection(direction1, true);
        room2.setConnection(direction2, true);

        return true;
    }

    /**
     * Get all rooms that exist in the grid
     * @returns {Array} Array of Room objects
     */
    getAllRooms() {
        return Array.from(this.rooms.values());
    }

    /**
     * Get adjacent rooms that are connected to the given coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array} Array of adjacent connected rooms
     */
    getAdjacentConnectedRooms(x, y) {
        const room = this.getRoom(x, y);
        if (!room) return [];

        const adjacent = [];
        const connectedCoords = room.getConnectedAdjacent();

        for (const coords of connectedCoords) {
            const adjacentRoom = this.getRoom(coords.x, coords.y);
            if (adjacentRoom) {
                adjacent.push(adjacentRoom);
            }
        }

        return adjacent;
    }

    /**
     * Check if player can move from one position to another
     * @param {number} fromX - Current X position
     * @param {number} fromY - Current Y position
     * @param {number} toX - Target X position
     * @param {number} toY - Target Y position
     * @returns {boolean} True if movement is valid
     */
    canMoveTo(fromX, fromY, toX, toY) {
        const fromRoom = this.getRoom(fromX, fromY);
        const toRoom = this.getRoom(toX, toY);

        if (!fromRoom || !toRoom) return false;

        // Check if rooms are adjacent
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        if (dx + dy !== 1) return false;

        // Check if rooms are connected
        const direction = this.getDirection(fromX, fromY, toX, toY);
        return fromRoom.hasConnection(direction);
    }

    /**
     * Get direction from one coordinate to another
     * @param {number} fromX - From X coordinate
     * @param {number} fromY - From Y coordinate
     * @param {number} toX - To X coordinate
     * @param {number} toY - To Y coordinate
     * @returns {string|null} Direction string or null
     */
    getDirection(fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;

        if (dx === 1 && dy === 0) return 'east';
        if (dx === -1 && dy === 0) return 'west';
        if (dx === 0 && dy === 1) return 'south';
        if (dx === 0 && dy === -1) return 'north';

        return null;
    }

    /**
     * Generate basic floor layout (to be expanded in dungeon generation)
     * @param {number} roomCount - Number of rooms to generate (5-10)
     */
    generateBasicLayout(roomCount = 7) {
        // Clear existing rooms
        this.rooms.clear();
        this.roomCount = 0;

        // Create start room at center
        const startRoom = this.createRoom(this.startPosition.x, this.startPosition.y, RoomTypes.START);

        // Simple linear layout for now (to be replaced with proper generation)
        const positions = [
            { x: 2, y: 1 }, // North
            { x: 3, y: 2 }, // East
            { x: 2, y: 3 }, // South
            { x: 1, y: 2 }, // West
            { x: 2, y: 0 }, // Far North
            { x: 4, y: 2 }  // Far East
        ];

        // Create rooms and connections
        for (let i = 0; i < Math.min(roomCount - 1, positions.length); i++) {
            const pos = positions[i];
            let roomType = RoomTypes.EMPTY;

            // Last room is stairs
            if (i === roomCount - 2) {
                roomType = RoomTypes.STAIRS;
                this.stairsPosition = { x: pos.x, y: pos.y };
            }
            // Random room types for others
            else if (Math.random() < 0.4) {
                roomType = RoomTypes.MONSTER;
            } else if (Math.random() < 0.2) {
                roomType = RoomTypes.TREASURE;
            }

            this.createRoom(pos.x, pos.y, roomType);

            // Connect to start room if adjacent
            if (Math.abs(pos.x - this.startPosition.x) + Math.abs(pos.y - this.startPosition.y) === 1) {
                this.connectRooms(this.startPosition.x, this.startPosition.y, pos.x, pos.y);
            }
        }

        // Connect some additional rooms for branching paths
        this.connectRooms(2, 1, 2, 0); // North to Far North
        this.connectRooms(3, 2, 4, 2); // East to Far East
    }
}

/**
 * Game state manager that handles all game data and state transitions
 */
const GameState = {
    // Current game state
    current: {
        screen: 'loading', // loading, game, menu, inventory, character, skills, combat
        isInitialized: false,
        isPaused: false,
        isGameActive: false
    },

    // Player state
    player: {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        strength: 10,
        agility: 10,
        vitality: 10,
        availablePoints: 0,
        x: 2, // Grid position (start at center)
        y: 2, // Grid position (start at center)
        floor: 1,
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        }
    },

    // Dungeon state with room grid system
    dungeon: {
        currentFloor: 1,
        grid: null, // DungeonGrid instance
        playerPosition: { x: 2, y: 2 }, // Current player position
        exploredRooms: new Set(), // Track explored room coordinates as "x,y" strings
        currentRoom: null, // Current Room object
        theme: 'crypt', // crypt, cave, forest
        floorSeed: Math.random() // Seed for reproducible floor generation
    },

    // Inventory state
    inventory: {
        items: [],
        maxSlots: 20,
        gold: 0
    },

    // Combat state
    combat: {
        isActive: false,
        enemy: null,
        playerTurn: true,
        cooldowns: {
            heavyAttack: 0,
            block: 0
        },
        lastAction: null,
        log: []
    },

    // Game settings
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        autoSave: true,
        difficulty: 'normal',
        showTutorial: true
    },

    // Statistics
    stats: {
        gamesPlayed: 0,
        totalPlayTime: 0,
        sessionStartTime: null,
        highestFloor: 0,
        monstersDefeated: 0,
        itemsFound: 0,
        deathCount: 0,
        achievements: []
    },

    // Event listeners for state changes
    listeners: {
        stateChange: [],
        playerUpdate: [],
        inventoryUpdate: [],
        combatUpdate: [],
        dungeonUpdate: []
    },

    /**
     * Initialize the game state
     */
    init() {
        console.log('Initializing game state...');

        // Load saved data
        this.loadGameData();

        // Set session start time
        this.stats.sessionStartTime = Date.now();

        // Mark as initialized
        this.current.isInitialized = true;

        this.emit('stateChange', { type: 'init', state: this.current });
    },

    /**
     * Start a new game
     */
    newGame() {
        console.log('Starting new game...');

        // Reset player to defaults
        this.player = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            health: 100,
            maxHealth: 100,
            strength: 10,
            agility: 10,
            vitality: 10,
            availablePoints: 0,
            x: 2,
            y: 2,
            floor: 1,
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            }
        };

        // Initialize new dungeon grid
        this.generateNewFloor(1);

        // Reset inventory
        this.inventory = {
            items: [],
            maxSlots: 20,
            gold: 0
        };

        // Reset combat
        this.combat = {
            isActive: false,
            enemy: null,
            playerTurn: true,
            cooldowns: {
                heavyAttack: 0,
                block: 0
            },
            lastAction: null,
            log: []
        };

        // Update stats
        this.stats.gamesPlayed++;
        this.stats.sessionStartTime = Date.now();

        // Set game as active
        this.current.isGameActive = true;
        this.current.screen = 'game';

        this.emit('stateChange', { type: 'newGame', state: this.current });
        this.emit('playerUpdate', this.player);
        this.emit('inventoryUpdate', this.inventory);
        this.emit('dungeonUpdate', this.dungeon);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Generate a new floor with room grid
     * @param {number} floorNumber - Floor number to generate
     */
    generateNewFloor(floorNumber) {
        // Generate new seed for this floor
        this.dungeon.floorSeed = Math.random();

        // Create new dungeon grid
        this.dungeon.grid = new DungeonGrid(floorNumber, this.dungeon.floorSeed);

        // Generate basic layout (5-10 rooms)
        const roomCount = Math.floor(Math.random() * 6) + 5; // 5-10 rooms
        this.dungeon.grid.generateBasicLayout(roomCount);

        // Update dungeon state
        this.dungeon.currentFloor = floorNumber;
        this.dungeon.playerPosition = { x: this.dungeon.grid.startPosition.x, y: this.dungeon.grid.startPosition.y };
        this.dungeon.exploredRooms = new Set();

        // Set current room and mark as explored
        this.updateCurrentRoom(this.dungeon.playerPosition.x, this.dungeon.playerPosition.y);

        // Update theme every 5 floors
        const themes = ['crypt', 'cave', 'forest'];
        this.dungeon.theme = themes[Math.floor((floorNumber - 1) / 5) % themes.length];

        console.log(`Generated floor ${floorNumber} with ${roomCount} rooms`);
    },

    /**
     * Update current room and exploration state
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updateCurrentRoom(x, y) {
        if (!this.dungeon.grid) return;

        const room = this.dungeon.grid.getRoom(x, y);
        if (!room) return;

        // Mark previous room as not having player
        if (this.dungeon.currentRoom) {
            this.dungeon.currentRoom.hasPlayer = false;
        }

        // Update current room
        this.dungeon.currentRoom = room;
        room.hasPlayer = true;
        room.isExplored = true;

        // Add to explored rooms set
        this.dungeon.exploredRooms.add(this.dungeon.grid.getCoordKey(x, y));

        // Update player position
        this.dungeon.playerPosition = { x, y };
        this.player.x = x;
        this.player.y = y;
    },

    /**
     * Move player to new position if valid
     * @param {number} toX - Target X coordinate
     * @param {number} toY - Target Y coordinate
     * @returns {boolean} True if move was successful
     */
    movePlayer(toX, toY) {
        if (!this.dungeon.grid) return false;

        const fromX = this.dungeon.playerPosition.x;
        const fromY = this.dungeon.playerPosition.y;

        // Check if move is valid
        if (!this.dungeon.grid.canMoveTo(fromX, fromY, toX, toY)) {
            return false;
        }

        // Update current room
        this.updateCurrentRoom(toX, toY);

        // Emit updates
        this.emit('playerUpdate', this.player);
        this.emit('dungeonUpdate', this.dungeon);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        return true;
    },

    /**
     * Get valid movement options from current position
     * @returns {Array} Array of {x, y, direction} objects for valid moves
     */
    getValidMoves() {
        if (!this.dungeon.grid || !this.dungeon.currentRoom) {
            return [];
        }

        return this.dungeon.currentRoom.getConnectedAdjacent()
            .filter(coords => this.dungeon.grid.getRoom(coords.x, coords.y))
            .map(coords => ({
                x: coords.x,
                y: coords.y,
                direction: coords.direction,
                room: this.dungeon.grid.getRoom(coords.x, coords.y)
            }));
    },

    /**
     * Switch to a different screen
     * @param {string} screenName - Name of the screen to switch to
     */
    switchScreen(screenName) {
        const previousScreen = this.current.screen;
        this.current.screen = screenName;

        this.emit('stateChange', {
            type: 'screenChange',
            from: previousScreen,
            to: screenName,
            state: this.current
        });
    },

    /**
     * Pause/unpause the game
     * @param {boolean} paused - Whether to pause or unpause
     */
    setPaused(paused) {
        this.current.isPaused = paused;
        this.emit('stateChange', { type: 'pause', paused, state: this.current });
    },

    /**
     * Update player stats
     * @param {Object} updates - Object containing stat updates
     */
    updatePlayer(updates) {
        Object.assign(this.player, updates);

        // Clamp health to max health
        if (this.player.health > this.player.maxHealth) {
            this.player.health = this.player.maxHealth;
        }

        this.emit('playerUpdate', this.player);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Add experience points to player
     * @param {number} exp - Experience points to add
     */
    addExperience(exp) {
        this.player.experience += exp;

        // Check for level up
        while (this.player.experience >= this.player.experienceToNext) {
            this.levelUp();
        }

        this.emit('playerUpdate', this.player);
    },

    /**
     * Handle player level up
     */
    levelUp() {
        this.player.experience -= this.player.experienceToNext;
        this.player.level++;
        this.player.availablePoints += 3; // 3 attribute points per level

        // Increase health and experience requirement
        const healthIncrease = 5 + this.player.vitality * 2;
        this.player.maxHealth += healthIncrease;
        this.player.health = this.player.maxHealth; // Full heal on level up

        this.player.experienceToNext = Math.floor(this.player.experienceToNext * 1.2);

        this.emit('playerUpdate', this.player);
        this.emit('stateChange', { type: 'levelUp', level: this.player.level });
    },

    /**
     * Update inventory
     * @param {Object} updates - Inventory updates
     */
    updateInventory(updates) {
        Object.assign(this.inventory, updates);
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Add item to inventory
     * @param {Object} item - Item to add
     * @returns {boolean} True if item was added successfully
     */
    addItem(item) {
        if (this.inventory.items.length >= this.inventory.maxSlots) {
            return false; // Inventory full
        }

        this.inventory.items.push(item);
        this.stats.itemsFound++;
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        return true;
    },

    /**
     * Remove item from inventory
     * @param {number} index - Index of item to remove
     * @returns {Object|null} Removed item or null
     */
    removeItem(index) {
        if (index < 0 || index >= this.inventory.items.length) {
            return null;
        }

        const item = this.inventory.items.splice(index, 1)[0];
        this.emit('inventoryUpdate', this.inventory);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        return item;
    },

    /**
     * Start combat with an enemy
     * @param {Object} enemy - Enemy to fight
     */
    startCombat(enemy) {
        this.combat.isActive = true;
        this.combat.enemy = enemy;
        this.combat.playerTurn = true;
        this.combat.log = ['Combat started!'];

        this.switchScreen('combat');
        this.emit('combatUpdate', this.combat);
    },

    /**
     * End combat
     * @param {boolean} playerWon - Whether the player won
     */
    endCombat(playerWon) {
        if (playerWon) {
            // Give experience and loot
            this.addExperience(this.combat.enemy.experience || 10);
            this.stats.monstersDefeated++;

            // Mark current room as cleared
            if (this.dungeon.currentRoom) {
                this.dungeon.currentRoom.isCleared = true;
            }
        } else {
            // Handle player death
            this.stats.deathCount++;
        }

        this.combat.isActive = false;
        this.combat.enemy = null;
        this.combat.log = [];

        this.switchScreen('game');
        this.emit('combatUpdate', this.combat);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Update dungeon state
     * @param {Object} updates - Dungeon updates
     */
    updateDungeon(updates) {
        Object.assign(this.dungeon, updates);

        // Update highest floor stat
        if (this.dungeon.currentFloor > this.stats.highestFloor) {
            this.stats.highestFloor = this.dungeon.currentFloor;
        }

        this.emit('dungeonUpdate', this.dungeon);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }
    },

    /**
     * Update game settings
     * @param {Object} updates - Settings updates
     */
    updateSettings(updates) {
        Object.assign(this.settings, updates);

        // Save settings immediately
        if (typeof Storage !== 'undefined' && Storage.available) {
            Storage.Game.saveSettings(this.settings);
        }

        this.emit('stateChange', { type: 'settingsUpdate', settings: this.settings });
    },

    /**
     * Save all game data to localStorage
     */
    saveGameData() {
        if (typeof Storage === 'undefined' || !Storage.available) {
            console.warn('Cannot save game data: localStorage not available');
            return false;
        }

        try {
            // Calculate total play time
            if (this.stats.sessionStartTime) {
                const sessionTime = Date.now() - this.stats.sessionStartTime;
                this.stats.totalPlayTime += sessionTime;
                this.stats.sessionStartTime = Date.now(); // Reset for next session
            }

            // Prepare dungeon data for saving (convert Set to Array and reconstruct grid)
            const dungeonSaveData = {
                ...this.dungeon,
                exploredRooms: Array.from(this.dungeon.exploredRooms),
                grid: this.dungeon.grid ? {
                    floor: this.dungeon.grid.floor,
                    seed: this.dungeon.grid.seed,
                    width: this.dungeon.grid.width,
                    height: this.dungeon.grid.height,
                    roomCount: this.dungeon.grid.roomCount,
                    startPosition: this.dungeon.grid.startPosition,
                    stairsPosition: this.dungeon.grid.stairsPosition,
                    bossPosition: this.dungeon.grid.bossPosition,
                    rooms: Array.from(this.dungeon.grid.rooms.entries()).map(([key, room]) => [key, {
                        x: room.x,
                        y: room.y,
                        type: room.type,
                        isExplored: room.isExplored,
                        isCleared: room.isCleared,
                        hasPlayer: room.hasPlayer,
                        connections: room.connections,
                        data: room.data
                    }])
                } : null
            };

            // Save all game state
            const gameState = {
                player: this.player,
                dungeon: dungeonSaveData,
                inventory: this.inventory,
                combat: this.combat,
                current: this.current
            };

            Storage.Game.saveState(gameState);
            Storage.Game.saveSettings(this.settings);
            Storage.Game.saveStats(this.stats);

            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    },

    /**
     * Load all game data from localStorage
     */
    loadGameData() {
        if (typeof Storage === 'undefined' || !Storage.available) {
            console.warn('Cannot load game data: localStorage not available');
            return false;
        }

        try {
            // Load settings first
            this.settings = Storage.Game.loadSettings();

            // Load statistics
            const savedStats = Storage.Game.loadStats();
            if (savedStats) {
                Object.assign(this.stats, savedStats);
            }

            // Load game state if it exists
            const savedState = Storage.Game.loadState();
            if (savedState) {
                if (savedState.player) Object.assign(this.player, savedState.player);
                if (savedState.inventory) Object.assign(this.inventory, savedState.inventory);
                if (savedState.combat) Object.assign(this.combat, savedState.combat);
                if (savedState.current) Object.assign(this.current, savedState.current);

                // Reconstruct dungeon state
                if (savedState.dungeon) {
                    Object.assign(this.dungeon, savedState.dungeon);

                    // Convert explored rooms array back to Set
                    if (Array.isArray(savedState.dungeon.exploredRooms)) {
                        this.dungeon.exploredRooms = new Set(savedState.dungeon.exploredRooms);
                    }

                    // Reconstruct grid if saved
                    if (savedState.dungeon.grid) {
                        const gridData = savedState.dungeon.grid;
                        this.dungeon.grid = new DungeonGrid(gridData.floor, gridData.seed);
                        this.dungeon.grid.width = gridData.width;
                        this.dungeon.grid.height = gridData.height;
                        this.dungeon.grid.roomCount = gridData.roomCount;
                        this.dungeon.grid.startPosition = gridData.startPosition;
                        this.dungeon.grid.stairsPosition = gridData.stairsPosition;
                        this.dungeon.grid.bossPosition = gridData.bossPosition;

                        // Reconstruct rooms
                        if (gridData.rooms) {
                            for (const [key, roomData] of gridData.rooms) {
                                const room = new Room(roomData.x, roomData.y, roomData.type);
                                room.isExplored = roomData.isExplored;
                                room.isCleared = roomData.isCleared;
                                room.hasPlayer = roomData.hasPlayer;
                                room.connections = roomData.connections;
                                room.data = roomData.data;
                                this.dungeon.grid.rooms.set(key, room);
                            }
                        }

                        // Set current room
                        this.dungeon.currentRoom = this.dungeon.grid.getRoom(
                            this.dungeon.playerPosition.x,
                            this.dungeon.playerPosition.y
                        );
                    }
                }

                this.current.isGameActive = true;
            }

            return true;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return false;
        }
    },

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    },

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    },

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    },

    /**
     * Get current game statistics
     * @returns {Object} Current game stats
     */
    getStats() {
        // Update session time
        if (this.stats.sessionStartTime) {
            const sessionTime = Date.now() - this.stats.sessionStartTime;
            return {
                ...this.stats,
                currentSessionTime: sessionTime,
                totalPlayTime: this.stats.totalPlayTime + sessionTime
            };
        }
        return this.stats;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
