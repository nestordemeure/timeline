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

    // Map from timeline scroll position to scrollbar position using interpolation
    timelineToScrollbar(timelinePosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;

        if (maxScrollLeft === 0) return 0;

        const trackWidth = this.scrollbarTrack.clientWidth;
        const thumbWidth = this.scrollbarThumb.offsetWidth;
        const maxThumbPosition = trackWidth - thumbWidth;

        // If no event data available, fall back to linear mapping
        if (!this.timeline.eventData || this.timeline.eventData.length === 0) {
            const ratio = timelinePosition / maxScrollLeft;
            return ratio * maxThumbPosition;
        }

        // Find the current viewport center position in timeline coordinates
        const viewportCenterPosition = timelinePosition + containerWidth / 2;

        // Find the two events that bracket this viewport center
        let beforeEvent = null;
        let afterEvent = null;

        for (let i = 0; i < this.timeline.eventData.length - 1; i++) {
            const currentEvent = this.timeline.eventData[i];
            const nextEvent = this.timeline.eventData[i + 1];

            if (viewportCenterPosition >= currentEvent.finalPosition &&
                viewportCenterPosition <= nextEvent.finalPosition) {
                beforeEvent = currentEvent;
                afterEvent = nextEvent;
                break;
            }
        }

        // Handle edge cases
        if (!beforeEvent || !afterEvent) {
            if (viewportCenterPosition <= this.timeline.eventData[0].finalPosition) {
                // Before first event - map to start of scrollbar
                return 0;
            } else {
                // After last event - map to end of scrollbar
                return maxThumbPosition;
            }
        }

        // Interpolate to find chronological position
        const positionSpan = afterEvent.finalPosition - beforeEvent.finalPosition;
        if (positionSpan === 0) {
            // Same position, use the before event's chronological position
            const beforeDate = this.timeline.parseDate(beforeEvent.date);
            const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
            const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
            const dateRange = lastEventDate - firstEventDate;
            const chronologicalRatio = (beforeDate - firstEventDate) / dateRange;
            return chronologicalRatio * maxThumbPosition;
        }

        const interpolationFactor = (viewportCenterPosition - beforeEvent.finalPosition) / positionSpan;

        // Get chronological dates
        const beforeDate = this.timeline.parseDate(beforeEvent.date);
        const afterDate = this.timeline.parseDate(afterEvent.date);
        const interpolatedDate = beforeDate + interpolationFactor * (afterDate - beforeDate);

        // Convert to scrollbar position using chronological mapping
        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;
        const chronologicalRatio = (interpolatedDate - firstEventDate) / dateRange;

        return Math.max(0, Math.min(maxThumbPosition, chronologicalRatio * maxThumbPosition));
    }

    scrollbarToTimeline(scrollbarPosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;

        const trackWidth = this.scrollbarTrack.clientWidth;
        const thumbWidth = this.scrollbarThumb.offsetWidth;
        const maxThumbPosition = trackWidth - thumbWidth;

        if (maxThumbPosition === 0) return 0;

        // Convert scrollbar position to chronological ratio
        const chronologicalRatio = scrollbarPosition / maxThumbPosition;

        // Use interpolation between events to map from chronological to shifted positions
        if (!this.timeline.eventData || this.timeline.eventData.length === 0) {
            // Fallback to linear mapping if no event data
            return chronologicalRatio * maxScrollLeft;
        }

        // Get first and last event dates for chronological mapping
        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        // Convert chronological ratio to target date
        const targetDate = firstEventDate + (chronologicalRatio * dateRange);

        // Find the two events that bracket this date
        let beforeEvent = null;
        let afterEvent = null;

        for (let i = 0; i < this.timeline.eventData.length - 1; i++) {
            const currentEventDate = this.timeline.parseDate(this.timeline.eventData[i].date);
            const nextEventDate = this.timeline.parseDate(this.timeline.eventData[i + 1].date);

            if (targetDate >= currentEventDate && targetDate <= nextEventDate) {
                beforeEvent = this.timeline.eventData[i];
                afterEvent = this.timeline.eventData[i + 1];
                break;
            }
        }

        // If we couldn't find bracketing events, use linear interpolation at edges
        if (!beforeEvent || !afterEvent) {
            if (targetDate <= firstEventDate) {
                // Before first event
                return Math.max(0, this.timeline.eventData[0].finalPosition - containerWidth / 2);
            } else {
                // After last event
                const lastEvent = this.timeline.eventData[this.timeline.eventData.length - 1];
                return Math.min(maxScrollLeft, lastEvent.finalPosition - containerWidth / 2);
            }
        }

        // Interpolate between the shifted positions of the bracketing events
        const beforeDate = this.timeline.parseDate(beforeEvent.date);
        const afterDate = this.timeline.parseDate(afterEvent.date);
        const dateSpan = afterDate - beforeDate;

        if (dateSpan === 0) {
            // Same date, use the before event position
            return Math.max(0, Math.min(maxScrollLeft, beforeEvent.finalPosition - containerWidth / 2));
        }

        const interpolationFactor = (targetDate - beforeDate) / dateSpan;
        const interpolatedPosition = beforeEvent.finalPosition +
            interpolationFactor * (afterEvent.finalPosition - beforeEvent.finalPosition);

        // Convert from event position to scroll position (center the event in viewport)
        const scrollPosition = interpolatedPosition - containerWidth / 2;

        return Math.max(0, Math.min(maxScrollLeft, scrollPosition));
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