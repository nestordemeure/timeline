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

    // Get current scroll factor from the timeline instance
    getCurrentScrollFactor() {
        try {
            if (window.timelineInstance && window.timelineInstance.computeScrollingFactor) {
                return window.timelineInstance.computeScrollingFactor() || 1;
            }
            return 1;
        } catch (error) {
            console.warn('computeScrollingFactor failed:', error);
            return 1; // fallback to normal speed
        }
    }
    
    // Get the timeline container for scrolling
    getScrollContainer() {
        return document.querySelector('.timeline-container') || window;
    }

    // Handle mouse wheel scrolling
    initWheelScrolling() {
        const timelineContainer = this.getScrollContainer();
        
        window.addEventListener('wheel', (e) => {
            // Only handle if the target is within the timeline container
            if (!timelineContainer.contains(e.target)) return;
            
            e.preventDefault();

            // Get current scroll factor
            const scrollFactor = this.getCurrentScrollFactor();

            // Scale the scroll delta - use deltaX if it exists, otherwise deltaY
            const scrollDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            const scaledDeltaX = scrollDelta * scrollFactor;

            // Apply the scaled scroll
            const currentScrollLeft = timelineContainer.scrollLeft;
            const maxScrollLeft = timelineContainer.scrollWidth - timelineContainer.clientWidth;
            const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft + scaledDeltaX));
            
            timelineContainer.scrollLeft = newScrollLeft;
        }, { passive: false, capture: true });
    }

    // Handle touch scrolling (mobile)
    initTouchScrolling() {
        const timelineContainer = this.getScrollContainer();
        
        timelineContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            }
        }, { passive: true });

        timelineContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();

                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                
                // Use vertical swipe for horizontal scrolling on timeline
                const deltaX = this.startY - currentY; // Swap Y movement for X scroll

                // Apply normal scroll without scaling for touch devices
                if (timelineContainer.scrollLeft !== undefined) {
                    const newScrollLeft = Math.max(0, Math.min(
                        timelineContainer.scrollWidth - timelineContainer.clientWidth,
                        timelineContainer.scrollLeft + deltaX
                    ));
                    timelineContainer.scrollLeft = newScrollLeft;
                }

                this.startX = currentX;
                this.startY = currentY;
            }
        }, { passive: false });
    }

    // Handle keyboard scrolling (arrow keys, page up/down, etc.)
    initKeyboardScrolling() {
        window.addEventListener('keydown', (e) => {
            const timelineContainer = this.getScrollContainer();
            
            // Define scroll amounts for different keys (all converted to horizontal)
            const scrollAmounts = {
                'ArrowUp': -200,     // Up arrow scrolls left
                'ArrowDown': 200,    // Down arrow scrolls right  
                'ArrowLeft': -200,   // Left arrow scrolls left
                'ArrowRight': 200,   // Right arrow scrolls right
                'PageUp': -timelineContainer.clientWidth * 0.8,    // Page up scrolls left
                'PageDown': timelineContainer.clientWidth * 0.8,   // Page down scrolls right
                'Home': -timelineContainer.scrollWidth,            // Home goes to start
                'End': timelineContainer.scrollWidth,              // End goes to end
                'Space': timelineContainer.clientWidth * 0.8       // Space scrolls right
            };

            const scrollAmount = scrollAmounts[e.code];
            if (scrollAmount !== undefined) {
                e.preventDefault();

                // Get current scroll factor
                const scrollFactor = this.getCurrentScrollFactor();
                const scaledAmount = scrollAmount * scrollFactor;

                // Apply horizontal scroll to timeline container
                if (timelineContainer.scrollLeft !== undefined) {
                    const newScrollLeft = Math.max(0, Math.min(
                        timelineContainer.scrollWidth - timelineContainer.clientWidth,
                        timelineContainer.scrollLeft + scaledAmount
                    ));
                    timelineContainer.scrollLeft = newScrollLeft;
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
    window.dynamicScroller = new DynamicScrollScaler();
});

// If DOM is already loaded, initialize immediately
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    window.dynamicScroller = new DynamicScrollScaler();
}