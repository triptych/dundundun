// Store System - Merchant shop functionality
import GameState from './game-state.js';
import Items from './items.js';

const Store = {
    // Store state
    isOpen: false,
    storeInventory: [],
    buybackItems: [], // Items player has sold

    // Store configuration
    config: {
        markup: 1.5,        // Buy price multiplier (items cost 150% of base value)
        sellback: 0.7,      // Sell price multiplier (get 70% of item value)
        maxItems: 12,       // Maximum items in store at once
        refreshCost: 50     // Cost to refresh store inventory
    },

    /**
     * Initialize store system
     */
    init() {
        console.log('Initializing Store system...');
        this.generateStoreInventory();
    },

    /**
     * Open the store interface
     */
    openStore() {
        if (this.isOpen) return;

        console.log('Opening store...');
        this.isOpen = true;

        // Generate fresh inventory if empty
        if (this.storeInventory.length === 0) {
            this.generateStoreInventory();
        }

        // Switch to store screen if UI system supports it
        if (typeof GameState !== 'undefined') {
            GameState.switchScreen('store');
        }

        // Create store UI
        this.createStoreUI();
    },

    /**
     * Close the store interface
     */
    closeStore() {
        if (!this.isOpen) return;

        console.log('Closing store...');
        this.isOpen = false;

        // Remove store UI
        this.removeStoreUI();

        // Return to game screen
        if (typeof GameState !== 'undefined') {
            GameState.switchScreen('game');
        }
    },

    /**
     * Generate store inventory based on current floor
     */
    generateStoreInventory() {
        const floor = GameState?.dungeon?.currentFloor || 1;
        this.storeInventory = [];

        console.log(`Generating store inventory for floor ${floor}`);

        // Generate items based on floor level
        const itemTypes = ['consumable', 'weapon', 'armor', 'accessory'];
        const rarityWeights = this.getRarityWeights(floor);

        for (let i = 0; i < this.config.maxItems; i++) {
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const rarity = this.selectRarity(rarityWeights);
            const item = this.generateStoreItem(itemType, rarity, floor);

            if (item) {
                this.storeInventory.push(item);
            }
        }

        console.log(`Generated ${this.storeInventory.length} items for store`);
    },

    /**
     * Get rarity weights based on floor level
     * @param {number} floor - Current floor
     * @returns {Object} Rarity weights
     */
    getRarityWeights(floor) {
        const baseWeights = {
            common: 50,
            uncommon: 30,
            rare: 15,
            epic: 4,
            legendary: 1
        };

        // Adjust weights based on floor
        if (floor >= 20) {
            baseWeights.legendary += 2;
            baseWeights.epic += 6;
        } else if (floor >= 10) {
            baseWeights.epic += 3;
            baseWeights.rare += 5;
        } else if (floor >= 5) {
            baseWeights.rare += 5;
            baseWeights.uncommon += 10;
        }

        return baseWeights;
    },

    /**
     * Select rarity based on weights
     * @param {Object} weights - Rarity weights
     * @returns {string} Selected rarity
     */
    selectRarity(weights) {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const [rarity, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return rarity;
            }
        }

        return 'common';
    },

    /**
     * Generate a store item
     * @param {string} type - Item type
     * @param {string} rarity - Item rarity
     * @param {number} floor - Current floor
     * @returns {Object|null} Generated item
     */
    generateStoreItem(type, rarity, floor) {
        // Get items of matching type and rarity
        const availableItems = Object.values(Items.database).filter(item =>
            item.type === type && item.rarity === rarity
        );

        // Also check equipment database
        const equipmentItems = Object.values(Items.equipmentDatabase || {}).filter(item =>
            item.type === type && item.rarity === rarity
        );

        const allItems = [...availableItems, ...equipmentItems];

        if (allItems.length === 0) return null;

        // Select random item
        const baseItem = allItems[Math.floor(Math.random() * allItems.length)];

        // Create store item with pricing
        const storeItem = {
            ...baseItem,
            quantity: baseItem.stackable ? Math.floor(Math.random() * 3) + 1 : 1,
            buyPrice: Math.floor(baseItem.value * this.config.markup),
            sellPrice: Math.floor(baseItem.value * this.config.sellback)
        };

        return storeItem;
    },

    /**
     * Buy an item from the store
     * @param {number} itemIndex - Index of item in store inventory
     * @returns {boolean} True if purchase successful
     */
    buyItem(itemIndex) {
        if (itemIndex < 0 || itemIndex >= this.storeInventory.length) {
            console.warn('Invalid item index');
            return false;
        }

        const item = this.storeInventory[itemIndex];
        const playerGold = GameState.inventory.gold;

        // Check if player has enough gold
        if (playerGold < item.buyPrice) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Not enough gold!', 2000, 'error');
            }
            return false;
        }

        // Check if inventory has space
        if (GameState.inventory.items.length >= GameState.inventory.maxSlots) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Inventory full!', 2000, 'error');
            }
            return false;
        }

        // Create item for player inventory (without store-specific properties)
        const purchasedItem = Items.createItem(item.id, item.quantity);
        if (!purchasedItem) {
            console.warn('Failed to create purchased item');
            return false;
        }

        // Add item to player inventory
        if (GameState.addItem(purchasedItem)) {
            // Deduct gold
            GameState.updateInventory({ gold: playerGold - item.buyPrice });

            // Remove item from store (or reduce quantity)
            this.storeInventory.splice(itemIndex, 1);

            // Show success notification
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`Purchased ${item.name} for ${item.buyPrice} gold`, 2000, 'success');
            }

            // Refresh store UI
            this.refreshStoreUI();

            console.log(`Player bought ${item.name} for ${item.buyPrice} gold`);
            return true;
        }

        return false;
    },

    /**
     * Sell an item to the store
     * @param {number} itemIndex - Index of item in player inventory
     * @returns {boolean} True if sale successful
     */
    sellItem(itemIndex) {
        if (itemIndex < 0 || itemIndex >= GameState.inventory.items.length) {
            console.warn('Invalid item index');
            return false;
        }

        const item = GameState.inventory.items[itemIndex];
        const sellPrice = Math.floor(item.value * this.config.sellback);

        // Remove item from player inventory
        const removedItem = GameState.removeItem(itemIndex);
        if (!removedItem) {
            console.warn('Failed to remove item from inventory');
            return false;
        }

        // Add gold to player
        GameState.updateInventory({ gold: GameState.inventory.gold + sellPrice });

        // Add to buyback items (so player can buy it back)
        this.buybackItems.unshift({
            ...removedItem,
            buyPrice: Math.floor(sellPrice * this.config.markup),
            sellPrice: sellPrice
        });

        // Limit buyback items to prevent memory issues
        if (this.buybackItems.length > 10) {
            this.buybackItems.pop();
        }

        // Show success notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(`Sold ${item.name} for ${sellPrice} gold`, 2000, 'success');
        }

        // Refresh store UI
        this.refreshStoreUI();

        console.log(`Player sold ${item.name} for ${sellPrice} gold`);
        return true;
    },

    /**
     * Refresh store inventory for a cost
     * @returns {boolean} True if refresh successful
     */
    refreshInventory() {
        const playerGold = GameState.inventory.gold;

        if (playerGold < this.config.refreshCost) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`Need ${this.config.refreshCost} gold to refresh!`, 2000, 'error');
            }
            return false;
        }

        // Deduct cost
        GameState.updateInventory({ gold: playerGold - this.config.refreshCost });

        // Generate new inventory
        this.generateStoreInventory();

        // Show notification
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification('Store inventory refreshed!', 2000, 'success');
        }

        // Refresh UI
        this.refreshStoreUI();

        return true;
    },

    /**
     * Create the store UI overlay
     */
    createStoreUI() {
        // Remove existing store UI
        this.removeStoreUI();

        const storeOverlay = document.createElement('div');
        storeOverlay.id = 'store-overlay';
        storeOverlay.className = 'store-overlay';

        storeOverlay.innerHTML = `
            <div class="store-container">
                <div class="store-header">
                    <h2>🏪 Merchant Store</h2>
                    <div class="store-header-info">
                        <div class="player-gold">Gold: ${GameState.inventory.gold}</div>
                        <button class="store-close-btn" onclick="Store.closeStore()">✕</button>
                    </div>
                </div>

                <div class="store-tabs">
                    <button class="store-tab active" data-tab="buy">Buy</button>
                    <button class="store-tab" data-tab="sell">Sell</button>
                    <button class="store-tab" data-tab="buyback">Buyback</button>
                </div>

                <div class="store-content">
                    <div class="store-tab-content active" id="buy-tab">
                        <div class="store-actions">
                            <button class="refresh-btn" onclick="Store.refreshInventory()">
                                🔄 Refresh (${this.config.refreshCost}g)
                            </button>
                        </div>
                        <div class="store-items" id="store-items">
                            ${this.renderStoreItems()}
                        </div>
                    </div>

                    <div class="store-tab-content" id="sell-tab">
                        <div class="store-info">
                            <p>Sell your items for ${Math.floor(this.config.sellback * 100)}% of their value</p>
                        </div>
                        <div class="store-items" id="player-items">
                            ${this.renderPlayerItems()}
                        </div>
                    </div>

                    <div class="store-tab-content" id="buyback-tab">
                        <div class="store-info">
                            <p>Buy back recently sold items</p>
                        </div>
                        <div class="store-items" id="buyback-items">
                            ${this.renderBuybackItems()}
                        </div>
                    </div>
                </div>

                <div class="store-footer">
                    <div class="player-gold">Gold: ${GameState.inventory.gold}</div>
                </div>
            </div>
        `;

        document.body.appendChild(storeOverlay);

        // Add event listeners for tabs
        this.setupTabListeners();
    },

    /**
     * Remove store UI
     */
    removeStoreUI() {
        const existing = document.getElementById('store-overlay');
        if (existing) {
            existing.remove();
        }
    },

    /**
     * Setup tab listeners
     */
    setupTabListeners() {
        const tabs = document.querySelectorAll('.store-tab');
        const tabContents = document.querySelectorAll('.store-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    },

    /**
     * Render store items for buying
     * @returns {string} HTML string
     */
    renderStoreItems() {
        if (this.storeInventory.length === 0) {
            return '<div class="empty-message">No items available</div>';
        }

        return this.storeInventory.map((item, index) => `
            <div class="store-item" onclick="Store.buyItem(${index})">
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-info">
                    <div class="item-name" style="color: ${Items.getRarityColor(item.rarity)}">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    ${item.quantity > 1 ? `<div class="item-quantity">Qty: ${item.quantity}</div>` : ''}
                </div>
                <div class="item-price">${item.buyPrice}g</div>
            </div>
        `).join('');
    },

    /**
     * Render player items for selling
     * @returns {string} HTML string
     */
    renderPlayerItems() {
        if (GameState.inventory.items.length === 0) {
            return '<div class="empty-message">No items to sell</div>';
        }

        return GameState.inventory.items.map((item, index) => {
            const sellPrice = Math.floor(item.value * this.config.sellback);
            return `
                <div class="store-item" onclick="Store.sellItem(${index})">
                    <div class="item-icon">${item.icon || '📦'}</div>
                    <div class="item-info">
                        <div class="item-name" style="color: ${Items.getRarityColor(item.rarity)}">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                        ${item.quantity > 1 ? `<div class="item-quantity">Qty: ${item.quantity}</div>` : ''}
                    </div>
                    <div class="item-price">${sellPrice}g</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render buyback items
     * @returns {string} HTML string
     */
    renderBuybackItems() {
        if (this.buybackItems.length === 0) {
            return '<div class="empty-message">No items to buy back</div>';
        }

        return this.buybackItems.map((item, index) => `
            <div class="store-item" onclick="Store.buybackItem(${index})">
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-info">
                    <div class="item-name" style="color: ${Items.getRarityColor(item.rarity)}">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    ${item.quantity > 1 ? `<div class="item-quantity">Qty: ${item.quantity}</div>` : ''}
                </div>
                <div class="item-price">${item.buyPrice}g</div>
            </div>
        `).join('');
    },

    /**
     * Buy back an item
     * @param {number} itemIndex - Index in buyback items
     * @returns {boolean} True if successful
     */
    buybackItem(itemIndex) {
        if (itemIndex < 0 || itemIndex >= this.buybackItems.length) {
            console.warn('Invalid buyback item index');
            return false;
        }

        const item = this.buybackItems[itemIndex];
        const playerGold = GameState.inventory.gold;

        // Check if player has enough gold
        if (playerGold < item.buyPrice) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Not enough gold!', 2000, 'error');
            }
            return false;
        }

        // Check if inventory has space
        if (GameState.inventory.items.length >= GameState.inventory.maxSlots) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Inventory full!', 2000, 'error');
            }
            return false;
        }

        // Create item for player inventory
        const purchasedItem = Items.createItem(item.id, item.quantity);
        if (!purchasedItem) {
            console.warn('Failed to create buyback item');
            return false;
        }

        // Add item to player inventory
        if (GameState.addItem(purchasedItem)) {
            // Deduct gold
            GameState.updateInventory({ gold: playerGold - item.buyPrice });

            // Remove item from buyback
            this.buybackItems.splice(itemIndex, 1);

            // Show success notification
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification(`Bought back ${item.name} for ${item.buyPrice} gold`, 2000, 'success');
            }

            // Refresh store UI
            this.refreshStoreUI();

            console.log(`Player bought back ${item.name} for ${item.buyPrice} gold`);
            return true;
        }

        return false;
    },

    /**
     * Refresh the store UI
     */
    refreshStoreUI() {
        if (!this.isOpen) return;

        // Update store items
        const storeItemsContainer = document.getElementById('store-items');
        if (storeItemsContainer) {
            storeItemsContainer.innerHTML = this.renderStoreItems();
        }

        // Update player items
        const playerItemsContainer = document.getElementById('player-items');
        if (playerItemsContainer) {
            playerItemsContainer.innerHTML = this.renderPlayerItems();
        }

        // Update buyback items
        const buybackItemsContainer = document.getElementById('buyback-items');
        if (buybackItemsContainer) {
            buybackItemsContainer.innerHTML = this.renderBuybackItems();
        }

        // Update player gold
        const goldDisplay = document.querySelector('.player-gold');
        if (goldDisplay) {
            goldDisplay.textContent = `Gold: ${GameState.inventory.gold}`;
        }
    }
};

// Make Store globally available
window.Store = Store;

// Export for ES6 modules
export default Store;
