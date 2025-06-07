// Splash Screen Controller
const SplashScreen = {
    isShown: false,
    splashElement: null,
    startButton: null,
    loadingText: null,
    instructions: null,

    /**
     * Initialize the splash screen
     */
    init() {
        this.splashElement = document.getElementById('splash-screen');
        this.startButton = document.getElementById('splash-start-btn');
        this.loadingText = document.querySelector('.splash-loading-text');
        this.instructions = document.querySelector('.splash-instructions');

        if (!this.splashElement) {
            console.warn('Splash screen element not found');
            return;
        }

        this.setupEventListeners();
        this.show();

        console.log('Splash screen initialized');
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle start button click
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Handle click anywhere on splash screen after loading
        this.splashElement.addEventListener('click', (e) => {
            if (this.startButton && this.startButton.style.display !== 'none') {
                this.startGame();
            }
        });

        // Handle keyboard input (Enter or Space to start)
        document.addEventListener('keydown', (e) => {
            if (this.isShown && (e.code === 'Enter' || e.code === 'Space')) {
                if (this.startButton && this.startButton.style.display !== 'none') {
                    this.startGame();
                }
            }
        });
    },

    /**
     * Show the splash screen
     */
    show() {
        if (!this.splashElement) return;

        this.splashElement.style.display = 'flex';
        this.splashElement.classList.remove('fade-out');
        this.isShown = true;

        // Simulate loading time
        this.simulateLoading();
    },

    /**
     * Hide the splash screen
     */
    hide() {
        if (!this.splashElement) return;

        this.splashElement.classList.add('fade-out');
        this.isShown = false;

        // Remove from DOM after animation
        setTimeout(() => {
            this.splashElement.style.display = 'none';
        }, 500);
    },

    /**
     * Simulate loading process
     */
    simulateLoading() {
        const loadingSteps = [
            'Loading game assets...',
            'Initializing systems...',
            'Preparing adventure...',
            'Ready to play!'
        ];

        let currentStep = 0;
        const stepInterval = 800; // 800ms per step

        const updateLoadingText = () => {
            if (this.loadingText && currentStep < loadingSteps.length) {
                this.loadingText.textContent = loadingSteps[currentStep];
                currentStep++;

                if (currentStep < loadingSteps.length) {
                    setTimeout(updateLoadingText, stepInterval);
                } else {
                    // Loading complete, show start button
                    this.onLoadingComplete();
                }
            }
        };

        // Start the loading simulation
        setTimeout(updateLoadingText, stepInterval);
    },

    /**
     * Called when loading is complete
     */
    onLoadingComplete() {
        // Hide loading spinner
        const spinner = document.querySelector('.splash-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }

        // Update loading text
        if (this.loadingText) {
            this.loadingText.textContent = 'Ready to play!';
        }

        // Show start button
        if (this.startButton) {
            this.startButton.style.display = 'block';
        }

        // Show instructions
        if (this.instructions) {
            this.instructions.style.opacity = '1';
        }
    },

    /**
     * Start the game
     */
    startGame() {
        if (!this.isShown) return;

        // Hide splash screen
        this.hide();

        // Initialize the game after a short delay
        setTimeout(() => {
            this.initializeGame();
        }, 500);
    },

    /**
     * Initialize the game systems
     */
    initializeGame() {
        // Initialize the main game
        if (typeof Game !== 'undefined' && Game.init) {
            Game.init();
        } else {
            console.error('Game module not available');
        }
    },

    /**
     * Check if splash screen is currently shown
     */
    isVisible() {
        return this.isShown;
    }
};

// Export for ES6 modules
export default SplashScreen;

// Also make available globally for compatibility
if (typeof window !== 'undefined') {
    window.SplashScreen = SplashScreen;
}
