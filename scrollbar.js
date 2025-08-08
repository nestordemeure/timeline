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

    // Map from timeline scroll position to scrollbar position using new conversion functions
    timelineToScrollbar(timelinePosition) {
        const trackWidth = this.scrollbarTrack.clientWidth;
        
        // Convert pixel position to date, then map date to scrollbar chronologically
        const date = this.timeline.pixelToDate(timelinePosition);
        const dateRange = this.timeline.maxDate - this.timeline.minDate;
        
        if (dateRange === 0) return 0;
        
        const chronologicalRatio = (date - this.timeline.minDate) / dateRange;
        return Math.max(0, Math.min(trackWidth, chronologicalRatio * trackWidth));
    }

    scrollbarToTimeline(scrollbarPosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;

        const trackWidth = this.scrollbarTrack.clientWidth;
        if (trackWidth === 0) return 0;

        // Convert scrollbar position to chronological ratio, then to date, then to pixel position
        const chronologicalRatio = scrollbarPosition / trackWidth;
        const dateRange = this.timeline.maxDate - this.timeline.minDate;
        const targetDate = this.timeline.minDate + (chronologicalRatio * dateRange);
        
        const timelinePosition = this.timeline.dateToPixel(targetDate);
        
        return Math.max(0, Math.min(maxScrollLeft, timelinePosition));
    }


    renderEventIndicators() {
        const existingIndicators = this.scrollbarTrack.querySelectorAll('.scrollbar-event-indicator');
        existingIndicators.forEach(indicator => indicator.remove());

        if (!this.timeline.events || this.timeline.events.length === 0) {
            return;
        }

        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        if (dateRange === 0) return;

        const trackWidth = this.scrollbarTrack.clientWidth;

        this.timeline.events.forEach(event => {
            const eventDate = this.timeline.parseDate(event.date);

            const dateRatio = (eventDate - firstEventDate) / dateRange;
            const scrollbarPosition = dateRatio * trackWidth;

            const indicator = document.createElement('div');
            indicator.className = 'scrollbar-event-indicator';
            indicator.style.left = `${scrollbarPosition}px`;

            this.scrollbarTrack.appendChild(indicator);
        });
    }

    setupEventListeners() {
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

                // We calculate position relative to the track, not the whole thumb travel area.
                const scrollbarPosition = Math.max(0, Math.min(
                    trackRect.width,
                    e.clientX - trackRect.left - this.dragOffset
                ));

                this.updateScrollFromScrollbar(scrollbarPosition);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.cursor = '';
            }
        });

        this.scrollbarTrack.addEventListener('click', (e) => {
            if (e.target === this.scrollbarThumb) return;

            const trackRect = this.scrollbarTrack.getBoundingClientRect();
            const thumbWidth = this.scrollbarThumb.offsetWidth;
            const trackWidth = trackRect.width;
            
            // Calculate click position relative to track
            const rawClickPosition = e.clientX - trackRect.left;
            
            // Center the thumb on the click position, but respect track boundaries
            const halfThumbWidth = thumbWidth / 2;
            const centeredPosition = Math.max(
                halfThumbWidth,
                Math.min(trackWidth - halfThumbWidth, rawClickPosition)
            );
            
            // The scrollbar position is offset by half thumb width to center it
            const scrollbarPosition = centeredPosition - halfThumbWidth;

            this.updateScrollFromScrollbar(scrollbarPosition);
        });

        this.container.addEventListener('scroll', () => {
            if (!this.isDragging) {
                this.updateThumbPosition();
            }
        });

        window.addEventListener('resize', () => {
            this.renderEventIndicators();
            this.updateThumbPosition();
        });
    }

    updateScrollFromScrollbar(scrollbarPosition) {
        // Since thumb width is variable, we pass the raw position on the track
        const timelinePosition = this.scrollbarToTimeline(scrollbarPosition);
        
        // During dragging, update the thumb position directly without triggering scroll events
        if (this.isDragging) {
            // Calculate thumb width for proper positioning
            const containerWidth = this.container.clientWidth;
            const leftEdgePos = this.timelineToScrollbar(timelinePosition);
            const rightEdgePos = this.timelineToScrollbar(timelinePosition + containerWidth);
            const newThumbWidth = rightEdgePos - leftEdgePos;
            const minThumbWidth = 20;
            
            // Update thumb position and width directly
            this.scrollbarThumb.style.width = `${Math.max(minThumbWidth, newThumbWidth)}px`;
            this.scrollbarThumb.style.left = `${scrollbarPosition}px`;
        }
        
        this.container.scrollLeft = timelinePosition;
    }

    updateThumbPosition() {
        const currentScroll = this.container.scrollLeft;
        const containerWidth = this.container.clientWidth;

        // Calculate the scrollbar positions for the left and right edges of the viewport.
        const leftEdgePos = this.timelineToScrollbar(currentScroll);
        const rightEdgePos = this.timelineToScrollbar(currentScroll + containerWidth);

        // The thumb's width is the difference between the two edges.
        const newThumbWidth = rightEdgePos - leftEdgePos;

        // Use a minimum width to ensure the thumb is always grabbable.
        const minThumbWidth = 20;

        this.scrollbarThumb.style.width = `${Math.max(minThumbWidth, newThumbWidth)}px`;

        // The thumb's position is the position of the left edge.
        this.scrollbarThumb.style.left = `${leftEdgePos}px`;
    }

    destroy() {
        if (this.scrollbarContainer) {
            this.scrollbarContainer.remove();
        }
        // You might want to add logic here to remove the document/window event listeners
        // to prevent memory leaks if the timeline can be destroyed and recreated dynamically.
    }
}