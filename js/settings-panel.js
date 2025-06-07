// Settings Panel Controller
const SettingsPanel = {
    isOpen: false,
    settingsElement: null,
    settings: {},
    defaultSettings: {
        masterVolume: 50,
        sfxVolume: 70,
        musicVolume: 30,
        autoSave: true,
        damageNumbers: true,
        tutorialHints: true,
        movementSpeed: 'normal',
        screenShake: true,
        animations: true,
        theme: 'dark',
        touchControls: true,
        hapticFeedback: true
    },

    /**
     * Initialize the settings panel
     */
    init() {
        this.settingsElement = document.getElementById('settings-screen');

        if (!this.settingsElement) {
            console.warn('Settings screen element not found');
            return;
        }

        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();

        console.log('Settings panel initialized');
    },

    /**
     * Load settings from storage
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('dun-dun-dungeon-settings');
        if (savedSettings) {
            try {
                this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.warn('Failed to load settings, using defaults:', error);
                this.settings = { ...this.defaultSettings };
            }
        } else {
            this.settings = { ...this.defaultSettings };
        }
    },

    /**
     * Save settings to storage
     */
    saveSettings() {
        try {
            localStorage.setItem('dun-dun-dungeon-settings', JSON.stringify(this.settings));
            console.log('Settings saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Settings button in menu
        const settingsBtn = document.getElementById('settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.show();
            });
        }

        // Close button
        const closeBtn = document.getElementById('settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Save button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettingsAndClose();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefaults();
            });
        }

        // Volume controls
        this.setupVolumeControls();

        // Toggle switches
        this.setupToggleSwitches();

        // Select dropdowns
        this.setupSelectControls();

        // Close on background click
        this.settingsElement.addEventListener('click', (e) => {
            if (e.target === this.settingsElement) {
                this.hide();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    },

    /**
     * Set up volume control listeners
     */
    setupVolumeControls() {
        const volumeControls = [
            { id: 'master-volume', setting: 'masterVolume' },
            { id: 'sfx-volume', setting: 'sfxVolume' },
            { id: 'music-volume', setting: 'musicVolume' }
        ];

        volumeControls.forEach(({ id, setting }) => {
            const slider = document.getElementById(id);
            const valueDisplay = slider?.parentElement?.querySelector('.volume-value');

            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.settings[setting] = value;
                    if (valueDisplay) {
                        valueDisplay.textContent = `${value}%`;
                    }
                    this.applyVolumeSetting(setting, value);
                });
            }
        });
    },

    /**
     * Set up toggle switch listeners
     */
    setupToggleSwitches() {
        const toggles = [
            { id: 'auto-save', setting: 'autoSave' },
            { id: 'damage-numbers', setting: 'damageNumbers' },
            { id: 'tutorial-hints', setting: 'tutorialHints' },
            { id: 'screen-shake', setting: 'screenShake' },
            { id: 'animations', setting: 'animations' },
            { id: 'touch-controls', setting: 'touchControls' },
            { id: 'haptic-feedback', setting: 'hapticFeedback' }
        ];

        toggles.forEach(({ id, setting }) => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.checked;
                    this.applyToggleSetting(setting, e.target.checked);
                });
            }
        });
    },

    /**
     * Set up select control listeners
     */
    setupSelectControls() {
        const selects = [
            { id: 'movement-speed', setting: 'movementSpeed' },
            { id: 'theme', setting: 'theme' }
        ];

        selects.forEach(({ id, setting }) => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.value;
                    this.applySelectSetting(setting, e.target.value);
                });
            }
        });
    },

    /**
     * Apply volume setting
     */
    applyVolumeSetting(setting, value) {
        // In a real game, this would affect audio volume
        console.log(`Applied ${setting}: ${value}%`);

        // Example: Apply to game audio systems
        if (typeof Game !== 'undefined' && Game.audio) {
            switch (setting) {
                case 'masterVolume':
                    Game.audio.setMasterVolume(value / 100);
                    break;
                case 'sfxVolume':
                    Game.audio.setSFXVolume(value / 100);
                    break;
                case 'musicVolume':
                    Game.audio.setMusicVolume(value / 100);
                    break;
            }
        }
    },

    /**
     * Apply toggle setting
     */
    applyToggleSetting(setting, value) {
        console.log(`Applied ${setting}: ${value}`);

        // Apply settings to game systems
        switch (setting) {
            case 'animations':
                if (typeof Animation !== 'undefined') {
                    Animation.setEnabled(value);
                }
                break;
            case 'screenShake':
                if (typeof Game !== 'undefined' && Game.effects) {
                    Game.effects.setScreenShakeEnabled(value);
                }
                break;
            case 'autoSave':
                if (typeof SaveSystem !== 'undefined') {
                    SaveSystem.setAutoSaveEnabled(value);
                }
                break;
            // Add more cases as needed
        }
    },

    /**
     * Apply select setting
     */
    applySelectSetting(setting, value) {
        console.log(`Applied ${setting}: ${value}`);

        switch (setting) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'movementSpeed':
                if (typeof Movement !== 'undefined') {
                    Movement.setSpeed(value);
                }
                break;
        }
    },

    /**
     * Apply theme setting
     */
    applyTheme(theme) {
        const body = document.body;

        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light');

        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    },

    /**
     * Update UI elements with current settings
     */
    updateUI() {
        // Update volume sliders
        const volumeControls = [
            { id: 'master-volume', setting: 'masterVolume' },
            { id: 'sfx-volume', setting: 'sfxVolume' },
            { id: 'music-volume', setting: 'musicVolume' }
        ];

        volumeControls.forEach(({ id, setting }) => {
            const slider = document.getElementById(id);
            const valueDisplay = slider?.parentElement?.querySelector('.volume-value');

            if (slider) {
                slider.value = this.settings[setting];
                if (valueDisplay) {
                    valueDisplay.textContent = `${this.settings[setting]}%`;
                }
            }
        });

        // Update toggles
        const toggles = [
            { id: 'auto-save', setting: 'autoSave' },
            { id: 'damage-numbers', setting: 'damageNumbers' },
            { id: 'tutorial-hints', setting: 'tutorialHints' },
            { id: 'screen-shake', setting: 'screenShake' },
            { id: 'animations', setting: 'animations' },
            { id: 'touch-controls', setting: 'touchControls' },
            { id: 'haptic-feedback', setting: 'hapticFeedback' }
        ];

        toggles.forEach(({ id, setting }) => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.checked = this.settings[setting];
            }
        });

        // Update selects
        const selects = [
            { id: 'movement-speed', setting: 'movementSpeed' },
            { id: 'theme', setting: 'theme' }
        ];

        selects.forEach(({ id, setting }) => {
            const select = document.getElementById(id);
            if (select) {
                select.value = this.settings[setting];
            }
        });
    },

    /**
     * Show the settings panel
     */
    show() {
        if (!this.settingsElement) return;

        this.settingsElement.style.display = 'flex';
        this.isOpen = true;

        // Update UI with current settings
        this.updateUI();
    },

    /**
     * Hide the settings panel
     */
    hide() {
        if (!this.settingsElement) return;

        this.settingsElement.style.display = 'none';
        this.isOpen = false;
    },

    /**
     * Save settings and close panel
     */
    saveSettingsAndClose() {
        if (this.saveSettings()) {
            // Show success notification
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Settings saved!', 1500);
            }
            this.hide();
        } else {
            // Show error notification
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Failed to save settings!', 2000);
            }
        }
    },

    /**
     * Reset settings to defaults
     */
    resetToDefaults() {
        const confirmed = confirm('Reset all settings to default values?');
        if (confirmed) {
            this.settings = { ...this.defaultSettings };
            this.updateUI();
            this.applyAllSettings();

            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Settings reset to defaults!', 1500);
            }
        }
    },

    /**
     * Apply all settings to the game
     */
    applyAllSettings() {
        // Apply volume settings
        Object.entries(this.settings).forEach(([key, value]) => {
            if (key.includes('Volume')) {
                this.applyVolumeSetting(key, value);
            } else if (typeof value === 'boolean') {
                this.applyToggleSetting(key, value);
            } else if (typeof value === 'string') {
                this.applySelectSetting(key, value);
            }
        });
    },

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    },

    /**
     * Get specific setting value
     */
    getSetting(key) {
        return this.settings[key];
    },

    /**
     * Set specific setting value
     */
    setSetting(key, value) {
        this.settings[key] = value;
        this.updateUI();
    }
};

// Export for ES6 modules
export default SettingsPanel;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.SettingsPanel = SettingsPanel;
}
