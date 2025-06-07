// NPC System - Handles NPC rooms and dialog
import GameState from './game-state.js';

/**
 * NPC System for managing non-player characters and their dialogs
 */
const NPCSystem = {
    // Fantasy and animal emoji avatars for NPCs
    avatars: [
        '🧙', '🧝', '🧚', '🧞', '🧛', '🧜', '🧙‍♀️', '🧝‍♀️', '🧚‍♀️', '🧞‍♀️', '🧛‍♀️', '🧜‍♀️',
        '🦄', '🐉', '🦅', '🦉', '🐺', '🦊', '🐻', '🐸', '🐢', '🦎', '🐍', '🕷️',
        '👑', '⚔️', '🛡️', '🔮', '🗝️', '📿', '🏺', '🕯️'
    ],

    // NPC dialog templates
    dialogs: [
        {
            greeting: "Greetings, brave adventurer! I am {name}, guardian of ancient secrets.",
            content: "These dungeons hold mysteries older than time itself. The deeper you venture, the greater the treasures... and dangers."
        },
        {
            greeting: "Ah, another soul seeking glory in these cursed halls. I am {name}.",
            content: "Beware the shadows that dance in the corners of your vision. Not all that moves in these depths is alive."
        },
        {
            greeting: "Welcome, traveler! {name} is what they call me in these forgotten realms.",
            content: "The magic here grows stronger with each floor. Learn to harness it, or it will consume you whole."
        },
        {
            greeting: "Hold there, wanderer! I am {name}, keeper of old tales.",
            content: "Legend speaks of a great treasure hidden in the deepest chamber, but none who sought it have ever returned."
        },
        {
            greeting: "Hail and well met! {name} has dwelt in these halls for countless ages.",
            content: "The monsters you face are but echoes of their former selves. The true horrors sleep deeper still."
        },
        {
            greeting: "Greetings, bold one! They know me as {name} in the world above.",
            content: "Each floor tells a story written in stone and shadow. Listen carefully, and the dungeon will teach you its secrets."
        },
        {
            greeting: "Ah, a living soul! How refreshing. I am {name}, chronicler of these depths.",
            content: "Time flows strangely here. What seems like hours may be days, what feels like years may be moments."
        },
        {
            greeting: "Stay your weapon, friend! I am {name}, and I mean no harm.",
            content: "The artifacts you find are fragments of a civilization lost to time. Handle them with respect, for they remember their makers."
        }
    ],

    // NPC names based on fantasy themes
    names: [
        'Eldara the Wise', 'Thorven Stonewhisper', 'Mystic Aeliana', 'Gareth the Wanderer',
        'Lady Seraphina', 'Draven Shadowmere', 'Oracle Luminara', 'Sir Caelum',
        'Sage Bramblewood', 'Archon Vexia', 'Keeper Dorian', 'Hermit Wolfric',
        'Enchantress Lyralei', 'Prophet Zephyr', 'Guardian Thaldric', 'Seer Evangeline'
    ],

    /**
     * Generate a random NPC for dialog
     * @returns {Object} NPC data with name, avatar, and dialog
     */
    generateNPC() {
        const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
        const name = this.names[Math.floor(Math.random() * this.names.length)];
        const dialogTemplate = this.dialogs[Math.floor(Math.random() * this.dialogs.length)];

        const greeting = dialogTemplate.greeting.replace('{name}', name);
        const fullDialog = `${greeting}\n\n${dialogTemplate.content}`;

        return {
            name,
            avatar,
            dialog: fullDialog
        };
    },

    /**
     * Handle NPC room encounter
     */
    handleNPCRoom() {
        console.log('NPC room encounter!');

        const npc = this.generateNPC();

        // Store the NPC data in the current room for potential re-encounters
        if (GameState.dungeon.currentRoom) {
            GameState.dungeon.currentRoom.data.npc = npc;
            GameState.dungeon.currentRoom.isCleared = true; // Mark as visited but not consumed
        }

        // Show NPC dialog
        this.showNPCDialog(npc);

        // Add to lore tracking
        this.addToLore(npc);
    },

    /**
     * Show NPC dialog overlay
     * @param {Object} npc - NPC data
     */
    showNPCDialog(npc) {
        const overlay = document.getElementById('npc-dialog-overlay');
        const npcEmoji = document.getElementById('npc-emoji');
        const npcName = document.getElementById('npc-name');
        const npcText = document.getElementById('npc-text');
        const continueBtn = document.getElementById('npc-continue-btn');

        if (!overlay || !npcEmoji || !npcName || !npcText || !continueBtn) {
            console.error('NPC dialog elements not found');
            return;
        }

        // Set NPC data
        npcEmoji.textContent = npc.avatar;
        npcName.textContent = npc.name;
        npcText.textContent = npc.dialog;

        // Show overlay
        overlay.style.display = 'flex';

        // Set up continue button handler
        const handleContinue = () => {
            overlay.style.display = 'none';
            continueBtn.removeEventListener('click', handleContinue);
        };

        continueBtn.addEventListener('click', handleContinue);

        // Also allow clicking outside to close
        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                overlay.removeEventListener('click', handleOverlayClick);
                continueBtn.removeEventListener('click', handleContinue);
            }
        };

        overlay.addEventListener('click', handleOverlayClick);
    },

    /**
     * Add conversation to lore tracking
     * @param {Object} npc - NPC data
     */
    addToLore(npc) {
        if (typeof GameState.addLoreConversation === 'function') {
            GameState.addLoreConversation(npc.name, npc.avatar, npc.dialog);
        } else {
            // Fallback: directly add to lore if method doesn't exist
            if (!GameState.lore) {
                GameState.lore = { conversations: [] };
            }

            const conversation = {
                npcName: npc.name,
                avatar: npc.avatar,
                dialog: npc.dialog,
                floor: GameState.dungeon.currentFloor,
                timestamp: Date.now()
            };

            GameState.lore.conversations.push(conversation);

            // Save if auto-save is enabled
            if (GameState.settings.autoSave) {
                GameState.saveGameData();
            }
        }

        console.log('Added conversation to lore:', npc.name);
    },

    /**
     * Update lore UI display
     */
    updateLoreUI() {
        const loreList = document.getElementById('lore-list');
        if (!loreList) return;

        const conversations = GameState.lore?.conversations || [];

        if (conversations.length === 0) {
            loreList.innerHTML = '<div class="lore-empty">No conversations discovered</div>';
            return;
        }

        // Clear existing content
        loreList.innerHTML = '';

        // Add each conversation as a clickable entry
        conversations.forEach((conversation, index) => {
            const entry = document.createElement('div');
            entry.className = 'lore-entry';
            entry.innerHTML = `
                <div class="lore-avatar">${conversation.avatar}</div>
                <div class="lore-info">
                    <div class="lore-npc-name">${conversation.npcName}</div>
                    <div class="lore-preview">${conversation.dialog.substring(0, 50)}...</div>
                </div>
            `;

            // Add click handler to re-show dialog
            entry.addEventListener('click', () => {
                this.showNPCDialog({
                    name: conversation.npcName,
                    avatar: conversation.avatar,
                    dialog: conversation.dialog
                });
            });

            loreList.appendChild(entry);
        });
    },

    /**
     * Initialize NPC system
     */
    init() {
        console.log('Initializing NPC System...');

        // Update lore UI when game state changes
        if (typeof GameState.on === 'function') {
            GameState.on('stateChange', () => {
                if (GameState.current.screen === 'character') {
                    this.updateLoreUI();
                }
            });
        }

        // Initial lore UI update
        setTimeout(() => {
            this.updateLoreUI();
        }, 100);

        console.log('NPC System initialized');
    }
};

// Export for ES6 modules
export default NPCSystem;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.NPCSystem = NPCSystem;
}
