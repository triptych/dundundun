// Dun Dun Dungeon - Advanced Inventory System
// Handles item categorization, auto-sort, drag-and-drop, and selling

/**
 * Advanced Inventory System
 */
const InventorySystem = {
    // Item categories for sorting
    categories: {
        EQUIPMENT: ['weapon', 'armor', 'accessory'],
        CONSUMABLES: ['consumable'],
        MATERIALS: ['material'],
        TREASURES: ['treasure']
    },

    // Drag and drop state
    dragState: {
        isDragging: false,
        draggedItem: null,
        draggedFromSlot: null,
        touchIdentifier: null,
        dragElement: null,
        offsetX: 0,
        offsetY: 0
    },

    // Selling state
    sellingMode: false,
    selectedForSale: new Set(),

    /**
     * Initialize the inventory system
     */
    init() {
        console.log('Initializing Advanced Inventory System...');

        // Set up drag and drop
        this.setupDragAndDrop();

        // Set up selling system
        this.setupSellingSystem();

        console.log('Advanced Inventory System initialized');
    },

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Add event listeners after DOM is ready
        setTimeout(() => {
            const inventoryGrid = document.getElementById('inventory-grid');
            if (!inventoryGrid) return;

            // Mouse events
            inventoryGrid.addEventListener('mousedown', this.handleDragStart.bind(this));
            document.addEventListener('mousemove', this.handleDragMove.bind(this));
            document.addEventListener('mouseup', this.handleDragEnd.bind(this));

            // Touch events for mobile
            inventoryGrid.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
            document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleDragEnd.bind(this));
            document.addEventListener('touchcancel', this.handleDragEnd.bind(this));

            // Prevent context menu on long press
            inventoryGrid.addEventListener('contextmenu', (e) => e.preventDefault());
        }, 100);
    },

    /**
     * Handle drag start
     * @param {Event} e - Mouse or touch event
     */
    handleDragStart(e) {
        const slot = e.target.closest('.inventory-slot');
        if (!slot || !slot.classList.contains('occupied')) return;

        const slotIndex = parseInt(slot.dataset.slotIndex);
        const item = GameState.inventory.items[slotIndex];
        if (!item) return;

        // Prevent default touch behavior
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        // Set up drag state
        this.dragState.isDragging = true;
        this.dragState.draggedItem = item;
        this.dragState.draggedFromSlot = slotIndex;

        // Get coordinates
        const coords = this.getEventCoordinates(e);
        const rect = slot.getBoundingClientRect();
        this.dragState.offsetX = coords.x - rect.left;
        this.dragState.offsetY = coords.y - rect.top;

        // Create drag element
        this.createDragElement(item, coords.x, coords.y);

        // Add dragging class to original slot
        slot.classList.add('dragging');

        // Store touch identifier for multi-touch support
        if (e.type === 'touchstart' && e.touches.length > 0) {
            this.dragState.touchIdentifier = e.touches[0].identifier;
        }
    },

    /**
     * Handle drag move
     * @param {Event} e - Mouse or touch event
     */
    handleDragMove(e) {
        if (!this.dragState.isDragging || !this.dragState.dragElement) return;

        // Prevent scrolling while dragging on mobile
        if (e.type === 'touchmove') {
            e.preventDefault();
        }

        const coords = this.getEventCoordinates(e);

        // Update drag element position
        this.dragState.dragElement.style.left = `${coords.x - this.dragState.offsetX}px`;
        this.dragState.dragElement.style.top = `${coords.y - this.dragState.offsetY}px`;

        // Highlight slot under cursor
        this.highlightSlotUnderCursor(coords.x, coords.y);
    },

    /**
     * Handle drag end
     * @param {Event} e - Mouse or touch event
     */
    handleDragEnd(e) {
        if (!this.dragState.isDragging) return;

        const coords = this.getEventCoordinates(e);
        const targetSlot = this.getSlotAtCoordinates(coords.x, coords.y);

        // Handle the drop
        if (targetSlot !== null && targetSlot !== this.dragState.draggedFromSlot) {
            this.handleItemDrop(this.dragState.draggedFromSlot, targetSlot);
        }

        // Clean up
        this.cleanupDrag();
    },

    /**
     * Get event coordinates for mouse or touch
     * @param {Event} e - Mouse or touch event
     * @returns {Object} {x, y} coordinates
     */
    getEventCoordinates(e) {
        if (e.type.includes('touch')) {
            // Find the correct touch for multi-touch support
            if (e.touches && e.touches.length > 0) {
                for (let touch of e.touches) {
                    if (touch.identifier === this.dragState.touchIdentifier) {
                        return { x: touch.clientX, y: touch.clientY };
                    }
                }
                // Fallback to first touch
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            }
        }
        return { x: e.clientX, y: e.clientY };
    },

    /**
     * Create drag element
     * @param {Object} item - Item being dragged
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    createDragElement(item, x, y) {
        const dragElement = document.createElement('div');
        dragElement.className = 'drag-item';
        dragElement.innerHTML = `
            <div class="item-icon">${item.icon || '📦'}</div>
            ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
        `;

        // Style the drag element
        dragElement.style.cssText = `
            position: fixed;
            left: ${x - this.dragState.offsetX}px;
            top: ${y - this.dragState.offsetY}px;
            width: 60px;
            height: 60px;
            pointer-events: none;
            z-index: 10001;
            opacity: 0.8;
            transform: scale(1.1);
            transition: transform 0.1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid ${Items.getRarityColor(item.rarity)};
            border-radius: 8px;
        `;

        document.body.appendChild(dragElement);
        this.dragState.dragElement = dragElement;
    },

    /**
     * Highlight slot under cursor
     * @param {number} x - Cursor X position
     * @param {number} y - Cursor Y position
     */
    highlightSlotUnderCursor(x, y) {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('drag-over'));

        const targetSlot = this.getSlotAtCoordinates(x, y);
        if (targetSlot !== null) {
            const slotElement = document.querySelector(`[data-slot-index="${targetSlot}"]`);
            if (slotElement) {
                slotElement.classList.add('drag-over');
            }
        }
    },

    /**
     * Get slot at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number|null} Slot index or null
     */
    getSlotAtCoordinates(x, y) {
        const slots = document.querySelectorAll('.inventory-slot');

        for (let slot of slots) {
            const rect = slot.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return parseInt(slot.dataset.slotIndex);
            }
        }

        return null;
    },

    /**
     * Handle item drop
     * @param {number} fromSlot - Source slot index
     * @param {number} toSlot - Target slot index
     */
    handleItemDrop(fromSlot, toSlot) {
        const fromItem = GameState.inventory.items[fromSlot];
        const toItem = GameState.inventory.items[toSlot];

        if (!fromItem) return;

        // Swap items
        GameState.inventory.items[fromSlot] = toItem;
        GameState.inventory.items[toSlot] = fromItem;

        // Update UI
        GameState.emit('inventoryUpdate', GameState.inventory);

        // Save if auto-save is enabled
        if (GameState.settings.autoSave) {
            GameState.saveGameData();
        }
    },

    /**
     * Clean up drag state
     */
    cleanupDrag() {
        // Remove drag element
        if (this.dragState.dragElement) {
            document.body.removeChild(this.dragState.dragElement);
        }

        // Remove all drag-related classes
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('dragging', 'drag-over');
        });

        // Reset drag state
        this.dragState = {
            isDragging: false,
            draggedItem: null,
            draggedFromSlot: null,
            touchIdentifier: null,
            dragElement: null,
            offsetX: 0,
            offsetY: 0
        };
    },

    /**
     * Auto-sort inventory by category and rarity
     */
    autoSortInventory() {
        const items = GameState.inventory.items.filter(item => item !== null);

        // Sort items by category, then rarity, then name
        items.sort((a, b) => {
            // First by category
            const categoryA = this.getItemCategory(a.type);
            const categoryB = this.getItemCategory(b.type);
            if (categoryA !== categoryB) {
                return categoryA - categoryB;
            }

            // Then by rarity (higher rarity first)
            const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
            const rarityA = rarityOrder[a.rarity] || 0;
            const rarityB = rarityOrder[b.rarity] || 0;
            if (rarityA !== rarityB) {
                return rarityB - rarityA;
            }

            // Finally by name
            return a.name.localeCompare(b.name);
        });

        // Clear inventory
        GameState.inventory.items = new Array(GameState.inventory.maxSlots).fill(null);

        // Place sorted items back
        items.forEach((item, index) => {
            if (index < GameState.inventory.maxSlots) {
                GameState.inventory.items[index] = item;
            }
        });

        // Update UI
        GameState.emit('inventoryUpdate', GameState.inventory);

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Inventory sorted!', 1500, 'info');
        }

        // Save if auto-save is enabled
        if (GameState.settings.autoSave) {
            GameState.saveGameData();
        }
    },

    /**
     * Get item category priority for sorting
     * @param {string} type - Item type
     * @returns {number} Category priority
     */
    getItemCategory(type) {
        if (this.categories.EQUIPMENT.includes(type)) return 1;
        if (this.categories.CONSUMABLES.includes(type)) return 2;
        if (this.categories.MATERIALS.includes(type)) return 3;
        if (this.categories.TREASURES.includes(type)) return 4;
        return 5; // Unknown
    },

    /**
     * Setup selling system
     */
    setupSellingSystem() {
        // Add sell mode button to inventory panel
        setTimeout(() => {
            const inventoryPanel = document.getElementById('inventory-panel');
            if (!inventoryPanel) return;

            const panelHeader = inventoryPanel.querySelector('.panel-header');
            if (panelHeader && !document.getElementById('sell-mode-btn')) {
                const sellButton = document.createElement('button');
                sellButton.id = 'sell-mode-btn';
                sellButton.className = 'sell-mode-btn';
                sellButton.textContent = 'Sell Mode';
                sellButton.style.cssText = `
                    margin-left: auto;
                    padding: 0.5rem 1rem;
                    background: #f39c12;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                `;

                sellButton.addEventListener('click', () => this.toggleSellMode());
                panelHeader.appendChild(sellButton);
            }

            // Add sort button
            if (panelHeader && !document.getElementById('sort-inventory-btn')) {
                const sortButton = document.createElement('button');
                sortButton.id = 'sort-inventory-btn';
                sortButton.className = 'sort-inventory-btn';
                sortButton.textContent = 'Sort';
                sortButton.style.cssText = `
                    margin-left: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #3498db;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                `;

                sortButton.addEventListener('click', () => this.autoSortInventory());
                panelHeader.appendChild(sortButton);
            }
        }, 100);
    },

    /**
     * Toggle sell mode
     */
    toggleSellMode() {
        this.sellingMode = !this.sellingMode;
        this.selectedForSale.clear();

        const sellButton = document.getElementById('sell-mode-btn');
        const inventoryGrid = document.getElementById('inventory-grid');

        if (this.sellingMode) {
            // Enter sell mode
            sellButton.textContent = 'Confirm Sale';
            sellButton.style.background = '#e74c3c';
            inventoryGrid.classList.add('sell-mode');

            // Update slot click handlers
            const slots = inventoryGrid.querySelectorAll('.inventory-slot');
            slots.forEach(slot => {
                slot.removeEventListener('click', this.handleSellSlotClick);
                slot.addEventListener('click', this.handleSellSlotClick.bind(this));
            });

            // Show sell UI
            this.showSellUI();
        } else {
            // Exit sell mode
            sellButton.textContent = 'Sell Mode';
            sellButton.style.background = '#f39c12';
            inventoryGrid.classList.remove('sell-mode');

            // Remove sell-specific click handlers
            const slots = inventoryGrid.querySelectorAll('.inventory-slot');
            slots.forEach(slot => {
                slot.removeEventListener('click', this.handleSellSlotClick);
                slot.classList.remove('selected-for-sale');
            });

            // Hide sell UI
            this.hideSellUI();
        }
    },

    /**
     * Handle slot click in sell mode
     * @param {Event} e - Click event
     */
    handleSellSlotClick(e) {
        if (!this.sellingMode) return;

        const slot = e.target.closest('.inventory-slot');
        if (!slot || !slot.classList.contains('occupied')) return;

        const slotIndex = parseInt(slot.dataset.slotIndex);
        const item = GameState.inventory.items[slotIndex];
        if (!item) return;

        // Prevent selling equipped items
        if (this.isItemEquipped(item)) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Cannot sell equipped items!', 2000, 'error');
            }
            return;
        }

        // Toggle selection
        if (this.selectedForSale.has(slotIndex)) {
            this.selectedForSale.delete(slotIndex);
            slot.classList.remove('selected-for-sale');
        } else {
            this.selectedForSale.add(slotIndex);
            slot.classList.add('selected-for-sale');
        }

        // Update sell UI
        this.updateSellTotal();

        e.stopPropagation();
    },

    /**
     * Check if an item is equipped
     * @param {Object} item - Item to check
     * @returns {boolean} True if equipped
     */
    isItemEquipped(item) {
        const equipment = GameState.player.equipment;
        return equipment.weapon === item ||
               equipment.armor === item ||
               equipment.accessory === item;
    },

    /**
     * Show sell UI
     */
    showSellUI() {
        // Create sell info panel
        const sellInfo = document.createElement('div');
        sellInfo.id = 'sell-info';
        sellInfo.className = 'sell-info';
        sellInfo.innerHTML = `
            <div class="sell-header">Select items to sell</div>
            <div class="sell-total">
                Total: <span id="sell-total-amount">0</span> gold
            </div>
            <button id="confirm-sell-btn" class="confirm-sell-btn">Sell Selected</button>
        `;

        sellInfo.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #f39c12;
            border-radius: 8px;
            padding: 1rem;
            z-index: 1000;
            text-align: center;
            color: white;
        `;

        document.body.appendChild(sellInfo);

        // Add confirm button handler
        document.getElementById('confirm-sell-btn').addEventListener('click', () => {
            this.confirmSale();
        });
    },

    /**
     * Hide sell UI
     */
    hideSellUI() {
        const sellInfo = document.getElementById('sell-info');
        if (sellInfo) {
            document.body.removeChild(sellInfo);
        }
    },

    /**
     * Update sell total
     */
    updateSellTotal() {
        let total = 0;

        this.selectedForSale.forEach(slotIndex => {
            const item = GameState.inventory.items[slotIndex];
            if (item) {
                total += (item.value || 0) * (item.quantity || 1);
            }
        });

        const totalElement = document.getElementById('sell-total-amount');
        if (totalElement) {
            totalElement.textContent = total;
        }
    },

    /**
     * Confirm and execute sale
     */
    confirmSale() {
        if (this.selectedForSale.size === 0) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('No items selected!', 1500, 'warning');
            }
            return;
        }

        let totalGold = 0;
        let itemsSold = 0;

        // Sort indices in descending order to avoid index shifting
        const sortedIndices = Array.from(this.selectedForSale).sort((a, b) => b - a);

        sortedIndices.forEach(slotIndex => {
            const item = GameState.inventory.items[slotIndex];
            if (item) {
                totalGold += (item.value || 0) * (item.quantity || 1);
                itemsSold++;
                GameState.removeItem(slotIndex);
            }
        });

        // Add gold
        GameState.inventory.gold += totalGold;
        GameState.emit('inventoryUpdate', GameState.inventory);

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Sold ${itemsSold} items for ${totalGold} gold!`, 2000, 'success');
        }

        // Exit sell mode
        this.toggleSellMode();

        // Save if auto-save is enabled
        if (GameState.settings.autoSave) {
            GameState.saveGameData();
        }
    }
};

// Add CSS for drag and drop
const inventoryStyles = document.createElement('style');
inventoryStyles.textContent = `
    .inventory-slot.dragging {
        opacity: 0.5;
    }

    .inventory-slot.drag-over {
        border-color: #3498db !important;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
    }

    .inventory-grid.sell-mode .inventory-slot.occupied {
        cursor: pointer;
    }

    .inventory-grid.sell-mode .inventory-slot.selected-for-sale {
        border-color: #e74c3c !important;
        background-color: rgba(231, 76, 60, 0.2);
    }

    .drag-item .item-icon {
        font-size: 2rem;
    }

    .drag-item .item-quantity {
        position: absolute;
        bottom: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 0.8rem;
    }

    .confirm-sell-btn {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #27ae60;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 1rem;
    }

    .confirm-sell-btn:hover {
        background: #2ecc71;
    }
`;
document.head.appendChild(inventoryStyles);

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        InventorySystem.init();
    }, 200);
});

// Export for ES6 modules
export default InventorySystem;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.InventorySystem = InventorySystem;
}
