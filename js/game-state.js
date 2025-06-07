// Pocket Dungeon - Game State Management
// Centralized state management for the entire game
import Storage from './storage.js';

/**
 * Room types for dungeon generation
 */
const RoomTypes = {
    EMPTY: 'empty',
    MONSTER: 'monster',
    TREASURE: 'treasure',
    BOSS: 'boss',
    STAIRS: 'stairs',
    START: 'start',
    STORE: 'store',
    CHEST: 'chest',
    CAMPFIRE: 'campfire',
    QUEST: 'quest',
    NPC: 'npc'
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
     * Generate floor layout with improved connectivity algorithms
     * @param {number} roomCount - Number of rooms to generate (5-10)
     */
    generateBasicLayout(roomCount = 7) {
        // Clear existing rooms
        this.rooms.clear();
        this.roomCount = 0;

        // Ensure room count is within bounds
        roomCount = Math.max(5, Math.min(10, roomCount));

        // Create start room at center
        const startRoom = this.createRoom(this.startPosition.x, this.startPosition.y, RoomTypes.START);

        // Generate layout using improved connectivity algorithm
        this.generateConnectedLayout(roomCount);

        // Assign room types after layout is complete
        this.assignRoomTypes();

        // Validate that all rooms are reachable
        this.validateConnectivity();

        console.log(`Generated ${this.roomCount} rooms with improved connectivity`);
    }

    /**
     * Generate a connected layout using various patterns
     * @param {number} roomCount - Target number of rooms
     */
    generateConnectedLayout(roomCount) {
        const patterns = ['linear', 'cross', 'spiral', 'branching'];
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

        switch (selectedPattern) {
            case 'linear':
                this.generateLinearLayout(roomCount);
                break;
            case 'cross':
                this.generateCrossLayout(roomCount);
                break;
            case 'spiral':
                this.generateSpiralLayout(roomCount);
                break;
            case 'branching':
                this.generateBranchingLayout(roomCount);
                break;
            default:
                this.generateLinearLayout(roomCount);
        }

        // Add extra connections for variety (5-30% chance per potential connection)
        this.addRandomConnections();
    }

    /**
     * Generate a linear layout with potential branches
     * @param {number} roomCount - Target number of rooms
     */
    generateLinearLayout(roomCount) {
        const directions = [
            { x: 0, y: -1, name: 'north' },
            { x: 1, y: 0, name: 'east' },
            { x: 0, y: 1, name: 'south' },
            { x: -1, y: 0, name: 'west' }
        ];

        let currentX = this.startPosition.x;
        let currentY = this.startPosition.y;
        const roomsToCreate = roomCount - 1; // Subtract the start room

        for (let i = 0; i < roomsToCreate; i++) {
            // Choose a direction, preferring to continue in the same direction
            let direction;
            if (i === 0 || Math.random() < 0.7) {
                // First room or continue straight
                direction = directions[i % directions.length];
            } else {
                // Random direction
                direction = directions[Math.floor(Math.random() * directions.length)];
            }

            const newX = currentX + direction.x;
            const newY = currentY + direction.y;

            // Check if position is valid and not occupied
            if (this.isValidCoordinate(newX, newY) && !this.getRoom(newX, newY)) {
                this.createRoom(newX, newY, RoomTypes.EMPTY);
                this.connectRooms(currentX, currentY, newX, newY);
                currentX = newX;
                currentY = newY;
            } else {
                // Find alternative position
                const altPosition = this.findNearestValidPosition(currentX, currentY);
                if (altPosition) {
                    this.createRoom(altPosition.x, altPosition.y, RoomTypes.EMPTY);
                    this.connectRooms(currentX, currentY, altPosition.x, altPosition.y);
                    currentX = altPosition.x;
                    currentY = altPosition.y;
                }
            }
        }
    }

    /**
     * Generate a cross-shaped layout
     * @param {number} roomCount - Target number of rooms
     */
    generateCrossLayout(roomCount) {
        const arms = [
            { x: 0, y: -1, name: 'north' },
            { x: 1, y: 0, name: 'east' },
            { x: 0, y: 1, name: 'south' },
            { x: -1, y: 0, name: 'west' }
        ];

        const roomsPerArm = Math.floor((roomCount - 1) / arms.length);
        const extraRooms = (roomCount - 1) % arms.length;

        arms.forEach((arm, armIndex) => {
            let currentX = this.startPosition.x;
            let currentY = this.startPosition.y;
            const roomsInThisArm = roomsPerArm + (armIndex < extraRooms ? 1 : 0);

            for (let i = 0; i < roomsInThisArm; i++) {
                const newX = currentX + arm.x;
                const newY = currentY + arm.y;

                if (this.isValidCoordinate(newX, newY) && !this.getRoom(newX, newY)) {
                    this.createRoom(newX, newY, RoomTypes.EMPTY);
                    this.connectRooms(currentX, currentY, newX, newY);
                    currentX = newX;
                    currentY = newY;
                }
            }
        });
    }

    /**
     * Generate a spiral layout
     * @param {number} roomCount - Target number of rooms
     */
    generateSpiralLayout(roomCount) {
        const directions = [
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }, // West
            { x: 0, y: -1 }  // North
        ];

        let currentX = this.startPosition.x;
        let currentY = this.startPosition.y;
        let dirIndex = 0;
        let steps = 1;
        let stepCount = 0;
        let roomsCreated = 0;

        while (roomsCreated < roomCount - 1) {
            const direction = directions[dirIndex];
            const newX = currentX + direction.x;
            const newY = currentY + direction.y;

            if (this.isValidCoordinate(newX, newY) && !this.getRoom(newX, newY)) {
                this.createRoom(newX, newY, RoomTypes.EMPTY);
                this.connectRooms(currentX, currentY, newX, newY);
                currentX = newX;
                currentY = newY;
                roomsCreated++;
            }

            stepCount++;
            if (stepCount === steps) {
                dirIndex = (dirIndex + 1) % directions.length;
                stepCount = 0;
                if (dirIndex % 2 === 0) {
                    steps++;
                }
            }

            // Safety break to prevent infinite loops
            if (roomsCreated > roomCount * 2) break;
        }
    }

    /**
     * Generate a branching layout with multiple paths
     * @param {number} roomCount - Target number of rooms
     */
    generateBranchingLayout(roomCount) {
        const mainPath = Math.ceil(roomCount * 0.6); // 60% of rooms in main path
        const branches = roomCount - mainPath;

        // Create main path
        let currentX = this.startPosition.x;
        let currentY = this.startPosition.y;
        const mainDirection = Math.random() < 0.5 ? { x: 1, y: 0 } : { x: 0, y: 1 };

        const mainPathRooms = [];
        for (let i = 0; i < mainPath; i++) {
            const newX = currentX + mainDirection.x;
            const newY = currentY + mainDirection.y;

            if (this.isValidCoordinate(newX, newY)) {
                const room = this.createRoom(newX, newY, RoomTypes.EMPTY);
                this.connectRooms(currentX, currentY, newX, newY);
                mainPathRooms.push({ x: newX, y: newY });
                currentX = newX;
                currentY = newY;
            }
        }

        // Create branches from random points on the main path
        for (let i = 0; i < branches; i++) {
            if (mainPathRooms.length === 0) break;

            const branchPoint = mainPathRooms[Math.floor(Math.random() * mainPathRooms.length)];
            const branchDirection = this.getRandomUnusedDirection(branchPoint.x, branchPoint.y);

            if (branchDirection) {
                const branchX = branchPoint.x + branchDirection.x;
                const branchY = branchPoint.y + branchDirection.y;

                if (this.isValidCoordinate(branchX, branchY) && !this.getRoom(branchX, branchY)) {
                    this.createRoom(branchX, branchY, RoomTypes.EMPTY);
                    this.connectRooms(branchPoint.x, branchPoint.y, branchX, branchY);
                }
            }
        }
    }

    /**
     * Find a random unused direction from a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Direction object or null
     */
    getRandomUnusedDirection(x, y) {
        const directions = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];

        const availableDirections = directions.filter(dir => {
            const checkX = x + dir.x;
            const checkY = y + dir.y;
            return this.isValidCoordinate(checkX, checkY) && !this.getRoom(checkX, checkY);
        });

        return availableDirections.length > 0
            ? availableDirections[Math.floor(Math.random() * availableDirections.length)]
            : null;
    }

    /**
     * Find the nearest valid position for room placement
     * @param {number} fromX - Starting X coordinate
     * @param {number} fromY - Starting Y coordinate
     * @returns {Object|null} Position object or null
     */
    findNearestValidPosition(fromX, fromY) {
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
            { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
        ];

        for (const dir of directions) {
            const checkX = fromX + dir.x;
            const checkY = fromY + dir.y;

            if (this.isValidCoordinate(checkX, checkY) && !this.getRoom(checkX, checkY)) {
                return { x: checkX, y: checkY };
            }
        }

        return null;
    }

    /**
     * Add random connections between existing rooms for variety
     */
    addRandomConnections() {
        const rooms = this.getAllRooms();
        const connectionChance = 0.15; // 15% chance per potential connection

        rooms.forEach(room => {
            const directions = [
                { x: 0, y: -1, name: 'north' },
                { x: 1, y: 0, name: 'east' },
                { x: 0, y: 1, name: 'south' },
                { x: -1, y: 0, name: 'west' }
            ];

            directions.forEach(dir => {
                const adjacentX = room.x + dir.x;
                const adjacentY = room.y + dir.y;
                const adjacentRoom = this.getRoom(adjacentX, adjacentY);

                // Only add connection if adjacent room exists and no connection already exists
                if (adjacentRoom && !room.hasConnection(dir.name) && Math.random() < connectionChance) {
                    this.connectRooms(room.x, room.y, adjacentX, adjacentY);
                }
            });
        });
    }

    /**
     * Assign room types after layout generation
     */
    assignRoomTypes() {
        const rooms = this.getAllRooms().filter(room => room.type === RoomTypes.EMPTY);

        if (rooms.length === 0) return;

        // Place stairs room (furthest from start)
        const stairsRoom = this.getFurthestRoom();
        if (stairsRoom) {
            stairsRoom.type = RoomTypes.STAIRS;
            this.stairsPosition = { x: stairsRoom.x, y: stairsRoom.y };
            rooms.splice(rooms.indexOf(stairsRoom), 1);
        }

        // Place store room on every 10th floor
        if (this.floor % 10 === 0 && rooms.length > 0) {
            const storeRoom = rooms[Math.floor(Math.random() * rooms.length)];
            storeRoom.type = RoomTypes.STORE;
            rooms.splice(rooms.indexOf(storeRoom), 1);
        }

        // Place boss room if enough rooms (at least 7 rooms total)
        if (this.roomCount >= 7 && rooms.length > 0) {
            const bossRoom = rooms[Math.floor(Math.random() * rooms.length)];
            bossRoom.type = RoomTypes.BOSS;
            this.bossPosition = { x: bossRoom.x, y: bossRoom.y };
            rooms.splice(rooms.indexOf(bossRoom), 1);
        }

        // Place campfire room (healing room) - 15% chance if enough rooms
        if (this.roomCount >= 6 && rooms.length > 0 && Math.random() < 0.15) {
            const campfireRoom = rooms[Math.floor(Math.random() * rooms.length)];
            campfireRoom.type = RoomTypes.CAMPFIRE;
            rooms.splice(rooms.indexOf(campfireRoom), 1);
        }

        // Place quest room every 5th floor starting from floor 3
        if (this.floor >= 3 && this.floor % 5 === 0 && rooms.length > 0) {
            const questRoom = rooms[Math.floor(Math.random() * rooms.length)];
            questRoom.type = RoomTypes.QUEST;
            rooms.splice(rooms.indexOf(questRoom), 1);
        }

        // Place NPC room - 20% chance if enough rooms and starting from floor 2
        if (this.floor >= 2 && this.roomCount >= 5 && rooms.length > 0 && Math.random() < 0.2) {
            const npcRoom = rooms[Math.floor(Math.random() * rooms.length)];
            npcRoom.type = RoomTypes.NPC;
            rooms.splice(rooms.indexOf(npcRoom), 1);
        }

        // Assign remaining room types
        rooms.forEach(room => {
            const rand = Math.random();
            if (rand < 0.25) {
                room.type = RoomTypes.MONSTER;
            } else if (rand < 0.4) {
                room.type = RoomTypes.TREASURE;
            } else if (rand < 0.55) {
                room.type = RoomTypes.CHEST;
            }
            // Otherwise stays EMPTY (45% chance for empty rooms)
        });
    }

    /**
     * Get the room furthest from the start position
     * @returns {Room|null} Furthest room or null
     */
    getFurthestRoom() {
        const rooms = this.getAllRooms().filter(room => room.type === RoomTypes.EMPTY);
        if (rooms.length === 0) return null;

        let furthestRoom = null;
        let maxDistance = -1;

        rooms.forEach(room => {
            const distance = Math.abs(room.x - this.startPosition.x) + Math.abs(room.y - this.startPosition.y);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestRoom = room;
            }
        });

        return furthestRoom;
    }

    /**
     * Validate that all rooms are reachable from the start position
     * @returns {boolean} True if all rooms are reachable
     */
    validateConnectivity() {
        const allRooms = this.getAllRooms();
        const reachableRooms = new Set();
        const queue = [this.getRoom(this.startPosition.x, this.startPosition.y)];

        // Breadth-first search to find all reachable rooms
        while (queue.length > 0) {
            const currentRoom = queue.shift();
            if (!currentRoom || reachableRooms.has(currentRoom)) continue;

            reachableRooms.add(currentRoom);

            // Add connected adjacent rooms to queue
            const connectedAdjacent = this.getAdjacentConnectedRooms(currentRoom.x, currentRoom.y);
            connectedAdjacent.forEach(room => {
                if (!reachableRooms.has(room)) {
                    queue.push(room);
                }
            });
        }

        const isValid = reachableRooms.size === allRooms.length;

        if (!isValid) {
            console.warn(`Connectivity validation failed: ${reachableRooms.size}/${allRooms.length} rooms reachable`);
            this.fixConnectivity(allRooms, reachableRooms);
        }

        return isValid;
    }

    /**
     * Fix connectivity issues by connecting unreachable rooms
     * @param {Array} allRooms - All rooms in the dungeon
     * @param {Set} reachableRooms - Set of currently reachable rooms
     */
    fixConnectivity(allRooms, reachableRooms) {
        const unreachableRooms = allRooms.filter(room => !reachableRooms.has(room));

        unreachableRooms.forEach(unreachableRoom => {
            // Find the closest reachable room
            let closestRoom = null;
            let minDistance = Infinity;

            reachableRooms.forEach(reachableRoom => {
                const distance = Math.abs(unreachableRoom.x - reachableRoom.x) +
                               Math.abs(unreachableRoom.y - reachableRoom.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestRoom = reachableRoom;
                }
            });

            // Connect to closest reachable room if adjacent
            if (closestRoom && minDistance === 1) {
                this.connectRooms(unreachableRoom.x, unreachableRoom.y, closestRoom.x, closestRoom.y);
                reachableRooms.add(unreachableRoom);
                console.log(`Connected unreachable room at (${unreachableRoom.x}, ${unreachableRoom.y}) to (${closestRoom.x}, ${closestRoom.y})`);
            }
        });
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
        skillPoints: 0,
        x: 2, // Grid position (start at center)
        y: 2, // Grid position (start at center)
        floor: 1,
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },
        abilities: {}
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

    // Lore tracking
    lore: {
        conversations: [] // Array of {npcName, avatar, dialog, floor, timestamp}
    },

    // Event listeners for state changes
    listeners: {
        stateChange: [],
        playerUpdate: [],
        inventoryUpdate: [],
        combatUpdate: [],
        dungeonUpdate: [],
        movement: [],
        combatAction: [],
        inventoryAction: []
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
        this.current.isTransitioningLevel = false; // Ensure movement is enabled for new game

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

        // Force save when combat starts to ensure state is preserved on reload
        console.log('Saving game data with combat active...', this.combat);
        const saveResult = this.saveGameData();
        console.log('Save result:', saveResult);

        // Verify the save worked by loading it immediately
        setTimeout(() => {
            const loadedState = Storage.Game.loadState();
            console.log('Loaded state after save:', loadedState ? 'Found data' : 'No data found');
            if (loadedState && loadedState.combat) {
                console.log('Combat state in saved data:', loadedState.combat.isActive);
            }
        }, 100);
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
                current: this.current,
                lore: this.lore
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
                if (savedState.lore) Object.assign(this.lore, savedState.lore);

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

                // Check if combat was active when saved and restore combat screen
                if (this.combat.isActive && this.combat.enemy) {
                    console.log('Restoring combat state after page reload');

                    // Safety check: Validate combat state on reload
                    const playerDead = this.player.health <= 0;
                    const enemyDead = this.combat.enemy.health <= 0;

                    if (playerDead || enemyDead) {
                        console.log('Combat state invalid on reload - ending combat', {
                            playerHealth: this.player.health,
                            enemyHealth: this.combat.enemy.health
                        });

                        // Determine winner and end combat immediately
                        const playerWon = enemyDead && !playerDead;
                        this.endCombat(playerWon);

                        // Don't restore combat UI
                        this.current.screen = 'game';
                    } else {
                        // Valid combat state - restore UI
                        this.current.screen = 'combat';

                        // Emit combat update to restore the combat UI with more robust restoration
                        setTimeout(() => {
                            console.log('Restoring combat UI with enemy:', this.combat.enemy);

                            // Make sure the combat overlay is visible
                            const combatOverlay = document.getElementById('combat-overlay');
                            if (combatOverlay) {
                                combatOverlay.classList.add('active');
                            }

                            // Emit the combat update event
                            this.emit('combatUpdate', this.combat);

                            // Also emit a screen change event to ensure proper UI state
                            this.emit('stateChange', {
                                type: 'screenChange',
                                from: 'loading',
                                to: 'combat',
                                state: this.current
                            });
                        }, 200);
                    }
                }
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
        console.log(`GameState.emit called for event: ${event} with data:`, data);
        console.log(`Available listeners for ${event}:`, this.listeners[event] ? this.listeners[event].length : 0);

        if (this.listeners[event]) {
            this.listeners[event].forEach((callback, index) => {
                try {
                    console.log(`Calling listener ${index} for event ${event}`);
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        } else {
            console.warn(`No listeners registered for event: ${event}`);
        }
    },

    /**
     * Add a conversation to the lore tracking
     * @param {string} npcName - Name of the NPC
     * @param {string} avatar - NPC avatar emoji
     * @param {string} dialog - Full conversation dialog
     */
    addLoreConversation(npcName, avatar, dialog) {
        // Initialize lore if it doesn't exist
        if (!this.lore) {
            this.lore = { conversations: [] };
        }

        const conversation = {
            npcName,
            avatar,
            dialog,
            floor: this.dungeon.currentFloor,
            timestamp: Date.now()
        };

        this.lore.conversations.push(conversation);

        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveGameData();
        }

        console.log('Added conversation to lore:', npcName);
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

// Export for ES6 modules
export { RoomTypes, Room, DungeonGrid };
export default GameState;
