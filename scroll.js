// Dynamic scroll speed scaling using computeScrollingFactor function
class DynamicScrollScaler {
    constructor() {
        this.isScrolling = false;
        this.startY = 0;
        this.lastScrollFactor = 1;

        // Initialize event listeners
        this.initWheelScrolling();
        this.initTouchScrolling();
        this.initKeyboardScrolling();
    }

    // Get current scroll factor from your function
    getCurrentScrollFactor() {
        try {
            // Call your function - adjust parameters as needed
            return computeScrollingFactor() || 1;
        } catch (error) {
            console.warn('computeScrollingFactor failed:', error);
            return 1; // fallback to normal speed
        }
    }

    // Handle mouse wheel scrolling
    initWheelScrolling() {
        window.addEventListener('wheel', (e) => {
            if (this.isScrolling) return;

            e.preventDefault();
            this.isScrolling = true;

            // Get current scroll factor
            const scrollFactor = this.getCurrentScrollFactor();

            // Scale the scroll delta
            const scaledDeltaY = e.deltaY * scrollFactor;
            const scaledDeltaX = e.deltaX * scrollFactor;

            // Apply the scaled scroll
            window.scrollBy(scaledDeltaX, scaledDeltaY);

            // Reset flag on next frame
            requestAnimationFrame(() => {
                this.isScrolling = false;
            });
        }, { passive: false });
    }

    // Handle touch scrolling (mobile)
    initTouchScrolling() {
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.startY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();

                const currentY = e.touches[0].clientY;
                const deltaY = this.startY - currentY;

                // Get current scroll factor
                const scrollFactor = this.getCurrentScrollFactor();

                // Apply scaled scroll
                const scaledDelta = deltaY * scrollFactor;
                window.scrollBy(0, scaledDelta);

                this.startY = currentY;
            }
        }, { passive: false });
    }

    // Handle keyboard scrolling (arrow keys, page up/down, etc.)
    initKeyboardScrolling() {
        window.addEventListener('keydown', (e) => {
            // Define scroll amounts for different keys
            const scrollAmounts = {
                'ArrowUp': -40,
                'ArrowDown': 40,
                'ArrowLeft': -40,
                'ArrowRight': 40,
                'PageUp': -window.innerHeight * 0.9,
                'PageDown': window.innerHeight * 0.9,
                'Home': -document.body.scrollHeight,
                'End': document.body.scrollHeight,
                'Space': window.innerHeight * 0.9
            };

            const scrollAmount = scrollAmounts[e.code];
            if (scrollAmount !== undefined) {
                e.preventDefault();

                // Get current scroll factor
                const scrollFactor = this.getCurrentScrollFactor();

                // Determine scroll direction
                const isVertical = !['ArrowLeft', 'ArrowRight'].includes(e.code);
                const scaledAmount = scrollAmount * scrollFactor;

                if (isVertical) {
                    window.scrollBy(0, scaledAmount);
                } else {
                    window.scrollBy(scaledAmount, 0);
                }
            }
        });
    }

    // Optional: Method to temporarily disable/enable scaling
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.lastScrollFactor = 1;
        }
    }

    // Optional: Method to get debug info
    getDebugInfo() {
        return {
            currentScrollFactor: this.getCurrentScrollFactor(),
            isScrolling: this.isScrolling,
            enabled: this.enabled !== false
        };
    }
}

// Initialize the scroller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.dynamicScroller = new DynamicScrollScaler();

    console.log('Dynamic scroll scaling initialized');

    // Optional: Log scroll factor changes for debugging
    let lastFactor = 1;
    setInterval(() => {
        try {
            const currentFactor = computeScrollingFactor();
            if (currentFactor !== lastFactor) {
                console.log('Scroll factor changed:', lastFactor, '->', currentFactor);
                lastFactor = currentFactor;
            }
        } catch (error) {
            // Silently handle errors
        }
    }, 100); // Check every 100ms
});

// If DOM is already loaded, initialize immediately
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    window.dynamicScroller = new DynamicScrollScaler();
    console.log('Dynamic scroll scaling initialized');
}