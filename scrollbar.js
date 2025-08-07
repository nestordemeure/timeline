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
        // Note: thumbWidth is variable, so maxThumbPosition is not constant.
        // We'll return a ratio and calculate the final pixel position in the caller.
        const maxThumbPosition = trackWidth;


        if (!this.timeline.eventData || this.timeline.eventData.length === 0) {
            const ratio = timelinePosition / maxScrollLeft;
            return ratio * maxThumbPosition;
        }

        const viewportPosition = timelinePosition;

        let beforeEvent = null;
        let afterEvent = null;

        const firstEvent = this.timeline.eventData[0];
        const lastEvent = this.timeline.eventData[this.timeline.eventData.length - 1];

        if (viewportPosition < firstEvent.finalPosition) {
            return 0;
        }

        if (viewportPosition > lastEvent.finalPosition) {
            // If we've scrolled past the last event's position, we are at the end.
            return trackWidth;
        }


        for (let i = 0; i < this.timeline.eventData.length - 1; i++) {
            const currentEvent = this.timeline.eventData[i];
            const nextEvent = this.timeline.eventData[i + 1];

            if (viewportPosition >= currentEvent.finalPosition &&
                viewportPosition <= nextEvent.finalPosition) {
                beforeEvent = currentEvent;
                afterEvent = nextEvent;
                break;
            }
        }

        if (!beforeEvent) {
            const ratio = timelinePosition / maxScrollLeft;
            return ratio * maxThumbPosition;
        }


        const positionSpan = afterEvent.finalPosition - beforeEvent.finalPosition;
        if (positionSpan === 0) {
            const beforeDate = this.timeline.parseDate(beforeEvent.date);
            const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
            const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
            const dateRange = lastEventDate - firstEventDate;
            const chronologicalRatio = (dateRange > 0) ? (beforeDate - firstEventDate) / dateRange : 0;
            return chronologicalRatio * maxThumbPosition;
        }

        const interpolationFactor = (viewportPosition - beforeEvent.finalPosition) / positionSpan;
        const beforeDate = this.timeline.parseDate(beforeEvent.date);
        const afterDate = this.timeline.parseDate(afterEvent.date);
        const interpolatedDate = beforeDate + interpolationFactor * (afterDate - beforeDate);

        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        if (dateRange === 0) return 0;

        const chronologicalRatio = (interpolatedDate - firstEventDate) / dateRange;

        return Math.max(0, Math.min(maxThumbPosition, chronologicalRatio * maxThumbPosition));
    }

    scrollbarToTimeline(scrollbarPosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;

        const trackWidth = this.scrollbarTrack.clientWidth;

        // The thumb width varies, so we can't subtract it here. The ratio is based on the full track.
        if (trackWidth === 0) return 0;

        const chronologicalRatio = scrollbarPosition / trackWidth;

        if (!this.timeline.eventData || this.timeline.eventData.length === 0) {
            return chronologicalRatio * maxScrollLeft;
        }

        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        const targetDate = (dateRange === 0) ? firstEventDate : firstEventDate + (chronologicalRatio * dateRange);

        let beforeEvent = null;
        let afterEvent = null;

        // This handles edge cases where the target date is outside the main event range.
        if (targetDate <= firstEventDate) {
            return 0;
        }
        if (targetDate >= lastEventDate) {
            return maxScrollLeft;
        }

        for (let i = 0; i < this.timeline.eventData.length - 1; i++) {
            const currentEventDate = this.timeline.parseDate(this.timeline.eventData[i].date);
            const nextEventDate = this.timeline.parseDate(this.timeline.eventData[i + 1].date);

            if (targetDate >= currentEventDate && targetDate <= nextEventDate) {
                beforeEvent = this.timeline.eventData[i];
                afterEvent = this.timeline.eventData[i + 1];
                break;
            }
        }

        // If bracketing events aren't found (shouldn't happen with edge cases handled), fallback.
        if (!beforeEvent || !afterEvent) {
            return chronologicalRatio * maxScrollLeft;
        }


        const beforeDate = this.timeline.parseDate(beforeEvent.date);
        const afterDate = this.timeline.parseDate(afterEvent.date);
        const dateSpan = afterDate - beforeDate;

        if (dateSpan === 0) {
            return beforeEvent.finalPosition;
        }

        const interpolationFactor = (targetDate - beforeDate) / dateSpan;
        const interpolatedPosition = beforeEvent.finalPosition +
            interpolationFactor * (afterEvent.finalPosition - beforeEvent.finalPosition);

        const scrollPosition = interpolatedPosition;

        return Math.max(0, Math.min(maxScrollLeft, scrollPosition));
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
            // Jump based on click position on the track, not centering the thumb.
            const clickPosition = e.clientX - trackRect.left;

            this.updateScrollFromScrollbar(clickPosition);
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