// Dun Dun Dungeon - Skill Tree System
// Manages skill progression, skill points, and skill effects

/**
 * Skill Tree System Manager
 */
const Skills = {
    // Skill points available for spending
    skillPoints: 0,

    // DOM element references
    elements: {},

    // Unlocked skills storage
    unlockedSkills: new Set(),

    // Skill tree definition - matrix layout (5x5 grid)
    skillTree: {
        // Row 0 - Foundation Skills
        'warrior_0_0': {
            id: 'warrior_0_0',
            name: 'Warrior Path',
            description: 'Begin the path of the warrior',
            icon: '⚔️',
            cost: 1,
            position: { row: 0, col: 0 },
            prerequisites: [],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                strength: 2,
                description: '+2 Strength'
            }
        },
        'mage_0_2': {
            id: 'mage_0_2',
            name: 'Mage Path',
            description: 'Begin the path of the mage',
            icon: '🔮',
            cost: 1,
            position: { row: 0, col: 2 },
            prerequisites: [],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                agility: 2,
                description: '+2 Agility'
            }
        },
        'guardian_0_4': {
            id: 'guardian_0_4',
            name: 'Guardian Path',
            description: 'Begin the path of the guardian',
            icon: '🛡️',
            cost: 1,
            position: { row: 0, col: 4 },
            prerequisites: [],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                vitality: 2,
                description: '+2 Vitality'
            }
        },

        // Row 1 - Basic Combat Skills
        'power_strike_1_0': {
            id: 'power_strike_1_0',
            name: 'Power Strike',
            description: 'Increases base attack damage',
            icon: '💥',
            cost: 1,
            position: { row: 1, col: 0 },
            prerequisites: ['warrior_0_0'],
            maxLevel: 3,
            currentLevel: 0,
            effects: {
                attackPower: 3,
                description: '+3 Attack Power per level'
            }
        },
        'quick_strike_1_2': {
            id: 'quick_strike_1_2',
            name: 'Quick Strike',
            description: 'Increases critical hit chance',
            icon: '⚡',
            cost: 1,
            position: { row: 1, col: 2 },
            prerequisites: ['mage_0_2'],
            maxLevel: 3,
            currentLevel: 0,
            effects: {
                critChance: 5,
                description: '+5% Critical Chance per level'
            }
        },
        'fortitude_1_4': {
            id: 'fortitude_1_4',
            name: 'Fortitude',
            description: 'Increases maximum health',
            icon: '❤️',
            cost: 1,
            position: { row: 1, col: 4 },
            prerequisites: ['guardian_0_4'],
            maxLevel: 3,
            currentLevel: 0,
            effects: {
                maxHealth: 10,
                description: '+10 Max Health per level'
            }
        },

        // Row 2 - Advanced Skills
        'berserker_2_0': {
            id: 'berserker_2_0',
            name: 'Berserker Rage',
            description: 'Attack power increases when health is low',
            icon: '🔥',
            cost: 2,
            position: { row: 2, col: 0 },
            prerequisites: ['power_strike_1_0'],
            maxLevel: 2,
            currentLevel: 0,
            effects: {
                berserkerRage: true,
                description: '+50% damage when health < 25%'
            }
        },
        'dual_wield_2_1': {
            id: 'dual_wield_2_1',
            name: 'Dual Wield',
            description: 'Can equip two weapons for bonus damage',
            icon: '⚔️⚔️',
            cost: 3,
            position: { row: 2, col: 1 },
            prerequisites: ['power_strike_1_0', 'quick_strike_1_2'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                dualWield: true,
                attackPower: 5,
                description: 'Dual wield weapons, +5 Attack Power'
            }
        },
        'spell_power_2_2': {
            id: 'spell_power_2_2',
            name: 'Spell Power',
            description: 'Magic attacks deal more damage',
            icon: '✨',
            cost: 2,
            position: { row: 2, col: 2 },
            prerequisites: ['quick_strike_1_2'],
            maxLevel: 2,
            currentLevel: 0,
            effects: {
                spellPower: 20,
                description: '+20% spell damage per level'
            }
        },
        'shield_master_2_3': {
            id: 'shield_master_2_3',
            name: 'Shield Master',
            description: 'Blocking becomes more effective',
            icon: '🛡️✨',
            cost: 3,
            position: { row: 2, col: 3 },
            prerequisites: ['quick_strike_1_2', 'fortitude_1_4'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                blockEfficiency: 50,
                description: '+50% block effectiveness'
            }
        },
        'regeneration_2_4': {
            id: 'regeneration_2_4',
            name: 'Regeneration',
            description: 'Slowly recover health over time',
            icon: '💚',
            cost: 2,
            position: { row: 2, col: 4 },
            prerequisites: ['fortitude_1_4'],
            maxLevel: 2,
            currentLevel: 0,
            effects: {
                healthRegen: 2,
                description: '+2 HP per turn per level'
            }
        },

        // Row 3 - Master Skills
        'weapon_master_3_0': {
            id: 'weapon_master_3_0',
            name: 'Weapon Master',
            description: 'All weapons deal increased damage',
            icon: '🗡️👑',
            cost: 3,
            position: { row: 3, col: 0 },
            prerequisites: ['berserker_2_0', 'dual_wield_2_1'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                weaponMastery: 25,
                description: '+25% weapon damage'
            }
        },
        'arcane_mastery_3_2': {
            id: 'arcane_mastery_3_2',
            name: 'Arcane Mastery',
            description: 'Unlock powerful magical abilities',
            icon: '🔮👑',
            cost: 3,
            position: { row: 3, col: 2 },
            prerequisites: ['spell_power_2_2', 'shield_master_2_3'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                arcaneMastery: true,
                critChance: 10,
                description: 'Unlock spells, +10% crit chance'
            }
        },
        'immortal_guardian_3_4': {
            id: 'immortal_guardian_3_4',
            name: 'Immortal Guardian',
            description: 'Chance to survive fatal damage',
            icon: '👑💎',
            cost: 4,
            position: { row: 3, col: 4 },
            prerequisites: ['shield_master_2_3', 'regeneration_2_4'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                immortalGuardian: 25,
                description: '25% chance to survive fatal damage'
            }
        },

        // Row 4 - Legendary Skills
        'grand_master_4_1': {
            id: 'grand_master_4_1',
            name: 'Grand Master',
            description: 'The pinnacle of combat prowess',
            icon: '👑⚡',
            cost: 5,
            position: { row: 4, col: 1 },
            prerequisites: ['weapon_master_3_0', 'arcane_mastery_3_2'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                grandMaster: true,
                attackPower: 10,
                critChance: 15,
                maxHealth: 25,
                description: '+10 Attack, +15% Crit, +25 Health'
            }
        },
        'divine_protection_4_3': {
            id: 'divine_protection_4_3',
            name: 'Divine Protection',
            description: 'Ultimate defensive mastery',
            icon: '🔰✨',
            cost: 5,
            position: { row: 4, col: 3 },
            prerequisites: ['arcane_mastery_3_2', 'immortal_guardian_3_4'],
            maxLevel: 1,
            currentLevel: 0,
            effects: {
                divineProtection: true,
                maxHealth: 50,
                healthRegen: 5,
                description: '+50 Health, +5 HP regen, damage immunity chance'
            }
        }
    },

    /**
     * Initialize the skill tree system
     */
    init() {
        console.log('Initializing Skill Tree system...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Subscribe to game state changes
        this.setupGameStateListeners();

        // Load saved skill data
        this.loadSkillData();

        // Render the skill tree
        this.renderSkillTree();

        console.log('Skill Tree system initialized');
    },

    /**
     * Cache DOM elements for the skill system
     */
    cacheElements() {
        this.elements = {
            skillsTree: document.getElementById('skills-tree'),
            availableSkillPoints: document.getElementById('available-skill-points'),
            skillTooltip: null // Will be created dynamically
        };
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Skill tree interactions will be set up when rendering
    },

    /**
     * Subscribe to game state changes
     */
    setupGameStateListeners() {
        if (typeof GameState !== 'undefined') {
            GameState.on('playerUpdate', (player) => this.handlePlayerUpdate(player));
            GameState.on('stateChange', (data) => this.handleStateChange(data));
        }
    },

    /**
     * Handle player updates
     * @param {Object} player - Player data
     */
    handlePlayerUpdate(player) {
        // Update skill points when player levels up
        this.updateAvailableSkillPoints();
        this.updateSkillAvailability();
    },

    /**
     * Handle game state changes
     * @param {Object} data - State change data
     */
    handleStateChange(data) {
        if (data.type === 'levelUp') {
            // Grant skill points on level up
            this.addSkillPoints(1); // 1 skill point per level
        }
    },

    /**
     * Add skill points
     * @param {number} points - Number of skill points to add
     */
    addSkillPoints(points) {
        this.skillPoints += points;
        this.updateAvailableSkillPoints();
        this.updateSkillAvailability();
        this.saveSkillData();
    },

    /**
     * Spend skill points on a skill
     * @param {string} skillId - ID of the skill to upgrade
     * @returns {boolean} True if skill was upgraded successfully
     */
    spendSkillPoints(skillId) {
        const skill = this.skillTree[skillId];
        if (!skill) {
            console.error('Skill not found:', skillId);
            return false;
        }

        // Check if we have enough skill points
        if (this.skillPoints < skill.cost) {
            console.log('Not enough skill points');
            return false;
        }

        // Check if skill is at max level
        if (skill.currentLevel >= skill.maxLevel) {
            console.log('Skill already at max level');
            return false;
        }

        // Check prerequisites
        if (!this.arePrerequisitesMet(skillId)) {
            console.log('Prerequisites not met');
            return false;
        }

        // Upgrade the skill
        this.skillPoints -= skill.cost;
        skill.currentLevel++;
        this.unlockedSkills.add(skillId);

        // Apply skill effects
        this.applySkillEffects(skill);

        // Update UI
        this.updateAvailableSkillPoints();
        this.updateSkillAvailability();
        this.renderSkillNode(skillId);

        // Save progress
        this.saveSkillData();

        console.log(`Upgraded skill: ${skill.name} to level ${skill.currentLevel}`);
        return true;
    },

    /**
     * Check if prerequisites for a skill are met
     * @param {string} skillId - ID of the skill to check
     * @returns {boolean} True if prerequisites are met
     */
    arePrerequisitesMet(skillId) {
        const skill = this.skillTree[skillId];
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
            return true;
        }

        return skill.prerequisites.every(prereqId =>
            this.unlockedSkills.has(prereqId) &&
            this.skillTree[prereqId].currentLevel > 0
        );
    },

    /**
     * Apply effects of a skill to the player
     * @param {Object} skill - Skill object
     */
    applySkillEffects(skill) {
        if (!GameState || !GameState.player) return;

        const effects = skill.effects;
        const updates = {};

        // Apply stat bonuses
        if (effects.strength) {
            updates.strength = GameState.player.strength + effects.strength;
        }
        if (effects.agility) {
            updates.agility = GameState.player.agility + effects.agility;
        }
        if (effects.vitality) {
            updates.vitality = GameState.player.vitality + effects.vitality;
        }
        if (effects.maxHealth) {
            const healthIncrease = effects.maxHealth * skill.currentLevel;
            updates.maxHealth = GameState.player.maxHealth + healthIncrease;
            updates.health = Math.min(GameState.player.health + healthIncrease, updates.maxHealth);
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
            GameState.updatePlayer(updates);
        }

        // Handle special abilities (these would be checked during combat/gameplay)
        this.updatePlayerAbilities();
    },

    /**
     * Update player abilities based on unlocked skills
     */
    updatePlayerAbilities() {
        if (!GameState || !GameState.player) return;

        // Initialize abilities object if it doesn't exist
        if (!GameState.player.abilities) {
            GameState.player.abilities = {};
        }

        // Check for special abilities
        const abilities = {};

        Object.values(this.skillTree).forEach(skill => {
            if (skill.currentLevel > 0) {
                const effects = skill.effects;

                if (effects.berserkerRage) abilities.berserkerRage = true;
                if (effects.dualWield) abilities.dualWield = true;
                if (effects.arcaneMastery) abilities.arcaneMastery = true;
                if (effects.immortalGuardian) abilities.immortalGuardian = effects.immortalGuardian;
                if (effects.grandMaster) abilities.grandMaster = true;
                if (effects.divineProtection) abilities.divineProtection = true;
                if (effects.weaponMastery) abilities.weaponMastery = effects.weaponMastery;
                if (effects.spellPower) abilities.spellPower = (abilities.spellPower || 0) + effects.spellPower * skill.currentLevel;
                if (effects.blockEfficiency) abilities.blockEfficiency = effects.blockEfficiency;
                if (effects.healthRegen) abilities.healthRegen = (abilities.healthRegen || 0) + effects.healthRegen * skill.currentLevel;
            }
        });

        GameState.player.abilities = abilities;
    },

    /**
     * Get total stat bonuses from skills
     * @returns {Object} Stat bonuses
     */
    getSkillStatBonuses() {
        const bonuses = {
            attackPower: 0,
            critChance: 0,
            maxHealth: 0,
            strength: 0,
            agility: 0,
            vitality: 0
        };

        Object.values(this.skillTree).forEach(skill => {
            if (skill.currentLevel > 0) {
                const effects = skill.effects;
                const level = skill.currentLevel;

                if (effects.attackPower) bonuses.attackPower += effects.attackPower * level;
                if (effects.critChance) bonuses.critChance += effects.critChance * level;
                if (effects.maxHealth) bonuses.maxHealth += effects.maxHealth * level;
                if (effects.strength) bonuses.strength += effects.strength * level;
                if (effects.agility) bonuses.agility += effects.agility * level;
                if (effects.vitality) bonuses.vitality += effects.vitality * level;
            }
        });

        return bonuses;
    },

    /**
     * Render the entire skill tree
     */
    renderSkillTree() {
        if (!this.elements.skillsTree) return;

        // Clear existing content
        this.elements.skillsTree.innerHTML = '';

        // Create skill tree grid (5x5)
        const treeGrid = document.createElement('div');
        treeGrid.className = 'skill-tree-grid';

        // Create grid cells
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'skill-cell';
                cell.style.gridRow = row + 1;
                cell.style.gridColumn = col + 1;

                // Find skill for this position
                const skill = this.findSkillAtPosition(row, col);
                if (skill) {
                    this.renderSkillNode(skill.id, cell);
                } else {
                    cell.classList.add('empty-cell');
                }

                treeGrid.appendChild(cell);
            }
        }

        // Add connection lines
        this.renderSkillConnections(treeGrid);

        this.elements.skillsTree.appendChild(treeGrid);
        this.updateAvailableSkillPoints();
    },

    /**
     * Find skill at a specific grid position
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Object|null} Skill object or null
     */
    findSkillAtPosition(row, col) {
        return Object.values(this.skillTree).find(skill =>
            skill.position.row === row && skill.position.col === col
        );
    },

    /**
     * Render a single skill node
     * @param {string} skillId - ID of the skill
     * @param {HTMLElement} container - Container element (optional)
     */
    renderSkillNode(skillId, container = null) {
        const skill = this.skillTree[skillId];
        if (!skill) return;

        let skillNode;
        if (container) {
            skillNode = container;
        } else {
            skillNode = this.elements.skillsTree.querySelector(`[data-skill-id="${skillId}"]`);
            if (!skillNode) return;
        }

        skillNode.className = 'skill-node';
        skillNode.setAttribute('data-skill-id', skillId);

        // Determine skill state
        const isUnlocked = skill.currentLevel > 0;
        const canUpgrade = this.canUpgradeSkill(skillId);
        const prereqsMet = this.arePrerequisitesMet(skillId);

        // Add state classes
        if (isUnlocked) skillNode.classList.add('unlocked');
        if (canUpgrade) skillNode.classList.add('available');
        if (!prereqsMet) skillNode.classList.add('locked');
        if (skill.currentLevel >= skill.maxLevel) skillNode.classList.add('maxed');

        // Create skill content
        skillNode.innerHTML = `
            <div class="skill-icon">${skill.icon}</div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-level">${skill.currentLevel}/${skill.maxLevel}</div>
            <div class="skill-cost">${skill.cost} SP</div>
        `;

        // Add click handler
        skillNode.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSkillClick(skillId);
        });

        // Add hover handlers for tooltip
        skillNode.addEventListener('mouseenter', (e) => {
            this.showSkillTooltip(e, skill);
        });

        skillNode.addEventListener('mouseleave', () => {
            this.hideSkillTooltip();
        });
    },

    /**
     * Check if a skill can be upgraded
     * @param {string} skillId - ID of the skill
     * @returns {boolean} True if skill can be upgraded
     */
    canUpgradeSkill(skillId) {
        const skill = this.skillTree[skillId];
        if (!skill) return false;

        return this.skillPoints >= skill.cost &&
               skill.currentLevel < skill.maxLevel &&
               this.arePrerequisitesMet(skillId);
    },

    /**
     * Handle skill node click
     * @param {string} skillId - ID of the clicked skill
     */
    handleSkillClick(skillId) {
        if (this.canUpgradeSkill(skillId)) {
            const success = this.spendSkillPoints(skillId);
            if (success) {
                // Add visual feedback
                const skillNode = this.elements.skillsTree.querySelector(`[data-skill-id="${skillId}"]`);
                if (skillNode) {
                    skillNode.classList.add('skill-upgraded');
                    setTimeout(() => {
                        skillNode.classList.remove('skill-upgraded');
                    }, 500);
                }
            }
        }
    },

    /**
     * Show skill tooltip
     * @param {Event} event - Mouse event
     * @param {Object} skill - Skill object
     */
    showSkillTooltip(event, skill) {
        this.hideSkillTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${skill.icon}</span>
                <span class="tooltip-name">${skill.name}</span>
                <span class="tooltip-level">${skill.currentLevel}/${skill.maxLevel}</span>
            </div>
            <div class="tooltip-description">${skill.description}</div>
            <div class="tooltip-effects">${skill.effects.description}</div>
            <div class="tooltip-cost">Cost: ${skill.cost} Skill Points</div>
            ${skill.prerequisites.length > 0 ?
                `<div class="tooltip-prereqs">Requires: ${skill.prerequisites.map(id => this.skillTree[id].name).join(', ')}</div>`
                : ''
            }
        `;

        document.body.appendChild(tooltip);
        this.elements.skillTooltip = tooltip;

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + 'px';

        // Adjust if tooltip goes off screen
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = rect.left - tooltipRect.width - 10 + 'px';
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = window.innerHeight - tooltipRect.height - 10 + 'px';
        }
    },

    /**
     * Hide skill tooltip
     */
    hideSkillTooltip() {
        if (this.elements.skillTooltip) {
            this.elements.skillTooltip.remove();
            this.elements.skillTooltip = null;
        }
    },

    /**
     * Render connection lines between skills
     * @param {HTMLElement} treeGrid - Skill tree grid element
     */
    renderSkillConnections(treeGrid) {
        Object.values(this.skillTree).forEach(skill => {
            skill.prerequisites.forEach(prereqId => {
                const prereqSkill = this.skillTree[prereqId];
                if (prereqSkill) {
                    const connection = document.createElement('div');
                    connection.className = 'skill-connection';

                    // Calculate connection position and style
                    const fromRow = prereqSkill.position.row;
                    const fromCol = prereqSkill.position.col;
                    const toRow = skill.position.row;
                    const toCol = skill.position.col;

                    // Determine connection type
                    if (fromRow === toRow) {
                        // Horizontal connection
                        connection.classList.add('horizontal');
                        connection.style.gridRow = fromRow + 1;
                        connection.style.gridColumn = `${Math.min(fromCol, toCol) + 1} / ${Math.max(fromCol, toCol) + 2}`;
                    } else if (fromCol === toCol) {
                        // Vertical connection
                        connection.classList.add('vertical');
                        connection.style.gridColumn = fromCol + 1;
                        connection.style.gridRow = `${Math.min(fromRow, toRow) + 1} / ${Math.max(fromRow, toRow) + 2}`;
                    } else {
                        // Diagonal or complex connection - use CSS positioning
                        connection.classList.add('diagonal');
                        // For simplicity, we'll skip diagonal connections in this implementation
                        return;
                    }

                    treeGrid.appendChild(connection);
                }
            });
        });
    },

    /**
     * Update available skill points display
     */
    updateAvailableSkillPoints() {
        if (this.elements.availableSkillPoints) {
            this.elements.availableSkillPoints.textContent = this.skillPoints;
        }
    },

    /**
     * Update skill availability based on current state
     */
    updateSkillAvailability() {
        Object.keys(this.skillTree).forEach(skillId => {
            const skillNode = this.elements.skillsTree?.querySelector(`[data-skill-id="${skillId}"]`);
            if (skillNode) {
                this.updateSkillNodeState(skillNode, skillId);
            }
        });
    },

    /**
     * Update a single skill node's visual state
     * @param {HTMLElement} skillNode - Skill node element
     * @param {string} skillId - ID of the skill
     */
    updateSkillNodeState(skillNode, skillId) {
        const skill = this.skillTree[skillId];
        const isUnlocked = skill.currentLevel > 0;
        const canUpgrade = this.canUpgradeSkill(skillId);
        const prereqsMet = this.arePrerequisitesMet(skillId);

        // Remove all state classes
        skillNode.classList.remove('unlocked', 'available', 'locked', 'maxed');

        // Add appropriate state classes
        if (isUnlocked) skillNode.classList.add('unlocked');
        if (canUpgrade) skillNode.classList.add('available');
        if (!prereqsMet) skillNode.classList.add('locked');
        if (skill.currentLevel >= skill.maxLevel) skillNode.classList.add('maxed');
    },

    /**
     * Reset all skills (for new game)
     */
    resetSkills() {
        this.skillPoints = 0;
        this.unlockedSkills.clear();

        Object.values(this.skillTree).forEach(skill => {
            skill.currentLevel = 0;
        });

        this.updateAvailableSkillPoints();
        this.renderSkillTree();
        this.saveSkillData();
    },

    /**
     * Save skill data to storage
     */
    saveSkillData() {
        if (typeof Storage !== 'undefined' && Storage.available) {
            const skillData = {
                skillPoints: this.skillPoints,
                unlockedSkills: Array.from(this.unlockedSkills),
                skillLevels: {}
            };

            Object.keys(this.skillTree).forEach(skillId => {
                skillData.skillLevels[skillId] = this.skillTree[skillId].currentLevel;
            });

            Storage.Game.saveSkills(skillData);
        }
    },

    /**
     * Load skill data from storage
     */
    loadSkillData() {
        if (typeof Storage !== 'undefined' && Storage.available) {
            const skillData = Storage.Game.loadSkills();
            if (skillData) {
                this.skillPoints = skillData.skillPoints || 0;
                this.unlockedSkills = new Set(skillData.unlockedSkills || []);

                if (skillData.skillLevels) {
                    Object.keys(skillData.skillLevels).forEach(skillId => {
                        if (this.skillTree[skillId]) {
                            this.skillTree[skillId].currentLevel = skillData.skillLevels[skillId] || 0;
                        }
                    });
                }

                // Reapply all skill effects
                this.updatePlayerAbilities();
            }
        }
    }
};

// Export for ES6 modules
export default Skills;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.Skills = Skills;
}
