class CustomScrollbar {
    constructor(timeline) {
        this.timeline = timeline;
        this.container = timeline.timelineContainer;
        this.scrollbarContainer = null;
        this.scrollbarTrack = null;
        this.scrollbarThumb = null;
        
        this.isDragging = false;
        this.dragOffset = 0;
        
        this.init();
    }

    init() {
        this.createScrollbarElements();
        this.renderEventIndicators();
        this.setupEventListeners();
        this.updateThumbPosition();
    }

    createScrollbarElements() {
        // Remove existing scrollbar overlay
        const existingOverlay = document.getElementById('scrollbar-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create custom scrollbar container
        this.scrollbarContainer = document.createElement('div');
        this.scrollbarContainer.className = 'custom-scrollbar';
        this.scrollbarContainer.innerHTML = `
            <div class="scrollbar-track">
                <div class="scrollbar-thumb"></div>
            </div>
        `;

        document.body.appendChild(this.scrollbarContainer);

        this.scrollbarTrack = this.scrollbarContainer.querySelector('.scrollbar-track');
        this.scrollbarThumb = this.scrollbarContainer.querySelector('.scrollbar-thumb');
    }

    // Simple linear mapping functions (identity function)
    timelineToScrollbar(timelinePosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;
        
        if (maxScrollLeft === 0) return 0;
        
        const trackWidth = this.scrollbarTrack.clientWidth;
        const thumbWidth = this.scrollbarThumb.offsetWidth;
        const maxThumbPosition = trackWidth - thumbWidth;
        
        const ratio = timelinePosition / maxScrollLeft;
        return ratio * maxThumbPosition;
    }

    scrollbarToTimeline(scrollbarPosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;
        
        const trackWidth = this.scrollbarTrack.clientWidth;
        const thumbWidth = this.scrollbarThumb.offsetWidth;
        const maxThumbPosition = trackWidth - thumbWidth;
        
        if (maxThumbPosition === 0) return 0;
        
        const ratio = scrollbarPosition / maxThumbPosition;
        return ratio * maxScrollLeft;
    }

    renderEventIndicators() {
        // Remove existing indicators
        const existingIndicators = this.scrollbarTrack.querySelectorAll('.scrollbar-event-indicator');
        existingIndicators.forEach(indicator => indicator.remove());

        if (!this.timeline.events || this.timeline.events.length === 0) {
            return;
        }

        // Get the actual date range of events
        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        const trackWidth = this.scrollbarTrack.clientWidth;

        // Add individual event indicators as thin lines
        this.timeline.events.forEach(event => {
            const eventDate = this.timeline.parseDate(event.date);
            
            // Map event date to scrollbar position based on date range
            const dateRatio = (eventDate - firstEventDate) / dateRange;
            const scrollbarPosition = dateRatio * trackWidth;
            
            const indicator = document.createElement('div');
            indicator.className = 'scrollbar-event-indicator';
            indicator.style.left = `${scrollbarPosition}px`;
            
            this.scrollbarTrack.appendChild(indicator);
        });
    }

    setupEventListeners() {
        // Mouse events for dragging
        this.scrollbarThumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const thumbRect = this.scrollbarThumb.getBoundingClientRect();
            this.dragOffset = e.clientX - thumbRect.left;
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const trackRect = this.scrollbarTrack.getBoundingClientRect();
                const thumbWidth = this.scrollbarThumb.offsetWidth;
                const maxThumbPosition = trackRect.width - thumbWidth;
                
                const scrollbarPosition = Math.max(0, Math.min(
                    maxThumbPosition,
                    e.clientX - trackRect.left - this.dragOffset
                ));
                
                // Update thumb position immediately during drag
                this.scrollbarThumb.style.left = `${scrollbarPosition}px`;
                this.updateScrollFromScrollbar(scrollbarPosition);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.cursor = '';
            }
        });

        // Click on track to jump
        this.scrollbarTrack.addEventListener('click', (e) => {
            if (e.target === this.scrollbarThumb) return;
            
            const trackRect = this.scrollbarTrack.getBoundingClientRect();
            const thumbWidth = this.scrollbarThumb.offsetWidth;
            const maxThumbPosition = trackRect.width - thumbWidth;
            
            const clickPosition = e.clientX - trackRect.left - thumbWidth / 2;
            const scrollbarPosition = Math.max(0, Math.min(maxThumbPosition, clickPosition));
            
            this.updateScrollFromScrollbar(scrollbarPosition);
        });

        // Listen to timeline scroll changes
        this.container.addEventListener('scroll', () => {
            if (!this.isDragging) {
                this.updateThumbPosition();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.renderEventIndicators();
            this.updateThumbPosition();
        });
    }

    updateScrollFromScrollbar(scrollbarPosition) {
        const timelinePosition = this.scrollbarToTimeline(scrollbarPosition);
        this.container.scrollLeft = timelinePosition;
    }

    updateThumbPosition() {
        const currentScroll = this.container.scrollLeft;
        const scrollbarPosition = this.timelineToScrollbar(currentScroll);
        
        // Calculate thumb width based on viewport ratio
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const viewportRatio = containerWidth / scrollableWidth;
        const trackWidth = this.scrollbarTrack.clientWidth;
        
        const minThumbWidth = 20;
        const maxThumbWidth = trackWidth * 0.8;
        const thumbWidth = Math.max(minThumbWidth, Math.min(maxThumbWidth, trackWidth * viewportRatio));
        
        this.scrollbarThumb.style.width = `${thumbWidth}px`;
        this.scrollbarThumb.style.left = `${scrollbarPosition}px`;
    }

    destroy() {
        if (this.scrollbarContainer) {
            this.scrollbarContainer.remove();
        }
    }
}