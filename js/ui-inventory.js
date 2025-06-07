// Dun Dun Dungeon - Inventory UI Management
// Handles inventory interface, item interactions, and equipment

/**
 * Inventory UI Manager for handling inventory and item interactions
 */
const UIInventory = {
    /**
     * Initialize inventory UI
     */
    init() {
        console.log('Initializing Inventory UI...');
        this.setupEventListeners();
        this.generateInventorySlots();
        console.log('Inventory UI initialized');
    },

    /**
     * Set up inventory event listeners
     */
    setupEventListeners() {
        // Set up equipment slot event listeners
        this.setupEquipmentListeners();

        // Subscribe to inventory updates
        if (typeof GameState !== 'undefined') {
            GameState.on('inventoryUpdate', (inventory) => this.updateInventoryUI(inventory));
        }
    },

    /**
     * Generate inventory slot elements
     */
    generateInventorySlots() {
        if (!UICore.elements.inventoryGrid) return;

        UICore.elements.inventoryGrid.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotIndex = i;

            // Add click handler for inventory slots
            slot.addEventListener('click', () => this.handleInventorySlotClick(i));

            UICore.elements.inventoryGrid.appendChild(slot);
        }
    },

    /**
     * Set up equipment slot event listeners
     */
    setupEquipmentListeners() {
        // Equipment slot click handlers
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotType = slot.dataset.slot;
                this.handleEquipmentSlotClick(slotType);
            });
        });
    },

    /**
     * Handle equipment slot clicks
     * @param {string} slotType - Type of equipment slot (weapon, armor, accessory)
     */
    handleEquipmentSlotClick(slotType) {
        if (typeof GameState !== 'undefined' && GameState.player.equipment[slotType]) {
            const equippedItem = GameState.player.equipment[slotType];
            this.showEquipmentActionMenu(equippedItem, slotType);
        }
    },

    /**
     * Show equipment action menu for equipped items
     * @param {Object} item - Equipped item
     * @param {string} slotType - Equipment slot type
     */
    showEquipmentActionMenu(item, slotType) {
        this.hideItemActionMenu();

        const menu = document.createElement('div');
        menu.id = 'item-action-menu';
        menu.innerHTML = `
            <div class="item-info">
                <div class="item-name" style="color: ${typeof Items !== 'undefined' ? Items.getRarityColor(item.rarity) : '#fff'};">
                    ${item.icon} ${item.name}
                </div>
                <div class="item-description">${item.description}</div>
                <div class="item-equipped">Currently Equipped</div>
            </div>
            <div class="item-actions">
                <button class="action-btn unequip-btn">Unequip</button>
                <button class="action-btn cancel-btn">Cancel</button>
            </div>
        `;

        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #555;
            border-radius: 12px;
            padding: 1rem;
            z-index: 10000;
            min-width: 250px;
            color: #e0e0e0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        document.body.appendChild(menu);

        // Add event listeners
        menu.querySelector('.unequip-btn').addEventListener('click', () => {
            this.unequipItem(slotType);
            this.hideItemActionMenu();
        });

        menu.querySelector('.cancel-btn').addEventListener('click', () => {
            this.hideItemActionMenu();
        });

        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideMenuClick.bind(this), { once: true });
        }, 100);
    },

    /**
     * Unequip an item
     * @param {string} slotType - Equipment slot type
     */
    unequipItem(slotType) {
        if (typeof GameState !== 'undefined' && GameState.player.equipment[slotType]) {
            const equippedItem = GameState.player.equipment[slotType];

            // Check if inventory has space - need to find an empty slot
            const emptySlotIndex = GameState.inventory.items.findIndex(item => item === null);
            if (emptySlotIndex === -1 && GameState.inventory.items.length >= GameState.inventory.maxSlots) {
                if (typeof UINotifications !== 'undefined') {
                    UINotifications.showNotification('Inventory full! Cannot unequip item', 2000, 'error');
                }
                return;
            }

            // Remove stat bonuses
            if (equippedItem.stats) {
                const updates = {};
                for (const [stat, value] of Object.entries(equippedItem.stats)) {
                    if (stat === 'maxHealth') {
                        updates.maxHealth = GameState.player.maxHealth - value;
                        // Adjust current health if it exceeds new max
                        updates.health = Math.min(GameState.player.health, updates.maxHealth);
                    } else if (GameState.player.hasOwnProperty(stat)) {
                        updates[stat] = GameState.player[stat] - value;
                    }
                }
                if (Object.keys(updates).length > 0) {
                    GameState.updatePlayer(updates);
                }
            }

            // Add to inventory
            GameState.addItem({ ...equippedItem });

            // Remove from equipment
            GameState.player.equipment[slotType] = null;

            // Emit events to update the UI
            GameState.emit('playerUpdate', GameState.player);
            GameState.emit('inventoryUpdate', GameState.inventory);

            if (typeof UINotifications !== 'undefined') {
                UINotifications.showNotification(`Unequipped ${equippedItem.name}`, 1500, 'info');
            }

            // Save if auto-save is enabled
            if (GameState.settings && GameState.settings.autoSave) {
                GameState.saveGameData();
            }
        }
    },

    /**
     * Handle inventory slot clicks
     * @param {number} slotIndex - Index of clicked slot
     */
    handleInventorySlotClick(slotIndex) {
        console.log('Inventory slot clicked:', slotIndex);

        if (typeof GameState !== 'undefined') {
            const item = GameState.inventory.items[slotIndex];
            if (item) {
                this.showItemActionMenu(item, slotIndex);
            }
        }
    },

    /**
     * Show item action menu
     * @param {Object} item - Item to show actions for
     * @param {number} slotIndex - Inventory slot index
     */
    showItemActionMenu(item, slotIndex) {
        this.hideItemActionMenu();

        const menu = document.createElement('div');
        menu.id = 'item-action-menu';
        menu.innerHTML = `
            <div class="item-info">
                <div class="item-name" style="color: ${typeof Items !== 'undefined' ? Items.getRarityColor(item.rarity) : '#fff'};">
                    ${item.icon} ${item.name}
                </div>
                <div class="item-description">${item.description}</div>
                ${item.quantity > 1 ? `<div class="item-quantity">Quantity: ${item.quantity}</div>` : ''}
            </div>
            <div class="item-actions">
                ${(item.type === 'consumable' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') ?
                    `<button class="action-btn use-btn">${item.type === 'consumable' ? 'Use' : 'Equip'}</button>` : ''}
                <button class="action-btn drop-btn">Drop</button>
                <button class="action-btn cancel-btn">Cancel</button>
            </div>
        `;

        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #555;
            border-radius: 12px;
            padding: 1rem;
            z-index: 10000;
            min-width: 250px;
            color: #e0e0e0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        document.body.appendChild(menu);

        // Add event listeners
        const useBtn = menu.querySelector('.use-btn');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                this.useItem(item, slotIndex);
                this.hideItemActionMenu();
            });
        }

        menu.querySelector('.drop-btn').addEventListener('click', () => {
            this.dropItem(slotIndex);
            this.hideItemActionMenu();
        });

        menu.querySelector('.cancel-btn').addEventListener('click', () => {
            this.hideItemActionMenu();
        });

        // Style the menu content
        const itemInfo = menu.querySelector('.item-info');
        if (itemInfo) {
            itemInfo.style.cssText = `
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #444;
            `;
        }

        const itemActions = menu.querySelector('.item-actions');
        if (itemActions) {
            itemActions.style.cssText = `
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            `;

            const actionBtns = itemActions.querySelectorAll('.action-btn');
            actionBtns.forEach(btn => {
                btn.style.cssText = `
                    flex: 1;
                    min-width: 60px;
                    padding: 0.5rem;
                    border: 1px solid #666;
                    border-radius: 6px;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                `;
            });
        }

        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideMenuClick.bind(this), { once: true });
        }, 100);
    },

    /**
     * Handle clicks outside the item menu
     */
    handleOutsideMenuClick(event) {
        const menu = document.getElementById('item-action-menu');

        // Don't close menu if clicking on overlays (like level up dialog)
        if (event.target.closest('.overlay') || event.target.closest('.level-up-overlay')) {
            return;
        }

        if (menu && !menu.contains(event.target)) {
            this.hideItemActionMenu();
        }
    },

    /**
     * Hide item action menu
     */
    hideItemActionMenu() {
        const menu = document.getElementById('item-action-menu');
        if (menu) {
            document.body.removeChild(menu);
        }
    },

    /**
     * Use an item
     * @param {Object} item - Item to use
     * @param {number} slotIndex - Inventory slot index
     */
    useItem(item, slotIndex) {
        if (typeof Items !== 'undefined') {
            Items.useItem(item, slotIndex);
        } else {
            console.warn('Items system not available');
        }
    },

    /**
     * Drop an item
     * @param {number} slotIndex - Inventory slot index
     */
    dropItem(slotIndex) {
        if (typeof Items !== 'undefined') {
            Items.dropItem(slotIndex);
        } else {
            GameState.removeItem(slotIndex);
            if (typeof UINotifications !== 'undefined') {
                UINotifications.showNotification('Item dropped', 1500, 'info');
            }
        }
    },

    /**
     * Update inventory UI
     * @param {Object} inventory - Inventory data
     */
    updateInventoryUI(inventory) {
        if (UICore.elements.inventoryCount) {
            UICore.elements.inventoryCount.textContent = `${inventory.items.length}/${inventory.maxSlots}`;
        }

        // Update inventory slots
        const slots = UICore.elements.inventoryGrid.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            const item = inventory.items[index];

            if (item) {
                slot.classList.add('occupied');
                slot.title = typeof Items !== 'undefined' ? Items.getTooltip(item) : (item.name || 'Item');

                // Add item icon and quantity
                slot.innerHTML = `
                    <div class="item-icon">${item.icon || '📦'}</div>
                    ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                `;

                // Set rarity border color
                if (typeof Items !== 'undefined' && item.rarity) {
                    slot.style.borderColor = Items.getRarityColor(item.rarity);
                } else {
                    slot.style.borderColor = '#555';
                }
            } else {
                slot.classList.remove('occupied');
                slot.title = '';
                slot.innerHTML = '';
                slot.style.borderColor = '#333';
            }
        });
    }
};

// Export for ES6 modules
export default UIInventory;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.UIInventory = UIInventory;
}
