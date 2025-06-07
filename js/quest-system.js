// Dun Dun Dungeon - Quest System
// Manages quest creation, tracking, and completion

/**
 * Quest System Manager
 */
const QuestSystem = {
    // Active and completed quests
    activeQuests: [],
    completedQuests: [],
    questProgress: {},

    // DOM element references
    elements: {},

    // Quest template definitions
    questTemplates: {
        'kill_monsters': {
            id: 'kill_monsters',
            name: 'Monster Hunter',
            description: 'Defeat monsters to prove your combat prowess',
            type: 'kill',
            icon: '⚔️',
            variants: [
                { target: 5, reward: { experience: 50, gold: 100 }, difficulty: 'easy' },
                { target: 10, reward: { experience: 100, gold: 200 }, difficulty: 'normal' },
                { target: 20, reward: { experience: 200, gold: 400 }, difficulty: 'hard' }
            ]
        },
        'reach_floor': {
            id: 'reach_floor',
            name: 'Deep Explorer',
            description: 'Descend deeper into the dungeon',
            type: 'floor',
            icon: '🏃',
            variants: [
                { target: 5, reward: { experience: 100, gold: 150 }, difficulty: 'easy' },
                { target: 10, reward: { experience: 200, gold: 300 }, difficulty: 'normal' },
                { target: 15, reward: { experience: 400, gold: 600 }, difficulty: 'hard' }
            ]
        },
        'collect_gold': {
            id: 'collect_gold',
            name: 'Treasure Hunter',
            description: 'Accumulate gold from your adventures',
            type: 'gold',
            icon: '💰',
            variants: [
                { target: 500, reward: { experience: 75, gold: 250 }, difficulty: 'easy' },
                { target: 1000, reward: { experience: 150, gold: 500 }, difficulty: 'normal' },
                { target: 2500, reward: { experience: 300, gold: 1000 }, difficulty: 'hard' }
            ]
        },
        'find_items': {
            id: 'find_items',
            name: 'Item Collector',
            description: 'Discover various items in the dungeon',
            type: 'items',
            icon: '📦',
            variants: [
                { target: 10, reward: { experience: 80, gold: 200 }, difficulty: 'easy' },
                { target: 25, reward: { experience: 160, gold: 400 }, difficulty: 'normal' },
                { target: 50, reward: { experience: 320, gold: 800 }, difficulty: 'hard' }
            ]
        },
        'level_up': {
            id: 'level_up',
            name: 'Power Growth',
            description: 'Increase your character level',
            type: 'level',
            icon: '⭐',
            variants: [
                { target: 5, reward: { experience: 200, gold: 300, skillPoints: 1 }, difficulty: 'normal' },
                { target: 10, reward: { experience: 500, gold: 750, skillPoints: 2 }, difficulty: 'hard' },
                { target: 20, reward: { experience: 1000, gold: 1500, skillPoints: 3 }, difficulty: 'very_hard' }
            ]
        }
    },

    /**
     * Initialize the quest system
     */
    init() {
        console.log('Initializing Quest System...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Subscribe to game state changes
        this.setupGameStateListeners();

        // Load saved quest data
        this.loadQuestData();

        // Generate initial quests if none exist
        if (this.activeQuests.length === 0) {
            this.generateInitialQuests();
        }

        // Update UI
        this.updateQuestDisplay();

        console.log('Quest System initialized');
    },

    /**
     * Cache DOM elements for the quest system
     */
    cacheElements() {
        this.elements = {
            questList: document.getElementById('quest-list'),
            questModal: document.getElementById('quest-modal'),
            questModalTitle: document.getElementById('quest-modal-title'),
            questModalDescription: document.getElementById('quest-modal-description'),
            questModalObjectives: document.getElementById('quest-modal-objectives'),
            questModalRewards: document.getElementById('quest-modal-rewards'),
            questModalClose: document.getElementById('quest-modal-close')
        };
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Quest modal close button
        if (this.elements.questModalClose) {
            this.elements.questModalClose.addEventListener('click', () => {
                this.hideQuestModal();
            });
        }

        // Close modal when clicking outside
        if (this.elements.questModal) {
            this.elements.questModal.addEventListener('click', (e) => {
                if (e.target === this.elements.questModal) {
                    this.hideQuestModal();
                }
            });
        }
    },

    /**
     * Subscribe to game state changes
     */
    setupGameStateListeners() {
        if (typeof GameState !== 'undefined') {
            GameState.on('playerUpdate', (player) => this.handlePlayerUpdate(player));
            GameState.on('stateChange', (data) => this.handleStateChange(data));
            GameState.on('inventoryUpdate', (inventory) => this.handleInventoryUpdate(inventory));
            GameState.on('dungeonUpdate', (dungeon) => this.handleDungeonUpdate(dungeon));
        }
    },

    /**
     * Handle player updates for quest progress
     * @param {Object} player - Player data
     */
    handlePlayerUpdate(player) {
        this.updateQuestProgress('level', player.level);
        this.checkQuestCompletion();
    },

    /**
     * Handle state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        if (data.type === 'combatEnd' && data.playerWon) {
            this.updateQuestProgress('kill', 1, true); // Increment kill count
        }
        this.checkQuestCompletion();
    },

    /**
     * Handle inventory updates for quest progress
     * @param {Object} inventory - Inventory data
     */
    handleInventoryUpdate(inventory) {
        this.updateQuestProgress('gold', inventory.gold);
        this.updateQuestProgress('items', inventory.items.length);
        this.checkQuestCompletion();
    },

    /**
     * Handle dungeon updates for quest progress
     * @param {Object} dungeon - Dungeon data
     */
    handleDungeonUpdate(dungeon) {
        this.updateQuestProgress('floor', dungeon.currentFloor);
        this.checkQuestCompletion();
    },

    /**
     * Generate initial quests for new players
     */
    generateInitialQuests() {
        // Create 3-4 starter quests
        const starterQuests = [
            this.createQuest('kill_monsters', 'easy'),
            this.createQuest('reach_floor', 'easy'),
            this.createQuest('collect_gold', 'easy')
        ];

        starterQuests.forEach(quest => {
            if (quest) {
                this.activeQuests.push(quest);
            }
        });

        this.saveQuestData();
    },

    /**
     * Create a quest from a template
     * @param {string} templateId - Quest template ID
     * @param {string} difficulty - Difficulty level
     * @returns {Object|null} Created quest or null
     */
    createQuest(templateId, difficulty = 'normal') {
        const template = this.questTemplates[templateId];
        if (!template) {
            console.error('Quest template not found:', templateId);
            return null;
        }

        const variant = template.variants.find(v => v.difficulty === difficulty);
        if (!variant) {
            console.error('Quest variant not found:', templateId, difficulty);
            return null;
        }

        const questId = `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id: questId,
            templateId: templateId,
            name: template.name,
            description: this.generateQuestDescription(template, variant),
            type: template.type,
            icon: template.icon,
            target: variant.target,
            progress: 0,
            completed: false,
            difficulty: difficulty,
            reward: variant.reward,
            startedAt: Date.now()
        };
    },

    /**
     * Generate quest description with specific target
     * @param {Object} template - Quest template
     * @param {Object} variant - Quest variant
     * @returns {string} Generated description
     */
    generateQuestDescription(template, variant) {
        const target = variant.target;

        switch (template.type) {
            case 'kill':
                return `Defeat ${target} monsters in combat`;
            case 'floor':
                return `Reach floor ${target} of the dungeon`;
            case 'gold':
                return `Accumulate ${target} gold`;
            case 'items':
                return `Find ${target} different items`;
            case 'level':
                return `Reach character level ${target}`;
            default:
                return template.description;
        }
    },

    /**
     * Update quest progress
     * @param {string} type - Quest type
     * @param {number} value - New value or increment
     * @param {boolean} isIncrement - Whether value is an increment
     */
    updateQuestProgress(type, value, isIncrement = false) {
        this.activeQuests.forEach(quest => {
            if (quest.type === type && !quest.completed) {
                if (isIncrement) {
                    quest.progress = Math.min(quest.progress + value, quest.target);
                } else {
                    quest.progress = Math.min(value, quest.target);
                }
            }
        });

        this.updateQuestDisplay();
        this.saveQuestData();
    },

    /**
     * Check for quest completion
     */
    checkQuestCompletion() {
        const completedQuests = [];

        this.activeQuests.forEach(quest => {
            if (!quest.completed && quest.progress >= quest.target) {
                quest.completed = true;
                quest.completedAt = Date.now();
                completedQuests.push(quest);
            }
        });

        // Process completed quests
        completedQuests.forEach(quest => {
            this.completeQuest(quest);
        });

        if (completedQuests.length > 0) {
            this.updateQuestDisplay();
            this.saveQuestData();
        }
    },

    /**
     * Complete a quest and give rewards
     * @param {Object} quest - Completed quest
     */
    completeQuest(quest) {
        console.log('Quest completed:', quest.name);

        // Move to completed quests
        this.completedQuests.push(quest);
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);

        // Give rewards
        if (quest.reward && GameState && GameState.player) {
            const updates = {};

            if (quest.reward.experience) {
                GameState.addExperience(quest.reward.experience);
            }

            if (quest.reward.gold) {
                GameState.updateInventory({
                    gold: GameState.inventory.gold + quest.reward.gold
                });
            }

            if (quest.reward.skillPoints && typeof Skills !== 'undefined') {
                Skills.addSkillPoints(quest.reward.skillPoints);
            }
        }

        // Show completion notification
        this.showQuestCompletionNotification(quest);

        // Generate a new quest to replace the completed one
        this.generateReplacementQuest(quest);
    },

    /**
     * Show quest completion notification
     * @param {Object} quest - Completed quest
     */
    showQuestCompletionNotification(quest) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = 'quest-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${quest.icon}</div>
                <div class="notification-text">
                    <div class="notification-title">Quest Complete!</div>
                    <div class="notification-quest">${quest.name}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    /**
     * Generate a replacement quest
     * @param {Object} completedQuest - The quest that was completed
     */
    generateReplacementQuest(completedQuest) {
        // Keep a balanced set of quest types
        const currentTypes = this.activeQuests.map(q => q.type);
        const availableTypes = Object.keys(this.questTemplates).filter(templateId => {
            const template = this.questTemplates[templateId];
            return !currentTypes.includes(template.type) || currentTypes.filter(t => t === template.type).length < 2;
        });

        if (availableTypes.length === 0) {
            availableTypes.push(...Object.keys(this.questTemplates));
        }

        // Choose a random available type
        const randomTemplate = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Choose difficulty based on player progress
        let difficulty = 'normal';
        if (GameState && GameState.player) {
            const level = GameState.player.level;
            if (level <= 3) difficulty = 'easy';
            else if (level >= 8) difficulty = 'hard';
        }

        const newQuest = this.createQuest(randomTemplate, difficulty);
        if (newQuest) {
            this.activeQuests.push(newQuest);
        }
    },

    /**
     * Update the quest display UI
     */
    updateQuestDisplay() {
        if (!this.elements.questList) return;

        // Clear existing content
        this.elements.questList.innerHTML = '';

        if (this.activeQuests.length === 0 && this.completedQuests.length === 0) {
            this.elements.questList.innerHTML = '<div class="quest-empty">No quests available</div>';
            return;
        }

        // Display active quests
        this.activeQuests.forEach(quest => {
            this.renderQuestItem(quest, false);
        });

        // Display recent completed quests (last 3)
        const recentCompleted = this.completedQuests.slice(-3).reverse();
        recentCompleted.forEach(quest => {
            this.renderQuestItem(quest, true);
        });
    },

    /**
     * Render a single quest item
     * @param {Object} quest - Quest data
     * @param {boolean} isCompleted - Whether the quest is completed
     */
    renderQuestItem(quest, isCompleted) {
        const questItem = document.createElement('div');
        questItem.className = `quest-item ${isCompleted ? 'completed' : 'active'}`;

        const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

        questItem.innerHTML = `
            <div class="quest-icon">${quest.icon}</div>
            <div class="quest-content">
                <div class="quest-header">
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-status">${isCompleted ? '✓' : ''}</div>
                </div>
                <div class="quest-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${quest.progress}/${quest.target}</div>
                </div>
            </div>
        `;

        // Add click handler to show quest details
        questItem.addEventListener('click', () => {
            this.showQuestModal(quest);
        });

        this.elements.questList.appendChild(questItem);
    },

    /**
     * Show quest details modal
     * @param {Object} quest - Quest to show
     */
    showQuestModal(quest) {
        if (!this.elements.questModal) return;

        // Update modal content
        if (this.elements.questModalTitle) {
            this.elements.questModalTitle.textContent = quest.name;
        }

        if (this.elements.questModalDescription) {
            this.elements.questModalDescription.textContent = quest.description;
        }

        // Update objectives
        if (this.elements.questModalObjectives) {
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
            this.elements.questModalObjectives.innerHTML = `
                <div class="objective-item">
                    <div class="objective-text">${quest.description}</div>
                    <div class="objective-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">${quest.progress}/${quest.target}</div>
                    </div>
                </div>
            `;
        }

        // Update rewards
        if (this.elements.questModalRewards && quest.reward) {
            const rewards = [];
            if (quest.reward.experience) rewards.push(`${quest.reward.experience} XP`);
            if (quest.reward.gold) rewards.push(`${quest.reward.gold} Gold`);
            if (quest.reward.skillPoints) rewards.push(`${quest.reward.skillPoints} Skill Points`);

            this.elements.questModalRewards.innerHTML = `
                <div class="reward-title">Rewards:</div>
                <div class="reward-list">${rewards.join(', ')}</div>
            `;
        }

        // Show modal
        this.elements.questModal.style.display = 'block';
    },

    /**
     * Hide quest details modal
     */
    hideQuestModal() {
        if (this.elements.questModal) {
            this.elements.questModal.style.display = 'none';
        }
    },

    /**
     * Reset all quests (for new game)
     */
    resetQuests() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.questProgress = {};

        this.generateInitialQuests();
        this.updateQuestDisplay();
        this.saveQuestData();
    },

    /**
     * Save quest data to storage
     */
    saveQuestData() {
        if (typeof Storage !== 'undefined' && Storage.available) {
            const questData = {
                activeQuests: this.activeQuests,
                completedQuests: this.completedQuests,
                questProgress: this.questProgress
            };

            Storage.Game.saveQuests(questData);
        }
    },

    /**
     * Load quest data from storage
     */
    loadQuestData() {
        if (typeof Storage !== 'undefined' && Storage.available) {
            const questData = Storage.Game.loadQuests();
            if (questData) {
                this.activeQuests = questData.activeQuests || [];
                this.completedQuests = questData.completedQuests || [];
                this.questProgress = questData.questProgress || {};
            }
        }
    }
};

// Export for ES6 modules
export default QuestSystem;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.QuestSystem = QuestSystem;
}
