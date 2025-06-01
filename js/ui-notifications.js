// Dun Dun Dungeon - Notifications UI Management
// Handles notifications, indicators, and user feedback

/**
 * Notifications UI Manager for user feedback and indicators
 */
const UINotifications = {
    /**
     * Initialize notifications UI
     */
    init() {
        console.log('Initializing Notifications UI...');
        this.setupCSS();
        console.log('Notifications UI initialized');
    },

    /**
     * Set up CSS animations for notifications
     */
    setupCSS() {
        // Add CSS animations if they don't exist
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(-50%) translateY(-100%);
                        opacity: 0;
                    }
                }

                @keyframes saveIndicatorFade {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    20% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    80% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Show a temporary notification
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     * @param {string} type - Type of notification (success, error, warning, info)
     */
    showNotification(message, duration = 2000, type = 'info') {
        // Define notification colors based on type
        const colors = {
            success: { bg: 'rgba(76, 175, 80, 0.9)', color: '#ffffff' },
            error: { bg: 'rgba(244, 67, 54, 0.9)', color: '#ffffff' },
            warning: { bg: 'rgba(255, 152, 0, 0.9)', color: '#1a1a1a' },
            info: { bg: 'rgba(212, 175, 55, 0.9)', color: '#1a1a1a' }
        };

        const typeColors = colors[type] || colors.info;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${typeColors.bg};
            color: ${typeColors.color};
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        // Remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    /**
     * Show a subtle save indicator for auto-saves
     */
    showSaveIndicator() {
        // Create save indicator element
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.innerHTML = '<span class="save-icon">💾</span> Saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #d4af37;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: bold;
            z-index: 8999;
            animation: saveIndicatorFade 2s ease;
            pointer-events: none;
        `;

        document.body.appendChild(indicator);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 2000);
    },

    /**
     * Show storage warning when space is low
     * @param {Object} storageInfo - Storage information
     */
    showStorageWarning(storageInfo) {
        const warningMessage = `Storage space low: ${Math.round(storageInfo.gameSize / 1024)}KB used. Some features may not save properly.`;
        this.showNotification(warningMessage, 5000, 'warning');
    },

    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Callback for confirm action
     * @param {Function} onCancel - Optional callback for cancel action
     * @param {Object} options - Optional styling and button text options
     */
    showConfirmation(title, message, onConfirm, onCancel = null, options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmStyle = 'primary',
            dangerConfirm = false
        } = options;

        // Create confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'confirmation-dialog';
        confirmDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid ${dangerConfirm ? '#d32f2f' : '#d4af37'};
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            color: #e0e0e0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            max-width: 400px;
            min-width: 300px;
        `;

        const confirmButtonStyle = dangerConfirm ?
            'background: #d32f2f; border-color: #d32f2f; color: #ffffff;' :
            'background: #d4af37; border-color: #d4af37; color: #1a1a1a;';

        dialogContent.innerHTML = `
            <h2 style="margin: 0 0 1rem 0; color: ${dangerConfirm ? '#d32f2f' : '#d4af37'};">${title}</h2>
            <p style="margin: 0 0 2rem 0; line-height: 1.4;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="confirm-btn" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    ${confirmButtonStyle}
                ">${confirmText}</button>
                <button class="cancel-btn" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid #666;
                    border-radius: 6px;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">${cancelText}</button>
            </div>
        `;

        confirmDialog.appendChild(dialogContent);
        document.body.appendChild(confirmDialog);

        // Add event listeners
        const confirmBtn = confirmDialog.querySelector('.confirm-btn');
        const cancelBtn = confirmDialog.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(confirmDialog);
        });

        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            document.body.removeChild(confirmDialog);
        });

        // Close on outside click
        confirmDialog.addEventListener('click', (e) => {
            if (e.target === confirmDialog) {
                if (onCancel) onCancel();
                document.body.removeChild(confirmDialog);
            }
        });

        return confirmDialog;
    },

    /**
     * Show a simple alert dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onOk - Optional callback for OK action
     */
    showAlert(title, message, onOk = null) {
        this.showConfirmation(
            title,
            message,
            onOk || (() => {}),
            null,
            { confirmText: 'OK', cancelText: '' }
        );
    },

    /**
     * Show a loading overlay
     * @param {string} message - Loading message
     * @returns {Object} Loading overlay element (for manual removal)
     */
    showLoading(message = 'Loading...') {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const loadingContent = document.createElement('div');
        loadingContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #d4af37;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            color: #e0e0e0;
        `;

        loadingContent.innerHTML = `
            <div style="margin-bottom: 1rem; font-size: 2rem;">⏳</div>
            <div>${message}</div>
        `;

        loadingOverlay.appendChild(loadingContent);
        document.body.appendChild(loadingOverlay);

        return {
            element: loadingOverlay,
            remove: () => {
                if (document.body.contains(loadingOverlay)) {
                    document.body.removeChild(loadingOverlay);
                }
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UINotifications;
} else if (typeof window !== 'undefined') {
    window.UINotifications = UINotifications;
}
